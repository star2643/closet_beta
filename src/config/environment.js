import { Platform } from 'react-native';
import Config from 'react-native-config';

class Environment {
  static instance = null;

  constructor() {
    if (Environment.instance) {
      return Environment.instance;
    }
    Environment.instance = this;
    this.environment = process.env.APP_ENV || 'development';
  }

  // 獲取 API Key
  getApiKey() {
    return Config.API_KEY;
  }

  // 獲取基礎 URL
  getBaseUrl() {
    return Config.BASE_URL;
  }

  // 獲取當前環境
  getCurrentEnvironment() {
    return this.environment;
  }

  // 檢查是否為開發環境
  isDevelopment() {
    return this.environment === 'development';
  }

  // 檢查環境變量是否正確設置
  validateEnvironment() {
    const requiredVars = ['API_KEY', 'BASE_URL'];
    const missingVars = requiredVars.filter(varName => !Config[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
}

export default new Environment();