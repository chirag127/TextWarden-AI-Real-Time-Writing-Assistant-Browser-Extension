/**
 * TextWarden Backend Test
 * 
 * This file contains simple tests for the TextWarden backend server.
 * 
 * @author Chirag Singhal (chirag127)
 */

console.log('Starting TextWarden backend tests...');

// Test the server startup
try {
  const app = require('./server');
  console.log('✅ Server imported successfully');
} catch (error) {
  console.error('❌ Server import failed:', error.message);
  process.exit(1);
}

// Test the Gemini utility
try {
  const { getGeminiSuggestion } = require('./utils/gemini');
  
  // Test with missing API key
  const missingKeyTest = async () => {
    const result = await getGeminiSuggestion('Test text', null);
    if (result.error && result.message.includes('API Key is missing')) {
      console.log('✅ Gemini utility correctly handles missing API key');
    } else {
      console.error('❌ Gemini utility failed to handle missing API key correctly');
    }
  };
  
  missingKeyTest();
  console.log('✅ Gemini utility imported successfully');
} catch (error) {
  console.error('❌ Gemini utility import failed:', error.message);
}

console.log('\nNote: To test with a real API key, you would need to provide your own Gemini API key.');
console.log('Backend tests completed. For full API testing, start the server and use tools like Postman or curl.');
