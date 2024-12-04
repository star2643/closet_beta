// imgur-api.js
const IMGUR_TOKENS = {
  access_token: 'c6e1f17d3becc1007b0dd285b79338cc949460c1e',
  refresh_token: '14befd734740f806609ee4e23b86c50af5293af0',
};

const refreshImgurToken = async () => {
  try {
    const response = await fetch('https://api.imgur.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        refresh_token: IMGUR_TOKENS.refresh_token,
        client_id: 'YOUR_CLIENT_ID', // 需要從 Imgur 開發者頁面獲取
        client_secret: 'YOUR_CLIENT_SECRET', // 需要從 Imgur 開發者頁面獲取
        grant_type: 'refresh_token'
      })
    });

    const data = await response.json();
    IMGUR_TOKENS.access_token = data.access_token;
    IMGUR_TOKENS.refresh_token = data.refresh_token;
    return data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

const uploadToImgur = async (imageSource) => {
  try {
    let imageData;
    
    // 處理不同的圖片來源（URL 或 base64）
    if (typeof imageSource === 'string') {
      // 如果是 base64
      if (imageSource.startsWith('data:image') || imageSource.startsWith('/9j/')) {
        imageData = imageSource.includes('data:image') 
          ? imageSource.split(',')[1] 
          : imageSource;
      } 
      // 如果是 URL
      else {
        imageData = imageSource;
      }
    }

    // 準備請求體
    const body = {
      image: imageData,
      type: imageSource.startsWith('http') ? 'url' : 'base64',
    };
    
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${IMGUR_TOKENS.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    // 如果 token 過期，嘗試刷新並重試
    if (response.status === 401) {
      const newToken = await refreshImgurToken();
      // 使用新 token 重試上傳
      const retryResponse = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const retryData = await retryResponse.json();
      if (!retryData.success) {
        throw new Error(retryData.data.error || '上傳失敗');
      }
      return retryData.data.link;
    }

    if (!data.success) {
      throw new Error(data.data.error || '上傳失敗');
    }

    return data.data.link;
    
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export default uploadToImgur;