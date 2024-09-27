import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const DataDisplayGrid = ({ data }) => {
  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <LinearGradient
          key={index}
          colors={['#FFF5E6', '#FFE4B5']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.card}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.title}>{item.title}</Text>
          </View>
          <View style={styles.decoration} />
        </LinearGradient>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '600',
    textAlign: 'center',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A2B0F',
    marginBottom: 5,
  },
  decoration: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default DataDisplayGrid;