/**
 * TextWarden Prompt Test
 * 
 * This script tests the Gemini API prompt for text analysis.
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

// Test the Gemini API prompt
async function testGeminiPrompt(apiKey, text, checks) {
  console.log('\nTesting Gemini API prompt...');
  
  try {
    // Initialize the API client with the provided key
    const ai = new GoogleGenAI(apiKey);
    
    // Use the model specified in the PRD
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });
    
    // Configure the request
    const generationConfig = {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    };
    
    // Create a prompt based on the requested check types
    const checkTypesText = checks.join(', ');
    
    const promptText = `
You are TextWarden, an AI writing assistant that analyzes text for issues and provides suggestions for improvement.

Analyze the following text for ${checkTypesText} issues. For each issue you find, provide:
1. The problematic text
2. The type of issue (grammar, spelling, style, or clarity)
3. A brief explanation of the issue
4. A suggested correction

Format your response as a valid JSON array of objects with the following structure:
[
  {
    "issue": "problematic text",
    "type": "issue type (grammar, spelling, style, or clarity)",
    "explanation": "brief explanation of the issue",
    "suggestion": "suggested correction"
  },
  ...
]

If you find no issues, return an empty array: []

TEXT TO ANALYZE:
"""
${text}
"""

RESPONSE (valid JSON array only):`;
    
    const contents = [
      {
        role: 'user',
        parts: [{ text: promptText }],
      },
    ];
    
    console.log('Sending test request to Gemini API...');
    
    // Send the request
    const response = await model.generateContent({
      contents,
      generationConfig,
    });
    
    const responseText = response.response.text();
    console.log('\n✅ API Response:');
    console.log('-------------------');
    console.log(responseText);
    console.log('-------------------');
    
    // Try to parse the JSON response
    try {
      const suggestions = JSON.parse(responseText.trim());
      console.log('\n✅ Parsed JSON:');
      console.log(JSON.stringify(suggestions, null, 2));
      
      if (Array.isArray(suggestions)) {
        console.log(`\nFound ${suggestions.length} issues in the text.`);
      } else {
        console.log('\n❌ Response is not an array as expected.');
      }
    } catch (parseError) {
      console.error('\n❌ Error parsing JSON response:', parseError.message);
    }
    
    console.log('\nPrompt test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error testing Gemini API prompt:');
    console.error('-------------------');
    console.error(error.message);
    console.error('-------------------');
  }
}

// Main function
function main() {
  console.log('TextWarden Prompt Test');
  console.log('======================');
  console.log('This script tests the Gemini API prompt for text analysis.');
  
  rl.question('\nPlease enter your Gemini API key: ', (apiKey) => {
    if (!apiKey || apiKey.trim() === '') {
      console.error('\n❌ Error: API key is required.');
      rl.close();
      return;
    }
    
    rl.question('\nEnter text to analyze: ', (text) => {
      if (!text || text.trim() === '') {
        console.error('\n❌ Error: Text is required.');
        rl.close();
        return;
      }
      
      const defaultChecks = ['grammar', 'spelling', 'style', 'clarity'];
      
      rl.question(`\nEnter check types (comma-separated, default: ${defaultChecks.join(', ')}): `, async (checksInput) => {
        let checks = defaultChecks;
        
        if (checksInput && checksInput.trim() !== '') {
          checks = checksInput.split(',').map(check => check.trim().toLowerCase());
          
          // Validate check types
          const validCheckTypes = ['grammar', 'spelling', 'style', 'clarity'];
          checks = checks.filter(check => validCheckTypes.includes(check));
          
          if (checks.length === 0) {
            console.log('\n⚠️ Warning: No valid check types provided. Using defaults.');
            checks = defaultChecks;
          }
        }
        
        console.log(`\nUsing check types: ${checks.join(', ')}`);
        
        await testGeminiPrompt(apiKey.trim(), text.trim(), checks);
        rl.close();
      });
    });
  });
}

// Run the main function
main();
