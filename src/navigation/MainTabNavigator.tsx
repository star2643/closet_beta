import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Text, View, ActivityIndicator } from 'react-native';
import HomeScreen from '../components/HomeScreen';
import MyWardrobe from '../components/MyWardrobe';
import AIdressing from '../components/AIDressing';
import Recycle from '../components/Recycle';
import Member from '../components/Member';
import { DataProvider, useData } from '../services/DataContext';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4B3621',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontSize: 10 },
        tabBarIcon: ({ focused }) => {
          let iconPath;
          switch (route.name) {
            case '主頁':
              iconPath = require('../assets/Images/navigatorLogo/home.png');
              break;
            case '我的衣櫃':
              iconPath = require('../assets/Images/navigatorLogo/closet.png');
              break;
            case '智慧穿搭':
              iconPath = require('../assets/Images/navigatorLogo/AI.png');
              break;
            case '舊衣回收':
              iconPath = require('../assets/Images/navigatorLogo/recycle2.png');
              break;
            case '會員':
              iconPath = require('../assets/Images/navigatorLogo/member.png');
              break;
            default:
              iconPath = require('../assets/Images/navigatorLogo/home.png');
          }
          
          return (
            <Image
              source={iconPath}
              style={{
                width: focused ? 30 : 24,
                height: focused ? 30 : 24,
                tintColor: focused ? '#4B3621' : 'gray',
              }}
            />
          );
        },
        tabBarLabel: ({ focused, color }) => {
          return (
            <Text style={{ color, fontWeight: focused ? 'bold' : 'normal', fontSize: 10 }}>
              {route.name}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="主頁" component={HomeScreen} />
      <Tab.Screen name="我的衣櫃" component={MyWardrobe} />
      <Tab.Screen name="智慧穿搭" component={AIdressing} />
      <Tab.Screen name="舊衣回收" component={Recycle} />
      <Tab.Screen name="會員" component={Member} />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#4B3621" />
      <Text style={{ marginTop: 20, fontSize: 16 }}>正在加載中...</Text>
    </View>
  );
}

function MainTabNavigator() {
  const { isLoading } = useData();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <TabNavigator />;
}

function MainTabNavigatorWrapper() {
  return (
    <DataProvider>
      <MainTabNavigator />
    </DataProvider>
  );
}

export default MainTabNavigatorWrapper;