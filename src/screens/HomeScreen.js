import React, {useEffect, useState} from 'react';
import {View, Button, FlatList, StyleSheet, Alert} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {copyFileToDocuments, deleteFile, getListOfPdfFiles} from "../utils/FileManagerHelper";
import FooterButton from "../components/buttons/FooterButton";
import {createPdfFile} from "../utils/PdfEditorHelper";
import PdfListItem from "../components/listItems/PdfListItem";

const HomeScreen = ({navigation}) => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    updateFilesList().catch(e => console.log('Error while updating files list: ' + e))
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => setIsEditing(!isEditing)}
          title={isEditing ? "Done" : 'Edit'}
        />
      ),
    });
  }, [navigation, isEditing]);

  const updateFilesList = async () => {
    const files = await getListOfPdfFiles();
    setPdfFiles(files);
  }

  const pickPdfFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      saveFileWithCustomName(res[0])
        .then()
        .catch(e => console.log('File not saved, reason: ' + e));
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        throw err;
      }
    }
  };

  const saveFileWithCustomName = async (file) => {
    Alert.prompt(
      "Copy PDF File",
      "Enter a name for the PDF file:",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Save",
          onPress: async (customName) => {
            await copyFileToDocuments(file.uri, customName);
            await updateFilesList();
          }
        }
      ],
      "plain-text",
      file.name,
    );
  };

  const createFileWithCustomName = async () => {
    Alert.prompt(
      "Create PDF file",
      "Enter a name for the PDF file:",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Create",
          onPress: async (customName) => {
            if (!customName) {
              Alert.alert(
                "Invalid Name",
                "The name cannot be empty.\nPlease enter a valid name.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      createFileWithCustomName();
                    }
                  }
                ]
              );
            } else {
              await createPdfFile(customName);
              await updateFilesList();
            }
          }
        }
      ],
      "plain-text",
    );
  };

  const removeFile = (uri) => {
    deleteFile(uri).then(() => {
      updateFilesList().then();
    })
  }

  const renderItem = ({item}) => {
    return (
      <View style={styles.pdfItemContainer}>
        <PdfListItem title={item.name}
                     onPress={() => navigation.navigate('PdfEdit', {uri: item.uri})}
                     disabled={isEditing}/>
        {isEditing ? <Button title={'Remove'} onPress={() => {
          removeFile(item.uri);
        }
        }/> : null}
      </View>
    )
  }

  const renderFooter = () => {
    if (isEditing) {
      return null;
    }
    return (
      <View style={styles.footerContainer}>
        <FooterButton title={'Add PDF'} onPress={pickPdfFile}/>
        <FooterButton title={'Create PDF'} onPress={createFileWithCustomName}/>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.flatList}
        data={pdfFiles}
        keyExtractor={item => item.uri}
        renderItem={renderItem}
        ListFooterComponent={() => renderFooter()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  pdfItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
});

export default HomeScreen;
