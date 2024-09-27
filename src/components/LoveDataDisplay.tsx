import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useData } from '../services/DataContext';
const LoveDataPreview = ({ loveData, onShowMore, previewCount = 3 }) => {
  const {data} = useData();
  const getUrlByFilename = (filename) => {
        const item = data.find(item => item.fileName === filename);
        return item ? item.url : null;
  };  
  const previewData = loveData.slice(0, previewCount);
  const renderOutfitItem = (item) => (
    <View key={item.id} style={styles.outfitItem}>
      <View style={styles.clothingItem}>
        <Image 
          source={{ uri: getUrlByFilename(item.top) }} 
          style={styles.clothingImage} 
        />
        <Text style={styles.clothingText}>Top: {item.top}</Text>
      </View>
      {item.bottom && (
        <View style={styles.clothingItem}>
          <Image 
            source={{ uri: getUrlByFilename(item.bottom) }} 
            style={styles.clothingImage} 
          />
          <Text style={styles.clothingText}>Bottom: {item.bottom}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {previewData.map(renderOutfitItem)}
      <TouchableOpacity style={styles.showMoreButton} onPress={onShowMore}>
        <Text style={styles.showMoreText}>顯示更多</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      padding: 10,
    },
    outfitItem: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    clothingItem: {
      alignItems: 'center',
    },
    clothingImage: {
      width: 80,
      height: 80,
      resizeMode: 'cover',
      borderRadius: 5,
    },
    clothingText: {
      marginTop: 5,
      fontSize: 12,
    },
    showMoreButton: {
      backgroundColor: '#007AFF',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
    },
    showMoreText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
export default LoveDataPreview;