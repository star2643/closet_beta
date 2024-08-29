import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ImageBackground, StyleSheet, Dimensions, Alert } from 'react-native';
import { BlurView } from '@react-native-community/blur';

// AIdressing 组件定义
function AIdressing() {
  const handlePress = (type) => {
    Alert.alert(`${type}穿搭建議`);
  };

  const RenderButtons = () => (
    <View style={AI.buttonContainer}>
      <TouchableOpacity style={AI.button} onPress={() => handlePress('休閒')}>
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
          <Image source={require('../assets/Images/model.png')} style={AI.image} />

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
    width: 400, // 调整人物图片宽度
    height: 480, // 调整人物图片高度
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
