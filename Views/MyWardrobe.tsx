import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, StyleSheet } from 'react-native';

type Category = '上衣' | '下身' | '外套' | '連身';
type SubCategory = 'Casual' | 'Formal' | 'Sport';

const data: Record<Category, { id: string; name: string; subCategory: SubCategory; type: string; topType: string }[]> = {
  '上衣': [
    { id: '1', name: '短袖 襯衫 1', subCategory: 'Casual', type: '短袖', topType: '襯衫' },
    { id: '2', name: '短袖 T-shirt 1', subCategory: 'Casual', type: '短袖', topType: 'T-shirt' },
    { id: '3', name: '無袖 背心 1', subCategory: 'Sport', type: '無袖', topType: '背心' },
    { id: '4', name: '長袖 T-shirt 1', subCategory: 'Casual', type: '長袖', topType: 'T-shirt' },
    { id: '5', name: '七分袖 襯衫 1', subCategory: 'Formal', type: '七分袖', topType: '襯衫' },
  ],
  '下身': [
    { id: '6', name: '短褲 牛仔褲', subCategory: 'Casual', type: '短褲', topType: '牛仔褲' },
    { id: '7', name: '七分褲 工裝褲', subCategory: 'Sport', type: '七分褲', topType: '工裝褲' },
    { id: '8', name: '長褲 西裝褲', subCategory: 'Formal', type: '長褲', topType: '西裝褲' },
    { id: '9', name: '短裙 百褶裙', subCategory: 'Casual', type: '短裙', topType: '百褶裙' },
    { id: '10', name: '長裙 西裝裙', subCategory: 'Formal', type: '長裙', topType: '西裝裙' },
  ],
  '外套': [
    { id: '11', name: '無帽 西裝外套', subCategory: 'Formal', type: '無帽', topType: '西裝外套' },
    { id: '12', name: '有帽 羽絨外套', subCategory: 'Casual', type: '有帽', topType: '羽絨外套' },
  ],
  '連身': [
    { id: '13', name: '連身裙 1', subCategory: 'Casual', type: '連身裙', topType: '' },
    { id: '14', name: '連身裙 2', subCategory: 'Formal', type: '連身裙', topType: '' },
    { id: '15', name: '連身褲 1', subCategory: 'Sport', type: '連身褲', topType: '' },
  ],
};

const categories: (Category | 'All')[] = ['All', '上衣', '下身', '連身', '外套'];
const subCategories = {
  上衣: ['短袖', '無袖', '長袖', '七分袖'],
  下身: ['短褲', '七分褲', '長褲', '短裙', '長裙'],
  連身: ['連身裙', '連身褲'],
  外套: ['無帽', '有帽'],
};

const topSubCategories = {
  無袖: ['背心'],
  短袖: ['襯衫', 'T-shirt', '連帽衫'],
  長袖: ['襯衫', 'T-shirt', '連帽衫'],
  七分袖: ['襯衫', 'T-shirt', '連帽衫'],
  短褲: ['牛仔褲', '西裝褲', '工裝褲', '衛褲', '其他(褲)'],
  七分褲: ['牛仔褲', '西裝褲', '工裝褲', '衛褲', '其他(褲)'],
  長褲: ['牛仔褲', '西裝褲', '工裝褲', '衛褲', '其他(褲)'],
  短裙: ['牛仔裙', '西裝裙', '工裝裙', '百褶裙', '其他(裙)'],
  連身裙: [],
  連身褲: [],
  長裙: ['牛仔裙', '西裝裙', '工裝裙', '百褶裙', '其他(裙)'],
  無帽: ['西裝外套', '大衣', '罩衫', '羽絨外套'],
  有帽: ['羽絨外套'],
};

function MyWardrobe() {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All' | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [topSubCategory, setTopSubCategory] = useState<string | null>(null);

  const scrollPositionRef = useRef<number>(0);
  const flatListRef = useRef<FlatList>(null);

  const filteredData = selectedCategory && selectedCategory !== 'All' && data[selectedCategory]
    ? selectedSubCategory
      ? topSubCategory
        ? data[selectedCategory].filter(item => item.type === selectedSubCategory && item.topType === topSubCategory)
        : data[selectedCategory].filter(item => item.type === selectedSubCategory)
      : data[selectedCategory]
    : Object.values(data).flat();

  const handleCategorySelect = (category: Category | 'All') => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    setTopSubCategory(null);
    scrollPositionRef.current = 0; // Reset scroll position
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const handleSubCategorySelect = (subCategory: string) => {
    setSelectedSubCategory(subCategory);
    setTopSubCategory(null);
    scrollPositionRef.current = 0; // Reset scroll position
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const handleTopSubCategorySelect = (subCategory: string) => {
    setTopSubCategory(subCategory);
  };

  return (
    <View style={Wardrobe.container}>
      <View style={[
        Wardrobe.categoryMenu,
        selectedCategory && selectedCategory !== 'All' && Wardrobe.selectedCategoryMenu
      ]}>
        {!selectedCategory || selectedCategory === 'All' ? (
          categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                Wardrobe.categoryItem,
                selectedCategory === category && Wardrobe.selectedCategoryItem,
              ]}
              onPress={() => handleCategorySelect(category)}
            >
              <Text style={Wardrobe.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <>
            <TouchableOpacity style={Wardrobe.backButton} onPress={() => handleCategorySelect('All')}>
              <Text style={Wardrobe.backButtonText}>返回</Text>
            </TouchableOpacity>
            {subCategories[selectedCategory].map((subCategory) => (
              <TouchableOpacity
                key={subCategory}
                style={[
                  Wardrobe.categoryItem,
                  selectedSubCategory === subCategory && Wardrobe.selectedSubCategoryItem,
                ]}
                onPress={() => handleSubCategorySelect(subCategory)}
              >
                <Text style={Wardrobe.categoryText}>{subCategory}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>

      <View style={Wardrobe.contentArea}>
        {selectedSubCategory && topSubCategories[selectedSubCategory] && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={Wardrobe.subCategoryMenu}
          >
            {topSubCategories[selectedSubCategory].map((sub) => (
              <TouchableOpacity
                key={sub}
                style={[
                  Wardrobe.subCategoryItem,
                  topSubCategory === sub && Wardrobe.selectedSubCategoryItem,
                ]}
                onPress={() => handleTopSubCategorySelect(sub)}
              >
                <Text style={Wardrobe.subCategoryText}>{sub}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={{ flex: 1, position: 'relative' }}>
          <FlatList
            ref={flatListRef}
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={Wardrobe.itemContainer}>
                <Text style={Wardrobe.itemText}>{item.name}</Text>
              </View>
            )}
            numColumns={2}
            contentContainerStyle={Wardrobe.flatListContent}
            extraData={selectedSubCategory}
            onScrollEndDrag={(event) => {
              scrollPositionRef.current = event.nativeEvent.contentOffset.y;
            }}
            onMomentumScrollEnd={(event) => {
              scrollPositionRef.current = event.nativeEvent.contentOffset.y;
            }}
            onLayout={() => {
              flatListRef.current?.scrollToOffset({ offset: scrollPositionRef.current, animated: false });
            }}
          />
        </View>
      </View>
    </View>
  );
}

const Wardrobe = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8f0e3',
  },
  categoryMenu: {
    width: '20%',
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  categoryItem: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  selectedCategoryItem: {
    backgroundColor: '#D3D3D3',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'serif',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 5,
    justifyContent: 'flex-start',
    backgroundColor: '#f8f0e3',
  },
  subCategoryMenu: {
    marginBottom: 10,
    height: 40,
    flexGrow: 0,
  },
  subCategoryItem: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#E8E8E8',
    borderRadius: 15,
    marginRight: 10,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedSubCategoryItem: {
    backgroundColor: '#D3D3D3',
  },
  subCategoryText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'serif',
  },
  itemContainer: {
    width: '46%',
    aspectRatio: 0.75,
    margin: 5,
    backgroundColor: '#B8AC9B',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  itemText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'serif',
  },
  flatListContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  selectedCategoryMenu: {
    backgroundColor: '#a69579',
  },
  backButton: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#6b5629',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'serif',
  },
});

export default MyWardrobe;
