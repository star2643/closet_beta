import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './components/SplashScreen';
import MainTabNavigator from './navigation/MainTabNavigator';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen'; // 会员登录页面
const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }} // 隐藏导航栏标题
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen} // 这是包含 HomeScreen 的底部导航栏
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
