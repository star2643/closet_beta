import * as React from 'react';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import { convertToRGB } from 'react-native-image-to-rgb';
import imageModel from '../models/imageModel';
function useImageController(model1) {
  const model = model1;
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
  const uploadImageToDatabase = async (URI,classes) => {
    try {
      const uploadProfile = await imgModel.uploadImage(URI,classes);
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
      console.error('Error upload img model:', error);
      throw error;
    }
  }
  const getModelImageFromFirebase=async()=>{
    const final_got_Model=await imgModel.getModelImage()
    return final_got_Model;

    
  }
  const getLoveList=async ()=>{
    const final_got_loveList=await imgModel.getLoveOutfitlist()
    return final_got_loveList;
  }
  const processLoveOutfit=async (outfit,processType,outfitId):Promise<number|null|undefined> =>{
    const finalresult=await imgModel.processLoveOutfit(outfit,processType,outfitId)
    return finalresult;
  }
  return {
    uploadImage,uploadImageToDatabase,listAll,uploadModel,getModelImageFromFirebase,getLoveList,processLoveOutfit
  };
  
}

export default useImageController;
