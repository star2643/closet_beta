
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ImageBackground, StyleSheet, Dimensions, Alert } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import axios from 'axios';
import RNFS from 'react-native-fs';
// AIdressing 组件定义
function AIdressing() {
  const handlePress = (type) => {
    Alert.alert(`${type}穿搭建議`);
  };
  
  const RenderButtons = () => (
    <View style={AI.buttonContainer}>
      <TouchableOpacity style={AI.button} onPress={() => uploadDirectly()}>
        <Text style={AI.buttonText}>休閒</Text>
      </TouchableOpacity>
      <TouchableOpacity style={AI.button} onPress={() => handlePress('正式')}>
        <Text style={AI.buttonText}>正式</Text>
      </TouchableOpacity>
      <TouchableOpacity style={AI.button} onPress={() => handlePress('運動')}>
        <Text style={AI.buttonText}>運動</Text>
      </TouchableOpacity>
    </View>
  );
  const init_top='https://firebasestorage.googleapis.com/v0/b/closet-b2d3d.appspot.com/o/user%2FyC6pSCbOwQUGoY0q8crUxcBmHEH3%2F2.jpg?alt=media&token=d6215d8a-d5b1-405b-8621-4820bd3ad64b'
  const init_bottom='https://firebasestorage.googleapis.com/v0/b/closet-b2d3d.appspot.com/o/user%2FyC6pSCbOwQUGoY0q8crUxcBmHEH3%2F3.jpg?alt=media&token=f0680a03-2154-4fa1-b83a-037e2e010de8'
  const init_people='https://firebasestorage.googleapis.com/v0/b/closet-b2d3d.appspot.com/o/user%2FyC6pSCbOwQUGoY0q8crUxcBmHEH3%2F4.jpg?alt=media&token=19d294a9-0d2b-425f-b442-1877e4ec414b'
  const [imagesUrl, setImageUrl] = useState({top:init_top,bottom:init_bottom,people:init_people});
  const [isLoading, setIsLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState({ top: '', bottom: '' ,people:''});
  const [result, setResult] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null);
  const [finalImageUrl, setFinalImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [taskId,setTaskId]=useState('');
  
  const title=['top','bottom','people']
  const uploadToFreeimage = async (imagesUrl) => {  //-----------------------------------第三方圖庫
    const apiKey = '6d207e02198a847aa98d0a2a901485a5'; // Freeimage.host 的 API key
    const apiUrl = 'https://freeimage.host/api/1/upload';
    const Tmpresult_url=[]
    for(let i=0;i<3;i++){
      const formData = new FormData();
      formData.append('key', apiKey);
      const uniqueUrl = `${imagesUrl[title[i]]}?timestamp=${Date.now()}&random=${Math.random()}`;
      formData.append('source', uniqueUrl);
      formData.append('format', 'json');

      try {
        const response = await axios.post(apiUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data && response.data.image && response.data.image.url) {
          Tmpresult_url.push(response.data.image.url)
              
              
            
          
          console.log(title[i],':',response.data.image.url);

        } else {
          console.log('Unexpected API response:', response.data);
          Alert.alert('上傳失敗', '服務器返回了意外的響應格式');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('上傳失敗', error.message || '發生未知錯誤');
      }
    }
    console.log(Tmpresult_url)
    
    
    if (Tmpresult_url && Tmpresult_url.length === 3) {
      await setResultUrl(prevState => {
        const newState = {top: Tmpresult_url[0], bottom: Tmpresult_url[1], people: Tmpresult_url[2]};
        console.log("New resultUrl:", newState);
        return newState;
      });
    } else {
      console.error("Tmpresult_url is invalid:", Tmpresult_url);
    }

    
    
  };
  useEffect(() => {
    console.log("resultUrl updated:", resultUrl);
    
    if (resultUrl.top && resultUrl.bottom && resultUrl.people) {
      submitImageSynthesisTask();
    }
  }, [resultUrl]);
  

  const submitImageSynthesisTask = async () => {  //----------------------------------開始運算
    setIsLoading(true);
    const apiUrl = "https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis";
    const headers = {
      "Content-Type": "application/json",
      "Authorization": "sk-c08abee2ece5482aa843a8737d23294e",  // 替换为你的 API Key
      "X-DashScope-Async": "enable"
    };
    const data = {
      "model": "aitryon",
      "input": {
        "top_garment_url": resultUrl['top'],
        "bottom_garment_url": resultUrl['bottom'],
        "person_image_url": resultUrl['people']
      },
      "parameters": {
        "resolution": -1,
        "restore_face": true
      }
    };
    for(let i=0;i<3;i++){
      try {
        const response = await axios.post(apiUrl, data, { headers });
      
        if (response.status === 200) {
          setResult(response.data);
          setTaskId(response.data.output.task_id)
          startPolling()
          Alert.alert("成功", "任務提交成功");
          break
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error("任務提交失敗:", error);
        Alert.alert("錯誤", `任務提交失敗: ${error}`);
      } finally {
        
      }
    }
    setResultUrl({ top: '', bottom: '' ,people:''})
    setIsLoading(false);
  };
  const uploadDirectly = async () => {
    setResultUrl({ top: '', bottom: '' ,people:''})
    setIsLoading(true);
    try {
      
      await uploadToFreeimage(imagesUrl);
    } catch (error) {
      Alert.alert('錯誤', '獲取或上傳圖片時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (result !== null) {
      console.log(result);
    }
  }, [result]);
  const checkTaskStatus = useCallback(async () => { //---------------------------檢查結果
    if (!taskId) return;

    try {
      const queryUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
      const response = await axios.get(queryUrl, {
        headers: {
          'Authorization': 'sk-c08abee2ece5482aa843a8737d23294e',
        },
      });

      if (response.status === 200) {
        const result = response.data;
        setTaskStatus(result.output.task_status);
        console.log("完整的响应数据:", result);

        if (result.output.task_status === "SUCCEEDED") {
          setFinalImageUrl(result.output.image_url);
          setIsPolling(false); // 停止轮询
          setTaskId('')
          setResultUrl({ top: '', bottom: '' ,people:''})
        } else if (result.output.task_status === "FAILED") {
          setError("任务失败");
          setIsPolling(false); // 停止轮询
        }
        // 如果状态是 "PENDING" 或 "RUNNING"，继续轮询
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("查询失败:", error);
      setError(error.message);
      setIsPolling(false); // 出错时停止轮询
    }
  }, [taskId, setTaskStatus, setImageUrl, setError, setIsPolling]);

  useEffect(() => {
    let intervalId;

    if (isPolling) {
      // 立即执行一次
      checkTaskStatus();
      
      // 然后每3秒执行一次
      intervalId = setInterval(checkTaskStatus, 3000);
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

 
  return (
    <ImageBackground 
      source={require('../assets/Images/back.jpg')} 
      style={AI.fullBackgroundImage}
    >
      <View style={AI.container}>
        {/* 背景图片与人物图片的容器 */}
        <View style={AI.imageContainer}>
          {/* 背景图片容器，带浅咖色边框 */}
          <View style={AI.backgroundImageWrapper}>
            {/* 滑动背景图片 */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={AI.backgroundScrollView}
              contentContainerStyle={AI.backgroundScrollContent}
            >
              <ImageBackground source={require('../assets/Images/casual.png')} style={AI.backgroundImage}>
                <BlurView style={AI.absolute} blurType="light" blurAmount={1} />
              </ImageBackground>
              <ImageBackground source={require('../assets/Images/formal.png')} style={AI.backgroundImage}>
                <BlurView style={AI.absolute} blurType="light" blurAmount={1} />
              </ImageBackground>
              <ImageBackground source={require('../assets/Images/sport.png')} style={AI.backgroundImage}>
                <BlurView style={AI.absolute} blurType="light" blurAmount={1} />
              </ImageBackground>
            </ScrollView>
          </View>
          
          {/* 人物图片 */}
          {finalImageUrl?(<><Image source={{ uri: finalImageUrl }} style={AI.image}/></>):(<><Image source={require('../assets/Images/model.png')} style={AI.image} /></>)}
          
          
          {/* 按钮容器 */}
          <View style={AI.overlay}>
            <RenderButtons />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

// 样式定义
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const AI = StyleSheet.create({
  fullBackgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    paddingTop: 85, // 让所有组件整体向上移动
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // 使背景和人物图片相对定位
    marginTop: 28, // 将内容向上移动
  },
  backgroundImageWrapper: {
    width: screenWidth * 0.75, // 缩窄背景图片容器的宽度为屏幕宽度的75%
    height: screenHeight * 0.7, // 背景图片容器高度为屏幕高度的70%
    borderWidth: 10, // 边框宽度
    borderColor: '#B09F85', // 浅咖色边框
    borderRadius: 10, // 可选：为图片添加圆角
    overflow: 'hidden', // 确保边框外的部分被裁剪
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundScrollView: {
    width: '100%', // ScrollView宽度占满容器
    height: '100%', // 使ScrollView高度占满容器
  },
  backgroundScrollContent: {
    flexDirection: 'row',
  },
  backgroundImage: {
    width: screenWidth * 0.75 - 20, // 缩小背景图片宽度，减去padding
    height: '100%', // 背景图片高度与容器高度相同
    justifyContent: 'center',
    alignItems: 'center',
    // 不使用margin或padding，避免图片之间的间隙
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  image: {
    width: 200, // 调整人物图片宽度
    height: 400, // 调整人物图片高度
    position: 'absolute', // 绝对定位使人物图片始终在中间
    zIndex: 1, // 确保人物图片在背景图片的前面
  },
  overlay: {
    position: 'absolute',
    top: -70, // 将按钮容器再往上移动
    width: '100%',
    alignItems: 'center',
    zIndex: 4, // 确保按钮位于所有内容的最前方
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '75%', // 调整按钮容器宽度
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // 添加一个半透明背景以突出显示按钮
    padding: 10,
    borderRadius: 10, // 可选：为按钮容器添加圆角
  },
  button: {
    padding: 10,
    backgroundColor: '#B8AC9B',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
  },
});

export default AIdressing;
