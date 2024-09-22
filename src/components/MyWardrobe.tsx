import React, { useState, useRef,useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, StyleSheet, Modal, Image,ActivityIndicator, Alert,Animated, Easing } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useData } from '../services/DataContext'
import { preloadImages } from '../services/imagePreloader';
type Category = '上裝' | '下裝' | '外套' | '連身';
const engToCHListconst:{ [key: string]: string }= {'main-bottom': '下裝',
  'main-jacket': '外套',
  'main-one-piece': '連身',
  'main-top': '上裝',
  'secondary Jacket': '有帽',
  'secondary Jacket -without hood-': '無帽',
  'secondary Jumpsuit': '連身褲',
  'secondary Long pants': '長褲',
  'secondary Long sleeves': '長袖',
  'secondary One-piece-dress': '連衣裙',
  'secondary Short skirt': '短裙',
  'secondary Short sleeves': '短袖',
  'secondary Shorts': '短褲',
  'secondary Sleeveless top': '無袖',
  'secondary-capri-pants': '七分褲',
  'secondary-long-skirt': '長裙',
  'secondary-three-quarter-sleeve-top': '七分袖',
  'tertiary Blazer': '西裝外套',
  'tertiary Cargo pants': '工裝褲',
  'tertiary Coat': '大衣',
  'tertiary Cotton pants': '棉褲',
  'tertiary Denim jacket': '牛仔夾克',
  'tertiary Denim skirt': '牛仔裙',
  'tertiary Hoodie': '連帽衫',
  'tertiary Suit-pants': '西裝褲',
  'tertiary Vest': '背心',
  'tertiary-T-shirt': 'T恤',
  'tertiary-cover-up': '罩衫',
  'tertiary-down-jacket': '羽絨外套',
  'tertiary-jeans': '牛仔褲',
  'tertiary-other-long-sleeves': '其他長袖',
  'tertiary-other-pants': '其他褲子',
  'tertiary-other-short-sleeves': '其他短袖',
  'tertiary-other-skirts': '其他裙子',
  'tertiary-pleated-skirt': '百褶裙',
  'tertiary-shirt': '襯衫',
  'tertiary-suit-skirt': '西裝裙',
  'tertiary-utility-skirt': '工裝裙'}
  const initialData: { 'fileName': string; 'url': string;'classes': string[] }[] = [
    {fileName:'1',url:'',classes:['上裝']}
  ];

const categories: (Category | 'All')[] = ['All', '上裝', '下裝', '連身', '外套'];
const subCategories = {
  上裝: ['無袖', '短袖', '七分袖', '長袖'],
  下裝: ['短裙', '長裙', '短褲', '長褲', '七分褲'],
  連身: ['連身裙', '連身褲'],
  外套: ['有帽', '無帽'],
};

const topSubCategories = {
  無袖: ['背心'],
  短袖: ['襯衫', 'T恤', '連帽衫'],
  長袖: ['襯衫', 'T恤', '連帽衫'],
  七分袖: ['襯衫', 'T恤', '連帽衫'],
  短褲: ['牛仔褲', '西裝褲', '工裝褲', '棉褲'],
  七分褲: ['牛仔褲', '西裝褲', '工裝褲', '棉褲'],
  長褲: ['牛仔褲', '西裝褲', '工裝褲', '棉褲'],
  短裙: ['牛仔裙', '西裝裙', '工裝裙', '百褶裙'],
  連身裙: [],
  連身褲: [],
  長裙: ['牛仔裙', '西裝裙', '工裝裙', '百褶裙'],
  無帽: ['西裝外套', '大衣', '罩衫', '羽絨外套','牛仔夾克'],
  有帽: ['羽絨外套'],
};
const moreOptionsByinitial=['長袖', '連衣裙', '短裙', '短袖', '短褲', '無袖', '七分褲', '長裙', '七分袖', '西裝外套', '工裝褲', '大衣', '棉褲', '牛仔夾克', '牛仔裙', '連帽衫', '西裝褲', '背心', 'T恤', '罩衫', '羽絨外套', '牛仔褲', '其他長袖', '其他褲子', '其他短袖', '其他裙子', '百褶裙', '襯衫', '西裝裙', '工裝裙']
const setItemsByinitial=['下裝', '外套', '連身', '上裝', '有帽', '無帽', '連身褲', '長褲']
type DataItemWithBase64 = {
  fileName: string;
  url: string;
  classes: string[];
  base64: string;
};
function MyWardrobe() {
  const { data,isLoading, uploadImage, uploadImageToDatabase ,setData} = useData();
  const [isPreloading, setIsPreloading] = useState(true);
  const [firstwithPreload, setfirstwithPreload] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [preloadedData, setPreloadedData] = useState<DataItemWithBase64[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All' | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [topSubCategory, setTopSubCategory] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMoreOptionsVisible, setIsMoreOptionsVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [moreOptions, setMoreOptions] = useState(moreOptionsByinitial);
  const [items, setItems] = useState(setItemsByinitial);
  const [loading, setLoading] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleCategorySelect = (category: Category | 'All') => {
    setSelectedCategory(category === 'All' ? null : category);
    setSelectedSubCategory(null);
    setTopSubCategory(null);
  };

  const handleSubCategorySelect = (subCategory: string) => {
    setSelectedSubCategory(subCategory);
    setTopSubCategory(null);
  };

  const handleTopSubCategorySelect = (subCategory: string) => {
    setTopSubCategory(subCategory);
  };

  const handleFloatingButtonPress = () => {
    setIsModalVisible(true);
    setLoading(false);
  };

  const handleImageUpload = async () => {
    setLoading(true);
    const CH_label = [];
    try {
      if (uploadImage) {
        const result = await uploadImage();
        console.log(result);
        for (const label of result.labels) {
          const translatedLabel = engToCHListconst[label];
          CH_label.push(translatedLabel);
        }
        setItems((prevItems) => prevItems.filter(i => !CH_label.includes(i)));
        setMoreOptions((prevItems) => prevItems.filter(i => !CH_label.includes(i)));
        setSelectedItems((prevOptions) => [...prevOptions, ...CH_label]);
        setImageUri(result.uri);
      }
    } catch (error) {
      console.error('Image upload failed1:', error);
    }
    setLoading(false);
  };
  useEffect(() => {
    
    const preloadAllImages = async () => {
      if (data.length > 0&&firstwithPreload) {
        setIsPreloading(true);
        const imageUrls = data.map(item => item.url);
        const base64Images = await preloadImages(imageUrls);
        
        const newPreloadedData = data.map(item => ({
          ...item,
          base64: base64Images[item.url] || item.url
        }));

        setPreloadedData(newPreloadedData);
        setIsPreloading(false);
        setfirstwithPreload(false)
      }
    };

    preloadAllImages();
  }, [data]);
  useEffect(() => {
    if (imageUri) {
      handleAfterImageLoad();
    }
  }, [imageUri]);

  const handleAfterImageLoad = () => {
    setItems((prevItems) => {
      const total_num = selectedItems.length + items.length;
      const toMove_num = total_num - 8;
      const tmpArr = [];
      for (let i = 0; i < toMove_num; i++) {
        tmpArr.push(prevItems.pop());
      }
      setMoreOptions((prevOptions) => [...prevOptions, ...tmpArr]);
      return prevItems;
    });
  };

  const initialOption = () => {
    setMoreOptions(moreOptionsByinitial);
    setItems(setItemsByinitial);
    setSelectedItems([]);
    setIsModalVisible(false);
  };

  const uploadToDatabase = async () => {
    if (imageUri && selectedItems.length > 0 && uploadImageToDatabase) {
      await uploadImageToDatabase(imageUri, selectedItems);
      setPreloadedData((prevData) => [...prevData, { fileName: imageUri, url: imageUri,base64:'', classes: selectedItems }]);
      setData((prevData) => [...prevData, { fileName: imageUri, url: imageUri, classes: selectedItems }]);
      initialOption();
      Alert.alert("上傳成功!");
    } else if (imageUri) {
      Alert.alert("請選擇至少一個標籤");
    } else {
      Alert.alert("請先上傳圖片");
    }
  };
  const toggleSelection = (item: string) => {
    setSelectedItems((prevItems) => {
      if (prevItems.includes(item)) {
        // 如果已经选中，取消选中
        const updatedItems = prevItems.filter(i => i !== item);
        if(updatedItems.length+items.length<9){
          setItems((prevItems) => {
            return [...prevItems,item]
          })
        }
        // 防止重复添加到 moreOptions 中
        else if (!moreOptions.includes(item)&&!items.includes(item)) {
          const updatedOptions = [...moreOptions];
          setMoreOptions(updatedOptions);
        }
  
        return updatedItems;
      } else {
        const tmpToSelectItems = [...prevItems, item];
        setItems((prevItems) => {
          const updatedItems = prevItems.filter(i => i !== item);
          return updatedItems
        })
        if (tmpToSelectItems.length > 5) {
          const excessItem = tmpToSelectItems.shift(); // 移除超過 5 個的按鈕
          if (items.length<4&&!items.includes(excessItem)) {
            setItems((prevOptions) => [...prevOptions, excessItem!]);
          }
          // 防止重复添加到 moreOptions 中
          else if (!moreOptions.includes(excessItem)) {
            setMoreOptions((prevOptions) => [...prevOptions, excessItem!]);
          }
        }
  
        // 确保新选中的项不会出现在 moreOptions 中
        setMoreOptions((prevOptions) => prevOptions.filter((option) => option !== item));
  
        return tmpToSelectItems;
      }
    });
  };
  

  const handleOptionSelect = (option: string) => {
    
    setSelectedItems((prevItems) => {
      const tmpToSelectItems = [...prevItems, option];
      if (tmpToSelectItems.length > 5) {
        const excessItem = tmpToSelectItems.shift(); // 移除超過 5 個的按鈕
        if (!items.includes(excessItem)) {
          setItems((prevItems) => {
            const popedItem = prevItems.pop()
            setMoreOptions((prevOptions) => [...prevOptions, popedItem!]);
            return [...prevItems, excessItem!]
          })
          
        }
        
      }
      else{
        setItems((prevItems) => {
          const outItem=prevItems.pop()

          setMoreOptions((prevOptions) => [...prevOptions, outItem!]); // 從更多選項中移除
          return prevItems
        });
      }
      return tmpToSelectItems;
    });
    console.log(items.length,' ',selectedItems.length)
    setMoreOptions((prevOptions) => prevOptions.filter((item) => item !== option)); // 從更多選項中移除
    
  };
    // const uri=await imageController.uploadImage()
    // if(uri){
    //   setImageUri(uri)
    //   const result=await imageController.temp(uri)
    // }
    
  
    useEffect(() => {
      if (isLoading || isPreloading) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          })
        ]).start();
      }
    }, [isLoading, isPreloading, fadeAnim, scaleAnim, progressAnim]);
    // ... 其他代碼保持不變
  
    if (isLoading || isPreloading) {
      if(!(data.length>0)&&!(preloadedData.length>0)){
        setIsPreloading(false)
      }
      return (
        <View style={styles.loadingContainer}>
          <Animated.View style={[
            styles.loadingContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <ActivityIndicator size="large" color="#B8AC9B" />
            <Text style={styles.loadingText}>
              {isPreloading ? "正在為您準備精美衣櫃..." : "正在整理您的時尚單品..."}
            </Text>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  {
                    transform: [{
                      scaleX: progressAnim
                    }],
                    transformOrigin: 'left',
                  }
                ]} 
              />
            </View>
          </Animated.View>
        </View>
      );
    }
  
    const filteredData = preloadedData.filter((item) => {
      if (selectedCategory && selectedCategory !== 'All') {
        if (!item.classes.includes(selectedCategory)) return false;
      }
      if (selectedSubCategory) {
        if (!item.classes.includes(selectedSubCategory)) return false;
      }
      if (topSubCategory) {
        if (!item.classes.includes(topSubCategory)) return false;
      }
      return true;
    });
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
            {subCategories[selectedCategory]?.map((subCategory) => (
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
            data={filteredData}
            keyExtractor={(item) => item.fileName}
            renderItem={({ item }) => (
              <TouchableOpacity style={Wardrobe.itemContainer}
              onPress={() => {
                setSelectedItem(item); // 設置選中的物品
                setIsItemModalVisible(true); // 顯示彈窗
              }}>
                  {item.base64?(<Image source={{ uri: item.base64 }} style={Wardrobe.itemImage} />):(
                    <Image source={{ uri: item.url }} style={Wardrobe.itemImage} />
                  )}
                <View style={{width:'100%',flex:1,flexDirection :'row',justifyContent: 'space-between'}}>
                  {item.classes
                          
                          .map(itemClass => (
                            <TouchableOpacity
                              key={itemClass}
                              
                              style={Wardrobe.roundButton2}
                              
                            >
                              <Text style={Wardrobe.buttonText2}>{itemClass}</Text>
                            </TouchableOpacity>
                  ))}
                 </View>
              </TouchableOpacity>
            )}
            numColumns={2}
            contentContainerStyle={Wardrobe.flatListContent}
          />
        </View>

        <TouchableOpacity style={Wardrobe.floatingButton} onPress={handleFloatingButtonPress}>
          <Text style={Wardrobe.floatingButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      {/* 選擇的衣物彈出視窗 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isItemModalVisible}
        onRequestClose={() => setIsItemModalVisible(false)}
      >
        <View style={Wardrobe.modalContainer}>
          <View style={Wardrobe.modalContent}>
            {selectedItem && (
              <>
                <Text style={Wardrobe.modalTitle}>分類: {selectedItem.classes}</Text>
                <Text style={Wardrobe.modalTitle}>名稱: {selectedItem.fileName}</Text>
              </>
            )}

            <TouchableOpacity
              style={Wardrobe.closeButton}
              onPress={() => setIsItemModalVisible(false)}
            >
              <Text style={Wardrobe.closeButtonText}>X</Text>
            </TouchableOpacity>

            {/* 新增刪除按鈕 */}
            <TouchableOpacity
              style={Wardrobe.deleteButton}
              onPress={() => {
                // 在此處添加刪除的邏輯
                console.log('Item deleted:', selectedItem);
                setIsItemModalVisible(false); // 关掉弹窗
              }}
            >
              <Text style={Wardrobe.deleteButtonText}>刪除</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* 从下往上弹出的 Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={Wardrobe.modalContainer}>
          <View style={Wardrobe.modalContent}>
            <Text style={Wardrobe.modalTitle}>上傳照片</Text>
            <TouchableOpacity style={Wardrobe.uploadButton} onPress={handleImageUpload}>
              <Text style={Wardrobe.uploadButtonText}>選擇照片</Text>
            </TouchableOpacity>
            
            {/* 如果有圖片則顯示圖片，否則顯示佔位符 */}
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={Wardrobe.uploadedImage} />
                <View style={styles.container}>
                  {selectedItems.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[Wardrobe.roundButton, Wardrobe.selectedButton]}
                      onPress={() => toggleSelection(item)}
                    >
                      <Text style={Wardrobe.buttonText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                      {items
                        
                        .map(item => (
                          <TouchableOpacity
                            key={item}
                            style={Wardrobe.roundButton}
                            onPress={() => toggleSelection(item)}
                          >
                            <Text style={Wardrobe.buttonText}>{item}</Text>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                    style={Wardrobe.roundButton}
                    onPress={() => setIsMoreOptionsVisible(true)}
                  >
                    <Text style={Wardrobe.buttonText}>{'>>'}</Text>
                  </TouchableOpacity>
                </View>

                
                
                  
              </>
            ) : (
              <View style={Wardrobe.imagePlaceholder}>
                <Text style={Wardrobe.placeholderText}>圖片預覽</Text>
              </View>
              
            )}
            {loading && (
                    <View style={styles.loadingContainer2}>
                      <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                  )}
            <TouchableOpacity style={Wardrobe.uploadButton} onPress={uploadToDatabase}>
              <Text style={Wardrobe.uploadButtonText}>上傳</Text>
            </TouchableOpacity>

            <TouchableOpacity style={Wardrobe.closeButton} onPress={() => setIsModalVisible(false)}>
              <Text style={Wardrobe.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* More Options Modal */}
      <Modal
  animationType="slide"
  transparent={true}
  visible={isMoreOptionsVisible}
  onRequestClose={() => setIsMoreOptionsVisible(false)}
>
  <View style={Wardrobe.modalContainer}>
    <View style={Wardrobe.moreOptionsModalContent}>
      <Text style={Wardrobe.moreOptionsTitle}>更多選項</Text>

      {/* 使用 ScrollView 讓內容可滑動 */}
      <ScrollView contentContainerStyle={Wardrobe.scrollViewContent}>
        {/* Render buttons 3 per row */}
        {moreOptions.reduce((rows, option, index) => {
          if (index % 3 === 0) rows.push([]); // 每3個選項開始一行
          rows[rows.length - 1].push(option);
          return rows;
        }, [] as string[][]).map((row, rowIndex) => (
          <View key={rowIndex} style={Wardrobe.moreOptionsButtonRow}>
            {row.map((option) => (
              <TouchableOpacity 
                key={option} 
                style={Wardrobe.moreOptionsRoundButton} 
                onPress={() => handleOptionSelect(option)}
              >
                <Text style={Wardrobe.moreOptionsButtonText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={Wardrobe.closeButton} onPress={() => setIsMoreOptionsVisible(false)}>
        <Text style={Wardrobe.closeButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </View>
  );
}
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingContainer2: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    width: 200,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: '#B8AC9B',
  },
  container: {
    flexDirection: 'row',    // 横向排列
    flexWrap: 'wrap',        // 自动换行
    justifyContent: 'space-between', // 均匀分布
    padding: 10,
  },
  roundButton: {
    width: 64,            // 按钮宽度，确保两列显示
    height:40,
    
    marginVertical: 10, 
    marginHorizontal: 2,     // 上下间距
    padding: 10,             // 按钮内边距
    backgroundColor: '#ccc', // 示例按钮背景色
    alignItems: 'center', 
    textAlignVertical:'center',   // 文本居中
    
    borderRadius: 20,        // 圆角样式
  },
  buttonText: {
    color: '#000',           // 按钮文本颜色
    fontSize: 14,            // 文本大小
  },
});
const Wardrobe = StyleSheet.create({
  itemImage: {
    flex: 3, // 高度占用剩餘空間的3倍
    aspectRatio: 1, // 保持寬高相等
    marginTop: 10,
    borderRadius: 10,
  },
  moreOptionsModalContent: {
    backgroundColor: '#f8f0e3', // Dark background to differentiate it from others
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    height: '70%', // Adjust height to ensure buttons fit
  },
  moreOptionsTitle: {
    fontSize: 18,
    marginBottom: 20,
    color: 'black', // White text for contrast on dark background
    fontFamily: 'serif',
  },
  moreOptionsButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Ensure 3 buttons per row with spacing
    marginTop: 10,
    width: '100%',
  },
  moreOptionsRoundButton: {
    backgroundColor: '#fff', // Use a bright color for buttons inside this modal
    padding: 10,
    borderRadius: 30,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: '24%', // Keep buttons smaller inside the more options modal
  },
  moreOptionsButtonText: {
    color: '#B8AC9B', // Darker text on the bright button
    fontSize: 14,
    fontFamily: 'serif',
  },
  moreOptionsCloseButton: {
    marginTop: 20,
    backgroundColor: '#FF6347', // A different color for the close button
    padding: 10,
    borderRadius: 20,
    alignSelf: 'center',
  },
  moreOptionsCloseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'serif',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8f0e3',
  },
  categoryMenu: {
    width: '20%',
    backgroundColor: '#D0C5B4', // 修改為你想要的顏色
    paddingVertical: 10,
    paddingHorizontal: 5,
},
  categoryItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7EF',
    marginBottom: 15,
    borderRadius: 30,
  },
  selectedCategoryItem: {
    backgroundColor: '#B8AC9B',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'serif',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 8,
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
    backgroundColor: '#B8AC9B',
    borderRadius: 15,
    marginRight: 10,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedSubCategoryItem: {
    backgroundColor: '#fff',
    
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
    backgroundColor: '#FFF7EF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
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
    backgroundColor: '#D2B48C',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f8f0e3',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'serif',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8C8C8C',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  floatingButtonText: {
    fontSize: 24,
    color: '#333',
    fontFamily: 'serif',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#f8f0e3',
    padding: 10, // Reduce padding to allow more space for buttons
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    height: '70%', // Increase the height to show more content (adjust this if needed)
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
    fontFamily: 'serif',
  },
  uploadButton: {
    backgroundColor: '#B8AC9B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'serif',
  },
  uploadedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 10,
    backgroundColor: '#B8AC9B',
    borderRadius: 20,
    zIndex: 1,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'serif',
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#B8AC9B',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f0e3',
    marginBottom: 15,
  },
  placeholderText: {
    color: '#B8AC9B',
    fontSize: 16,
    fontFamily: 'serif',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
    width: '100%',
  },
  roundButton: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '18%',
  },
  roundButton2: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  selectedButton: {
    backgroundColor: '#E0E0E0', // Selected button color
  },
  buttonText: {
    color: '#B8AC9B',
    fontSize: 14,
  },buttonText2: {
    color: '#B8AC9B',
    fontSize: 10,
  },scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  deleteButton: {
    position: 'absolute', // 將按鈕固定在底部
    bottom: 20, // 距離底部20px
    alignSelf: 'center', // 按鈕置中
    backgroundColor: '#FF6347', // 刪除按鈕的背景色
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  deleteButtonText: {
    color: '#fff', // 刪除按鈕的文本顏色
    fontSize: 18,
    fontFamily: 'serif',
  },
});

export default MyWardrobe;
