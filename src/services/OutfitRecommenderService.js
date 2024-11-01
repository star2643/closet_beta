import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

class OutfitRecommenderService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.clothingDatabase = {
      tops: {},
      bottoms: {}
    };
  }

  async convertToBase64(imageUri) {
    if (!imageUri) return imageUri;

    try {
      let adjustedPath = imageUri;
      
      // 處理 file:// 開頭的路徑
      if (imageUri.startsWith('file://')) {
        adjustedPath = Platform.OS === 'android' 
          ? imageUri.replace('file://', '')
          : imageUri.replace('file://', '');
      }
      
      // 新增：處理網路圖片（如 Firebase URL）
      if (imageUri.startsWith('http')) {
        const tempFile = `${RNFS.CachesDirectoryPath}/temp_image_${Date.now()}.jpg`;
        await RNFS.downloadFile({
          fromUrl: imageUri,
          toFile: tempFile,
        }).promise;
        adjustedPath = tempFile;
      }

      // 使用 RNFS 替代原本的方法
      const base64 = await RNFS.readFile(adjustedPath, 'base64');

      // 新增：清理臨時文件
      if (imageUri.startsWith('http')) {
        RNFS.unlink(adjustedPath).catch(err => 
          console.warn('清理臨時文件失敗:', err)
        );
      }

      return base64;
    } catch (error) {
      console.error('轉換圖片到base64失敗:', error);
      throw error;
    }
  }

  cleanJsonResponse(responseText) {
    return responseText.replace(/```json|```/g, '').trim();
  }

  async analyzeClothing(imageUri) {
    try {
      const base64Image = await this.convertToBase64(imageUri);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "你是一個專業的服飾分析助手。請嚴格按照提供的JSON格式進行回應，不要添加任何markdown格式或其他文字。"
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  }
                },
                {
                  type: "text",
                  text: `請分析這件服飾，並將分析結果填入以下JSON格式中的對應位置（只需填入引號內的值，直接返回JSON，不要加入markdown格式）：

{
    "type": "上衣/下身",
    "category": "T恤/襯衫/牛仔褲/短褲/長褲/etc",
    "color": "主要顏色",
    "material": "主要材質",
    "season": "適合季節",
    "occasion": "適合場合",
    "style": "風格標籤",
    "temperature": "適合溫度範圍（例：20-25）"
}`
                }
              ]
            }
          ],
          max_tokens: 500
        })
      });
      console.log(response)
      if (!response.ok) {
        throw new Error('分析請求失敗');
      }

      const data = await response.json();
      console.log(data.choices[0].message.content)
      const cleanedContent = this.cleanJsonResponse(data.choices[0].message.content);
      const result = JSON.parse(cleanedContent);

      // 轉換為中文鍵名
      const translated_result = {
        "類型": result.type,
        "具體品類": result.category,
        "主要顏色": result.color,
        "材質": result.material,
        "適合季節": result.season,
        "適合場合": result.occasion,
        "風格標籤": result.style,
        "溫度範圍": result.temperature
      };

      // 根據類型存儲到對應分類
      if (translated_result.類型.includes('上衣')) {
        this.clothingDatabase.tops[imageUri] = translated_result;
      } else {
        this.clothingDatabase.bottoms[imageUri] = translated_result;
      }

      return translated_result;

    } catch (error) {
      console.error('分析錯誤:', error);
      return {
        "類型": "未知",
        "具體品類": "未知",
        "主要顏色": "未知",
        "材質": "未知",
        "適合季節": "未知",
        "適合場合": "未知",
        "風格標籤": "未知",
        "溫度範圍": "未知"
      };
    }
  }

  async processClothingBatch(imageUris) {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      for (const uri of imageUris) {
        await delay(1000); // 添加延遲以避免請求限制
        try {
          const analysis = await this.analyzeClothing(uri);
          console.log('成功處理服飾:', uri);
        } catch (error) {
          console.error('處理服飾失敗:', uri, error);
        }
      }
    } catch (error) {
      console.error('批量處理失敗:', error);
    }
  }

  async recommendOutfit(conditions) {
    try {
      const prompt = `請根據以下條件和衣物清單，推薦一套最適合的搭配。直接返回JSON格式的結果，不要添加markdown格式或其他文字。若上身為連身裙或連身褲，則下身請保留空白

環境條件：
-性別：${conditions.gender}
- 最高溫度：${conditions.Maxtemperature}°C
- 最低溫度：${conditions.Mintemperature}°C
- 場合：${conditions.occasion}
- 風格偏好：${conditions.style || '不指定'}

可選的上衣：
${JSON.stringify(this.clothingDatabase.tops, null, 2)}

可選的下身：
${JSON.stringify(this.clothingDatabase.bottoms, null, 2)}

請仔細考慮以下因素：
1. 溫度適合性
2. 場合適當性
3. 顏色搭配和諧度
4. 風格一致性
5. 季節性
6. 整體視覺效果
7.性別
回應格式：
{
    "top_url": "選中的上衣URL",
    "bottom_url": "選中的下身URL",
    "reasoning": "選擇原因（請詳細說明配色、場合適合性、溫度考量等）",
    "style_tips": "穿搭建議",
    "matching_score": "搭配分數（1-100）"
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "你是一個專業的服飾搭配顧問，精通色彩搭配、場合穿搭和時尚趨勢。請提供詳細的搭配建議和理由。"
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('推薦請求失敗');
      }

      const data = await response.json();
      const cleanedContent = this.cleanJsonResponse(data.choices[0].message.content);
      return JSON.parse(cleanedContent);

    } catch (error) {
      console.error('推薦搭配錯誤:', error);
      return {
        top_url: "無法生成推薦",
        bottom_url: "無法生成推薦",
        reasoning: "系統無法正確解析搭配建議，請稍後重試",
        style_tips: "",
        matching_score: 0
      };
    }
  }
}

export default OutfitRecommenderService;
