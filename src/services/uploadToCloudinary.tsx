const uploadToCloudinary = async (imageSource) => {
  try {
    const formData = new FormData();
    
    // 處理不同的圖片來源（URL 或 base64）
    if (typeof imageSource === 'string') {
      // 如果是 base64
      if (imageSource.startsWith('data:image') || imageSource.startsWith('/9j/')) {
        const base64WithPrefix = imageSource.startsWith('data:image') 
          ? imageSource 
          : `data:image/jpeg;base64,${imageSource}`;
        formData.append('file', base64WithPrefix);
      } 
      // 如果是 URL
      else {
        formData.append('file', imageSource);
      }
    }

    formData.append('upload_preset', 'esodbeha');
    
    
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dmjdd9tml/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '上傳失敗');
    }

    return data.secure_url;
    
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export default uploadToCloudinary;