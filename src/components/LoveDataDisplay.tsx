import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground } from 'react-native';
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
        <Text style={styles.clothingText}>上身</Text>
      </View>
      {item.bottom && (
        <View style={styles.clothingItem}>
          <Image 
            source={{ uri: getUrlByFilename(item.bottom) }} 
            style={styles.clothingImage} 
          />
          <Text style={styles.clothingText}>下裝</Text>
        </View>
      )}
    </View>
  );

  return (
    <ImageBackground style={{width:'100%',height:'100%',flexDirection: 'column',}} source={require('../assets/Images/LoveDataBack.jpg')}>
      <View style={styles.titleContainer}>
        <View style={styles.titleBox}>
          <Text style={styles.titletext}>收藏穿搭</Text>
          <Text style={styles.titletext2}>好的穿搭，值得重複回味</Text>
        </View>
      </View>
      <View style={styles.container}>
        {previewData.map(renderOutfitItem)}
        
      </View>
      <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.showMoreButton} onPress={onShowMore}>
        <Text style={styles.showMoreText}>顯示更多</Text>
      </TouchableOpacity>
      </View>
  </ImageBackground>
  );
};

const styles = StyleSheet.create({
    titletext:{
      color:'black',
      fontSize: 20,
      fontWeight:'bold',
      marginTop:10
    },
    titletext2:{
      color:'black',
      fontSize: 14,
      marginBottom:10
    },
    titleBox:{
      width:'60%',
      height:'75%',
      backgroundColor:'rgba(230, 230, 230,0.9)',
      margin:10,
      borderRadius:20,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleContainer:{
      flex:3,
      alignItems:"center",
      
    },
    container: {
      flex:10,
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'space-between', // 這會使項目平均分散
      width:'100%',
      alignSelf: 'center',
    },
    outfitItem: {
      flexDirection: 'column',
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
      fontSize: 14,
      color:'black'
    },
    buttonContainer:{
      flex:2,
      alignItems:"flex-end",
      justifyContent:'center',
      alignContent:'center',
    },
    showMoreButton: {
      backgroundColor: '#FFF',
      textAlign:'center',
      justifyContent:'center',
      borderRadius: 15,
      alignItems: 'center',
      width:'35%',
      height:'60%',
      marginRight:10
    },
    showMoreText: {
      color: 'black',
      fontSize: 14,
    },
  });
export default LoveDataPreview;