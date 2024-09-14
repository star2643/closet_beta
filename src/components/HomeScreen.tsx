import React, { useRef, useState, useEffect } from 'react';
import { ScrollView, Text, View, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

function HomeScreen() {
  const scrollViewRef = useRef(null);
  const [viewHeight, setViewHeight] = useState(0);
  const [currentDate, setCurrentDate] = useState('');
  const [selectedSection, setSelectedSection] = useState(1);

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

  const sectionHeights = [viewHeight, viewHeight, viewHeight];

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const nearestSection = getNearestSection(scrollY);
    setSelectedSection(nearestSection);
  };

  const getNearestSection = (scrollY) => {
    let offset = 0;
    for (let i = 0; i < sectionHeights.length; i++) {
      offset += sectionHeights[i];
      const sectionMidPoint = offset - sectionHeights[i] / 2;
      if (scrollY < sectionMidPoint) {
        return i + 1;
      }
    }
    return sectionHeights.length;
  };

  // 使用 setTimeout 延遲狀態更新，避免按鈕之間的飄移問題
  const scrollToSection = (id) => {
    const targetRef = sectionRefs[id].current;
    if (targetRef) {
      targetRef.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          // 滾動到對應的區塊
          scrollViewRef.current.scrollTo({ y, animated: true });

          // 延遲狀態更新，確保滾動完成後再更新底線狀態
          setTimeout(() => {
            setSelectedSection(id);
          }, 300); // 延遲 300ms
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
          <TouchableOpacity
            onPress={() => scrollToSection(1)}
            style={[
              styles.navItem,
              selectedSection === 1 && styles.selectedNavItem,
            ]}
          >
            <Text style={styles.navText}>智慧穿搭</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => scrollToSection(2)}
            style={[
              styles.navItem,
              selectedSection === 2 && styles.selectedNavItem,
            ]}
          >
            <Text style={styles.navText}>衣櫃數據</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => scrollToSection(3)}
            style={[
              styles.navItem,
              selectedSection === 3 && styles.selectedNavItem,
            ]}
          >
            <Text style={styles.navText}>收藏穿搭</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          pagingEnabled
          onScroll={handleScroll}
          scrollEventThrottle={16}
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
    backgroundColor: '#F5F5F5',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    backgroundColor: '#FDFFFF',
  },
  navItem: {
    padding: 6,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  selectedNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#D2B48C',
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
    backgroundColor: '#D0C5B4',
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
    backgroundColor: '#D0C5B4',
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
    marginTop: -12,
    marginLeft: -2,
  },
  image: {
    width: 65,
    height: 60,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
});

export default HomeScreen;
