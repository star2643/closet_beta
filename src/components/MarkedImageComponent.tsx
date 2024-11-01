import React, { useState } from 'react';
import { View, Image, TouchableWithoutFeedback } from 'react-native';
import Svg, { Circle, Text } from 'react-native-svg';

const MarkedImageComponent = React.memo(({ 
  imageUri, 
  coordinates, 
  originalWidth, 
  originalHeight,
  onAddMarker,
  isEditable
}) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const onLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  const scaleCoordinate = (coord) => {
    const scaleX = layout.width / originalWidth;
    const scaleY = layout.height / originalHeight;
    return [coord[0] * scaleX, coord[1] * scaleY];
  };

  const handlePress = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const newCoord = [
      (locationX / layout.width) * originalWidth,
      (locationY / layout.height) * originalHeight
    ];
    if(isEditable){
      onAddMarker(newCoord);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={{ width: '100%', height: '100%',justifyContent:'center',alignItems:'center' }} onLayout={onLayout}>
        <Image 
          source={{ uri: imageUri }} 
          style={{ width: 300, height: 300,alignSelf:'center' }}
          resizeMode="contain"
        />
        {layout.width > 0 && layout.height > 0 && coordinates.length>0 &&coordinates[0].length>0 && (
          <Svg 
            style={{ position: 'absolute', top: 0, left: 0 }}
            width={layout.width} 
            height={layout.height}
          >
            { (coordinates.map((coord, index) => {
              
              const [cx, cy] = scaleCoordinate(coord);
              const radius = Math.min(layout.width, layout.height) * 0.01;
              return (
                <React.Fragment key={index}>
                  <Circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="red"
                    opacity={0.5}
                  />
                  <Text
                    x={cx}
                    y={cy - radius - 10}
                    fontSize={20}
                    fill="red"
                    textAnchor="middle"
                    alignmentBaseline="central"
                    
                  >
                    {index + 1}
                  </Text>
                </React.Fragment>
              );
            }))}
          </Svg>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
});

export default MarkedImageComponent;