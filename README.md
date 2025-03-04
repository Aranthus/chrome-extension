# Grammar Corrector Chrome Extension

This Chrome extension allows you to correct the grammar of any text you write on websites using ChatGPT, Google Gemini, or Deepseek AI.

## Features

- Works on any website (Twitter, Facebook, Gmail, etc.)
- Simply select (highlight) text to correct it
- Modern, user-friendly interface with draggable correction modal
- Supports multiple AI providers:
  - OpenAI (ChatGPT)
  - Google Gemini
  - Deepseek AI
- Elegant "Correct" button with ripple animation effect
- Responsive design that adapts to content length

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked extension"
5. Select the downloaded folder

## Usage

1. Enter your API key in the extension settings:
   - Click the extension icon
   - Select your preferred API type (OpenAI, Gemini, or Deepseek)
   - Enter your API key and click "Save API Key"
2. Select any text you want to correct on any website
3. Click the "Correct" button that appears
4. The corrected text will be displayed in a modal window
5. You can copy the corrected text and paste it wherever you need

## Requirements

- Google Chrome browser
- An API key from one of these providers:
  - OpenAI API key (get it from [OpenAI](https://platform.openai.com/account/api-keys))
  - Google Gemini API key (get it from [Google AI](https://ai.google.dev))
  - Deepseek API key (get it from [Deepseek](https://platform.deepseek.com))

## Notes

- Please use this extension in accordance with API usage policies
- API calls will count against your credit/usage limits
- This extension stores your API keys locally in your browser storage and does not send them elsewhere

## Icon Generation

To generate the required icons for the extension:

1. Open `images/create_icons.html` in your browser
2. Click the "Download" button for each icon size
3. Save the downloaded icons to the `images` folder with the following names:
   - icon16.png
   - icon48.png
   - icon128.png
