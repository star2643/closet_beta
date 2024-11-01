import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Modal, Alert, TouchableWithoutFeedback, FlatList,ActivityIndicator } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import UserProfileController from '../controllers/userProfileController'
import { useAuth } from '../services/AuthContext'; 
import { useNavigation } from '@react-navigation/native';
import { useData } from '../services/DataContext'
import Svg, { Circle } from 'react-native-svg';
import MarkedImageComponent from './MarkedImageComponent';

const defaultProfilePic = require('../assets/Images/user.png');

function Member() {
  const { uploadModel, setModelImage, getModelImageFromFirebase, modelImage, uploadClosetImage, setClosetImage, closetImage ,uploadClosetImageToDatabase} = useData();
  const [profilePic, setProfilePic] = useState(defaultProfilePic);
  const [User, setUser] = useState();
  const { user, signOut } = useAuth();
  const navigation = useNavigation();
  const { width } = Dimensions.get('window');
  const [isModelModalVisible, setIsModelModalVisible] = useState(false);
  const [isClosetModalVisible, setIsClosetModalVisible] = useState(false);
  const [markedImageComponent, setMarkedImageComponent] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [isModelUploading, setIsModelUploading] = useState(false);
  const [isClosetUploading, setIsClosetUploading] = useState(false);
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };
  useEffect(() => {
    const loadCloset = async () => {
      if(closetImage){
        setCoordinates(closetImage.coords)
      }
    };

    loadCloset();
  }, []);
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
        quality: 0.8
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

  const addMarker = (newCoord) => {
    setCoordinates(prev => [...prev, newCoord]);
    
  };

  const deleteMarker = (index) => {
    setCoordinates(prev => prev.filter((_, i) => i !== index));
  };

  const handleClosetImagePicker = async () => {
    try {
      const result = await uploadClosetImage();
      setCoordinates(result.coordinates);
      setClosetImage({
        uri: result.imageUri,
        originalWidth: result.originalWidth,
        originalHeight: result.originalHeight,
        coords:result.coordinates
      });
    } catch (error) {
      console.error('上傳圖片時出錯：', error);
    }
  };

  const uploadModelToDatabase = async () => {
    try {
      if (uploadModel && modelImage) {
        setIsModelUploading(true); // 開始上傳時設置
        await uploadModel(modelImage)
        Alert.alert("成功", "模型已成功上傳");
        setIsModelModalVisible(false);  // 關閉 Modal
      }
    } catch (e) {
      console.log(e)
    }finally{
      setIsModelUploading(false);
    }
  }
  const onClosetClose=()=>{
    if(closetImage)
      setCoordinates(closetImage.coords)
    setIsClosetModalVisible(false)
  }
  const uploadClosetToDatabase = async () => {
    try {
      if (uploadModel && closetImage) {
        setIsClosetUploading(true);
        const tmpData={
          uri:closetImage.uri,
          originalWidth:closetImage.originalWidth,
          originalHeight:closetImage.originalHeight,
          coords:coordinates
        }
        
        await uploadClosetImageToDatabase(tmpData)
        Alert.alert("成功", "模型已成功上傳");
        setIsClosetModalVisible(false);  // 關閉 Modal
      }
    } catch (e) {
      console.log(e)
    }finally {
      setIsClosetUploading(false); // 無論成功與否都要重置
    }
  }
  

  return (
    <View style={styles.container}>
      <Image source={require('../assets/Images/login.jpg')} style={styles.backgroundImage} />
      <View style={styles.contentContainer}>
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={handleImagePicker} >
            <Image 
              source={require('../assets/Images/user.png')} 
              style={styles.profilePic} 
            />
          </TouchableOpacity>
          <Text style={styles.userName}>{User}</Text>
        </View>
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.button} onPress={() => setIsModelModalVisible(true)}>
            <Text style={styles.buttonText}>人物設定</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>收藏穿搭</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setIsClosetModalVisible(true)}>
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
        onRequestClose={() => setIsModelModalVisible(false)}
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
            
            <TouchableOpacity 
              style={[
                styles.closeButton, 
                isModelUploading && styles.disabledButton
              ]} 
              onPress={uploadModelToDatabase}
              disabled={isModelUploading}
            >
              {isModelUploading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={[styles.closeButtonText, { marginLeft: 8 }]}>上傳中...</Text>
                </View>
              ) : (
                <Text style={styles.closeButtonText}>保存</Text>
              )}
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={isClosetModalVisible}
        onRequestClose={() => setIsClosetModalVisible(false)}
      >
        <View style={styles.fullScreenModalView}>
          <TouchableOpacity 
            style={styles.closeModalButton} 
            onPress={() => onClosetClose()}
          >
            <Text style={styles.closeModalButtonText}>X</Text>
          </TouchableOpacity>
          <View style={styles.fullScreenImageContainer}>
            {closetImage && (
              <MarkedImageComponent
                imageUri={closetImage.uri}
                coordinates={coordinates}
                originalWidth={640}
                originalHeight={640}
                onAddMarker={addMarker}
                isEditable={true}
              />
            )}
          </View>
          <TouchableOpacity style={styles.uploadButton} onPress={handleClosetImagePicker}>
            <Text style={styles.uploadButtonText}>上傳圖片</Text>
          </TouchableOpacity>
          
          
          
          <FlatList
            data={coordinates}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.markerItem}>
                <Text style={{fontSize:16, marginLeft:100,color:'black'}}>標記 {index + 1}</Text>
                <TouchableOpacity onPress={() => deleteMarker(index)}>
                  <Text style={styles.deleteButton}>刪除</Text>
                </TouchableOpacity>
              </View>
            )}
            style={styles.markerList}
          />

          <TouchableOpacity 
              style={[
                styles.saveButton,
                isClosetUploading && styles.disabledButton
              ]} 
              onPress={uploadClosetToDatabase}
              disabled={isClosetUploading}
            >
              {isClosetUploading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>上傳中...</Text>
                </View>
              ) : (
                <Text style={styles.saveButtonText}>保存</Text>
              )}
            </TouchableOpacity>
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
    bottom: 0,
    backgroundColor: '#f8f0e3',
    width: '100%',
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
    borderTopWidth: 3,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#D2B48C',
  },
  profileContainer: {
    position: 'absolute',
    top: -40,
    alignItems: 'center',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#D2B48C',
    backgroundColor: 'rgba(255,255,255,1)'
  },
  userName: {
    marginTop: 10,
    fontSize: 20,
    color: '#333333',
    fontWeight: 'bold',
  },
  buttonSection: {
    width: '90%',
    marginTop: 35,
  },
  button: {
    backgroundColor: '#B8AC9B',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 30,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    color: '#333333',
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
  // 新添加的樣式
  fullScreenModalView: {
    width:'90%',
    height:'90%',
    marginTop:'5%',
    margin:'5%',
    backgroundColor: 'white',
    borderRadius:20,
    padding: 20,
  },
  closeModalButton: {
    position: 'absolute',
    top: 5,
    right: 20,
    zIndex: 1,
  },
  closeModalButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  fullScreenImageContainer: {
    width:320,
    height:320,
    borderWidth:10,
    borderColor:'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  markerList: {
    maxHeight: 150,
    width: '100%',
    marginBottom: 20,
  },
  markerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height:60,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    
  },
  deleteButton: {
    color: 'red',
    fontSize:16
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#808080',
  },
});

export default Member;