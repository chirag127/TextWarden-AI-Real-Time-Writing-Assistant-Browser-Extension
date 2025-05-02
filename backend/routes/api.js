/**
 * TextWarden API Routes
 *
 * This file contains the API routes for the TextWarden backend server.
 *
 * @author Chirag Singhal (chirag127)
 */

const express = require("express");
const router = express.Router();
const { getGeminiSuggestion } = require("../utils/gemini");

/**
 * Health check endpoint
 * GET /api/health
 */
router.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "API is operational" });
});

/**
 * AI suggestion endpoint
 * POST /api/ai/suggest
 *
 * Receives text, check types, and a user-provided API key from the extension,
 * uses the key to call the Gemini API, and returns the results.
 *
 * Request body: { text: string, checks: string[] }
 * Request header: X-User-API-Key: string
 */
router.post("/ai/suggest", async (req, res) => {
    const { text, checks } = req.body;
    // Retrieve key securely from header
    const userApiKey = req.headers["x-user-api-key"];

    // Validate input
    if (!text) {
        return res.status(400).json({
            error: true,
            message: "Input text is required.",
        });
    }

    // Default checks if not provided
    const checksToPerform =
        Array.isArray(checks) && checks.length > 0
            ? checks
            : ["grammar", "spelling", "style", "clarity"];

    // Validate check types
    const validCheckTypes = ["grammar", "spelling", "style", "clarity"];
    const validChecks = checksToPerform.filter((check) =>
        validCheckTypes.includes(check)
    );

    if (validChecks.length === 0) {
        return res.status(400).json({
            error: true,
            message:
                "At least one valid check type is required (grammar, spelling, style, clarity).",
        });
    }

    try {
        // Call Gemini API with user's key and specified checks
        const result = await getGeminiSuggestion(text, userApiKey, validChecks);

        if (result.error) {
            // Determine appropriate status code based on error type
            let statusCode = 500; // General server/API error
            if (result.message.includes("API Key is missing")) statusCode = 401; // Unauthorized/Missing Key
            if (result.message.includes("not valid")) statusCode = 403; // Forbidden/Invalid Key
            if (result.message.includes("quota")) statusCode = 429; // Too Many Requests/Quota
            if (result.message.includes("billing")) statusCode = 402; // Payment Required (conceptually)

            return res.status(statusCode).json(result);
        }

        // Send successful suggestion
        res.json({ suggestion: result.suggestion });
    } catch (error) {
        console.error("Error in /api/ai/suggest:", error.message);
        res.status(500).json({
            error: true,
            message: "Server error processing your request. Please try again.",
        });
    }
});

module.exports = router;
