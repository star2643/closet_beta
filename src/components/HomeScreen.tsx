import React, { useRef, useState, useEffect,useCallback } from 'react';
import { ScrollView, Text, View, Image, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useData } from '../services/DataContext'
function HomeScreen() {
  const scrollViewRef = useRef(null);
  const [viewHeight, setViewHeight] = useState(0);
  const [currentDate, setCurrentDate] = useState('');
  const [selectedSection, setSelectedSection] = useState(1);
  const{  }=useData
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date();
      const Day = { day: 'numeric', month: 'short' };
      const dateString = today.toLocaleDateString('en-US', Day);
      setCurrentDate(dateString);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  // 使用 setTimeout 延遲狀態更新，避免按鈕之間的飄移問題
  const scrollToSection = (id) => {
    const targetRef = sectionRefs[id].current;
    if (targetRef) {
      targetRef.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          // 滾動到對應的區塊
          scrollViewRef.current.scrollTo({ y, animated: true });

          // 延遲狀態更新，確保滾動完成後再更新底線狀態
          setTimeout(() => {
            setSelectedSection(id);
          }, 300); // 延遲 300ms
        },
        (error) => {
          console.error(error);
        }
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f0e3' }}>
      <View style={{ flex: 1 }}>
        <View style={additionalStyles.rectangle}>
          <View style={additionalStyles.row}>
            <Image
              source={require('../assets/Images/logo.png')}
              style={additionalStyles.image}
            />
          </View>
        </View>
      </View>
      <View style={{ flex: 3 }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <View style={styles.rectangle}>
            <WeatherInfo />
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{currentDate}</Text>
            </View>
            
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
              <Text style={styles.sectionText}>This is Section 1</Text>
            </View>
          </View>
          <View ref={sectionRefs[2]} style={[{ height: viewHeight }]}>
            <View ref={sectionRefs[2]} style={[styles.section, { margin: 10 }]}>
              <Text style={styles.sectionText}>This is Section 2</Text>
            </View>
          </View>
          <View ref={sectionRefs[3]} style={[{ height: viewHeight }]}>
            <View ref={sectionRefs[3]} style={[styles.section, { margin: 10 }]}>
              <Text style={styles.sectionText}>This is Section 3</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
const API_KEY = 'CWA-729AFB2B-4F3F-4C74-B63D-E37848253038';
const LOCATION = '桃園市';

function WeatherInfo() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeatherData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${API_KEY}&locationName=${encodeURIComponent(LOCATION)}`
      );
      const data = await response.json();
      console.log(data)
      setWeatherData(data);
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWeatherData();
    }, [fetchWeatherData])
  );

  const getCurrentWeatherInfo = () => {
    if (!weatherData || !weatherData.records || !weatherData.records.location) {
      return null;
    }

    const location = weatherData.records.location[0];
    const currentTime = new Date();

    const weatherElements = {};
    location.weatherElement.forEach(element => {
      // 找出最早的 startTime
      const earliestTimeInfo = element.time.reduce((earliest, timeInfo) => {
        const startTime = new Date(timeInfo.startTime);
        return startTime < new Date(earliest.startTime) ? timeInfo : earliest;
      }, element.time[0]);

      // 如果 currentTime 小於最早的 startTime，使用最早的時間區間
      const relevantTimeInfo = currentTime < new Date(earliestTimeInfo.startTime)
        ? earliestTimeInfo
        : element.time.find(timeInfo => {
            const startTime = new Date(timeInfo.startTime);
            const endTime = new Date(timeInfo.endTime);
            return currentTime >= startTime && currentTime <= endTime;
          }) || earliestTimeInfo; // 如果找不到符合的時間區間，使用最早的

      weatherElements[element.elementName] = relevantTimeInfo.parameter;
    });

    return weatherElements;
  };

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
      <Text style={styles.weatherMain}>{currentWeather.Wx.parameterName}</Text>
      <View style={styles.tempContainer}>
        <Text style={styles.tempText}>{currentWeather.MaxT.parameterName}°C</Text>
        <Text style={styles.tempSeparator}> / </Text>
        <Text style={styles.tempText}>{currentWeather.MinT.parameterName}°C</Text>
      </View>
      <Text style={styles.rainChance}>降雨機率：{currentWeather.PoP.parameterName}%</Text>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  weatherContainer: {
    position: 'absolute',
    right: 10,  // 改為 right
    top: 10,
    width: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a4a4a',
    marginBottom: 5,
  },
  weatherMain: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  tempContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
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
    flex: 9,
    backgroundColor: '#F5F5F5',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    backgroundColor: '#FDFFFF',
  },
  navItem: {
    padding: 6,
    borderBottomWidth: 0,
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
    flex: 1,
    backgroundColor: '#f8f0e3',
  },
  section: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D0C5B4',
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
    width: '50%',
    height: 50,
    backgroundColor: 'rgba(225, 219, 209, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    position: 'absolute',
    left: 10,  // 改為 left
    top: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateText: {
    fontSize: 20,
    color: '#4a4a4a',
    fontWeight: 'bold',
  },
  rectangle: {
    height: '95%',
    width: screenWidth - 40,
    backgroundColor: '#D0C5B4',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    position: 'relative',
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
