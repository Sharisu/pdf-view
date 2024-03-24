import React, {useEffect, useRef, useState} from 'react';
import {View, PanResponder} from 'react-native';

function OverlayDraggable({children, initialX, initialY, onMoveEnd}) {
  const positionRef = useRef({x: initialX, y: initialY});
  const [position, setPosition] = useState(positionRef.current);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    positionRef.current = {x: initialX, y: initialY};
    setPosition(positionRef.current);
  }, [initialX, initialY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderStart: () => {
        setIsMoving(true);
      },
      onPanResponderMove: (event, gestureState) => {
        const newX = positionRef.current.x + gestureState.dx;
        const newY = positionRef.current.y + gestureState.dy;
        setPosition({x: newX, y: newY});
      },
      onPanResponderRelease: (event, gestureState) => {
        const finalX = positionRef.current.x + gestureState.dx;
        const finalY = positionRef.current.y + gestureState.dy;
        positionRef.current = {x: finalX, y: finalY};
        setPosition(positionRef.current);
        onMoveEnd && onMoveEnd(positionRef.current);
        setIsMoving(false);
      },
    })
  ).current;

  return (
    <View
      {...panResponder.panHandlers}
      pointerEvents="auto"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        backgroundColor: 'rgba(18,154,201,0.3)',
        borderWidth: 2,
        borderColor: isMoving ? '#af0f0f' : 'rgba(18,154,201,0.8)',
        borderStyle: 'dashed',
      }}
    >
      {children}
    </View>
  );
}

export default OverlayDraggable;
