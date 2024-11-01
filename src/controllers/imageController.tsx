import React, { useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import { convertToRGB } from 'react-native-image-to-rgb';
import imageModel from '../models/imageModel';
import { Image, View,TouchableWithoutFeedback  } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

function useImageController(model1,model2) {
  const model = model1;
  const closet_model=model2;
  const imgModel= new imageModel();
  const resizeImage = async (uri: string, width: number, height: number) => {
    try {
      const response = await ImageResizer.createResizedImage(uri, width, height, 'JPEG', 100, 0, undefined, true, { mode: "stretch" });
      console.log(response.height, "x", response.width, " img");
      return response.uri;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const findMaxValuesInEachRow = (twoDArray: any) => {
    const maxValues = [];
  
    for (let i = 0; i < twoDArray.length; i++) {
      let maxInRow = -Infinity;
      let index;
      for (let j = 0; j < twoDArray[i].length; j++) {
        if (twoDArray[i][j] > maxInRow) {
          maxInRow = twoDArray[i][j];
          index = [i, j];
        }
      }
      const result = [maxInRow, index];
      maxValues.push(result);
    }
  
    return maxValues;
  };

  const findTopThreeMaxValuesWithIndicesOptimized = (maxArray: any[]) => {
    let max1 = -Infinity, max2 = -Infinity, max3 = -Infinity;
    let index1 = null, index2 = null, index3 = null;
  
    for (let i = 0; i < maxArray.length; i++) {
      const value = maxArray[i][0];
      const index = maxArray[i][1];
      if (value > max1) {
        max3 = max2;
        index3 = index2;
        max2 = max1;
        index2 = index1;
        max1 = value;
        index1 = index;
      } else if (value > max2) {
        max3 = max2;
        index3 = index2;
        max2 = value;
        index2 = maxArray[i][1];
      } else if (value > max3) {
        max3 = value;
        index3 = maxArray[i][1];
      }
    }
  
    return [
      { value: max1, index: index1 },
      { value: max2, index: index2 },
      { value: max3, index: index3 }
    ];
  };
  const findallspace = (twoDArray: any) => {
    
    const index_result=[]
    
  
    for (let i = 0; i < twoDArray.length; i++) {
      let index;
      for (let j = 0; j < twoDArray[i].length; j++) {
        if (twoDArray[i][j] > 0.5) {
          index_result.push([i,j])
        }
      }
      
    }
  
    return index_result;
  };
  const uploadImage = () => {
    return new Promise((resolve, reject) => {
      launchImageLibrary({ mediaType: 'photo', maxHeight: 640, maxWidth: 640 }, async response => {
        if (response.didCancel) {
          reject('User cancelled image picker');
          return;
        }
        if (response.errorCode) {
          reject('ImagePicker Error: ' + response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const originalUri = response.assets[0]?.uri || '';
          console.log(originalUri);
          const resized = await resizeImage(originalUri, 640, 640);
          if (resized) {
            const convertedArray = await convertToRGB(resized);
            const floatArray = new Float32Array(convertedArray.length);
            for (let i = 0; i < convertedArray.length; i++) {
              floatArray[i] = convertedArray[i] / 255.0;
            }

            const result = model.model?.runSync([floatArray]);
            if (result) {
              const outputTensor = new Float32Array(result[0]);
              console.log(outputTensor.length);
              const convertTo2DArray = (flatArray: Float32Array, rows: number, cols: number) => {
                const twoDArray = [];
                for (let i = 0; i < rows; i++) {
                  const start = i * cols;
                  const end = start + cols;
                  twoDArray.push(flatArray.slice(start, end));
                }
                return twoDArray;
              };
              const twoDArray = convertTo2DArray(outputTensor, 42, 8400);
              const twoDArrayLength = twoDArray.length;
              const slicedTwoDArray = twoDArray.slice(-twoDArrayLength + 4);
              const eachMax = findMaxValuesInEachRow(slicedTwoDArray);
              const topThree = findTopThreeMaxValuesWithIndicesOptimized(eachMax);
              console.log(topThree);
              console.log(slicedTwoDArray.length);

              const labels = ['main-bottom', 'main-jacket', 'main-one-piece', 'main-top', 'secondary Jacket', 'secondary Jacket -without hood-', 'secondary Jumpsuit', 'secondary Long pants', 'secondary Long sleeves', 'secondary One-piece-dress', 'secondary Short skirt', 'secondary Short sleeves', 'secondary Shorts', 'secondary Sleeveless top', 'secondary-capri-pants', 'secondary-long-skirt', 'secondary-three-quarter-sleeve-top', 'tertiary Blazer', 'tertiary Cargo pants', 'tertiary Coat', 'tertiary Cotton pants', 'tertiary Denim jacket', 'tertiary Denim skirt', 'tertiary Hoodie', 'tertiary Suit-pants', 'tertiary Vest', 'tertiary-T-shirt', 'tertiary-cover-up', 'tertiary-down-jacket', 'tertiary-jeans', 'tertiary-other-long-sleeves', 'tertiary-other-pants', 'tertiary-other-short-sleeves', 'tertiary-other-skirts', 'tertiary-pleated-skirt', 'tertiary-shirt', 'tertiary-suit-skirt', 'tertiary-utility-skirt'];
              console.log(labels[topThree[0].index[0]] + " " + labels[topThree[1].index[0]] + " " + labels[topThree[2].index[0]]);
              console.log(topThree[0].index[1] + " " + topThree[1].index[1] + " " + topThree[2].index[1]);

              const topThreeLabels = [];
              const topThreeIndexes = [];
              const topThreeCoordinates = [];
              for (let i = 0; i < 3; i++) {
                if (topThree[i].value > 0.5) {
                  topThreeLabels.push(labels[topThree[i].index[0]]);
                  topThreeIndexes.push(topThree[i].index[1]);
                  const tempArrays = [];
                  for (let j = 0; j < 4; j++) {
                    tempArrays.push(twoDArray[j][topThreeIndexes[i]]);
                  }
                  topThreeCoordinates.push(tempArrays);
                }
              }
              console.log(topThreeCoordinates);

              resolve({
                uri: originalUri,
                labels: topThreeLabels,
                coordinates: topThreeCoordinates
              });
            } else {
              reject('Model run failed');
            }
          } else {
            reject('Failed to resize image');
          }
        } else {
          reject('No image selected');
        }
      });
    });
  };
  const uploadClosetImage =async () => {
    return new Promise((resolve, reject) => {
      launchImageLibrary({ mediaType: 'photo', maxHeight: 640, maxWidth: 640 }, async response => {
        if (response.didCancel) {
          reject('User cancelled image picker');
          return;
        }
        if (response.errorCode) {
          reject('ImagePicker Error: ' + response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const originalUri = response.assets[0]?.uri || '';
          const { width: originalWidth, height: originalHeight } = await getImageDimensions(originalUri);
          console.log(originalUri);
          const resized = await resizeImage(originalUri, 640, 640);
          if (resized) {
            const convertedArray = await convertToRGB(resized);
            const floatArray = new Float32Array(convertedArray.length);
            for (let i = 0; i < convertedArray.length; i++) {
              floatArray[i] = convertedArray[i] / 255.0;
            }

            const result =closet_model.model?.runSync([floatArray]);
            if (result) {
              const outputTensor = new Float32Array(result[0]);
              console.log('outputTensor:',outputTensor)
              console.log(outputTensor.length);
              const convertTo2DArray = (flatArray: Float32Array, rows: number, cols: number) => {
                const twoDArray = [];
                for (let i = 0; i < rows; i++) {
                  const start = i * cols;
                  const end = start + cols;
                  twoDArray.push(flatArray.slice(start, end));
                }
                return twoDArray;
              };
              const twoDArray = convertTo2DArray(outputTensor, 6, 8400);
              console.log(twoDArray)
              const twoDArrayLength = twoDArray.length;
              const slicedTwoDArray = twoDArray.slice(-twoDArrayLength + 4);
              
              const allspace = findallspace(slicedTwoDArray);
              console.log(allspace);
              console.log(slicedTwoDArray.length);
              const labels = ['close_space', 'space'];
              const coordinates = [];
              for (let i = 0; i < allspace.length; i++) {
                  const tmparray=[]
                  for (let j = 0; j < 2; j++) {
                    
                    tmparray.push(twoDArray[j][allspace[i][1]]);
                  }
                  coordinates.push(tmparray)
              }
              console.log('即將進行後製工作');
              const pixelCoordinates = convertToPixelCoordinates(coordinates, 640, 640);
              console.log('Converted to pixel coordinates');

              const threshold = 0.05 * 640; // 调整阈值为像素值
              const filteredCoordinates = filterCloseCoordinates(pixelCoordinates, threshold);
              console.log('Filtered coordinates:', filteredCoordinates.length);
              
              // 将坐标映射回原始图片的尺寸
              //const scaledCoordinates = scaleCoordinates(filteredCoordinates, 640, 640, originalWidth, originalHeight);
              console.log('Scaled coordinates to original image size');
              //console.log(scaledCoordinates)
              // 创建一个包含原始图像和标注的组件
              
              resolve({
                imageUri: originalUri,
                coordinates: filteredCoordinates,
                originalWidth,
                originalHeight
              });
            } else {
              reject('Model run failed');
            }
          } else {
            reject('Failed to resize image');
          }
        } else {
          reject('No image selected');
        }
      });
    });
  };
  const getImageDimensions = (uri: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve, reject) => {
      Image.getSize(uri, (width, height) => {
        resolve({ width, height });
      }, reject);
    });
  };
  const convertToPixelCoordinates = (coordinates: number[][], width: number, height: number): number[][] => {
    return coordinates.map(coord => [
      Math.round(coord[0] * width),
      Math.round(coord[1] * height),
    ]);
  };
  const scaleCoordinates = (
    coordinates: number[][], 
    fromWidth: number, 
    fromHeight: number, 
    toWidth: number, 
    toHeight: number
  ): number[][] => {
    return coordinates.map(coord => [
      (coord[0] * toWidth) / fromWidth,
      (coord[1] * toHeight) / fromHeight
    ]);
  };

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };
  
  // 過濾掉中心點距離過近的坐標
  const filterCloseCoordinates = (coordinates: number[][], threshold: number): number[][] => {
    const filteredCoordinates: number[][] = [];
  
    for (let i = 0; i < coordinates.length; i++) {
      let shouldAdd = true;
      const [x1, y1] = coordinates[i];
  
      for (let j = 0; j < filteredCoordinates.length; j++) {
        const [x2, y2] = filteredCoordinates[j];
        const distance = calculateDistance(x1, y1, x2, y2);
  
        if (distance < threshold) {
          shouldAdd = false;
          break;
        }
      }
  
      if (shouldAdd) {
        filteredCoordinates.push(coordinates[i]);
      }
    }
  
    return filteredCoordinates;
  };
  const uploadImageToDatabase = async (URI:string,classes:string[],coordinate:number[][]) => {
    try {
      const uploadProfile = await imgModel.uploadImage(URI,classes,coordinate);
      return uploadProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };
  const listAll= async()=>{
    try {
      const tmp=await imgModel.listAll();
      console.log(tmp+"fast!!!"+typeof tmp)
      const array=JSON.parse(tmp);
      return array
    }
    catch (error) {
      console.error('Error fetching img profile1:', error);
      throw error;
    }
  }
  const uploadModel= async(uri:string)=>{
    try {
      console.log('success enter ')
      const tmp=await imgModel.uploadModel(uri);

    }
    catch (error) {
      console.error('Error upload model img:', error);
      throw error;
    }
  }
  const uploadClosetToDataBase= async(closetData:{uri:string,originalWidth:number,originalHeight:number,coords:number[][]})=>{
    try {
      console.log('success enter ')
      const tmp=await imgModel.uploadClosetToDataBase(closetData);

    }
    catch (error) {
      console.error('Error upload closet img in controller:', error);
      throw error;
    }
  }
  const getModelImageFromFirebase=async()=>{
    const final_got_Model=await imgModel.getModelImage()
    return final_got_Model;

    
  }
  const getClosetImageFromFirebase=async()=>{
    const tmp=await imgModel.getClosetImageFromFirebase()
    
    return tmp
  }
  const getLoveList=async ()=>{
    const final_got_loveList=await imgModel.getLoveOutfitlist()
    return final_got_loveList;
  }
  const processLoveOutfit=async (outfit,processType,outfitId):Promise<number|null|undefined> =>{
    const finalresult=await imgModel.processLoveOutfit(outfit,processType,outfitId)
    return finalresult;
  }
  const removeClotheImage=async (imageId,classes):Promise<any>=>{
    const imgId=await imgModel.removeClotheImage(imageId,classes)
    return imgId
    
  }
  return {
    uploadImage,uploadImageToDatabase,listAll,uploadModel,getModelImageFromFirebase,getLoveList,processLoveOutfit,uploadClosetImage,uploadClosetToDataBase,getClosetImageFromFirebase,removeClotheImage
  };
  
}


export default useImageController;
