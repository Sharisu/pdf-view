import ImageResizer from "react-native-image-resizer";

const getImageScaledDimensions = (originalWidth, originalHeight, maxSize) => {
  let newWidth, newHeight;
  if (originalWidth <= maxSize && originalHeight <= maxSize) {
    return {width: originalWidth, height: originalHeight};
  }
  const scale = Math.min(maxSize / originalWidth, maxSize / originalHeight);
  newWidth = originalWidth * scale;
  newHeight = originalHeight * scale;
  return {width: newWidth, height: newHeight};
};

const resizeImage = async (uri) => {
  try {
    const response = await ImageResizer.createResizedImage(uri, 800, 800, 'JPEG', 70);
    return response.uri;
  } catch (err) {
    console.error(err);
    return uri;
  }
};

export {getImageScaledDimensions, resizeImage}
