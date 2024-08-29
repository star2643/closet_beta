import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NavigationProp } from '@react-navigation/native';

interface RegisterScreenProps {
  navigation: NavigationProp<any, any>;
}

function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    // 处理注册逻辑
    console.log('Register button clicked');
  };

  const handleBack = () => {
    navigation.goBack(); // 返回到登录页面
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/Images/re.jpg')} style={styles.backgroundImage} />
      <View style={styles.registerContainer}>
        <Text style={styles.title}>創建帳號</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>使用者名稱/Username</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="請輸入使用者名稱"
              value={username}
              onChangeText={setUsername}
            />
            <Image source={require('../assets/Images/user.png')} style={styles.icon} />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>帳號/E-mail</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="example@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Image source={require('../assets/Images/mail.png')} style={styles.icon} />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>密碼/password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="請輸入密碼"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Image source={require('../assets/Images/lock.png')} style={styles.icon} />
          </View>
        </View>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>註冊</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  registerContainer: {
    flex: 1,
    marginTop: '40%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#8B4513',
    marginBottom: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
  },
  icon: {
    width: 20,
    height: 20,
  },
  registerButton: {
    backgroundColor: '#F5DEB3',
    borderRadius: 5,
    paddingVertical: 10,
    marginTop: 20,
  },
  registerButtonText: {
    color: '#8B4513',
    textAlign: 'center',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#D2B48C',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 10, // 与注册按钮的间距
  },
  backButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default RegisterScreen;
