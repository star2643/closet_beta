import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

// 縣市列表
const taiwanCities = [
  '臺北市', '臺中市', '基隆市', '臺南市', '高雄市', '新北市', 
  '宜蘭縣', '桃園市', '嘉義市', '新竹縣', '苗栗縣', '南投縣', 
  '彰化縣', '新竹市', '雲林縣', '嘉義縣', '屏東縣', '花蓮縣', 
  '臺東縣', '金門縣', '澎湖縣', '連江縣'
];

function Recycle() {
  const [selectedCity, setSelectedCity] = useState(taiwanCities[0]);
  const [cityData, setCityData] = useState(null); // 儲存載入的 JSON 資料

  // 當選擇的縣市改變時加載對應的 JSON 檔案
  useEffect(() => {
    const loadCityData = () => {
      let cityDataFile;
      switch (selectedCity) {
        case '臺北市':
          cityDataFile = require('../assets/json/recycle/臺北市.json');
          break;
        case '臺中市':
          cityDataFile = require('../assets/json/recycle/臺中市.json');
          break;
        case '基隆市':
          cityDataFile = require('../assets/json/recycle/基隆市.json');
          break;
        case '臺南市':
          cityDataFile = require('../assets/json/recycle/臺南市.json');
          break;
        case '高雄市':
          cityDataFile = require('../assets/json/recycle/高雄市.json');
          break;
        case '新北市':
          cityDataFile = require('../assets/json/recycle/新北市.json');
          break;
        case '宜蘭縣':
          cityDataFile = require('../assets/json/recycle/宜蘭縣.json');
          break;
        case '桃園市':
          cityDataFile = require('../assets/json/recycle/桃園市.json');
          break;
        case '嘉義市':
          cityDataFile = require('../assets/json/recycle/嘉義市.json');
          break;
        case '新竹縣':
          cityDataFile = require('../assets/json/recycle/新竹縣.json');
          break;
        case '苗栗縣':
          cityDataFile = require('../assets/json/recycle/苗栗縣.json');
          break;
        case '南投縣':
          cityDataFile = require('../assets/json/recycle/南投縣.json');
          break;
        case '彰化縣':
          cityDataFile = require('../assets/json/recycle/彰化縣.json');
          break;
        case '新竹市':
          cityDataFile = require('../assets/json/recycle/新竹市.json');
          break;
        case '雲林縣':
          cityDataFile = require('../assets/json/recycle/雲林縣.json');
          break;
        case '嘉義縣':
          cityDataFile = require('../assets/json/recycle/嘉義縣.json');
          break;
        case '屏東縣':
          cityDataFile = require('../assets/json/recycle/屏東縣.json');
          break;
        case '花蓮縣':
          cityDataFile = require('../assets/json/recycle/花蓮縣.json');
          break;
        case '臺東縣':
          cityDataFile = require('../assets/json/recycle/臺東縣.json');
          break;
        case '金門縣':
          cityDataFile = require('../assets/json/recycle/金門縣.json');
          break;
        case '澎湖縣':
          cityDataFile = require('../assets/json/recycle/澎湖縣.json');
          break;
        case '連江縣':
          cityDataFile = require('../assets/json/recycle/連江縣.json');
          break;
        default:
          cityDataFile = null;
      }
      setCityData(cityDataFile);
    };

    loadCityData();
  }, [selectedCity]);

  return (
    <ImageBackground 
      source={require('../assets/Images/out.jpg')} 
      style={styles.fullBackgroundImage}
      imageStyle={{ resizeMode: 'cover' }}>
      <View style={styles.container}>
        <Text style={styles.title}>Clothes Recycling</Text>
        <View style={styles.contentContainer}>
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={selectedCity}
              onValueChange={(itemValue) => setSelectedCity(itemValue)}
              style={styles.picker}
            >
              {taiwanCities.map((city, index) => (
                <Picker.Item key={index} label={city} value={city} />
              ))}
            </Picker>
          </View>
          <ImageBackground 
            source={require('../assets/Images/recycle.png')} 
            style={styles.largeTextContainer}
            imageStyle={{ resizeMode: 'contain', opacity: 0.1 }}>
            
            {/* 加入 ScrollView 以便滑動查看內容 */}
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              {cityData ? (
                cityData.map((item, index) => (
                  <View key={index} style={styles.itemContainer}>
                    {/* 只顯示名稱與地址 */}
                    <Text style={styles.itemText}>名稱: {item.SClassName}</Text>
                    <Text style={styles.itemText}>地址: {item.addr}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.contentText}>無法加載資料</Text>
              )}
            </ScrollView>

          </ImageBackground>
        </View>
      </View>
    </ImageBackground>
  );
}

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  fullBackgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f0e3',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#D2B48C',
    position: 'absolute',
    top: 60,
  },
  dropdownContainer: {
    height: 100,
    backgroundColor: '#f8f0e3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    width: screenWidth - 80,
    borderRadius: 25,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#e1dbd1',
    borderRadius: 10,
  },
  largeTextContainer: {
    width: screenWidth - 50,
    height: screenHeight * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: '#B8AC9B',
    borderWidth: 1,
    borderColor: '#D2B48C',
    padding: 20,
  },
  scrollViewContent: {
    alignItems: 'center',
    
  },
  itemContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width:'100%',
    paddingBottom: 10,
  },
  itemText: {
    fontSize: 18,
    color: '#333',
  },
  contentText: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'serif',
  },
});

export default Recycle;
