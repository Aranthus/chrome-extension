/**
 * API Manager for Grammar Corrector Extension
 * 
 * Bu dosya, farklı AI API'leri ile iletişim kurma işlemlerini yönetir.
 * Yeni bir API eklemek için bir fonksiyon ekleyin ve apiHandlers nesnesine kaydedin.
 */

// Desteklenen API türleri
const API_TYPES = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
  DEEPSEEK: 'deepseek'
};

// Her API türü için işleyiciler
const apiHandlers = {
  // OpenAI (ChatGPT) API işleyicisi
  [API_TYPES.OPENAI]: async (text, apiKey) => {
    try {
      console.log('Calling ChatGPT API with text:', text);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that corrects grammar. Only return the corrected text without any additional explanation.'
            },
            {
              role: 'user',
              content: `Correct the grammar in the following text, but preserve the meaning and style: "${text}"`
            }
          ],
          temperature: 0.3,
          max_tokens: 150
        })
      });
      
      const data = await response.json();
      console.log('OpenAI API response:', data);
      
      if (data.error) {
        throw new Error(data.error.message || 'Unknown OpenAI API error');
      }
      
      // Extract only the corrected text from the response
      const correctedText = data.choices[0].message.content.trim();
      console.log('Corrected text from OpenAI:', correctedText);
      return correctedText;
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      throw error;
    }
  },
  
  // Google Gemini API işleyicisi
  [API_TYPES.GEMINI]: async (text, apiKey) => {
    try {
      console.log('Calling Gemini API with text:', text);
      
      // API endpoint
      const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
      console.log('API endpoint:', apiEndpoint.replace(apiKey, apiKey.substring(0, 3) + "..."));
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Correct the grammar in the following text, but preserve the meaning and style. Only return the corrected text without any additional explanation: "${text}"`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 256
        }
      };
      
      console.log('Request body:', JSON.stringify(requestBody));
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      
      const data = await response.json();
      console.log('Gemini API response:', JSON.stringify(data, null, 2));
      
      if (data.error) {
        throw new Error(data.error.message || 'Unknown Gemini API error');
      }
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Unexpected response from Gemini API');
      }
      
      // Extract only the corrected text from the response
      const content = data.candidates[0].content;
      const textParts = content.parts.filter(part => part.text).map(part => part.text);
      const correctedText = textParts.join(' ').trim();
      console.log('Corrected text from Gemini:', correctedText);
      return correctedText;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  },
  
  // Deepseek API işleyicisi
  [API_TYPES.DEEPSEEK]: async (text, apiKey) => {
    try {
      console.log('Calling Deepseek API with text:', text);
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that corrects grammar. Only return the corrected text without any additional explanation.'
            },
            {
              role: 'user',
              content: `Correct the grammar in the following text, but preserve the meaning and style: "${text}"`
            }
          ],
          temperature: 0.3,
          max_tokens: 200
        })
      });
      
      const data = await response.json();
      console.log('Deepseek API response:', data);
      
      if (data.error) {
        throw new Error(data.error.message || 'Unknown Deepseek API error');
      }
      
      // Extract only the corrected text from the response
      const correctedText = data.choices[0].message.content.trim();
      console.log('Corrected text from Deepseek:', correctedText);
      return correctedText;
    } catch (error) {
      console.error('Error calling Deepseek API:', error);
      throw error;
    }
  }
};

/**
 * Ana API işleyici fonksiyonu
 * @param {string} text - Düzeltilecek metin
 * @param {string} apiType - Kullanılacak API türü (openai, gemini, vs.)
 * @param {string} apiKey - API anahtarı
 * @returns {Promise<string>} - Düzeltilmiş metin
 */
async function correctGrammarWithAPI(text, apiType, apiKey) {
  // API türünü kontrol et
  if (!apiHandlers[apiType]) {
    throw new Error(`Desteklenmeyen API türü: ${apiType}`);
  }
  
  // İlgili API işleyicisini çağır
  return await apiHandlers[apiType](text, apiKey);
}

// API işlevlerini dışa aktar
export {
  correctGrammarWithAPI,
  API_TYPES
};
