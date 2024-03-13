import React, {useMemo, useState} from 'react';
import {Dimensions, View, Text} from 'react-native';
import {LongPressGestureHandler, State} from 'react-native-gesture-handler';
import Pdf from "react-native-pdf";

const Label = React.memo(({title, x, y}) => (
  <View pointerEvents="none" style={{position: 'absolute', left: x, top: y}}>
    <Text>{title}</Text>
  </View>
));

function PdfPageItem({source, page, labels = [], onCreateLabel}) {
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);

  const memoizedLabels = useMemo(() => {
    return labels.map((label, index) => {
      const absoluteX = label.labelX * pageWidth;
      const absoluteY = label.labelY * pageHeight;
      return <Label key={index} title={label.title} x={absoluteX} y={absoluteY}/>;
    });
  }, [labels, page, pageWidth, pageHeight]);

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
        const title = '';
        const labelX = x / pageWidth;
        const labelY = y / pageHeight;
        onCreateLabel({page, title, labelX, labelY});
      }
    }
  };

  return (
    <View style={{width: pageWidth, height: pageHeight}}>
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
      {memoizedLabels}
    </View>
  );
}

export default PdfPageItem;
