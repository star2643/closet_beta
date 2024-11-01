import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useData } from '../services/DataContext';

const ITEMS_PER_PAGE = 6;

const OutfitDetailModal = ({ outfits, onClose }) => {
  const { data } = useData();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setTotalPages(Math.ceil(outfits.length / ITEMS_PER_PAGE));
  }, [outfits]);

  const getUrlByFilename = (filename) => {
    const item = data.find(item => item.fileName === filename);
    return item ? item.url : null;
  };

  const renderClothingItem = (item, title) => {
    if (!item) return null;

    const imageUrl = getUrlByFilename(item);
    const clothingItem = data.find(dataItem => dataItem.fileName === item);

    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
        
      </View>
    );
  };

  const renderOutfit = ({ item }) => (
    <View style={styles.outfitContainer}>
      <View style={styles.outfitItemsContainer}>
        {renderClothingItem(item.top, '上裝')}
        {renderClothingItem(item.bottom, '下裝')}
      </View>
    </View>
  );

  const paginatedOutfits = outfits.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const Pagination = () => (
    <View style={styles.paginationContainer}>
      {Array.from({ length: totalPages }, (_, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.pageButton, currentPage === index + 1 && styles.activePageButton]}
          onPress={() => setCurrentPage(index + 1)}
        >
          <Text style={[styles.pageButtonText, currentPage === index + 1 && styles.activePageButtonText]}>
            {index + 1}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.modalContainer}>
      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <FlatList
            data={paginatedOutfits}
            renderItem={renderOutfit}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            scrollEnabled={false}
          />
          <Pagination />
        </ScrollView>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>關閉</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f0e3', // 淺米色背景
  },
  contentContainer: {
    width: '90%',
    height: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  outfitContainer: {
    backgroundColor: '#f8f0e3', // 與背景色相同，創造一體感
    borderRadius: 10,
    padding: 10,
    margin: 5,
    width: '48%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  outfitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a4a4a',
    marginBottom: 10,
  },
  outfitItemsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: '48%',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#4a4a4a',
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 5,
    marginBottom: 5,
  },
  infoContainer: {
    marginBottom: 5,
  },
  infoText: {
    fontSize: 12,
    color: '#6a6a6a',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  pageButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  activePageButton: {
    backgroundColor: '#B8AC9B',
  },
  pageButtonText: {
    color: '#4a4a4a',
  },
  activePageButtonText: {
    color: 'white',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#B8AC9B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});



export default OutfitDetailModal;