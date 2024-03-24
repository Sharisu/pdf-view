import React, {useEffect, useState} from "react";
import {Image} from "react-native";
import {getImageScaledDimensions} from "../../utils/ImageHelper";
import OverlayDraggable from "./OverlayDraggable";

const OverlayImage = React.memo(({uri, x, y, onMoveEnd}) => {
  const [imageSize, setImageSize] = useState({width: 0, height: 0});

  useEffect(() => {
    if (uri) {
      Image.getSize(
        uri,
        (width, height) => {
          const {width: scaledWidth, height: scaledHeight} = getImageScaledDimensions(width, height, 200);
          setImageSize({width: scaledWidth, height: scaledHeight});
        },
        (error) => {
          console.error(`Couldn't get the image size: ${error.message}`);
        }
      );
    }
  }, [uri]);

  return (
    <OverlayDraggable initialX={x} initialY={y} onMoveEnd={onMoveEnd}>
      <Image source={{uri: uri}} style={{width: imageSize.width, height: imageSize.height}}/>
    </OverlayDraggable>
  );
});

export default OverlayImage;
