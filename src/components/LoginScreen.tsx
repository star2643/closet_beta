import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { NavigationProp } from '@react-navigation/native';

interface LoginScreenProps {
  navigation: NavigationProp<any, any>;
}

function LoginScreen ({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    const isLoggedIn = true; // 假设用户登录成功

    if (isLoggedIn) {
      navigation.replace('Home'); // 登录成功后跳转到主页面（MainTabNavigator）
    } else {
      console.log('Login failed. Please try again.');
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
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>登入</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>註冊</Text>
        </TouchableOpacity>
        <Text style={styles.thirdPartyText}>使用第三方登入</Text>
        <View style={styles.thirdPartyIcons}>
          <Image source={require('../assets/Images/google.png')} style={{ width: 30, height: 30 }} />
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
    padding: 20,
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
  
  thirdPartyIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center', // 添加这一行以确保图标在垂直方向上居中对齐
  },
});

export default LoginScreen;
