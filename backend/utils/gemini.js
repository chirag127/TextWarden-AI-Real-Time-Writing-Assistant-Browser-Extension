/**
 * TextWarden Gemini API Integration
 *
 * This file contains the functions for interacting with the Gemini API.
 * It uses the user-provided API key to make calls to the Gemini API.
 *
 * @author Chirag Singhal (chirag127)
 */

const { GoogleGenAI } = require("@google/genai");

/**
 * Get suggestions from Gemini API
 *
 * @param {string} userInputText - The text to analyze
 * @param {string} userApiKey - The user's Gemini API key
 * @param {Array} checks - Types of checks to perform (grammar, spelling, style, clarity)
 * @returns {Object} - The suggestion or error
 */
async function getGeminiSuggestion(
    userInputText,
    userApiKey,
    checks = ["grammar", "spelling", "style", "clarity"]
) {
    if (!userApiKey) {
        console.error("User API Key not provided in request.");
        // Return a specific error object/message for the frontend
        return {
            error: true,
            message:
                "API Key is missing. Please add it in the extension settings.",
        };
    }

    try {
        // Initialize dynamically with the user's key for THIS request
        // Initialize Google GenAI with the provided API key
        const ai = new GoogleGenAI({ apiKey: userApiKey });

        // Configure the request
        const config = {
            thinkingConfig: {
                thinkingBudget: 0,
            },
            responseMimeType: "text/plain",
        };

        // Use the model specified in the PRD
        const model = "gemini-2.5-flash-preview-04-17";

        // Create a prompt based on the requested check types
        const checkTypesText = checks.join(", ");

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
${userInputText}
"""

RESPONSE (valid JSON array only and don't include the \`\`\`json\` and \`\`\`):`;

        const contents = [
            {
                role: "user",
                parts: [{ text: promptText }],
            },
        ];

        // Adjust based on whether streaming or single response is needed per feature
        const response = await ai.models.generateContent({
          model,
            contents,
          config,
        });

        // Get the response text
        const responseText = response.text;

        // Parse the JSON response
        let suggestions;
        try {
            // Try to parse the response as JSON
            suggestions = JSON.parse(responseText.trim());

            // Ensure it's an array
            if (!Array.isArray(suggestions)) {
                suggestions = [];
                console.error(
                    "Response was not a valid JSON array:",
                    responseText
                );
            }
        } catch (parseError) {
            console.error("Error parsing JSON response:", parseError.message);
            console.error("Raw response:", responseText);

            // Return a fallback empty array if parsing fails
            suggestions = [];
        }

        // Return successful suggestion
        return { error: false, suggestion: suggestions };
    } catch (error) {
        console.error("Error calling Gemini API:", error.message); // Log error message, NOT the key

        let userMessage =
            "Error generating suggestion due to an issue with the AI service or your API key.";

        // Handle specific errors from Google and provide better user feedback
        if (error.message.includes("API key not valid")) {
            userMessage =
                "Error: The provided API Key is not valid. Please check your key in the extension settings.";
        } else if (error.message.includes("quota")) {
            userMessage =
                "Error: Your Gemini API key has exceeded its quota limit.";
        } else if (error.message.includes("billing")) {
            userMessage =
                "Error: There might be a billing issue associated with your API key.";
        }

        // Return error object for frontend handling
        return { error: true, message: userMessage };
    }
}

module.exports = {
    getGeminiSuggestion,
};
