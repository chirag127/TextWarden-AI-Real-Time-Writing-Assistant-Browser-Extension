# 📘 TextWarden

![TextWarden Logo](https://raw.githubusercontent.com/chirag127/TextWarden/main/extension/icons/icon.svg)

## ✨ Description

TextWarden is an AI-powered writing assistant browser extension that provides real-time grammar, spelling, style, and clarity suggestions across the web. It analyzes text in input fields (e.g., emails, social media posts, forms) and offers actionable feedback to improve communication, acting as a lightweight, privacy-focused alternative to tools like Grammarly.

## 🚀 Key Features

-   **Real-time Grammar & Spelling Checks**: Get instant feedback on your writing without disrupting your workflow
-   **Style & Clarity Suggestions**: Improve the readability and impact of your text
-   **User-Provided API Key**: Use your own Gemini API key for AI-powered features
-   **Privacy-Focused**: Your API key is stored locally and never on our servers
-   **Seamless Integration**: Works across websites including Gmail, Google Docs, and more

## 🛠️ Tech Stack / Tools Used

-   **Frontend**: HTML, CSS, JavaScript, Chrome Extension (Manifest V3)
-   **Backend**: Node.js, Express.js (Stateless API Proxy)
-   **AI Integration**: Google Gemini 2.5 Flash Preview API
-   **Development Tools**: Git, GitHub

## 📦 Installation

### Prerequisites

-   Node.js (v14 or higher)
-   npm (v6 or higher)
-   Chrome browser

### Backend Setup

1. Clone the repository and navigate to the project directory:

    ```
    git clone https://github.com/chirag127/TextWarden.git
    cd TextWarden
    ```

2. Install backend dependencies:

    ```
    cd backend
    npm install
    ```

3. Start the backend server:

    ```
    npm start
    ```

    The server will run on `http://localhost:3000`. You should see a message confirming the server is running.

### Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" in the top-right corner.
3. Click "Load unpacked" and select the `extension` directory from the TextWarden project.
4. The TextWarden extension should now be installed and visible in your browser toolbar.

## 🔧 Usage

### Basic Usage

1. Click the TextWarden icon in your browser toolbar to open the popup.
2. Toggle the extension on/off using the switch at the top.
3. Select which types of checks you want to enable (Grammar, Spelling, Style, Clarity).
4. Start typing in any text field on the web, and TextWarden will analyze your text in real-time.
5. Hover over highlighted text to see suggestions and click on a suggestion to apply it.

### Setting Up Your Gemini API Key

To use the AI-powered features, you'll need to provide your own Gemini API key:

1. Get a Gemini API key from [Google AI Studio](https://ai.google.dev/).
2. Click the TextWarden icon in your browser toolbar.
3. Click "Settings" or the "Add API Key" button.
4. Enter your Gemini API key in the field provided.
5. Click "Save API Key".

Your API key is stored securely in your browser using Chrome's local storage and is never sent to our servers except when making requests to the Gemini API through our secure backend.

## 🧪 Detailed Features

### Core Features (No API Key Required)

-   **Real-Time Grammar & Spelling Checks**: Instantly identifies and highlights grammar, spelling, and punctuation errors as you type
-   **Style & Clarity Analysis**: Suggests improvements for clarity, conciseness, and readability
-   **Customizable Checks**: Toggle specific types of checks (grammar, spelling, style, clarity) based on your preferences
-   **Language Preference**: Choose between American English (en-US) and British English (en-GB)
-   **Statistics Tracking**: Monitor how many corrections you've applied and suggestions you've received

### AI-Powered Features (Requires Gemini API Key)

-   **Advanced Writing Suggestions**: Get intelligent recommendations for improving your text using Google's Gemini AI
-   **Context-Aware Analysis**: Receive suggestions that consider the full context of your writing
-   **Vocabulary Enhancement**: Get recommendations for more precise or impactful word choices
-   **Tone Adjustment**: Suggestions to help maintain a consistent and appropriate tone

### Technical Features

-   **Secure API Key Handling**: Your Gemini API key is stored locally in your browser and never on our servers
-   **Stateless Backend**: Our backend acts only as a proxy to the Gemini API, with no persistent storage of your data
-   **Cross-Site Compatibility**: Works across websites including Gmail, Google Docs, and more
-   **Lightweight & Fast**: Minimal impact on browser performance

## 🔒 Privacy & Security

TextWarden is designed with privacy and security as top priorities:

-   **Local Storage Only**: Your API key is stored securely in your browser using Chrome's local storage
-   **No User Data Collection**: We don't collect or store any of your text or personal information
-   **Secure Transmission**: Your API key is transmitted securely (HTTPS) to our backend only when needed for API calls
-   **Ephemeral Processing**: Your text and API key are used only for the duration of the request and never stored persistently
-   **Minimal Permissions**: The extension requests only the permissions it needs to function

## 👌 Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the existing coding style.

## 🏢 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Future Enhancements

-   Support for additional browsers (Firefox, Edge, Safari)
-   More language options beyond English
-   Enhanced text field detection and compatibility
-   Additional AI-powered writing features

---

Made with ❤️ by [chirag127](https://github.com/chirag127)
