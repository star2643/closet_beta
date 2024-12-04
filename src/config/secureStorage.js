import EncryptedStorage from 'react-native-encrypted-storage';
import Environment from './environment';

class SecureStorage {
  static instance = null;

  constructor() {
    if (SecureStorage.instance) {
      return SecureStorage.instance;
    }
    SecureStorage.instance = this;
  }

  // 存儲加密的 API Key
  async storeApiKey() {
    try {
      const apiKey = Environment.getApiKey();
      if (!apiKey) {
        throw new Error('API key not found in environment variables');
      }

      await EncryptedStorage.setItem(
        'secure_api_key',
        JSON.stringify({
          key: apiKey,
          timestamp: Date.now()
        })
      );
    } catch (error) {
      console.error('Error storing API key:', error);
      throw error;
    }
  }

  // 獲取加密的 API Key
  async getApiKey() {
    try {
      const data = await EncryptedStorage.getItem('secure_api_key');
      if (!data) {
        return null;
      }

      const { key, timestamp } = JSON.parse(data);
      // 檢查是否需要更新（例如每24小時）
      if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
        await this.storeApiKey(); // 重新存儲以更新時間戳
        return Environment.getApiKey();
      }

      return key;
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    }
  }

  // 清除存儲的數據
  async clearSecureStorage() {
    try {
      await EncryptedStorage.clear();
    } catch (error) {
      console.error('Error clearing secure storage:', error);
      throw error;
    }
  }
}

export default new SecureStorage();