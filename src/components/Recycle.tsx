import React from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const mapRegions = [
  { name: '基隆', top: 0.15, left: 0.79 },
  { name: '台北', top: 0.19, left: 0.68 },
  { name: '新北', top: 0.145, left: 0.7 },
  { name: '桃園', top: 0.19, left: 0.56 },
  { name: '新竹', top: 0.24, left: 0.53 },
  { name: '苗栗', top: 0.282, left: 0.43 },
  { name: '台中', top: 0.34, left: 0.4 },
  { name: '彰化', top: 0.412, left: 0.24 },
  { name: '南投', top: 0.43, left: 0.45 },
  { name: '雲林', top: 0.46, left: 0.2 },
  { name: '嘉義', top: 0.52, left: 0.33},
  { name: '台南', top: 0.59, left: 0.2 },
  { name: '高雄', top: 0.7, left: 0.34 },
  { name: '屏東', top: 0.62, left: 0.55 },
  { name: '花蓮', top: 0.42, left: 0.67 },
  { name: '宜蘭', top: 0.26, left: 0.76 },
  // 更多县市可以依次添加
];

function Recycle() {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const navigation = useNavigation();

  const handlePress = (region) => {
    navigation.navigate('RegionScreen', { regionName: region });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <Image
          source={require('../assets/Images/taiwan.png')}
          style={styles.mapImage}
        />
        {mapRegions.map((region) => (
          <TouchableOpacity
            key={region.name}
            style={[
              styles.regionButton,
              { top: windowHeight * region.top, left: windowWidth * region.left }
            ]}
            onPress={() => handlePress(region.name)}
          >
            <Text style={styles.regionText}>{region.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f0e3',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: Dimensions.get('window').width * 1.2,
    height: Dimensions.get('window').height * 1.2,
    resizeMode: 'contain',
  },
  regionButton: {
    position: 'absolute',
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
  },
  regionText: {
    fontSize: 12,
    color: '#333',
  },
});

export default Recycle;
