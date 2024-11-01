import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  ImageBackground, 
  StyleSheet, 
  Dimensions, 
  FlatList, 
  Linking, 
  Platform, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const taiwanCities = [
  '臺北市', '臺中市', '基隆市', '臺南市', '高雄市', '新北市', 
  '宜蘭縣', '桃園市', '嘉義市', '新竹縣', '苗栗縣', '南投縣', 
  '彰化縣', '新竹縣', '雲林縣', '嘉義縣', '屏東縣', '花蓮縣', 
  '臺東縣', '金門縣', '澎湖縣', '連江縣'
];
const PAGE_SIZE = 10; // 每頁顯示的數量

class RecycleService {
  static BASE_URL = 'https://recycle.moenv.gov.tw/utmap/api/Store/IndexList';
  static CACHE_KEY = 'recycleData';
  static CACHE_EXPIRY = 24 * 60 * 60 * 1000;

  static async fetchData() {
    try {
      // 檢查緩存
      const cachedData = await AsyncStorage.getItem(this.CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < this.CACHE_EXPIRY) {
          console.log('快取')
          return data;
        }
      }

      const response = await fetch(this.BASE_URL);
      console.log('取得結果')
      const { data } = await response.json();
      console.log('獲取完畢')
      if (!data || !Array.isArray(data)) {
        throw new Error('資料格式錯誤');
      }

      const filteredData = data.filter(item => 
        item.GoodsTypeName && item.GoodsTypeName.includes('舊衣類')
      );

      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify({
        data: filteredData,
        timestamp: Date.now()
      }));

      return filteredData;
    } catch (error) {
      console.error('獲取資料失敗:', error);
      throw error;
    }
  }
}

const RecycleItem = React.memo(({ item, openGoogleMaps, getDisplayAddress }) => (
  <View style={styles.itemContainer}>
    <Text style={styles.itemTitle}>
      {item.SClassName || "回收點"}
    </Text>
    <Text style={styles.itemName}>{item.sname}</Text>
    
    {item.Memo && (
      <Text style={styles.itemDescription}>
        ℹ️ {item.sname}
      </Text>
    )}
    
    {item.phone && (
      <Text style={styles.itemPhone}>
        📞 {item.phone}
      </Text>
    )}
    
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
  </View>
));

function Recycle() {
  const [selectedCity, setSelectedCity] = useState(taiwanCities[0]);
  const [allData, setAllData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [displayData, setDisplayData] = useState([]);

  // 加載初始數據
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const data = await RecycleService.fetchData();
        setAllData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // 當城市改變時重置分頁
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setDisplayData([]);
  }, [selectedCity]);

  // 使用 useMemo 優化城市數據過濾
  const cityData = useMemo(() => {
    if (!allData) return [];
    return allData.filter(item => item.CityName === selectedCity);
  }, [selectedCity, allData]);

  // 加載更多數據
  const loadMoreData = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    const startIndex = page * PAGE_SIZE;
    const newItems = cityData.slice(startIndex, startIndex + PAGE_SIZE);

    if (newItems.length < PAGE_SIZE) {
      setHasMore(false);
    }

    setDisplayData(prev => [...prev, ...newItems]);
    setPage(prev => prev + 1);
    setIsLoadingMore(false);
  }, [cityData, page, hasMore, isLoadingMore]);

  // 初始加載和城市變更時加載數據
  useEffect(() => {
    if (cityData.length > 0) {
      setDisplayData([]);
      setPage(0);
      setHasMore(true);
      loadMoreData();
    }
  }, [cityData]);

  const getDisplayAddress = useCallback((item) => {
    if (item.addr) {
      if (item.addr.includes(item.CityName) && item.addr.includes(item.AreaName)) {
        return item.addr;
      }
      return `${item.CityName}${item.AreaName}${item.addr}`;
    }
    return '地址不詳';
  }, []);

  const openGoogleMaps = useCallback((address) => {
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
  }, []);

  const renderFooter = () => {
    if (!hasMore) return null;
    if (isLoadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#4CAF50" />
        </View>
      );
    }
    return null;
  };

  return (
    <ImageBackground 
      source={require('../assets/Images/out.jpg')} 
      style={styles.fullBackgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.title}>舊衣回收管道</Text>
        <View style={styles.contentContainer}>
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={selectedCity}
              onValueChange={setSelectedCity}
              style={styles.picker}
            >
              {taiwanCities.map((city, index) => (
                <Picker.Item key={index} label={city} value={city} />
              ))}
            </Picker>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>正在加載資料...</Text>
            </View>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <FlatList
              data={displayData}
              renderItem={({ item }) => (
                <RecycleItem
                  item={item}
                  openGoogleMaps={openGoogleMaps}
                  getDisplayAddress={getDisplayAddress}
                />
              )}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={loadMoreData}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={() => (
                <Text style={styles.contentText}>
                  此城市暫無舊衣回收點資料
                </Text>
              )}
              contentContainerStyle={styles.scrollViewContent}
            />
          )}
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
    width:'100%'  },
  itemContainer: {
    backgroundColor: '#fff',
    width:'100%',
    borderRadius: 15,
    padding: 30,
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