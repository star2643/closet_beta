// controllers/UserProfileController.js
import * as React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, TouchableOpacity, Image } from 'react-native';
import { TensorflowModel, useTensorflowModel } from 'react-native-fast-tflite';
import { ImagePickerResponse, launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import { convertToRGB } from 'react-native-image-to-rgb';
import RNFS from 'react-native-fs';

class imageController {
  private imguri:string|undefined;
  private actualModel:TensorflowModel|undefined;
  constructor() {
    const model = useTensorflowModel(require('../assets/major.tflite')); // model path
    this.actualModel = model.state === 'loaded' ? model.model : undefined;
    
    const [image, setImage] = React.useState<ImagePickerResponse | null>();
    const [result, setResult] = React.useState<string>('');
    
    React.useEffect(() => {
      if (this.actualModel == null) return;
    }, [this.actualModel]);

    console.log(`Model: ${model.state} (${model.model != null})`);

    

    
    
  }
  findMaxValuesInEachRow(twoDArray) {
    const maxValues = [];
  
    // 遍历二维数组的每一行
    for (let i = 0; i < twoDArray.length; i++) {
      let maxInRow = -Infinity;
      let index;
      // 找出当前行的最大值
      for (let j = 0; j < twoDArray[i].length; j++) {
        if (twoDArray[i][j] > maxInRow) {
          maxInRow = twoDArray[i][j];
          index=[i,j]
        }
      }
      const result=[maxInRow,index]
      // 将每行的最大值存入 maxValues 数组中
      maxValues.push(result);
    }
  
    return maxValues;
  }
  findTopThreeMaxValuesWithIndicesOptimized(maxArray) {
    let max1 = -Infinity, max2 = -Infinity, max3 = -Infinity;
    let index1 = null, index2 = null, index3 = null;
  
    for (let i = 0; i < maxArray.length; i++) {
      const value = maxArray[i][0];
      const index=maxArray[i][1];
      if (value > max1) {
        max3 = max2
        index3=index2
        max2 = max1;
        index2=index1
        max1 = value;
        index1=index;
      } else if (value > max2) {
        max3 = max2;
        index3=index2
        max2 = value;
        index2=maxArray[i][1];
      } else if (value > max3) {
        max3 = value;
        index3=maxArray[i][1];

      }
    }
  
    return [
      { value: max1, index: index1 },
      { value: max2, index: index2 },
      { value: max3, index: index3 }
    ];
  }
  uploadImage = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      launchImageLibrary({ mediaType: 'photo', maxHeight: 640, maxWidth: 640 }, async response => {
        if (!response.didCancel) {
          if (response.assets && response.assets.length > 0) {
            const uri = response.assets[0]?.uri;
            if (uri) {
              this.imguri=uri;
              resolve(uri);
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        } else {
          console.log(response.errorMessage);
          resolve(null);
        }
      });
    });
  };
  temp = async(img)=>{
    const resized = await this.resizeImage(img, 640, 640);
    
  
    const convertedArray = await convertToRGB(resized);
    const floatArray = new Float32Array(convertedArray.length);
    for (let i = 0; i < convertedArray.length; i++) {
       floatArray[i] = convertedArray[i] / 255.0;  // 归一化像素值
    }
  
    const result = this.actualModel.model?.runSync([floatArray]);
    const outputTensor = new Float32Array(result[0]);
    console.log(outputTensor.length)
    const convertTo2DArray = (flatArray, rows, cols) => {
    const twoDArray = [];
      for (let i = 0; i < rows; i++) {
        const start = i * cols;
        const end = start + cols;
        twoDArray.push(flatArray.slice(start, end));
      }
      return twoDArray;
    };
    const twoDArray = convertTo2DArray(outputTensor, 47, 8400);
    const twoDArrayLength=twoDArray.length
    const slicedTwoDArray=twoDArray.slice(-twoDArrayLength+4)
    const eachMax=this.findMaxValuesInEachRow(slicedTwoDArray)
    const topThree=this.findTopThreeMaxValuesWithIndicesOptimized(eachMax)
            console.log(topThree)
            console.log(slicedTwoDArray.length)
            //console.log(twoDArray[22][8192]);
            const labels= ['Casual shorts', 'Hooded jacket', 'Long sleeved shirt', 'Long sleeved top', 'Skirt', 'Underwear', 'main-bottom', 'main-jacket', 'main-one-piece', 'main-top', 'secondary Jacket', 'secondary Jacket -without hood-', 'secondary Jumpsuit', 'secondary Long pants', 'secondary Long sleeves', 'secondary One-piece-dress', 'secondary Short skirt', 'secondary Short sleeves', 'secondary Shorts', 'secondary Sleeveless top', 'secondary-capri-pants', 'secondary-long-skirt', 'secondary-three-quarter-sleeve-top', 'tertiary Blazer', 'tertiary Cargo pants', 'tertiary Coat', 'tertiary Cotton pants', 'tertiary Denim jacket', 'tertiary Denim skirt', 'tertiary Hoodie', 'tertiary Suit-pants', 'tertiary Vest', 'tertiary-T-shirt', 'tertiary-cover-up', 'tertiary-down-jacket', 'tertiary-jeans', 'tertiary-other-long-sleeves', 'tertiary-other-pants', 'tertiary-other-short-sleeves', 'tertiary-other-skirts', 'tertiary-pleated-skirt', 'tertiary-shirt', 'tertiary-suit-skirt']
            console.log(labels[topThree[0].index[0]]+" "+labels[topThree[1].index[0]]+" "+labels[topThree[2].index[0]])
            console.log(topThree[0].index[1]+" "+topThree[1].index[1]+" "+topThree[2].index[1])
            const topThreeLabels=[]
            const topThreeindexs=[]
            const topThreeCoordinates=[]
            for(let i=0;i<3;i++){
              if(topThree[i].value>0.9){
                topThreeLabels.push(labels[topThree[i].index[0]])
                topThreeindexs.push(topThree[i].index[1])
                const tempArrays=[]
                for(let j=0;j<4;j++){
                    tempArrays.push(twoDArray[j][topThreeindexs[i]])
                }
                topThreeCoordinates.push(tempArrays)
              }
            }
            console.log(topThreeCoordinates)
            for(let i=0;i<topThreeCoordinates.length;i++){
  
            }
            return topThreeLabels.toString()
  }
  resizeImage = async (uri, width, height) => {
    try {
      const response = await ImageResizer.createResizedImage(uri, width, height, 'JPEG', 100, 0, undefined, true, { mode: "stretch" });
      console.log(response.height, "x", response.width, " img");
      return response.uri;
    } catch (err) {
      console.error(err);
      return null;
    }
  };
}


export default new imageController();
