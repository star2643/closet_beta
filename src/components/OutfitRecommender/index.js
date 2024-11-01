import React, { useState, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Switch
} from 'react-native';
import OutfitRecommenderService from '../../services/OutfitRecommenderService';
import RecommendationView from './RecommendationView';
import { useData } from '../../services/DataContext';

// 定義選項常量
const OCCASION_OPTIONS = [
  '休閒約會',
  '正式場合',
  '運動活動',
  '日常穿搭'
];

const STYLE_OPTIONS = [
  '簡約時尚',
  '商務正裝',
  '運動休閒',
  '浪漫甜美'
];
const GENDER_OPTIONS = [
  '男性',
  '女性'
];
const OutfitRecommender = ({
  apiKey,
  clothingUrls,
  onAnalysisComplete,
  onRecommendationComplete,
  onError,
  hasRecommended,
  recommendation,
  setRecommendation,
  onClose,
  setHasRecommended
}) => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showSetup, setShowSetup] = useState(true);
  const [useCurrentTemp, setUseCurrentTemp] = useState(true);
  const { weatherInfo } = useData();
  console.log(hasRecommended)
  // 初始化 conditions
  const [conditions, setConditions] = useState({
    Maxtemperature: weatherInfo?.currentWeather?.MaxT?.parameterName || 25,
    Mintemperature: weatherInfo?.currentWeather?.MinT?.parameterName || 20,
    occasion: '休閒約會',
    style: '簡約時尚',
    gender: '男性' // 添加默認性別
  });

  const resetState = () => {
    setLoading(false);
    setAnalyzing(false);
    setError(null);
    setProgress(0);
  };

  const handleError = useCallback((error) => {
    console.error('錯誤:', error);
    setError(error.message);
    onError?.(error);
    Alert.alert(
      '錯誤',
      error.message,
      [{ text: '確定' }]
    );
  }, [onError]);

  const getRecommendation = useCallback(async () => {
    if (!clothingUrls?.length) {
      handleError(new Error('請提供服飾圖片'));
      return;
    }
    if (hasRecommended) {
      console.log('已經執行過推薦，跳過重新執行');
      return;
    }
    resetState();
    setLoading(true);

    try {
      const service = new OutfitRecommenderService(apiKey);
      setAnalyzing(true);
      const totalImages = clothingUrls.length;
      
      for (let i = 0; i < clothingUrls.length; i++) {
        const url = clothingUrls[i];
        try {
          await service.analyzeClothing(url);
          setProgress(((i + 1) / totalImages) * 100);
        } catch (err) {
          console.error(`分析圖片失敗 ${url}:`, err);
        }
      }
      
      setAnalyzing(false);
      onAnalysisComplete?.();
      
      const result = await service.recommendOutfit(conditions);
      setRecommendation(result);
      onRecommendationComplete?.(result);
      
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [apiKey, clothingUrls, conditions, handleError, onAnalysisComplete, onRecommendationComplete, hasRecommended]);
  const renderGenderSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>性別</Text>
      <View style={styles.optionsContainer}>
        {GENDER_OPTIONS.map((gender) => (
          <TouchableOpacity
            key={gender}
            style={[
              styles.optionButton,
              conditions.gender === gender && styles.optionButtonSelected
            ]}
            onPress={() => setConditions(prev => ({ ...prev, gender }))}
          >
            <Text style={[
              styles.optionText,
              conditions.gender === gender && styles.optionTextSelected
            ]}>
              {gender}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
  const renderTemperatureSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>溫度範圍</Text>
      
      <View style={styles.switchContainer}>
        <Text>使用當前溫度</Text>
        <Switch
          value={useCurrentTemp}
          onValueChange={(value) => {
            setUseCurrentTemp(value);
            if (value) {
              setConditions(prev => ({
                ...prev,
                Maxtemperature: weatherInfo?.currentWeather?.MaxT?.parameterName || 25,
                Mintemperature: weatherInfo?.currentWeather?.MinT?.parameterName || 20,
              }));
            }
          }}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={useCurrentTemp ? '#2196F3' : '#f4f3f4'}
        />
      </View>

      {useCurrentTemp ? (
        <View style={styles.tempInfo}>
          <Text style={styles.tempText}>
            最高溫度：{conditions.Maxtemperature}°C
          </Text>
          <Text style={styles.tempText}>
            最低溫度：{conditions.Mintemperature}°C
          </Text>
        </View>
      ) : (
        <View style={styles.tempInputContainer}>
          <View style={styles.tempInputGroup}>
            <Text style={styles.tempLabel}>最高溫度</Text>
            <TextInput
              style={styles.tempInput}
              value={String(conditions.Maxtemperature)}
              onChangeText={(text) => {
                const temp = parseInt(text) || 0;
                setConditions(prev => ({
                  ...prev,
                  Maxtemperature: temp,
                  Mintemperature: Math.min(prev.Mintemperature, temp)
                }));
              }}
              keyboardType="numeric"
              maxLength={2}
              placeholder="°C"
            />
            <Text style={styles.tempUnit}>°C</Text>
          </View>

          <View style={styles.tempInputGroup}>
            <Text style={styles.tempLabel}>最低溫度</Text>
            <TextInput
              style={styles.tempInput}
              value={String(conditions.Mintemperature)}
              onChangeText={(text) => {
                const temp = parseInt(text) || 0;
                setConditions(prev => ({
                  ...prev,
                  Mintemperature: temp,
                  Maxtemperature: Math.max(prev.Maxtemperature, temp)
                }));
              }}
              keyboardType="numeric"
              maxLength={2}
              placeholder="°C"
            />
            <Text style={styles.tempUnit}>°C</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderSetup = () => (
    <ScrollView style={styles.setupContainer}>
      <Text style={styles.setupTitle}>請選擇穿搭場合和風格</Text>
      {renderGenderSection()}
      {renderTemperatureSection()}

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>場合</Text>
        <View style={styles.optionsContainer}>
          {OCCASION_OPTIONS.map((occasion) => (
            <TouchableOpacity
              key={occasion}
              style={[
                styles.optionButton,
                conditions.occasion === occasion && styles.optionButtonSelected
              ]}
              onPress={() => setConditions(prev => ({ ...prev, occasion }))}
            >
              <Text style={[
                styles.optionText,
                conditions.occasion === occasion && styles.optionTextSelected
              ]}>
                {occasion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>風格</Text>
        <View style={styles.optionsContainer}>
          {STYLE_OPTIONS.map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                styles.optionButton,
                conditions.style === style && styles.optionButtonSelected
              ]}
              onPress={() => setConditions(prev => ({ ...prev, style }))}
            >
              <Text style={[
                styles.optionText,
                conditions.style === style && styles.optionTextSelected
              ]}>
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => {
          setShowSetup(false);
          setHasRecommended(false);
          getRecommendation();
          
        }}
      >
        <Text style={styles.startButtonText}>開始分析</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderProgress = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[styles.progressFill, { width: `${progress}%` }]} 
        />
      </View>
      <Text style={styles.progressText}>{`${Math.round(progress)}%`}</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={getRecommendation}
      >
        <Text style={styles.retryButtonText}>重試</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.loadingText}>
        {analyzing ? '分析服飾中...' : '生成搭配建議中...'}
      </Text>
      {analyzing && renderProgress()}
    </View>
  );

  const renderButtons = () => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={[styles.button, styles.buttonRetry]}
        onPress={() => {
          setShowSetup(true);
          onRecommendationComplete?.(null);
          setHasRecommended(false)
        }}
      >
        <Text style={styles.buttonText}>重新搭配</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, styles.buttonClose]}
        onPress={onClose}
      >
        <Text style={styles.buttonText}>關閉</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {showSetup ? (
        renderSetup()
      ) : (
        <>
          {loading && renderLoading()}
          {error && renderError()}
          {!loading && !error && recommendation && (
            <RecommendationView recommendation={recommendation} />
          )}
          {!loading && renderButtons()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // 容器相關
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  setupContainer: {
    flex: 1,
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4, // 替代 gap
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5E6D3', // 更淺的奶茶色邊框
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    width: '80%',
    marginTop: 20,
  },
  errorContainer: {
    padding: 16,
    margin: 16,
    backgroundColor: '#FFE6E6',
    borderRadius: 8,
    alignItems: 'center',
  },

  // 標題文字相關
  setupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#8B5E3C', // 深奶茶色
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#8B5E3C', // 深奶茶色
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#A67B5B', // 中奶茶色
  },
  progressText: {
    textAlign: 'center',
    marginTop: 5,
    color: '#A67B5B', // 中奶茶色
  },
  errorText: {
    color: '#D35D6E', // 柔和的紅色
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionText: {
    color: '#A67B5B', // 中奶茶色
  },
  optionTextSelected: {
    color: 'white',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // 溫度設置相關
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 12,
  },
  tempInfo: {
    backgroundColor: '#FDF5E6', // 非常淺的奶茶色背景
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tempText: {
    fontSize: 14,
    color: '#8B5E3C', // 深奶茶色
    marginBottom: 4,
  },
  tempInputContainer: {
    backgroundColor: '#FDF5E6', // 非常淺的奶茶色背景
    padding: 12,
    borderRadius: 8,
  },
  tempInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tempLabel: {
    flex: 1,
    fontSize: 14,
    color: '#A67B5B', // 中奶茶色
  },
  tempInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DEB887', // 淺奶茶色邊框
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 60,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  tempUnit: {
    fontSize: 14,
    color: '#A67B5B', // 中奶茶色
    width: 30,
  },

  // 進度條相關
  progressBar: {
    height: 10,
    backgroundColor: '#FDF5E6', // 非常淺的奶茶色背景
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#DEB887', // 淺奶茶色
  },

  // 按鈕相關
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  buttonClose: {
    backgroundColor: '#B8907D', // 稍深的奶茶色
  },
  buttonRetry: {
    backgroundColor: '#DEB887', // 淺奶茶色
  },
  retryButton: {
    backgroundColor: '#DEB887', // 淺奶茶色
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DEB887', // 淺奶茶色邊框
    margin: 4,
    backgroundColor: 'white',
  },
  optionButtonSelected: {
    backgroundColor: '#DEB887', // 淺奶茶色
    borderColor: '#DEB887', // 淺奶茶色
  },
  startButton: {
    backgroundColor: '#DEB887', // 淺奶茶色
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
  },

  content: {
    flex: 1,
  },

  separator: {
    height: 1,
    backgroundColor: '#F5E6D3', // 更淺的奶茶色
    marginVertical: 16,
  },
});

export default OutfitRecommender;