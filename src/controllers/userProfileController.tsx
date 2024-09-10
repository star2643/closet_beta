// controllers/UserProfileController.js
import UserModel from '../models/userModel';


class UserProfileController {
  private Model
  constructor() {
    this.Model = new UserModel();
  }

  async fetchUserProfile(userId) {
    try {
      const userProfile = await this.Model.getUserProfile(userId);
      return userProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  
}

export default new UserProfileController();
