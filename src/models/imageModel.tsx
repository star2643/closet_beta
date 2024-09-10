// models/UserModel.js
import ImageDAO from '../services/imageFirebaseDAO';

class UserModel {
  private imageDAO:ImageDAO;
  constructor() {
    
    this.imageDAO = new ImageDAO();
  }

  async uploadImage(URI,classes) {
    try {
      const user = await this.imageDAO.UploadImage(URI,classes);
      console.log('3',user)
      // 这里可以添加更多的业务逻辑处理，例如数据转换、过滤等
      return user;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
  }
  async listAll(){
    try{
      const tmparr=this.imageDAO.listFilesAndDirectories(null)
      console.log(tmparr+"222222");
      return tmparr
    }
    catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
  }
 
  // 可以添加其他与用户相关的业务逻辑方法...
}

export default UserModel;
