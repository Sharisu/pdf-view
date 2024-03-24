import React from 'react';
import {Text} from 'react-native';
import OverlayDraggable from "./OverlayDraggable";

const OverlayLabel = React.memo(({title, x, y, onMoveEnd}) => (
  <OverlayDraggable initialX={x} initialY={y} onMoveEnd={onMoveEnd}>
    <Text>{title}</Text>
  </OverlayDraggable>
));

export default OverlayLabel;
