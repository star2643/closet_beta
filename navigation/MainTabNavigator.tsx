import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../Views/HomeScreen';
import MyWardrobe from '../Views/MyWardrobe';
import AIdressing from '../Views/AIDressing';
import Recycle from '../Views/Recycle';
import Member from '../Views/Member';

const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="主頁" component={HomeScreen} />
      <Tab.Screen name="我的衣櫃" component={MyWardrobe} />
      <Tab.Screen name="智慧穿搭" component={AIdressing} />
      <Tab.Screen name="舊衣回收" component={Recycle} />
      <Tab.Screen name="會員" component={Member} />
    </Tab.Navigator>
  );
}

export default MainTabNavigator;
