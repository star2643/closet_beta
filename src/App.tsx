import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './components/SplashScreen';
import { AuthProvider } from './services/AuthContext';
import MainTabNavigator from './navigation/MainTabNavigator';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen'; // 会员登录页面
import ProtectedRoute from './services/ProtectedRoute';
import HomeScreen from './components/HomeScreen';

const Stack = createStackNavigator();

function App() {
  
  return (
    <AuthProvider>
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
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Home" 
            options={{ headerShown: false }}
          >
            {() => (
              <ProtectedRoute>
                <MainTabNavigator />
              </ProtectedRoute>
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;
