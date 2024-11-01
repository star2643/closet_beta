import { Scroll } from 'lucide-react';
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const RecommendationView = ({ recommendation }) => {
  if (!recommendation) return null;

  return (
    <View style={styles.container}>
      <View style={styles.imagesContainer}>
        <View style={styles.imageWrapper}>
          <Text style={styles.label}>上衣</Text>
          <Image
            source={{ uri: recommendation.top_url }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.imageWrapper}>
          <Text style={styles.label}>下身</Text>
          <Image
            source={{ uri: recommendation.bottom_url }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>搭配評分</Text>
          <Text style={styles.scoreValue}>{recommendation.matching_score}/100</Text>
        </View>
        <ScrollView style={{flex:1}}>
          <View style={styles.reasoningContainer}>
            <Text style={styles.sectionTitle}>搭配理由</Text>
            <Text style={styles.reasoningText}>{recommendation.reasoning}</Text>
          </View>

          <View style={styles.tipsContainer}>
            <Text style={styles.sectionTitle}>穿搭建議</Text>
            <Text style={styles.tipsText}>{recommendation.style_tips}</Text>
          </View>
        </ScrollView>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  imageWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  image: {
    width: '100%',
    height: 150, // 調整圖片高度以適應 Modal
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  
  infoContainer: {
    marginTop: 24,
    flex:1
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  reasoningContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  tipsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  reasoningText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});

export default RecommendationView;
