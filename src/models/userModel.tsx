// models/UserModel.js
import UserDAO from '../services/userFirebaseDAO';

class UserModel {
  private userDAO:UserDAO;
  constructor() {
    
    this.userDAO = new UserDAO();
  }

  async getUserProfile(id) {
    try {
      const user = await this.userDAO.getUserById(id);
      console.log('3',user)
      // 这里可以添加更多的业务逻辑处理，例如数据转换、过滤等
      return user;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
  }

 
  // 可以添加其他与用户相关的业务逻辑方法...
}

export default UserModel;
