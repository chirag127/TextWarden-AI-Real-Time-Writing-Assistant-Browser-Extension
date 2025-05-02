/**
 * TextWarden Gemini API Test
 * 
 * This script tests the connection to the Gemini API using a user-provided API key.
 * 
 * @author Chirag Singhal (chirag127)
 */

const { GoogleGenAI } = require('@google/genai');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Test the Gemini API connection
async function testGeminiAPI(apiKey) {
  console.log('\nTesting connection to Gemini API...');
  
  try {
    // Initialize the API client with the provided key
    const ai = new GoogleGenAI(apiKey);
    
    // Use the model specified in the PRD
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });
    
    // Simple configuration
    const config = {
      responseMimeType: "text/plain",
    };
    
    // Simple test prompt
    const contents = [
      {
        role: 'user',
        parts: [
          { text: 'Please respond with "Connection successful!" if you receive this message.' },
        ],
      },
    ];
    
    console.log('Sending test request to Gemini API...');
    
    // Send the request
    const response = await model.generateContent({
      contents,
      generationConfig: config,
    });
    
    const responseText = response.response.text();
    console.log('\n✅ API Response:');
    console.log('-------------------');
    console.log(responseText);
    console.log('-------------------');
    console.log('\nConnection test successful! Your API key is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Error connecting to Gemini API:');
    console.error('-------------------');
    console.error(error.message);
    console.error('-------------------');
    
    // Provide more helpful error messages
    if (error.message.includes('API key not valid')) {
      console.error('\nThe API key you provided is not valid. Please check it and try again.');
    } else if (error.message.includes('quota')) {
      console.error('\nYour Gemini API key has exceeded its quota limit.');
    } else if (error.message.includes('billing')) {
      console.error('\nThere might be a billing issue associated with your API key.');
    } else {
      console.error('\nPlease check your internet connection and try again.');
    }
  }
}

// Main function
function main() {
  console.log('TextWarden Gemini API Test');
  console.log('=========================');
  console.log('This script tests the connection to the Gemini API using your API key.');
  
  rl.question('\nPlease enter your Gemini API key: ', async (apiKey) => {
    if (!apiKey || apiKey.trim() === '') {
      console.error('\n❌ Error: API key is required.');
      rl.close();
      return;
    }
    
    await testGeminiAPI(apiKey.trim());
    rl.close();
  });
}

// Run the main function
main();
