import React, { useState, useCallback } from 'react';
import { View, Image, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface InteractiveMarkedImageProps {
  imageUri: string;
  coordinates: number[][];
  originalWidth: number;
  originalHeight: number;
  onCoordinatesChange: (newCoordinates: number[][]) => void;
}

const InteractiveMarkedImage: React.FC<InteractiveMarkedImageProps> = ({
  imageUri,
  coordinates,
  originalWidth,
  originalHeight,
  onCoordinatesChange
}) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const screenWidth = Dimensions.get('window').width;

  const onLayout = useCallback((event) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  }, []);

  const scaleCoordinate = useCallback((coord: number[]) => {
    const scaleX = layout.width / originalWidth;
    const scaleY = layout.height / originalHeight;
    return [coord[0] * scaleX, coord[1] * scaleY];
  }, [layout, originalWidth, originalHeight]);

  const handlePress = useCallback((event) => {
    const { locationX, locationY } = event.nativeEvent;
    const newCoord = [
      (locationX / layout.width) * originalWidth,
      (locationY / layout.height) * originalHeight
    ];
    onCoordinatesChange([...coordinates, newCoord]);
  }, [layout, originalWidth, originalHeight, coordinates, onCoordinatesChange]);

  const handlePointPress = useCallback((index: number) => {
    const newCoordinates = coordinates.filter((_, i) => i !== index);
    onCoordinatesChange(newCoordinates);
  }, [coordinates, onCoordinatesChange]);

  return (
    <TouchableOpacity onPress={handlePress} style={{ width: screenWidth, height: screenWidth * (originalHeight / originalWidth) }} onLayout={onLayout}>
      <Image 
        source={{ uri: imageUri }} 
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
      {layout.width > 0 && layout.height > 0 && (
        <Svg 
          style={{ position: 'absolute', top: 0, left: 0 }}
          width={layout.width} 
          height={layout.height}
        >
          {coordinates.map((coord, index) => {
            const [cx, cy] = scaleCoordinate(coord);
            return (
              <Circle
                key={index}
                cx={cx}
                cy={cy}
                r={10}
                fill="red"
                opacity={0.7}
                onPress={() => handlePointPress(index)}
              />
            );
          })}
        </Svg>
      )}
    </TouchableOpacity>
  );
};

export default InteractiveMarkedImage;