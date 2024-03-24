import React, {useMemo, useState} from 'react';
import {Dimensions, View, ActionSheetIOS} from 'react-native';
import {LongPressGestureHandler, State} from 'react-native-gesture-handler';
import Pdf from "react-native-pdf";
import OverlayImage from "../overlayItems/OverlayImage";
import OverlayLabel from "../overlayItems/OverlayLabel";

function PdfPageItem({source, page, labels = [], images = [], onUpdateLabel, onUpdateImage, onRemovePage}) {
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);

  const memoizedLabels = useMemo(() => {
    return labels.map((label, index) => {
      const absoluteX = label.labelX * pageWidth;
      const absoluteY = label.labelY * pageHeight;
      return <OverlayLabel key={index} title={label.title} x={absoluteX} y={absoluteY}
                           onMoveEnd={(newPosition) => handleMoveEndLabel(index, newPosition)}/>;
    });
  }, [labels, page, pageWidth, pageHeight]);

  const memoizedImages = useMemo(() => {
    return images.map((image, index) => {
      const absoluteX = image.imageX * pageWidth;
      const absoluteY = image.imageY * pageHeight;
      return <OverlayImage key={index} uri={image.imageUri} x={absoluteX} y={absoluteY}
                           onMoveEnd={(newPosition) => handelMoveEndImage(index, newPosition)}/>;
    });
  }, [images, page, pageWidth, pageHeight]);

  const handleLoadComplete = (numberOfPages, filePath, {width, height}) => {
    const screenWidth = Dimensions.get('window').width;
    const scale = screenWidth / width;
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;

    setPageHeight(scaledHeight);
    setPageWidth(scaledWidth);
  };

  const handlePressStateChange = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const {x, y} = event.nativeEvent;
      if (x > 0 && y > 0) {
        showActionSheet({x, y});
      }
    }
  };

  const handleMoveEndLabel = (index, newPosition) => {
    onUpdateLabel({page, index, labelX: newPosition.x / pageWidth, labelY: newPosition.y / pageHeight});
  };

  const handelMoveEndImage = (index, newPosition) => {
    onUpdateImage({page, index, imageX: newPosition.x / pageWidth, imageY: newPosition.y / pageHeight});
  }

  const showActionSheet = ({x, y}) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Add Text Label', 'Add Image', 'Remove Page'],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 3,
      },
      buttonIndex => {
        if (buttonIndex === 1) {
          const labelX = x / pageWidth;
          const labelY = y / pageHeight;
          onUpdateLabel({page, labelX, labelY});
        } else if (buttonIndex === 2) {
          const imageX = x / pageWidth;
          const imageY = y / pageHeight;
          onUpdateImage({page, imageX, imageY});
        } else if (buttonIndex === 3) {
          onRemovePage(page - 1);
        }
      }
    );
  };

  return (
    <View style={{width: pageWidth, height: pageHeight, overflow: 'hidden'}}>
      <LongPressGestureHandler minDurationMs={200} onHandlerStateChange={handlePressStateChange}>
        <View>
          <Pdf
            pointerEvents="none"
            source={source}
            page={page}
            singlePage={true}
            onLoadComplete={handleLoadComplete}
            style={{width: pageWidth, height: pageHeight}}
          />
        </View>
      </LongPressGestureHandler>
      {memoizedImages}
      {memoizedLabels}
    </View>
  );
}

export default PdfPageItem;
