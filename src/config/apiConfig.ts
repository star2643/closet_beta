import Config from 'react-native-config';

class ApiConfig {
  private static instance: ApiConfig | null = null;

  private constructor() {
    this.validateConfig();
  }

  public static getInstance(): ApiConfig {
    if (!ApiConfig.instance) {
      ApiConfig.instance = new ApiConfig();
    }
    return ApiConfig.instance;
  }

  // DashScope 配置
  public getDashScopeConfig() {
    return {
      apiKey: Config.DASHSCOPE_API_KEY,
      baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Config.DASHSCOPE_API_KEY,
        'X-DashScope-Async': 'enable'
      }
    };
  }

  // OpenAI 配置
  public getOpenAiConfig() {
    return {
      apiKey: Config.OPENAI_API_KEY,
      headers: {
        'Authorization': `Bearer ${Config.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };
  }

  // 驗證配置
  private validateConfig() {
    const required = ['DASHSCOPE_API_KEY', 'OPENAI_API_KEY'];
    const missing = required.filter(key => !Config[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

export default ApiConfig.getInstance();