import { Image } from 'react-native';
import RNFS from 'react-native-fs';

export const preloadImages = async (urls: string[]): Promise<{[key: string]: string}> => {
  const base64Images: {[key: string]: string} = {};

  for (const url of urls) {
    try {
      // 如果是本地文件路徑
      if (url.startsWith('file://')) {
        const base64 = await RNFS.readFile(url, 'base64');
        base64Images[url] = `data:image/jpeg;base64,${base64}`;
      }
      // 如果是網絡 URL
      else {
        const response = await fetch(url);
        const blob = await response.blob();
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        base64Images[url] = base64 as string;
      }
    } catch (error) {
      console.error(`Failed to preload image: ${url}`, error);
    }
  }

  return base64Images;
};