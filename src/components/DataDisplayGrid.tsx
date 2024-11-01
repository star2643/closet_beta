import React from 'react';
import { View, Text, StyleSheet, ImageBackground,Dimensions } from 'react-native';

const OctagonCell = ({ item, myMainColor }) => (
  <View style={styles.babian}>
    <View style={[styles.imgBox, { backgroundColor: myMainColor }]}>
      <View style={styles.contentContainer}>
        <Text style={styles.value}>{item.value}</Text>
        <Text style={styles.title}>{item.title}</Text>
      </View>
    </View>
  </View>
);

const DataDisplayGrid = ({ data, myMainColor = '#FFF5E6' }) => (
  <ImageBackground style={styles.container} source={require('../assets/Images/numBack.png')}>
    <View style={styles.row}>
      {data.slice(0, 2).map((item, index) => (
        <OctagonCell key={index} item={item} myMainColor={myMainColor} />
      ))}
    </View>
    <View style={styles.row2}>
      {data.slice(2, 4).map((item, index) => (
        <OctagonCell key={index} item={item} myMainColor={myMainColor} />
      ))}
    </View>
  </ImageBackground>
);
const screenWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    
    alignContent:'center',
    justifyContent:'center',
    
  },
  row: {
    flexDirection: 'row',
    marginLeft: 10, // 第一行緊貼左邊界
  },
  row2: {
    flexDirection: 'row',
    marginLeft: screenWidth*0.25*0.9, // 第二行從左邊距離50開始
    marginTop: -screenWidth*0.25*0.2, // 保持行間距
  },
  babian: {
    width: screenWidth*0.25,
    height: screenWidth*0.25,
    borderRadius: 0,
    overflow: 'hidden',
    transform: [{ rotate: '0deg' }],
    marginRight: 50, // 為每個單元格添加右邊距，以保持間隔
  },
  imgBox: {
    width: screenWidth*0.25,
    height: screenWidth*0.25,
    borderRadius: 0,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
   
  },
  contentContainer: {
    alignItems: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  title: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '600',
    textAlign: 'center',
  },
  value: {
    fontSize: screenWidth*0.05,
    fontWeight: 'bold',
    color: '#4A2B0F',
    marginBottom: 5,
  },
});

export default DataDisplayGrid;