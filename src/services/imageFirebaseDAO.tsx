import userDAO from './userDAO';
import { firebase } from '@react-native-firebase/database';
import database from '@react-native-firebase/database';
import { useState } from 'react';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
class imageFirebaseDAO extends userDAO{
  private reference:any;
  constructor(){
    super()
  }
  async getIdclass(imageId){
    return new Promise((resolve) => {
    let w;
    try {
      const uid=auth().currentUser?.uid;
      database()
      .ref('/images/'+uid+'/'+imageId+'/classes')
      .once('value')
      .then(snapshot => {
        
        w=snapshot.val()
        const arrayW = Object.values(w);
        console.log(arrayW);  // arrayW 會是一個 array，包含 w object 的所有值
        resolve (arrayW );
      })
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
    });
  }
  async getImageNum() {
    let w;
    try {
      const uid=auth().currentUser?.uid;
      await database()
      .ref('/users/'+uid)
      .once('value')
      .then(snapshot => {
        
        w=snapshot.val()
        
      })
      return w ? w : null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
   
  }
  async updateUserImageId(imageIds,classes:string[]) {
    let w;
    const contains1 = classes.includes('上裝');
    const contains2 = classes.includes('下裝');
    const contains3 = classes.includes('連身');
    const contains4 = classes.includes('外套');
    const update_num=[0,0,0,0]
    if(contains1){
      update_num[0]+=1
    }
    if(contains2){
      update_num[1]+=1
    }
    if(contains3){
      update_num[2]+=1
    }
    if(contains4){
      update_num[3]+=1
    }
    try {
      let w;
      const uid=auth().currentUser?.uid;
      database()
      .ref('/users/'+uid)
      .update({
        current_clothe_number:parseInt(imageIds.current_clothe_number, 10)+1,
        total_clothe_number:parseInt(imageIds.total_clothe_number,10)+1,
        top_number:imageIds.top_number+update_num[0],
        bottom_number:imageIds.bottom_number+update_num[1],
        onepiece_number:imageIds.onepiece_number+update_num[2],
        jacket_number:imageIds.jacket_number+update_num[3]
      }).then(() => console.log('Data updated..'));
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
   
  }
  async UploadImage(imageUri:string,classes:[]) {
    let w;
    try {
      let w;
      const imageIds=await this.getImageNum()
      this.uploadImageURIToFirebase(imageUri,(imageIds.total_clothe_number+1))
      auth().currentUser?.uid
      const uid=auth().currentUser?.uid;
      database()
      .ref('/images/'+uid+'/'+(imageIds.total_clothe_number+1))
      .update({
        classes:classes
        
      }).then(() => console.log('Image Data updated.'));
      this.updateUserImageId(imageIds,classes)
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
   
  }
  private uploadImageURIToFirebase = async (uri,imageid) => {
    try {
      // 使用 fetch 將文件讀取為 Blob
      const response = await fetch(uri);
      const blob = await response.blob();
      const uid=auth().currentUser?.uid;
      // 設置 Firebase Storage 中的文件路徑和名稱
      const fileName = `user/${uid}/${imageid}.jpg`;
      const storageRef = storage().ref(fileName);
  
      // 開始上傳
      const task = storageRef.put(blob);
  
      // 監控上傳進度
      task.on('state_changed', taskSnapshot => {
        console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
      });
  
      // 完成上傳並獲取下載 URL
      await task;
      const downloadURL = await storageRef.getDownloadURL();
      console.log('File available at:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };
  listFilesAndDirectories = async (pageToken) => {
    try {
      const uid = auth().currentUser?.uid;
      if (!uid) {
        throw new Error("用户未认证");
      }
  
      const reference = storage().ref('user/' + uid);
      const tmpImageArray = [];
  
      const result = await reference.list({ pageToken });
  
      // 循环每个文件引用，获取其下载 URL
      const urlPromises = result.items.map(async (ref) => {
        const url = await ref.getDownloadURL();  // 获取每个文件的下载链接
        const fileName = ref.name;  // 获取文件名
        const fileNameWithoutExtension = ref.name.substring(0, ref.name.lastIndexOf('.'));
        const classes2=await this.getIdclass(fileNameWithoutExtension)
        console.log(classes2+"++++++++dddd")
        tmpImageArray.push({
          fileName: fileNameWithoutExtension,  // 文件名
          url: url,  
          classes:classes2          // 下载链接
        });
        console.log(ref.fullPath, url);  // 输出文件路径和 URL
      });
  
      // 等待所有下载链接都获取完成
      await Promise.all(urlPromises);
  
      // 如果还有下一页，递归调用此函数获取更多文件
      if (result.nextPageToken==null) {
        console.log('no next')
      }
      else{
        await this.listFilesAndDirectories(result.nextPageToken);
      }
  
      console.log("所有图片 URL:", JSON.stringify(tmpImageArray, null, 2));
      const res=JSON.stringify(tmpImageArray, null, 2)
      return res
    } catch (error) {
      console.error("获取文件列表时出错:", error);
    }
  };
  uploadModelsToDataBase= async (modelUrl) =>{
    try {
      // 使用 fetch 將文件讀取為 Blob
      const response = await fetch(modelUrl);
      const blob = await response.blob();
      const uid=auth().currentUser?.uid;
      // 設置 Firebase Storage 中的文件路徑和名稱
      const fileName = `user/${uid}/models/model.jpg`;
      const storageRef = storage().ref(fileName);
  
      // 開始上傳
      const task = storageRef.put(blob);
  
      // 監控上傳進度
      task.on('state_changed', taskSnapshot => {
        console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
      });
  
      // 完成上傳並獲取下載 URL
      await task;
      const downloadURL = await storageRef.getDownloadURL();
      console.log('File available at:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
  getModelImageFromFirebase = async () => {
    try {
      const uid=auth().currentUser?.uid;
      const fileName = `user/${uid}/models/model.jpg`;
      // 获取图片的下载 URL
      const url = await storage().ref(fileName).getDownloadURL();
      const response = await fetch(url);
      console.log(url+"abcde")
      if (!response.ok) {
        return '';
      }
      // 返回下载 URL
      return url;
    } catch (error) {
      console.error('Error getting image from Firebase:', error);
      throw error;
    }
  };
  processLoveOutfit =async(outfit,processType,outfitId)=>{
    const uid=auth().currentUser?.uid;
    const imageIds=await this.getImageNum()
    if(processType===1){ //新增穿搭收藏
      try {
        console.log(outfit)
        database()
        .ref('/loveOutfit/'+uid+'/'+(imageIds.loveOutfitSerialNum+1))
        .update({
          top:outfit.top,
          bottom:outfit.bottom
        }).then(() => console.log('love outfit updated.'));
        const currentId=parseInt(imageIds.loveOutfitSerialNum)+1;
        this.updateLoveOutfitId(imageIds)
        return currentId;
      } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
      }
    }
    else if(processType===2&&outfitId){ //刪除收藏
      database()
      .ref(`/loveOutfit/${uid}/${outfitId}`)
      .remove()
      .then(() => {
        console.log(`Outfit with id ${outfitId} has been removed successfully.`);
        this.minusLoveOutfitNum(imageIds)
        return outfitId;
      })
      .catch((error) => {
        console.error("Error removing outfit:", error);
        return null;
      });
    }
  }
  getLoveOutfitlist =async () => {
    const uid=auth().currentUser?.uid;
    return database()
      .ref('/loveOutfit/' + uid)
      .once('value')
      .then((snapshot) => {
        const outfits = snapshot.val();
        if (!outfits) return [];
  
        return Object.entries(outfits).map(([key, value]) => ({
          id: key,
          top: value.top,
          bottom: value.bottom
        }));
      })
      .catch((error) => {
        console.error("Error fetching love outfits:", error);
        return [];
      });
  };
  async updateLoveOutfitId(imageIds) {
    
    try {
      let w;
      const uid=auth().currentUser?.uid;
      database()
      .ref('/users/'+uid)
      .update({
        loveOutfitNum:parseInt(imageIds.loveOutfitNum)+1,
        loveOutfitSerialNum:parseInt(imageIds.loveOutfitSerialNum)+1
      }).then(() => console.log('Love Data updated..'));
    } catch (error) {
      console.error('Error Love Outfit data:', error);
      return null;
    }
   
  }
  async minusLoveOutfitNum(imageIds) {
    
    try {
      let w;
      const uid=auth().currentUser?.uid;
      database()
      .ref('/users/'+uid)
      .update({
        loveOutfitNum:parseInt(imageIds.loveOutfitNum)-1,
      }).then(() => console.log('Love Data updated..'));
    } catch (error) {
      console.error('Error Love Outfit data:', error);
      return null;
    }
   
  }
}


export default imageFirebaseDAO;
