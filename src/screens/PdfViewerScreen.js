import React, {useEffect, useState} from 'react';
import {StyleSheet, Alert, Button, FlatList, View} from 'react-native';
import PdfPageItem from "../components/PdfPageItem";
import {PdfUtil} from 'react-native-pdf-light';
import addLabelsToPdf from "../utils/PdfEditorHelper";

const PdfViewerScreen = ({navigation, route}) => {
  const source = {uri: route.params.uri, cache: true};
  const [pages, setPages] = useState([]);
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // hack for force update

  // Init pages and labels
  useEffect(() => {
    PdfUtil.getPageCount(route.params.uri).then(numberOfPages => {
      const initialPages = Array.from({length: numberOfPages}, (_, index) => ({
        pageNumber: index + 1,
        labels: []
      }));
      setPages(initialPages);
    });
  }, [route.params.uri]);

  // Right navigation button
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

  const handleSavePage = () => {
    addLabelsToPdf(source.uri, pages).then(() => {
      console.log('SAVED');

      //Clean state
      const clearedPages = pages.map(page => ({...page, labels: []}));
      setPages(clearedPages);
      setIsSaveButtonEnabled(false);
      setRefreshKey(prevKey => prevKey + 1);
    })
  }

  const createLabelWithPrompt = (params) => {
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
            onCreateLabel={createLabelWithPrompt}
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    marginVertical: 4,
  },
})

export default PdfViewerScreen;
