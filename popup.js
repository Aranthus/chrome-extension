// Popup script for Grammar Corrector Extension
import { API_TYPES } from './api-manager.js';

document.addEventListener('DOMContentLoaded', () => {
  const apiTypeSelect = document.getElementById('apiType');
  const openaiSection = document.getElementById('openaiSection');
  const geminiSection = document.getElementById('geminiSection');
  const deepseekSection = document.getElementById('deepseekSection');
  const openaiKeyInput = document.getElementById('openaiKey');
  const geminiKeyInput = document.getElementById('geminiKey');
  const deepseekKeyInput = document.getElementById('deepseekKey');
  const saveButton = document.getElementById('saveButton');
  const statusElement = document.getElementById('status');
  
  // Handle API type selection change
  apiTypeSelect.addEventListener('change', () => {
    const selectedApiType = apiTypeSelect.value;
    
    // Hide all sections first
    openaiSection.classList.add('hidden');
    geminiSection.classList.add('hidden');
    deepseekSection.classList.add('hidden');
    
    // Show only the selected section
    switch (selectedApiType) {
      case API_TYPES.OPENAI:
        openaiSection.classList.remove('hidden');
        break;
      case API_TYPES.GEMINI:
        geminiSection.classList.remove('hidden');
        break;
      case API_TYPES.DEEPSEEK:
        deepseekSection.classList.remove('hidden');
        break;
    }
  });
  
  // Load saved API settings on popup open
  chrome.storage.sync.get(['apiType', 'openaiKey', 'geminiKey', 'deepseekKey'], (result) => {
    if (result.apiType) {
      apiTypeSelect.value = result.apiType;
      // Trigger change event to show correct sections
      apiTypeSelect.dispatchEvent(new Event('change'));
    }
    
    if (result.openaiKey) {
      openaiKeyInput.value = result.openaiKey;
    }
    
    if (result.geminiKey) {
      geminiKeyInput.value = result.geminiKey;
    }
    
    if (result.deepseekKey) {
      deepseekKeyInput.value = result.deepseekKey;
    }
  });
  
  // Save API settings when button is clicked
  saveButton.addEventListener('click', () => {
    const apiType = apiTypeSelect.value;
    const openaiKey = openaiKeyInput.value.trim();
    const geminiKey = geminiKeyInput.value.trim();
    const deepseekKey = deepseekKeyInput.value.trim();
    
    // Get the current API key based on selected type
    let currentKey = '';
    let apiName = '';
    
    switch(apiType) {
      case API_TYPES.OPENAI:
        currentKey = openaiKey;
        apiName = 'OpenAI';
        break;
      case API_TYPES.GEMINI:
        currentKey = geminiKey;
        apiName = 'Gemini';
        break;
      case API_TYPES.DEEPSEEK:
        currentKey = deepseekKey;
        apiName = 'Deepseek';
        break;
    }
    
    // Validate key
    if (!currentKey) {
      alert('Please enter a valid API key');
      return;
    }
    
    // Save all API settings to storage
    chrome.storage.sync.set({ 
      apiType: apiType,
      openaiKey: openaiKey,
      geminiKey: geminiKey,
      deepseekKey: deepseekKey
    }, () => {
      // Show success message
      statusElement.style.display = 'block';
      statusElement.textContent = 'API key saved successfully!';
      
      // Hide message after 3 seconds
      setTimeout(() => {
        statusElement.style.display = 'none';
      }, 3000);
    });
  });
});
