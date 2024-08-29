import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Recycle from './Recycle';
import RegionScreen from './RegionScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Recycle" component={Recycle} />
        <Stack.Screen name="RegionScreen" component={RegionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
