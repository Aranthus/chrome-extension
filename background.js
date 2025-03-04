// Background script for Grammar Corrector Extension
import { correctGrammarWithAPI, API_TYPES } from './api-manager.js';

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Grammar Corrector Extension installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'correctGrammar') {
    console.log('Received grammar correction request:', request.text);
    
    // Get the API settings from storage
    chrome.storage.sync.get(['apiType', 'openaiKey', 'geminiKey', 'deepseekKey'], (result) => {
      const apiType = result.apiType || 'openai'; // Default to OpenAI if not set
      console.log('Using API type:', apiType);
      
      // API türüne göre anahtarı al
      let apiKey;
      switch (apiType) {
        case 'openai':
          apiKey = result.openaiKey;
          break;
        case 'gemini':
          apiKey = result.geminiKey;
          break;
        case 'deepseek':
          apiKey = result.deepseekKey;
          break;
      }
      
      if (!apiKey) {
        console.error(`${apiType} API key not found`);
        sendResponse({ error: `${apiType} API key is not set. Please set it in the extension popup.` });
        return;
      }
      
      // API Manager kullanarak düzeltme işlemini yap
      correctGrammarWithAPI(request.text, apiType, apiKey)
        .then(correctedText => {
          console.log(`${apiType} Grammar correction successful`);
          sendResponse({ correctedText: correctedText });
        })
        .catch(error => {
          console.error(`${apiType} API Error:`, error);
          console.error('Error details:', error.message, error.stack);
          sendResponse({ error: `Failed to correct grammar with ${apiType}: ${error.message}. Please try again.` });
        });
    });
    
    // Return true to indicate that the response will be sent asynchronously
    return true;
  } else if (request.action === 'checkConnection') {
    sendResponse({ connected: true });
    return true; // Keep the message channel open for async responses
  }
});
