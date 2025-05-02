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
${userInputText}
"""

RESPONSE (ONLY the JSON array):`;

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
        console.log("Raw response from Gemini API:", responseText);

        // Parse the JSON response
        let suggestions = [];

        try {
            // First, try to parse the entire response as JSON
            try {
                const parsedJson = JSON.parse(responseText.trim());
                if (Array.isArray(parsedJson)) {
                    suggestions = parsedJson;
                    console.log("Successfully parsed response as JSON array");
                } else if (
                    typeof parsedJson === "object" &&
                    parsedJson !== null
                ) {
                    suggestions = [parsedJson];
                    console.log(
                        "Parsed response as single JSON object, wrapped in array"
                    );
                }
            } catch (directParseError) {
                console.log(
                    "Direct JSON parsing failed, trying alternative methods"
                );

                // Try to extract JSON array from the response
                const arrayMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
                if (arrayMatch) {
                    try {
                        const arrayStr = arrayMatch[0];
                        console.log(
                            "Extracted potential JSON array:",
                            arrayStr
                        );
                        const parsedArray = JSON.parse(arrayStr);
                        if (Array.isArray(parsedArray)) {
                            suggestions = parsedArray;
                            console.log(
                                "Successfully parsed extracted JSON array"
                            );
                        }
                    } catch (arrayParseError) {
                        console.error(
                            "Error parsing extracted array:",
                            arrayParseError.message
                        );
                    }
                }

                // If still no valid suggestions, try to find individual JSON objects
                if (suggestions.length === 0) {
                    const objectMatches = responseText.match(/\{[\s\S]*?\}/g);
                    if (objectMatches && objectMatches.length > 0) {
                        console.log(
                            "Found potential JSON objects:",
                            objectMatches.length
                        );
                        for (const match of objectMatches) {
                            try {
                                const obj = JSON.parse(match);
                                if (typeof obj === "object" && obj !== null) {
                                    suggestions.push(obj);
                                    console.log(
                                        "Added valid JSON object to suggestions"
                                    );
                                }
                            } catch (objParseError) {
                                // Skip invalid objects
                            }
                        }
                    }
                }
            }

            // If we still have no suggestions, try one more approach
            if (suggestions.length === 0) {
                // Remove any markdown code block markers
                const cleanedText = responseText
                    .replace(/```json|```/g, "")
                    .trim();
                try {
                    const parsedClean = JSON.parse(cleanedText);
                    if (Array.isArray(parsedClean)) {
                        suggestions = parsedClean;
                        console.log(
                            "Successfully parsed cleaned response as JSON array"
                        );
                    } else if (
                        typeof parsedClean === "object" &&
                        parsedClean !== null
                    ) {
                        suggestions = [parsedClean];
                        console.log(
                            "Parsed cleaned response as single JSON object"
                        );
                    }
                } catch (cleanParseError) {
                    console.error(
                        "Error parsing cleaned text:",
                        cleanParseError.message
                    );
                }
            }
        } catch (error) {
            console.error("All JSON parsing attempts failed:", error.message);
            console.error("Raw response:", responseText);
            suggestions = [];
        }

        // If we still have no suggestions, create a fallback suggestion
        if (suggestions.length === 0) {
            console.warn("Creating fallback suggestion from raw text");
            suggestions = [
                {
                    issue: "Could not parse response",
                    type: "general",
                    explanation: "The AI response could not be parsed as JSON",
                    suggestion:
                        responseText.substring(0, 200) +
                        (responseText.length > 200 ? "..." : ""),
                },
            ];
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
