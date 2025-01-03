
import React, { useState, useEffect, useCallback, useRef,useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ImageBackground, StyleSheet, Dimensions, Alert, Animated, FlatList,ActivityIndicator, Modal  } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import axios from 'axios';
import RNFS from 'react-native-fs';
import { useData } from '../services/DataContext'
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import uploadToImgur from '../services/uploadToCloudinary';
import OutfitRecommender from './OutfitRecommender';

import ApiConfig from '../config/apiConfig';
interface InputData {
  top_garment_url: string;
  person_image_url: string;
  bottom_garment_url?: string; // 使用可选属性
}

interface AitryonData {
  model: string;
  input: InputData;
  parameters: {
    resolution: number;
    restore_face: boolean;
  };
}
// AIdressing 组件定义
function AIdressing() {
  const [apiKey, setApiKey] = useState(null);

  
  

  const RenderButtons = () => (
    <View style={AI.buttonContainer}>
      
      <TouchableOpacity 
        style={AI.button} 
        onPress={handleOpenRecommender}
      >
        <Text style={AI.buttonText}>獲取搭配建議</Text>
      </TouchableOpacity>
      
    </View>
  );
  const [isRecommenderVisible, setIsRecommenderVisible] = useState(false);
  const [selectedClothing, setSelectedClothing] = useState([]); 
  const [imagesUrl, setImageUrl] = useState({top:'',bottom:'',people:''});
  const [isAPILoading, setIsAPILoading] = useState(false);
  const [resultUrl, setResultUrl] = useState({ top: '', bottom: '' ,people:''});
  const [result, setResult] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null);
  const [finalImageUrl, setFinalImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [taskId,setTaskId]=useState('');
  const title=['top','bottom','people']
  const { data,isLoading,modelImage } = useData();
  const [isExpanded, setIsExpanded] = useState(false); // 控制彈出框的狀態
  const modelPosition = useRef(new Animated.Value(0)).current;
  const expansionWidth = useRef(new Animated.Value(0)).current;
  const topClothing = useMemo(() => data.filter(item => item.classes.includes('上裝') || item.classes.includes('連身')), [data]);
  const bottomClothing = useMemo(() => data.filter(item => item.classes.includes('下裝')), [data]);
  const [selectedTop, setSelectedTop] = useState(null);
  const [selectedBottom, setSelectedBottom] = useState(null);
  const [accessToApi,setaccessToApi]=useState(false)
  const route = useRoute();
  const { selectedOutfit } = route.params || {};  // 獲取傳遞的參數
  const [autoProcess,setAutoProcess]=useState(false);
  const [hasRecommended, setHasRecommended] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  
  const convertImageUrl = (originalUrl) => {
    // 使用你的實際 Fastly service ID: hFoYcbBRKWlVMTJymwA9k4
    const FASTLY_DOMAIN = "https://hFoYcbBRKWlVMTJymwA9k4.global.ssl.fastly.net";
    
    // 構建圖片處理參數
    const params = new URLSearchParams({
      url: originalUrl,
      width: '800',
      quality: '80',
      format: 'auto',
      dpr: 'auto'
    });
    
    return `${FASTLY_DOMAIN}/image/optimize?${params}`;
  };
  

  const handleOpenRecommender = () => {
    // 從 topClothing 和 bottomClothing 中獲取所有 URL
    const allClothingUrls = [...topClothing, ...bottomClothing].map(item => item.url);
    setSelectedClothing(allClothingUrls);
    setIsRecommenderVisible(true);
  };
  
  const handleCloseRecommender = () => {
    setIsRecommenderVisible(false);
  };
  
  const handleRecommendationComplete = (result) => {
    console.log('搭配推薦完成:', result);
    setHasRecommended(true);
    setRecommendation(result)
    // 這裡可以處理推薦結果，例如更新選中的衣物等
  };

  useEffect(() => {
    const updateImagesAndUpload = () => {
      if (selectedOutfit) {
        // 重置 resultUrl，确保新的操作开始前状态清空
        setResultUrl({ top: '', bottom: '', people: '' });
        
        // 更新 imagesUrl 并在完成更新后执行 uploadDirectly
        setImageUrl(prevState => {
          const newState = {
            ...prevState,
            top: selectedOutfit.top.url,
            bottom: selectedOutfit.bottom ? selectedOutfit.bottom.url : null,
          };
          
          return newState; // 返回更新后的状态
        });
        setAutoProcess(true)
      }
    };
  
    updateImagesAndUpload(); // 当 selectedOutfit 改变时，调用此函数
  }, [selectedOutfit]);
  useEffect(() => {
    const handleUpload = async () => {
      if (autoProcess) {
        await uploadDirectly();  // 确保异步操作执行完成
        setAutoProcess(false);   // 上传完成后将 `autoProcess` 设置为 false
      }
    };
  
    handleUpload();  // 调用异步函数
  }, [autoProcess]);
  const updateimagesUrl = (type, url) => {
    setImageUrl(prevState => ({
      ...prevState,
      [type]: url
    }));
  };
  useEffect(() => {
    
    if (modelImage) {
      setImageUrl(prevState => ({
        ...prevState,
        ['people']: modelImage
        
      }));
      console.log(modelImage)
    }
  }, [modelImage]);
  useEffect(() => {
    
    if (resultUrl.top && resultUrl.people && accessToApi) {
      submitImageSynthesisTask();
    }
  }, [resultUrl]);
  const convertToBase64 = async (filePath) => {
    if(!filePath)
      return filePath
    if (filePath.startsWith('file:')) {
      try {
        // 移除 "file://" 前綴，因為 RNFS.readFile 在某些平台上可能不需要它
        const adjustedPath = filePath.replace('file://', '');
        
        // 讀取文件內容
        const base64 = await RNFS.readFile(adjustedPath, 'base64');
        
        // 根據文件擴展名確定 MIME 類型
        
        // 返回完整的 base64 字符串，包括 MIME 類型
        return base64;
      } catch (error) {
        console.error('Error converting file to base64:', error);
        Alert.alert('Error converting file to base64:', '發生未知錯誤');
        throw error; // 拋出錯誤而不是返回 null，讓調用者決定如何處理錯誤
      }
    }
    // 如果不是 file: 開頭，直接返回原始路徑
    return filePath;
  };
  
  // 輔助函數來確定 MIME 類型
  const uploadToFreeimage = async (imagesUrl) => {
    const Tmpresult_url = [];
    
    for(let i = 0; i < 3; i++) {
      try {
        if (!imagesUrl[title[i]]) {
          if(title[i] === 'bottom') {
            Tmpresult_url.push('');
            continue;
          }
          throw new Error(`No image for ${title[i]}`);
        }
  
        const imageSource = imagesUrl[title[i]];
        let processedUrl;
  
        // 如果是 URL
        if (typeof imageSource === 'string' && imageSource.startsWith('http')) {
          processedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageSource)}`;
        } 
        // 如果是本地文件或 base64
        else {
          const imgurUrl = await uploadToImgur(
            imageSource.startsWith('file:') ? await convertToBase64(imageSource) : imageSource
          );
          processedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imgurUrl)}`;
        }
  
        console.log(`${title[i]} processed URL:`, processedUrl);
        Tmpresult_url.push(processedUrl);
  
      } catch (error) {
        console.error(`Error processing ${title[i]}:`, error);
        if (title[i] === 'bottom') {
          Tmpresult_url.push('');
        } else {
          throw error;
        }
      }
    }
  
  
    console.log('處理結果:', Tmpresult_url);
    
    if (Tmpresult_url && Tmpresult_url.length === 3) {
      await setResultUrl(prevState => {
        const newState = {top: Tmpresult_url[0], bottom: Tmpresult_url[1], people: Tmpresult_url[2]};
        console.log("New resultUrl:", newState);
        return newState;
      });
    } else {
      throw new Error("處理圖片失敗");
    }
  };
  
  

  const handleImageUpload = () => {
    setIsExpanded(true); // 展開彈出框，並隱藏浮動按鈕
    Animated.parallel([
      Animated.timing(modelPosition, {
        toValue: screenWidth * 0.5, // 向右移動 50% 的螢幕寬度
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(expansionWidth, {
        toValue: screenWidth * 1, // 設定框的寬度為螢幕的 100%
        duration: 500,
        useNativeDriver: false,
      })
    ]).start();
  };

  const handleClosePopup = () => {
    setIsExpanded(false); // 收起彈出框並顯示浮動按鈕
    setSelectedTop(prevTop => {
      const newTop = resultUrl.top;
      console.log('New Top:', newTop);
      return newTop;
    });
    
    setSelectedBottom(prevBottom => {
      const newBottom = resultUrl.bottom;
      console.log('New Bottom:', newBottom);
      return newBottom;
    });
    console.log(selectedTop,' ',selectedBottom)
    Animated.parallel([
      Animated.timing(modelPosition, {
        toValue: 0, // 回到原點
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(expansionWidth, {
        toValue: 0, // 縮小到 0 寬度
        duration: 500,
        useNativeDriver: false,
      })
    ]).start();
  };
  useEffect(() => {
    console.log(selectedTop, ' ', selectedBottom);
  }, [selectedTop, selectedBottom]);
  useEffect(() => {
    console.log(imagesUrl);
  }, [imagesUrl]);
  const renderClothingItem = ({ item, type }) => {
    const isSelected = type === 'top' ? selectedTop === item.url : selectedBottom === item.url;
  
    const handleSelect = () => {
      if (type === 'top') {
        setSelectedTop(isSelected ? null : item.url);
      } else {
        setSelectedBottom(isSelected ? null : item.url);
      }
    };
  
    return (
      <TouchableOpacity 
        style={[
          AI.clothingItem, 
          isSelected && AI.selectedClothingItem
        ]} 
        onPress={handleSelect}
      >
        <Image source={{ uri: item.url }} style={AI.clothingImage} />
      </TouchableOpacity>
    );
  };
  const submitImageSynthesisTask = async () => {
    const { baseUrl, headers } = ApiConfig.getDashScopeConfig();
    const apiUrl = `${baseUrl}/services/aigc/image2image/image-synthesis`;
    
    const data = {
      model: "aitryon",
      input: {
        top_garment_url: resultUrl.top,
        person_image_url: resultUrl.people
      },
      parameters: {
        resolution: -1,
        restore_face: true
      }
    };
  
    if (resultUrl.bottom?.trim()) {
      data.input.bottom_garment_url = resultUrl.bottom;
    }
  
    for (let i = 0; i < 10; i++) {
      try {
        const response = await axios.post(apiUrl, data, { headers });
      
        if (response.status === 200) {
          setResult(response.data);
          setTaskId(response.data.output.task_id);
          startPolling();
          Alert.alert("正在生成您專屬的穿搭效果", "可能會需要一些時間，請您耐心等候");
          break;
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        //console.error("任務提交失敗:", error);
        if (i === 9) {  // 最後一次嘗試失敗
          setIsAPILoading(false);
          Alert.alert("啊！好像出了點問題...", "或許是您的圖片暫時不支援，請您稍後或換張照片後重新嘗試");
        }
      } 
    }
    setResultUrl({ top: '', bottom: '', people: '' });
  };
  const uploadDirectly = async () => {
    setResultUrl({ top: '', bottom: '', people: '' });
    setIsAPILoading(true);
    setaccessToApi(true);
    try {
      await uploadToFreeimage(imagesUrl);
    } catch (error) {
      Alert.alert('錯誤' + error);
      console.log(error);
      setaccessToApi(false);
    } 
    
  };
  useEffect(() => {
    if (result !== null) {
      console.log(result);
    }
  }, [result]);
  
  const checkTaskStatus = useCallback(async () => {
    if (!taskId) return;
  
    try {
      const { baseUrl, headers } = ApiConfig.getDashScopeConfig();
      const queryUrl = `${baseUrl}/tasks/${taskId}`;
      const response = await axios.get(queryUrl, { headers });
      console.log(response)
      if (response.status === 200) {
        const result = response.data;
        setTaskStatus(result.output.task_status);
        
        if (result.output.task_status === "SUCCEEDED") {
          setFinalImageUrl(result.output.image_url);
          setTaskId('');
          setIsAPILoading(false);
          setIsPolling(false);
          
          Alert.alert("任務成功！", "圖片生成完成");
        } else if (result.output.task_status === "FAILED") {
          setError("任务失败");
          setTaskId('');
          setIsAPILoading(false);
          setIsPolling(false);
          Alert.alert("哎呀！好像出了點問題...", "伺服器當前可能出了問題，或您提供的照片可能不被支援，請您稍後或換張照片後重試");
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("查詢失敗:", error);
      setTaskId('');
      setIsAPILoading(false);
      setIsPolling(false);
      Alert.alert("失敗", "查詢狀態失敗");
    }
  }, [taskId]);

  useEffect(() => {
    let intervalId;

    if (isPolling) {
      // 立即执行一次
      checkTaskStatus();
      
      // 然后每3秒执行一次
      intervalId = setInterval(checkTaskStatus, 6000);
    }

    // 清理函数
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling, checkTaskStatus, taskId]);

  const startPolling = () => {
    
    setError(null);
    setTaskStatus(null);
    setFinalImageUrl(null);
    setIsPolling(true);
  };
  const handleConfirm = () => {
    // 在這裡處理確認邏輯
    console.log("選擇已確認");
    updateimagesUrl('top',selectedTop)
    updateimagesUrl('bottom',selectedBottom)
    
    setIsExpanded(false);
      Animated.parallel([
        Animated.timing(modelPosition, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(expansionWidth, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        })
      ]).start();
  };
 
  return (
    <ImageBackground 
      source={require('../assets/Images/out.jpg')} 
      style={AI.fullBackgroundImage}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <View style={AI.container}>
        <Text style={AI.title}>Smart Dressing</Text>
        <View style={AI.contentContainer}>
          <ImageBackground 
            source={require('../assets/Images/back.jpg')} 
            style={AI.innerBackgroundImage}
            imageStyle={{resizeMode: 'cover' }}
            blurRadius={4} 
          >
            <RenderButtons />
            {finalImageUrl ? (
              <Animated.View style={[AI.imageContainer, { transform: [{ translateX: modelPosition }] }]}>
                <Image source={{ uri: finalImageUrl }} style={AI.image}/>
              </Animated.View>
            ) : modelImage ? (
              <Animated.View style={[AI.imageContainer, { transform: [{ translateX: modelPosition }] }]}>
                <Image source={{ uri: modelImage }} style={AI.image} />
              </Animated.View>
            ) : (
              <Animated.View style={[AI.imageContainer, { transform: [{ translateX: modelPosition }] }]}>
                <Image source={require('../assets/Images/model.png')} style={AI.image} />
              </Animated.View>
            )}
           <TouchableOpacity style={[AI.generateButton,isAPILoading && AI.buttonDisabled]} 
              onPress={() => uploadDirectly()} disabled={isAPILoading}>
                {isAPILoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                  ) :(
                  <Text style={AI.generateButtonText}>開始生成</Text>)}
            </TouchableOpacity>

            {/* 彈出框內容 */}
            <Animated.View style={[AI.expansionBox, { width: expansionWidth }]}>
              <View style={AI.section}>
                <Text style={AI.sectionTitle}>上裝</Text>
                <FlatList
                    data={topClothing}
                    renderItem={({ item }) => renderClothingItem({ item, type: 'top' })}
                    keyExtractor={(item) => item.fileName}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  />

              </View>
              <View style={AI.section}>
                <Text style={AI.sectionTitle}>下裝</Text>
                <FlatList
                  data={bottomClothing}
                  renderItem={({ item }) => renderClothingItem({ item, type: 'bottom' })}
                  keyExtractor={(item) => item.fileName}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
              
              {/* 右上角的 "X" 按鈕 */}
              
              <View style={AI.buttonGroup}>
                <TouchableOpacity style={AI.confirmButton} onPress={handleConfirm}>
                  <Text style={AI.confirmButtonText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity style={AI.closeButton} onPress={handleClosePopup}>
                  <Text style={AI.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ImageBackground>
        </View>

        {/* 浮動按鈕：當彈出框展開時隱藏 */}
        {!isExpanded && (
          <TouchableOpacity style={AI.floatingButton} onPress={handleImageUpload}>
            <Image source={require('../assets/Images/closet.png')} style={AI.floatingButtonIcon} />
          </TouchableOpacity>
        )}
      </View>
      <Modal
        visible={isRecommenderVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseRecommender}
      >
        <View style={AI.modalContainer}>
          <View style={AI.modalContent}>
            <TouchableOpacity 
              style={AI.modalCloseButton}
              onPress={handleCloseRecommender}
            >
              <Text style={AI.modalCloseButtonText}>✕</Text>
            </TouchableOpacity>
            
            <OutfitRecommender
              hasRecommended={hasRecommended}
              setHasRecommended={setHasRecommended}
              recommendation={recommendation}
              setRecommendation={setRecommendation}
              apiKey={ApiConfig.getOpenAiConfig().apiKey}
              clothingUrls={selectedClothing}
              onClose={handleCloseRecommender}
              onRecommendationComplete={handleRecommendationComplete}
              onError={(error) => console.error('推薦錯誤:', error)}
            />
          </View>
        </View>
      </Modal>
    </ImageBackground>
    // <ImageBackground 
    //   source={require('../assets/Images/back.jpg')} 
    //   style={AI.fullBackgroundImage}
    // >
    //   <View style={AI.container}>
    //     {/* 背景图片与人物图片的容器 */}
    //     <View style={AI.imageContainer}>
    //       {/* 背景图片容器，带浅咖色边框 */}
    //       <View style={AI.backgroundImageWrapper}>
    //         {/* 滑动背景图片 */}
    //         <ScrollView
    //           horizontal
    //           pagingEnabled
    //           showsHorizontalScrollIndicator={false}
    //           style={AI.backgroundScrollView}
    //           contentContainerStyle={AI.backgroundScrollContent}
    //         >
    //           <ImageBackground source={require('../assets/Images/casual.png')} style={AI.backgroundImage}>
    //             <BlurView style={AI.absolute} blurType="light" blurAmount={1} />
    //           </ImageBackground>
    //           <ImageBackground source={require('../assets/Images/formal.png')} style={AI.backgroundImage}>
    //             <BlurView style={AI.absolute} blurType="light" blurAmount={1} />
    //           </ImageBackground>
    //           <ImageBackground source={require('../assets/Images/sport.png')} style={AI.backgroundImage}>
    //             <BlurView style={AI.absolute} blurType="light" blurAmount={1} />
    //           </ImageBackground>
    //         </ScrollView>
    //       </View>
          
    //       {/* 人物图片 */}
    //       {finalImageUrl?(<><Image source={{ uri: finalImageUrl }} style={AI.image}/></>):(<><Image source={require('../assets/Images/model.png')} style={AI.image} /></>)}
          
          
    //       {/* 按钮容器 */}
    //       <View style={AI.overlay}>
    //         <RenderButtons />
    //       </View>
    //     </View>
    //   </View>
    // </ImageBackground>
  );
}

// 样式定义
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const AI = StyleSheet.create({
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'flex-start', // 改為從頂部開始排列
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
  innerBackgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D2B48C',
    marginTop: 40, // 調整頂部距離
    marginBottom: 20, // 添加底部間距
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '75%',
    marginTop: 60, // 在標題下方添加一些間距
    marginBottom: 20, // 在按鈕和圖片之間添加間距
  },
  button: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5, // 減少水平間距以適應更多按鈕
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#D2B48C',
  },

  buttonText: {
    fontSize: 14, // 稍微減小字體大小
    color: '#B8AC9B',
    fontWeight: '600',
  },
  imageContainer: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto', // 將剩餘空間推到上方
  
    marginBottom: 140, // 調整這個值以確保不會與底部按鈕重疊
  },
  generateButton: {
    position: 'absolute',
    bottom: 50, // 距離底部的距離
    alignSelf: 'center', // 水平居中
    backgroundColor: '#D2B48C', // 使用與主題相符的顏色
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  floatingButton: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    backgroundColor: '#FFF',
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  floatingButtonIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  expansionBox: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#f8f0e3',
    borderRadius: 0,
  },
  section: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  clothingItem: {
    width: 130,
    height: 135,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedClothingItem: {
    borderColor: '#4CAF50', // 選中時的邊框顏色
    backgroundColor: '#E8F5E9', // 選中時的背景顏色
  },
  row: {
    flexDirection: 'column', 
    justifyContent: 'space-between',
    marginRight: 3,
  },
  buttonGroup: {
    position: 'absolute',
    top: 15,
    right: 10,
    flexDirection: 'row',
  },
  confirmButton: {
    backgroundColor: '#4CAF50', // 綠色
    width: 32,
    height: 32,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    elevation: 5,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeButton: {
    backgroundColor: '#FFF',
    width: 32,
    height: 32,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },clothingImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  clothingText: {
    marginTop: 5,
    fontSize: 12,
  },
  buttonDisabled: {
    opacity: 0.7, // 使按鈕在禁用時看起來稍微不同
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
    padding: 10,
  },
  modalCloseButtonText: {
    fontSize: 24,
    color: '#666',
  },
  recommendButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  recommendButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default AIdressing;
