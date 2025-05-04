# TextWarden Extension

This directory contains the browser extension part of TextWarden, an AI-powered writing assistant that provides real-time grammar, spelling, style, and clarity suggestions.

## Directory Structure

- `manifest.json`: Manifest V3 configuration for the extension
- `popup/`: Contains the popup UI files
  - `popup.html`: HTML structure for the popup
  - `popup.css`: Styling for the popup
  - `popup.js`: JavaScript for the popup functionality
- `scripts/`: Contains the extension scripts
  - `background.js`: Background script for API communication
  - `content.js`: Content script for text field detection and highlighting
  - `generate-icons.js`: Script to generate PNG icons from SVG
- `styles/`: Contains CSS files for the extension
  - `content.css`: Styling for the content script
- `icons/`: Contains extension icons
  - `icon.svg`: SVG source for the extension icon
  - `icon16.png`, `icon48.png`, `icon128.png`: PNG icons in different sizes
- `test.html`: Test page for the extension

## Features

- Real-time grammar, spelling, style, and clarity suggestions
- Highlighting of issues in text fields
- Popup with explanations and suggestions for fixing issues
- Settings to customize which types of checks to perform
- Option to disable the extension for specific sites
- Statistics tracking for corrections applied and suggestions shown

## Development

To modify the extension:

1. Edit the files in this directory
2. Load the extension in your browser:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select this directory
3. Test your changes using the `test.html` file

## Building Icons

To generate PNG icons from the SVG source:

1. Make sure you have Node.js installed
2. Install the required dependencies:
   ```
   npm install canvas
   ```
3. Run the icon generation script:
   ```
   node scripts/generate-icons.js
   ```

## Testing

To test the extension:

1. Open the `test.html` file in your browser
2. Type or paste text with grammar, spelling, style, or clarity issues
3. Check if the issues are highlighted and if the suggestions are accurate

## Notes

- The extension requires a backend server to be running for the AI functionality
- Users need to provide their own Gemini API key in the extension settings
