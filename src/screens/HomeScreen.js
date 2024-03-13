import React, {useEffect, useState} from 'react';
import {View, Button, Text, FlatList, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {copyFileToDocuments, deleteFile, listPdfFilesInDocumentsDirectory} from "../utils/FileManagerHelper";

const HomeScreen = ({navigation}) => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    updateFilesList().then(() => 'initial state');
  }, []);

  // Right navigation button
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
    const files = await listPdfFilesInDocumentsDirectory();
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
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        throw err;
      }
    }
  };

  const saveFileWithCustomName = async (file) => {
    Alert.prompt(
      "New PDF File",
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

  const removeFile = (uri) => {
    deleteFile(uri).then(() => {
      updateFilesList().then();
    })
  }

  const renderItem = ({item}) => {
    return (
      <View style={styles.pdfItemContainer}>
        <TouchableOpacity style={styles.pdfItem} disabled={isEditing}
                          onPress={() => navigation.navigate('PdfEdit', {uri: item.uri})}>
          <Text style={styles.pdfItemText}>
            {item.name}
          </Text>
        </TouchableOpacity>
        {isEditing ? <Button title={'remove'} onPress={() => {
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
    return <Button title="+ Add new PDF" onPress={pickPdfFile}/>
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
  pdfItem: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    flex: 1,
  },
  pdfItemText: {
    fontSize: 14,
  },
});

export default HomeScreen;
