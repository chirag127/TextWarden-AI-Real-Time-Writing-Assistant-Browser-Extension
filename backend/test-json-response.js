/**
 * TextWarden JSON Response Test
 * 
 * This script tests the Gemini API prompt for text analysis and ensures it returns a valid JSON array.
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
async function testJsonResponse(apiKey, text) {
  console.log('\nTesting Gemini API JSON response...');
  
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
    
    // Create the prompt
    const promptText = `
You are TextWarden, an AI writing assistant that analyzes text for issues and provides suggestions for improvement.

Analyze the following text for grammar, spelling, style, clarity issues. For each issue you find, provide:
1. The problematic text
2. The type of issue (grammar, spelling, style, or clarity)
3. A brief explanation of the issue
4. A suggested correction

IMPORTANT: Your response must be ONLY a valid JSON array of objects with the following structure:
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

Do not include any explanations, markdown formatting, or code block markers (like \`\`\`json or \`\`\`).
Your entire response must be a valid JSON array that can be parsed directly with JSON.parse().

TEXT TO ANALYZE:
"""
${text}
"""

RESPONSE (ONLY the JSON array):`;
    
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
      console.log('\n✅ Successfully parsed as JSON:');
      console.log(JSON.stringify(suggestions, null, 2));
      
      if (Array.isArray(suggestions)) {
        console.log(`\nFound ${suggestions.length} issues in the text.`);
        
        // Display each suggestion
        if (suggestions.length > 0) {
          console.log('\nSuggestions:');
          suggestions.forEach((suggestion, index) => {
            console.log(`\n[${index + 1}] Issue: ${suggestion.issue}`);
            console.log(`    Type: ${suggestion.type}`);
            console.log(`    Explanation: ${suggestion.explanation}`);
            console.log(`    Suggestion: ${suggestion.suggestion}`);
          });
        }
      } else {
        console.log('\n❌ Response is not an array as expected.');
      }
    } catch (parseError) {
      console.error('\n❌ Error parsing JSON response:', parseError.message);
      
      // Try to extract JSON from the response
      try {
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          console.log('\nExtracted potential JSON array:');
          console.log(jsonStr);
          
          const suggestions = JSON.parse(jsonStr);
          console.log('\n✅ Successfully parsed extracted JSON:');
          console.log(JSON.stringify(suggestions, null, 2));
        } else {
          console.error('\nCould not find JSON array in response.');
        }
      } catch (extractError) {
        console.error('\nError extracting JSON from response:', extractError.message);
      }
    }
    
    console.log('\nJSON response test completed!');
    
  } catch (error) {
    console.error('\n❌ Error testing Gemini API JSON response:');
    console.error('-------------------');
    console.error(error.message);
    console.error('-------------------');
  }
}

// Main function
function main() {
  console.log('TextWarden JSON Response Test');
  console.log('============================');
  console.log('This script tests the Gemini API JSON response format.');
  
  rl.question('\nPlease enter your Gemini API key: ', (apiKey) => {
    if (!apiKey || apiKey.trim() === '') {
      console.error('\n❌ Error: API key is required.');
      rl.close();
      return;
    }
    
    rl.question('\nEnter text with intentional errors to analyze: ', async (text) => {
      if (!text || text.trim() === '') {
        console.error('\n❌ Error: Text is required.');
        rl.close();
        return;
      }
      
      await testJsonResponse(apiKey.trim(), text.trim());
      rl.close();
    });
  });
}

// Run the main function
main();
