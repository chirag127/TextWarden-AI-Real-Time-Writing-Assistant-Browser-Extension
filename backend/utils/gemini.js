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
 * @returns {Object} - The suggestion or error
 */
async function getGeminiSuggestion(userInputText, userApiKey) {
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
        const contents = [
            {
                role: "user",
                parts: [{ text: userInputText }],
            },
        ];

        // Adjust based on whether streaming or single response is needed per feature
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
      });

      // Collect the response chunks
      let suggestion = response.text || ""; // Fallback to empty string if no text is returned


        // Return successful suggestion
        return { error: false, suggestion: suggestion };
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
