import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useData } from '../services/DataContext';

const OutfitSuggestion = ({ onOutfitSelect }) => { 
  const { data,processLoveOutfit,setloveData,loveData } = useData();
  const clothingData = useMemo(() => categorizeClothing(data), [data]);
  const [selectedOutfit, setSelectedOutfit] = useState({ top: null, bottom: null });
  const [isLoved, setIsLoved] = useState(false);
  const [loveId,setloveId]=useState<number|null|undefined>(-1)
  useEffect(() => {
    selectRandomOutfit();
  }, [clothingData]);
  useEffect(()=>{
    console.log(selectedOutfit)
  },[selectedOutfit])
  const selectRandomOutfit = () => {
    let newOutfit;
    do {
      const isOnePiece = Math.random() < 0.3; // 30% 概率选择连身装
  
      if (isOnePiece && clothingData.onePiece.length > 0) {
        const randomOnePiece = clothingData.onePiece[Math.floor(Math.random() * clothingData.onePiece.length)];
        newOutfit = { top: randomOnePiece, bottom: null };
      } else {
        const randomTop = clothingData.tops[Math.floor(Math.random() * clothingData.tops.length)];
        const randomBottom = clothingData.bottoms[Math.floor(Math.random() * clothingData.bottoms.length)];
        newOutfit = { top: randomTop, bottom: randomBottom };
      }
    } while (
      newOutfit.top === selectedOutfit.top && 
      newOutfit.bottom === selectedOutfit.bottom
    );
  
    setSelectedOutfit(newOutfit);
  };
  
  const selectRandomItem = (type) => {
    if (type === 'top') {
      let newTop;
      do {
        const isOnePiece = Math.random() < 0.3;
        if (isOnePiece && clothingData.onePiece.length > 0) {
          newTop = clothingData.onePiece[Math.floor(Math.random() * clothingData.onePiece.length)];
        } else {
          newTop = clothingData.tops[Math.floor(Math.random() * clothingData.tops.length)];
        }
      } while (newTop === selectedOutfit.top);
  
      if (newTop.classes.includes('連身')) {
        setSelectedOutfit({ top: newTop, bottom: null });
      } else {
        setSelectedOutfit(prev => ({ ...prev, top: newTop }));
      }
    } else if (type === 'bottom') {
      if (selectedOutfit.top && selectedOutfit.top.classes.includes('連身')) {
        // 如果当前是连身装，则重新随机选择上装和下装
        let newTop, newBottom;
        do {
          newTop = clothingData.tops[Math.floor(Math.random() * clothingData.tops.length)];
          newBottom = clothingData.bottoms[Math.floor(Math.random() * clothingData.bottoms.length)];
        } while (newTop === selectedOutfit.top && newBottom === selectedOutfit.bottom);
        
        setSelectedOutfit({ top: newTop, bottom: newBottom });
      } else {
        let newBottom;
        do {
          newBottom = clothingData.bottoms[Math.floor(Math.random() * clothingData.bottoms.length)];
        } while (newBottom === selectedOutfit.bottom);
  
        setSelectedOutfit(prev => ({ ...prev, bottom: newBottom }));
      }
    }
  };

  const handleOkayPress = () => {
    if (typeof onOutfitSelect === 'function' && selectedOutfit) {
      onOutfitSelect({
        top: selectedOutfit.top,
        bottom: selectedOutfit.bottom
      });
    }
  };
  
  const handleLovePress = () => {
    if (isLoved) {
      // 取消選中時的操作
      handleUnlove();
    } else {
      // 選中時的操作
      handleLove();
    }
    setIsLoved(!isLoved);
  };

  const handleLove =async () => {
    // 實現選中時的邏輯
    const outfits={
      top:selectedOutfit.top.fileName,
      bottom:selectedOutfit.bottom?selectedOutfit.bottom.fileName:null
    }
    console.log(outfits)
    const resultID=await processLoveOutfit(outfits,1,-1)
    setloveId(resultID)
    setloveData((prevItems) => {
      return [...prevItems,{id: resultID,
        top: selectedOutfit.top.fileName,
        bottom: selectedOutfit.bottom?selectedOutfit.bottom.fileName:null}]
    })
    
    // 這裡可以調用 API 或執行其他操作
  };

  const handleUnlove =async () => {
    // 實現取消選中時的邏輯
    const outfits={
      top:selectedOutfit.top.filename,
      bottom:selectedOutfit.bottom?selectedOutfit.bottom.filename:null
    }
    console.log('取消喜歡項目');
    const resultID=await processLoveOutfit(outfits,2,loveId)
    setloveData(prevData => 
      prevData.filter(item => item.id.toString() !== loveId.toString())
    );
    // 這裡可以調用 API 或執行其他操作
  };
  const renderClothingItem = (item, type) => (
    <View style={styles.clothingItemContainer}>
      <TouchableOpacity style={styles.clothingButton}
        
        onPress={() => selectRandomItem(type)}
      >
      <Image source={{ uri: item?.url }} style={styles.clothingItem} />
      </TouchableOpacity>
        
      
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/Images/bedroom-background.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
      <View style={styles.showContainer}>
          <View style={styles.reminderContainer}>
            <Text style={styles.reminderTitle}>來點穿搭靈感嗎？</Text>
            <Text style={styles.reminderText}>
              來隨機搭配一下吧！
            </Text>
            <Text style={styles.reminderText2}>
              點選圖片能夠重新生成照片喔！
            </Text>
          </View>
          <View style={styles.btnContainer}>
            <TouchableOpacity style={styles.button} onPress={handleOkayPress}>
              <Text style={styles.buttonText}>Okay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heartButton} onPress={handleLovePress}>
              <Text style={[styles.heartButtonText, isLoved && styles.heartButtonTextLoved]}>
                {isLoved ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.outfitContainer}>
          <View style={styles.imageContainer}>
            
              {renderClothingItem(selectedOutfit.top, 'top')}
              
              <View style={styles.clothingItemContainer}>
              <TouchableOpacity 
                style={styles.clothingButton} 
                onPress={() => selectRandomItem('bottom')}
              >
                {selectedOutfit.bottom ? (
                  <Image source={{ uri: selectedOutfit.bottom.url }} style={styles.clothingItem} />
                ) : (
                  <View style={[styles.clothingItem]} />
                )}
              
                
              </TouchableOpacity>
            </View>
          </View>
          
        </View>
        
        
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outfitContainer: {
    flex: 3,
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    paddingVertical: 10,
    //backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 15,
    marginLeft:5
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(230, 220, 206, 0.7)',
    padding:5,
    borderRadius: 20,
  },
  clothingItemContainer: {
    flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
  },
  clothingItem: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    
    resizeMode: 'cover',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  
  btnContainer: {
    height: 'auto',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 10,
  },
  button: {
    
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height:'25%',
    width: '100%',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  heartButton: {
    backgroundColor: 'rgba(210, 180, 140, 0.9)',
    marginTop:10,
    width: '100%',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButtonText: {
    fontSize: 18,
    color: '#FFF',
  },
  showContainer: {
    flex: 2,
    height:'100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderContainer: {
    height: '40%',
    width:'100%',
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 5,
    borderRadius: 15,
    marginTop: 18,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reminderText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom:10,
  },
  reminderText2: {
   
    fontSize: 14,
    lineHeight: 20,
    color:'#f39c12'
  },
  clothingButton:{
    width:'100%',
  }
});

const categorizeClothing = (data) => {
  const categories = {
    tops: [],
    bottoms: [],
    onePiece: [],
    outerwear: []
  };

  data.forEach(item => {
    if (item.classes.includes('上裝') || item.classes.includes('短袖') || item.classes.includes('長袖') || item.classes.includes('T恤')) {
      categories.tops.push(item);
    }
    if (item.classes.includes('下裝') || item.classes.includes('長褲') || item.classes.includes('短褲')) {
      categories.bottoms.push(item);
    }
    if (item.classes.includes('連身') || item.classes.includes('連衣裙')) {
      categories.onePiece.push(item);
    }
    if (item.classes.includes('外套')) {
      categories.outerwear.push(item);
    }
  });

  return categories;
};

export default OutfitSuggestion;