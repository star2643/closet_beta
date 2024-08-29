import React, { useState,useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import UserProfileController from '../controllers/userProfileController'
function Member() {
  const [profilePic, setProfilePic] = useState('https://via.placeholder.com/80');
  const [User,setUser]=useState();
  const handleImagePicker = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.8,
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
      <View style={styles.header}>
        <TouchableOpacity onPress={handleImagePicker}>
          <Image 
            source={{ uri: profilePic }} 
            style={styles.profilePic} 
            onError={() => setProfilePic('https://via.placeholder.com/80')} // 错误时的占位符图片
          />
        </TouchableOpacity>
        <Text style={styles.userName}>{User}</Text>
        <Text style={styles.userEmail}>janedoe@example.com</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>人物設定</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>收藏穿搭</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>我的衣櫥</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>主題設置</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>帳號設置</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>退出登入</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf3e0',
  },
  header: {
    backgroundColor: '#f8f0e3',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0cdb8',
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0cdb8',
    backgroundColor: '#e0e0e0',
  },
  userName: {
    fontSize: 20,
    color: '#3e3e3e',
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#7a7a7a',
  },
  section: {
    marginTop: 20,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuText: {
    fontSize: 16,
    color: '#3e3e3e',
    fontFamily: 'serif',
  },
});

export default Member;
