import React, { useState,useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity ,Dimensions,Modal,Alert} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import UserProfileController from '../controllers/userProfileController'
import { useAuth } from '../services/AuthContext'; 
import { useNavigation } from '@react-navigation/native';
import { useData } from '../services/DataContext'
const defaultProfilePic = require('../assets/Images/user.png');
function Member() {
  const { uploadModel,setModelImage,getModelImageFromFirebase ,modelImage} = useData();
  const [profilePic, setProfilePic] = useState(defaultProfilePic);
  const [User,setUser]=useState();
  const { user, signOut } = useAuth();
  const navigation = useNavigation();
  const { width } = Dimensions.get('window');
  const [isModelModalVisible, setIsModelModalVisible] = useState(false);
 
  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' as never }],
      });
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };
  const handleImagePicker = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeExtra: true,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          const source = { uri: response.assets?.[0]?.uri };
          if (source.uri) {
            setProfilePic(source.uri);
          }
        }
      }
    );
  };
  const handleModelImagePicker = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        includeExtra: true,
        quality:0.8
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          const source = { uri: response.assets?.[0]?.uri };
          if (source.uri) {
            setModelImage(source.uri);
            console.log(source.uri)
          }
        }
      }
    );
  };
  const uploadModelToDatabase= async ()=>{
    try{
      if(uploadModel&&modelImage){
        await uploadModel(modelImage)
        Alert.alert("成功", "模型已成功上傳");
        setIsModelModalVisible(false);  // 關閉 Modal
      }
    }catch(e){
      console.log(e)
    }
  }
  useEffect(() => {
    // 组件挂载时加载用户数据
    const loadUserProfile = async () => {
      try {
        const userProfile = await UserProfileController.fetchUserProfile('10131062');
        setUser(userProfile); // 设置用户数据
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, []);
  return (
    <View style={styles.container}>
    <Image source={require('../assets/Images/login.jpg')} style={styles.backgroundImage} />
    <View style={styles.contentContainer}>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={()=>handleImagePicker()} >
          <Image 
            source={require('../assets/Images/user.png')} 
            style={styles.profilePic} 
          />
        </TouchableOpacity>
        <Text style={styles.userName}>{User}</Text>
      </View>
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.button} onPress={()=>setIsModelModalVisible(true)}>
          <Text style={styles.buttonText}>人物設定</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>收藏穿搭</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>我的衣櫥</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>主題設置</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>帳號設置</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>退出登入</Text>
        </TouchableOpacity>
      </View>
    </View>
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModelModalVisible}
      onRequestClose={() =>setIsModelModalVisible(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.uploadButton} onPress={handleModelImagePicker}>
            <Text style={styles.uploadButtonText}>上傳圖片</Text>
          </TouchableOpacity>
          
          <View style={styles.imageContainer}>
            {modelImage ? (
              <Image source={{ uri: modelImage }} style={styles.image} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text>未上傳圖片</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity style={styles.closeButton} onPress={uploadModelToDatabase}>
            <Text style={styles.closeButtonText}>保存</Text>
          </TouchableOpacity>
          <TouchableOpacity 
              style={[styles.closeButton, { marginTop: 10, backgroundColor: '#999' }]} 
              onPress={() => setIsModelModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>取消</Text>
            </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '50%',
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0, // 贴合屏幕底部
    backgroundColor: '#f8f0e3',
    width: '100%', // 使容器宽度覆盖屏幕
    height: '80%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    borderTopWidth: 3, // 顶部边框
    borderLeftWidth: 2, // 左边框
    borderRightWidth: 2, // 右边框
    borderColor: '#D2B48C', // 边框颜色
  },
  
  profileContainer: {
    position: 'absolute',
    top: -40, // 让头像位于背景与框框之间
    alignItems: 'center',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#D2B48C',
    backgroundColor:'rgba(255,255,255,1)'
  },
  userName: {
    marginTop: 10,
    fontSize: 20,
    color: '#333333',
    fontWeight: 'bold',
  },
  buttonSection: {
    width: '90%',
    marginTop: 35, // 调整为适当的值
  },
  button: {
    
    backgroundColor: '#B8AC9B',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 30,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // 调整按钮间距
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    color: '#333333',
    //fontWeight: '300',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  uploadButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginBottom: 15,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imageContainer: {
    width: 200,
    height: 200,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: '#ff6347',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Member;
