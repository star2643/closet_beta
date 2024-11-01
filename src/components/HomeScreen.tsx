import React, { useRef, useState, useEffect,useCallback } from 'react';
import { ScrollView, Text, View, Image, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator,Modal  } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../services/AuthContext';
import DataDisplayGrid from './DataDisplayGrid';
import OutfitSuggestion from './OutfitSuggestion';
import { useNavigation } from '@react-navigation/native';
import { useData } from '../services/DataContext';
import LoveDataPreview from './LoveDataDisplay';
import { Sun, Cloud, CloudRain, Umbrella, Calendar, Activity, Shirt } from 'lucide-react';
import OutfitDetailModal from './OutfitDisplay';
function HomeScreen() {
  const scrollViewRef = useRef(null);
  const [viewHeight, setViewHeight] = useState(0);
  const [currentDate, setCurrentDate] = useState('');
  const [selectedSection, setSelectedSection] = useState(1);
  const { getClotheNumber } = useAuth();
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const {loveData,data} = useData();
  const navigation = useNavigation();
  const [outfitModalVisible, setOutfitModalVisible] = useState(false);
  const handleShowMore = () => {
     // 導航到收藏穿搭的完整列表頁面
  };
  const handleOutfitSelect = useCallback((outfit) => {
    console.log('handleOutfitSelect called with:', outfit);
    setSelectedOutfit(outfit);
    navigation.navigate('智慧穿搭', { selectedOutfit: outfit });
  }, []);
  

  console.log('HomeScreen render, handleOutfitSelect:', handleOutfitSelect);
  const [clotheAllNum, setclotheAllNum] = useState({
    total_clothe_number: 0,
    top_number: 0,
    bottom_number: 0,
    onepiece_number: 0,
    jacket_number: 0
  });
  const [statisticsData, setstatisticsData] = useState([
    { title: '上裝數量', value: 0 },
    { title: '下裝數量', value: 0 },
    { title: '連身數量', value: 0 },
    { title: '外套數量', value: 0 },
  ]);

  const updateValue = useCallback((title, newValue) => {
    setstatisticsData(prevData =>
      prevData.map(item =>
        item.title === title ? { ...item, value: newValue } : item
      )
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date();
      const Day = { day: 'numeric', month: 'short',year:'numeric' };
      const dateString = today.toLocaleDateString('en-US', Day);
      setCurrentDate(dateString);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isMountedRef = useRef(false);
  const fetchClothingNumbers = useCallback(async () => {
    try {
      const tmp_dict = await getClotheNumber();
      setclotheAllNum(tmp_dict);
      updateValue('上裝數量', tmp_dict.top_number);
      updateValue('下裝數量', tmp_dict.bottom_number);
      updateValue('連身數量', tmp_dict.onepiece_number);
      updateValue('外套數量', tmp_dict.jacket_number);
      console.log(tmp_dict);
      console.log("數據已更新");
    } catch (error) {
      console.error("Error fetching clothe number:", error);
    }
  }, [getClotheNumber, updateValue]);
  useFocusEffect(
    useCallback(() => {
      fetchClothingNumbers();
      return () => {
        console.log('頁面失去焦點了！');
        // 在這裡你可以執行清理操作
      };
    }, [fetchClothingNumbers])
  );
  useEffect(() => {
    console.log('loveData updated:', loveData);
  }, [loveData]);
  const sectionRefs = {
    1: useRef(null),
    2: useRef(null),
    3: useRef(null),
  };

  const sectionHeights = [viewHeight, viewHeight, viewHeight];

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const nearestSection = getNearestSection(scrollY);
    setSelectedSection(nearestSection);
  };

  const getNearestSection = (scrollY) => {
    let offset = 0;
    for (let i = 0; i < sectionHeights.length; i++) {
      offset += sectionHeights[i];
      const sectionMidPoint = offset - sectionHeights[i] / 2;
      if (scrollY < sectionMidPoint) {
        return i + 1;
      }
    }
    return sectionHeights.length;
  };

  const scrollToSection = (id) => {
    const targetRef = sectionRefs[id].current;
    if (targetRef) {
      targetRef.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ y, animated: true });
          setTimeout(() => {
            setSelectedSection(id);
          }, 300);
        },
        (error) => {
          console.error(error);
        }
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f0e3' }}>
      
      <View style={{ height:'25%' }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <View style={styles.rectangle}>
            <View style={{width:'50%'}}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{currentDate}</Text>
            </View>
            <View style={{marginLeft:25}}>
            <Text style={{fontSize:28,fontWeight:'bold',color:'rgba(200,180,154,1)'}}>您好，</Text>
            <Text style={{fontSize:4,fontWeight:'bold',color:'rgba(200,180,154,1)'}}></Text>
            <Text style={{fontSize:16,color:'black',textDecorationLine: 'underline'}}>今天想穿點什麼呢？</Text>
            </View>
            </View>
            <WeatherInfo />
          </View>
          <View style={styles.rectangle}>
            <Text>Rectangle 2</Text>
          </View>
          <View style={styles.rectangle}>
            <Text>Rectangle 3</Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.container}>
        <View style={styles.navContainer}>
          <TouchableOpacity
            onPress={() => scrollToSection(1)}
            style={[
              styles.navItem,
              selectedSection === 1 && styles.selectedNavItem,
            ]}
          >
            <Text style={styles.navText}>智慧穿搭</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => scrollToSection(2)}
            style={[
              styles.navItem,
              selectedSection === 2 && styles.selectedNavItem,
            ]}
          >
            <Text style={styles.navText}>衣櫃數據</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => scrollToSection(3)}
            style={[
              styles.navItem,
              selectedSection === 3 && styles.selectedNavItem,
            ]}
          >
            <Text style={styles.navText}>收藏穿搭</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          pagingEnabled
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onLayout={(event) => setViewHeight(event.nativeEvent.layout.height)}
        >
          <View ref={sectionRefs[1]} style={[{ height: viewHeight }]}>
            <View ref={sectionRefs[1]} style={[styles.section, { margin: 10 }]}>
            <OutfitSuggestion onOutfitSelect={handleOutfitSelect} />
            </View>
          </View>
          <View ref={sectionRefs[2]} style={[{ height: viewHeight }]}>
            <View ref={sectionRefs[2]} style={[styles.section, { margin: 10 }]}>
              <DataDisplayGrid data={statisticsData} />
            </View>
          </View>
          <View ref={sectionRefs[3]} style={[{ height: viewHeight }]}>
            <View ref={sectionRefs[3]} style={[styles.section, { margin: 10 }]}>
            <LoveDataPreview 
                loveData={loveData} 
                onShowMore={() => setOutfitModalVisible(true)}
                previewCount={3} // 顯示前3個收藏的穿搭
              />
            </View>
          </View>
        </ScrollView>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={outfitModalVisible}
        onRequestClose={() => setOutfitModalVisible(false)}
      >
        <OutfitDetailModal
          outfits={loveData}
          onClose={() => setOutfitModalVisible(false)}
        />
      </Modal>
    </View>
  );
}
const API_KEY = 'CWA-729AFB2B-4F3F-4C74-B63D-E37848253038';
const LOCATION = '桃園市';

function WeatherInfo() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setWeatherInfo } = useData();

  const fetchWeatherData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${API_KEY}&locationName=${encodeURIComponent(LOCATION)}`
      );
      const data = await response.json();
      console.log(data);
      setWeatherData(data);
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentWeatherInfo = useCallback(() => {
    if (!weatherData || !weatherData.records || !weatherData.records.location) {
      return null;
    }

    const location = weatherData.records.location[0];
    const currentTime = new Date();

    const weatherElements = {};
    location.weatherElement.forEach(element => {
      const earliestTimeInfo = element.time.reduce((earliest, timeInfo) => {
        const startTime = new Date(timeInfo.startTime);
        return startTime < new Date(earliest.startTime) ? timeInfo : earliest;
      }, element.time[0]);

      const relevantTimeInfo = currentTime < new Date(earliestTimeInfo.startTime)
        ? earliestTimeInfo
        : element.time.find(timeInfo => {
            const startTime = new Date(timeInfo.startTime);
            const endTime = new Date(timeInfo.endTime);
            return currentTime >= startTime && currentTime <= endTime;
          }) || earliestTimeInfo;

      weatherElements[element.elementName] = relevantTimeInfo.parameter;
    });

    return weatherElements;
  }, [weatherData]);

  // 使用 useEffect 來更新 weatherInfo
  useEffect(() => {
    const currentWeather = getCurrentWeatherInfo();
    if (currentWeather) {
      setWeatherInfo(currentWeather);
    }
  }, [getCurrentWeatherInfo, setWeatherInfo]);

  useFocusEffect(
    useCallback(() => {
      fetchWeatherData();
    }, [fetchWeatherData])
  );

  if (loading) {
    return (
      <View style={styles.weatherContainer}>
        <ActivityIndicator size="large" color="#D2B48C" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.weatherContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const currentWeather = getCurrentWeatherInfo();
  
  if (!currentWeather) {
    return (
      <View style={styles.weatherContainer}>
        <Text style={styles.errorText}>No weather data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.weatherContainer}>
      <Text style={styles.weatherTitle}>今日天氣</Text>
      <Text style={styles.weatherMain} numberOfLines={1} adjustsFontSizeToFit>
        {currentWeather.Wx.parameterName}
      </Text>
      <View style={styles.tempContainer}>
        <Text style={styles.tempText}>{currentWeather.MaxT.parameterName}°C</Text>
        <Text style={styles.tempSeparator}> / </Text>
        <Text style={styles.tempText}>{currentWeather.MinT.parameterName}°C</Text>
      </View>
      <Text style={styles.rainChance}>
        降雨機率：{currentWeather.PoP.parameterName}%
      </Text>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  weatherContainer: {
  
    width: '40%',
    height:'90%',
    alignSelf:'flex-end',
    margin:10,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a4a4a',
    marginBottom: 5,
  },
  weatherMain: {
    fontSize:16,
    color: '#333',
    marginBottom: 5,
  },
  tempContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    alignSelf:'flex-start'
  },
  tempText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  tempSeparator: {
    fontSize: 18,
    color: '#666',
  },
  rainChance: {
    fontSize: 14,
    color: '#4a4a4a',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
  container: {
    height:'75%',
    backgroundColor: '#f8f0e3',
    
  },
  navContainer: {
    height:'10%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal:10,
    borderRadius:20,
    backgroundColor: '#Ffffff',
  },
  navItem: {
    padding: 4,
    borderBottomWidth: 0,
    alignSelf:'center',
    borderBottomColor: 'transparent',
  },
  selectedNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#D2B48C',
  },
  navText: {
    fontSize: 15,
    color: '#333',
  },
  scrollView: {
    height:'90%',
    backgroundColor: '#f8f0e3',
  },
  section: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddc9af',
    borderRadius: 20,
    margin: 10,
  },
  sectionText: {
    fontSize: 18,
    color: '#fff',
  },
  rectangleText: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
  },
  dateContainer: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(225, 219, 209, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    alignContent:'flex-start',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    margin:10,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dateText: {
    fontSize: 20,
    color: '#4a4a4a',
    fontWeight: 'bold',
  },
  rectangle: {
    height: '90%',
    flexDirection:'row',
    width: screenWidth - 30,
    backgroundColor: 'rgba(255,255,255,1)',
    borderRadius: 25,
    justifyContent: 'space-between',
    marginHorizontal: 15,
    alignSelf:'center'
    
  },
});

const additionalStyles = StyleSheet.create({
  rectangle: {
    backgroundColor: '#f8f0e3',
    padding: 10,
    width: '100%',
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -12,
    marginLeft: -2,
  },
  image: {
    width: 65,
    height: 60,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
});

export default HomeScreen;
