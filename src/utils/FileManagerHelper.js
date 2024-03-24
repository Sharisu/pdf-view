import RNFS from 'react-native-fs';
import base64 from 'react-native-base64'

const copyFileToDocuments = async (sourceUri, customName) => {
  if (typeof sourceUri !== 'string' || !sourceUri) {
    throw new Error('Invalid sourceUri. It must be a non-empty string.');
  }

  let fileName = customName || sourceUri.split('/').pop();
  if (typeof fileName !== 'string' || !fileName) {
    throw new Error('Invalid fileName. It must be a non-empty string.');
  }

  if (!fileName.endsWith('.pdf')) {
    fileName += '.pdf';
  }

  const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

  const fileExist = await checkFileExists(destinationPath)
  if (fileExist) {
    await deleteFile(destinationPath);
  }

  try {
    await RNFS.copyFile(sourceUri, destinationPath);
    return destinationPath;
  } catch (error) {
    console.error('Error copying file:', error);
    throw error;
  }
};

const checkFileExists = async (fileUri) => {
  return await RNFS.exists(fileUri);
};

const getListOfPdfFiles = async () => {
  try {
    const files = await RNFS.readdir(RNFS.DocumentDirectoryPath);
    return files
      .filter(file => file.endsWith('.pdf'))
      .map(file => {
        const nameWithoutExtension = file.replace('.pdf', '');
        const uri = `${RNFS.DocumentDirectoryPath}/${file}`;
        return {uri, name: nameWithoutExtension};
      });
  } catch (error) {
    console.error('Error listing PDF files in Documents Directory:', error);
    throw error;
  }
};

const saveBytesToFile = async (bytes, fileName) => {
  if (!fileName.endsWith('.pdf')) {
    fileName += '.pdf';
  }
  const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
  const fileExist = await checkFileExists(destinationPath)
  if (fileExist) {
    await deleteFile(destinationPath);
  }
  return await saveBytesToDocuments(bytes, destinationPath);
};

const saveBytesToDocuments = async (bytes, uri) => {
  const base64String = base64.encodeFromByteArray(bytes);
  const filePath = uri.replace('file://', '');
  await RNFS.writeFile(filePath, base64String, 'base64');
};

const deleteFile = async (uri) => {
  try {
    await RNFS.unlink(uri);
    console.log(`File deleted successfully`);
  } catch (error) {
    console.error(`Error deleting file: ${uri}`, error);
    throw error;
  }
};

// DEBUG USAGE
const deleteAllFilesInDocumentsDirectory = async () => {
  try {
    const files = await RNFS.readdir(RNFS.DocumentDirectoryPath);
    console.log('Files in Documents Directory:', files.length);
    for (const fileName of files) {
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await RNFS.unlink(filePath);
      console.log(`Deleted: ${filePath}`);
    }

    console.log('All files have been deleted from the Documents Directory.');
  } catch (error) {
    console.error('Error deleting files from Documents Directory:', error);
  }
};

export {
  copyFileToDocuments,
  checkFileExists,
  getListOfPdfFiles,
  deleteFile,
  saveBytesToDocuments,
  saveBytesToFile,
  deleteAllFilesInDocumentsDirectory
};
