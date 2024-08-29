import React, { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';

function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Login');
    }, 3000);
  }, [navigation]);

  return (
    <View style={styles.splashContainer}>
      <Image
        source={require('../assets/Images/go.png')}
        style={styles.splashImage}
      />
      <Text style={styles.splashText}>加載中...</Text>
      <ActivityIndicator size="large" color="#8B4513" />
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  splashText: {
    fontSize: 24,
    marginTop: 20,
    color: '#8B4513',
  },
  splashImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
});

export default SplashScreen;
