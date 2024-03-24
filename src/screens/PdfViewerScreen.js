import React, {useEffect, useState} from 'react';
import {Alert, Button, FlatList, StyleSheet, View} from 'react-native';
import {PdfUtil} from 'react-native-pdf-light';
import Share from 'react-native-share';
import {addLabelsToPdf, addNewPageToPdf, removePageFromPdf} from "../utils/PdfEditorHelper";
import PdfPageItem from "../components/listItems/PdfPageItem";
import FooterButton from "../components/buttons/FooterButton";
import {launchImageLibrary} from "react-native-image-picker";

const PdfViewerScreen = ({navigation, route}) => {
  const source = {uri: route.params.uri, cache: true};
  const [pages, setPages] = useState([]);
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // hack for force update

  useEffect(() => {
    updatePages();
  }, [route.params.uri]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => handleSavePage()}
          title="Save"
          disabled={!isSaveButtonEnabled}
        />
      ),
    });
  }, [navigation, isSaveButtonEnabled]);

  const updatePages = () => {
    PdfUtil.getPageCount(route.params.uri).then(numberOfPages => {
      const initialPages = Array.from({length: numberOfPages}, (_, index) => ({
        pageNumber: index + 1,
        labels: [],
        images: [],
      }));
      setPages(initialPages);
      setIsSaveButtonEnabled(false);
      setRefreshKey(prevKey => prevKey + 1);
    });
  }

  const handleSavePage = () => {
    addLabelsToPdf(source.uri, pages).then(() => {
      updatePages();
    })
  }

  const handleAddNewPage = () => {
    addNewPageToPdf(source.uri).then(() => {
      updatePages();
    });
  }

  const handleSharePdf = async () => {
    const shareOptions = {
      title: 'Share PDF',
      url: source.uri,
      type: 'application/pdf',
    };

    try {
      await Share.open(shareOptions);
    } catch (error) {
      console.log(error);
    }
  }

  const createOrUpdateLabel = (params) => {
    // update or create new label
    if (params.index >= 0) {
      const {page, index} = params;
      const newPages = [...pages];
      for (let i = 0; i < newPages.length; i++) {
        if (newPages[i].pageNumber === page) {
          newPages[i].labels = newPages[i].labels.map((label, idx) => {
            if (idx === index) {
              return {...label, ...params};
            }
            return label;
          });
          break;
        }
      }
      setPages(newPages);
    } else {
      Alert.prompt(
        "Create new label",
        "Enter a text:",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Create",
            onPress: (labelText) => {
              setIsSaveButtonEnabled(true);
              const {page} = params;
              params.title = labelText;
              const newPages = [...pages];
              for (let i = 0; i < newPages.length; i++) {
                if (newPages[i].pageNumber === page) {
                  newPages[i].labels = [...newPages[i].labels, params];
                  break;
                }
              }
              setPages(newPages);
            }
          }
        ],
        "plain-text",
      );
    }
  }

  const createOrUpdateImage = (params) => {
    if (params.index >= 0) {
      const {page, index} = params;
      const newPages = [...pages];
      for (let i = 0; i < newPages.length; i++) {
        if (newPages[i].pageNumber === page) {
          newPages[i].images = newPages[i].images.map((image, idx) => {
            if (idx === index) {
              return {...image, ...params};
            }
            return image;
          });
          break;
        }
      }
      setPages(newPages);
    } else {
      const options = {
        mediaType: 'photo',
      };
      launchImageLibrary(options, (response) => {
        if (!response.didCancel && !response.error) {
          setIsSaveButtonEnabled(true);
          const {page} = params;
          params.imageUri = response.assets[0].uri;
          const newPages = [...pages];
          for (let i = 0; i < newPages.length; i++) {
            if (newPages[i].pageNumber === page) {
              newPages[i].images = [...newPages[i].images, params];
              break;
            }
          }
          setPages(newPages);
        }
      }).catch((e) => console.log('ImagePicker Error: ', e));
    }
  }

  const removePageWithIndex = (pageIndex) => {
    console.log('Page removed: ' + pageIndex);
    removePageFromPdf(source.uri, pageIndex).then(() => {
      updatePages();
    })
  }

  const renderFooter = () => {
    return (
      <View style={styles.footerContainer}>
        <FooterButton title={'Add New Page'} onPress={handleAddNewPage}/>
        <FooterButton title={'Export'} onPress={handleSharePdf}/>
      </View>
    )
  }

  return (
    <FlatList
      data={pages}
      key={refreshKey}
      keyExtractor={item => item.pageNumber.toString()}
      renderItem={({item}) => (
        <View style={styles.itemContainer}>
          <PdfPageItem
            source={source}
            page={item.pageNumber}
            labels={item.labels}
            images={item.images}
            onUpdateLabel={createOrUpdateLabel}
            onUpdateImage={createOrUpdateImage}
            onRemovePage={removePageWithIndex}
          />
        </View>
      )}
      ListFooterComponent={renderFooter}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    marginVertical: 4,
  },
  footerContainer: {
    marginVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
})

export default PdfViewerScreen;
