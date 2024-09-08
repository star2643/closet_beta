import React, { useRef, useState, useEffect } from 'react';
import { ScrollView, Text, View, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useAuth } from '../services/AuthContext'; 
function HomeScreen() {
  const scrollViewRef = useRef(null);
  const [viewHeight, setViewHeight] = useState(0);
  const [currentDate, setCurrentDate] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date();
      const Day = { day: 'numeric', month: 'short' };
      const dateString = today.toLocaleDateString('en-US', Day);
      setCurrentDate(dateString);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const sectionRefs = {
    1: useRef(null),
    2: useRef(null),
    3: useRef(null),
  };

  const sectionHeights = [600, 600, 600];
  const threshold = 0.2;
  let lastScrollY = 0;

  const handleScrollEndDrag = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const direction = scrollY - lastScrollY > 0 ? 'down' : 'up';
    const nearestSection = getNearestSection(scrollY, direction);
    scrollToSection(nearestSection);
    lastScrollY = scrollY;
  };

  const getNearestSection = (scrollY, direction) => {
    let offset = 0;
    for (let i = 0; i < sectionHeights.length; i++) {
      offset += sectionHeights[i];
      const previousOffset = offset - sectionHeights[i];
      const sectionStart = previousOffset + sectionHeights[i] * threshold;
      const sectionEnd = offset - sectionHeights[i] * threshold;

      if (direction === 'down' && scrollY >= sectionStart && scrollY < offset) {
        return i + 2;
      } else if (direction === 'up' && scrollY < sectionEnd && scrollY >= previousOffset) {
        return i + 1;
      }
    }
    return sectionHeights.length;
  };

  const scrollToSection = (id) => {
    const targetRef = sectionRefs[id].current;
    if (targetRef) {
      targetRef.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ y, animated: true });
        },
        (error) => {
          console.error(error);
        }
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f0e3' }}>
      <View style={{ flex: 1 }}>
        <View style={additionalStyles.rectangle}>
          <View style={additionalStyles.row}>
            <Image
              source={require('../assets/Images/logo.png')}
              style={additionalStyles.image}
            />
          </View>
        </View>
      </View>
      <View style={{ flex: 3 }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <View style={styles.rectangle}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{currentDate}</Text>
            </View>
          </View>
          <View style={styles.rectangle}>
            <Text>Rectangle 2</Text>
          </View>
          <View style={styles.rectangle}>
            <Text>Rectangle 3</Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.container}>
        <View style={styles.navContainer}>
          <TouchableOpacity onPress={() => scrollToSection(1)} style={styles.navItem}>
            <Text style={styles.navText}>智慧穿搭</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToSection(2)} style={styles.navItem}>
            <Text style={styles.navText}>Section 2</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToSection(3)} style={styles.navItem}>
            <Text style={styles.navText}>Section 3</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          pagingEnabled
          onLayout={(event) => setViewHeight(event.nativeEvent.layout.height)}
        >
          <View ref={sectionRefs[1]} style={[{ height: viewHeight }]}>
            <View ref={sectionRefs[1]} style={[styles.section, { margin: 10 }]}>
              <Text style={styles.sectionText}>This is Section 1</Text>
            </View>
          </View>
          <View ref={sectionRefs[2]} style={[{ height: viewHeight }]}>
            <View ref={sectionRefs[2]} style={[styles.section, { margin: 10 }]}>
              <Text style={styles.sectionText}>This is Section 2</Text>
            </View>
          </View>
          <View ref={sectionRefs[3]} style={[{ height: viewHeight }]}>
            <View ref={sectionRefs[3]} style={[styles.section, { margin: 10 }]}>
              <Text style={styles.sectionText}>This is Section 3</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 9,
    backgroundColor: '#f8f0e3',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    backgroundColor: '#f8f0e3',
  },
  navItem: {
    padding: 6,
  },
  navText: {
    fontSize: 15,
    color: '#333',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f0e3',
  },
  section: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B8AC9B',
  },
  sectionText: {
    fontSize: 18,
    color: '#fff',
  },
  rectangleText: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
  },
  dateContainer: {
    width: 110,
    height: 110,
    backgroundColor: '#e1dbd1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    position: 'absolute',
    right: 10,
  },
  dateText: {
    fontSize: 20,
    color: '#fff',
  },
  rectangle: {
    height: '95%',
    width: screenWidth - 40, 
    backgroundColor: '#B8AC9B',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    position: 'relative', 
  },
});

const additionalStyles = StyleSheet.create({
  rectangle: {
    backgroundColor: '#f8f0e3',
    padding: 10,
    width: '100%',
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -30,
    marginLeft: 10,
  },
  image: {
    width: 90,
    height: 100,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
});

export default HomeScreen;
