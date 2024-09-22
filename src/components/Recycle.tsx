import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ImageBackground, 
  StyleSheet, 
  Dimensions, 
  ScrollView, 
  Linking, 
  Platform, 
  TouchableOpacity ,
  ActivityIndicator
} from 'react-native';
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
  const [isLoading, setIsLoading] = useState(true);
  // 當選擇的縣市改變時加載對應的 JSON 檔案
  useEffect(() => {
    const loadCityData = () => {
      setIsLoading(true);
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
      setIsLoading(false);
    };

    loadCityData();
  }, [selectedCity]);
  const openGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps://app?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const browserUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        Linking.openURL(browserUrl);
      }
    });
  };
  const getDisplayAddress = (item) => {
    if (item.addr.includes(item.CityName) && item.addr.includes(item.AreaName)) {
      return item.addr;
    } else {
      return `${item.CityName}${item.AreaName}${item.addr}`;
    }
  };
  return (
    <ImageBackground 
      source={require('../assets/Images/out.jpg')} 
      style={styles.fullBackgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>舊衣回收管道</Text>
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
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>正在加載資料...</Text>
              </View>
            ) : cityData ? (
              cityData.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                  <Text style={styles.itemTitle}>{item.SClassName}</Text>
                  <Text style={styles.itemName}>{item.sname}</Text>
                  
                  {item.memo && (
                    <Text style={styles.itemDescription}>
                      ℹ️ {item.memo || "無詳細描述"}
                    </Text>
                  )}
                  
                  {item.phone && (
                    <Text style={styles.itemPhone}>
                      📞 {item.phone}
                    </Text>
                  )}
                  
                  {item.addr !== "無" && (
                    <View>
                      <Text style={styles.itemAddress}>
                        📍 {getDisplayAddress(item)}
                      </Text>
                      <TouchableOpacity 
                        style={styles.mapButton}
                        onPress={() => openGoogleMaps(getDisplayAddress(item))}
                      >
                        <Text style={styles.mapButtonText}>🗺️ 在地圖中查看</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.contentText}>無法加載資料</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </ImageBackground>
  );
}

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  fullBackgroundImage: {
    flex: 1,
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
    height: '90%',
    backgroundColor: 'rgba(248, 240, 227, 0.9)',
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    
    color: 'rgba(196, 148, 90)',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    position: 'absolute',
    top: 20,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    width: screenWidth - 40,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  scrollViewContent: {
    paddingHorizontal: 20,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  mapButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  mapButtonText: {
    color: 'white',
    fontSize: 14,
  },
  contentText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});

export default Recycle;