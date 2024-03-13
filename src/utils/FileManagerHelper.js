import RNFS from 'react-native-fs';
import base64 from 'react-native-base64'

const copyFileToDocuments = async (sourceUri, customName) => {
  // deleteAllFilesInDocumentsDirectory();

  // TODO: unfixed same name of files
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
  try {
    await RNFS.copyFile(sourceUri, destinationPath);
    console.log('FILE COPIED')
    return destinationPath;
  } catch (error) {
    console.error('Error copying file:', error);
    throw error;
  }
};

const listPdfFilesInDocumentsDirectory = async () => {
  try {
    const files = await RNFS.readdir(RNFS.DocumentDirectoryPath);
    const pdfFiles = files
      .filter(file => file.endsWith('.pdf'))
      .map(file => {
        const nameWithoutExtension = file.replace('.pdf', '');
        const uri = `${RNFS.DocumentDirectoryPath}/${file}`;
        return {uri, name: nameWithoutExtension};
      });

    console.log('PDF Files in Documents Directory:', pdfFiles);
    return pdfFiles;
  } catch (error) {
    console.error('Error listing PDF files in Documents Directory:', error);
    throw error;
  }
};

const savePdfToFile = async (pdfBytes, uri) => {
  const base64String = base64.encodeFromByteArray(pdfBytes);
  const filePath = uri.replace('file://', '');
  await RNFS.writeFile(filePath, base64String, 'base64');
};

const deleteFile = async (uri) => {
  try {
    await RNFS.unlink(uri);
    console.log(`File deleted successfully: ${uri}`);
  } catch (error) {
    console.error(`Error deleting file: ${uri}`, error);
    throw error;
  }
};

// DEBUG USAGE ONLY
const deleteAllFilesInDocumentsDirectory = async () => {
  try {
    const files = await RNFS.readdir(RNFS.DocumentDirectoryPath);
    console.log('Files in Documents Directory:', files);
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
  listPdfFilesInDocumentsDirectory,
  deleteFile,
  savePdfToFile,
  deleteAllFilesInDocumentsDirectory
};
