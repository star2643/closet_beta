import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image,ActivityIndicator  } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../services/AuthContext';
import { Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface LoginScreenProps {
  navigation: NavigationProp<any, any>;
}

function LoginScreen ({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn,signInWithGoogle } = useAuth();
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const check=await signInWithGoogle();
      if(!check){
        return
      }
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    } catch (error) {
      console.log('Google 登入失敗', error);
      Alert.alert('登入失敗', 'Google 登入過程中發生錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('錯誤', '請輸入帳號和密碼');
      return;
    }
    
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    } catch (error) {
      console.log('登入失敗', error);
      Alert.alert('登入失敗', '請檢查您的帳號和密碼是否正確');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register'); // 跳转到注册页面
  };
  return (
    <View style={styles.container}>
      <Image source={require('../assets/Images/login.jpg')} style={styles.backgroundImage} />
      <View style={styles.loginContainer}>
        <Text style={styles.title}>歡迎回來!</Text>
        <View style={styles.inputContainer}>
          <Image source={require('../assets/Images/mail.png')} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputContainer}>
          <Image source={require('../assets/Images/lock.png')} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="請輸入密碼"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <View style={styles.optionsContainer}>
          <View style={styles.rememberMeContainer}>
            <CheckBox value={rememberMe} onValueChange={setRememberMe} />
            <Text style={styles.rememberMeText}>記住密碼</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.forgotPasswordText}>忘記密碼？</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>登入</Text>
        )}
      </TouchableOpacity>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>註冊</Text>
        </TouchableOpacity>
        <Text style={styles.thirdPartyText}>使用第三方登入</Text>
        <View style={styles.thirdPartyIcons}>
          <TouchableOpacity onPress={handleGoogleSignIn} disabled={isLoading}>
            <Image source={require('../assets/Images/google.png')} style={{ width: 30, height: 30 }} />
          </TouchableOpacity>
          <Image source={require('../assets/Images/fb.png')} style={{ width: 40, height: 45 }} />
          <Image source={require('../assets/Images/line.png')} style={{ width: 40, height: 30 }} />
        </View>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '40%',
    top: 0,
    left: 0,
    resizeMode: 'cover',
  },
  loginContainer: {
    flex: 1,
    marginTop: '40%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 30,
  },
  title: {
    fontSize: 24,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    marginLeft: 5,
  },
  forgotPasswordText: {
    color: '#8B4513',
  },
  loginButton: {
    backgroundColor: '#D2B48C',
    borderRadius: 5,
    paddingVertical: 10,
    marginBottom: 10,
    alignItems: 'center', // 確保 ActivityIndicator 居中
  },
  loginButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#F5DEB3',
    borderRadius: 5,
    paddingVertical: 10,
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#8B4513',
    textAlign: 'center',
    fontSize: 16,
  },
  thirdPartyText: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#8B4513',
  },
  loginButtonDisabled: {
    backgroundColor: '#A9A9A9', // 登入中時的顏色
  },
  
  thirdPartyIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center', // 添加这一行以确保图标在垂直方向上居中对齐
  },
});

export default LoginScreen;
