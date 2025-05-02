/**
 * TextWarden Background Script
 *
 * This script runs in the background and handles:
 * - Communication between content script and backend
 * - API key management
 * - Caching of analysis results
 *
 * @author Chirag Singhal (chirag127)
 */

// Backend API URL
// const API_URL = "http://localhost:3000/api";
const API_URL = "https://textwarden.onrender.com/api";

// Cache for analysis results
const analysisCache = new Map();

// Initialize the background script
const initialize = async () => {
    console.log("TextWarden background script initialized");

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "analyzeText") {
            analyzeText(
                message.elementId,
                message.text,
                message.checks,
                sender.tab.id
            );
        } else if (message.action === "settingChanged") {
            handleSettingChange(message.setting, message.value);
        } else if (message.action === "apiKeyChanged") {
            // Clear cache when API key changes
            analysisCache.clear();
        } else if (message.action === "languageChanged") {
            // Clear cache when language changes
            analysisCache.clear();
        }

        // Always return true for async response
        return true;
    });
};

// Analyze text for issues
const analyzeText = async (elementId, text, checks, tabId) => {
    // Check if we have a cached result
    const cacheKey = `${text}-${checks.join(",")}`;
    if (analysisCache.has(cacheKey)) {
        sendAnalysisResult(tabId, elementId, text, analysisCache.get(cacheKey));
        return;
    }

    try {
        // Get API key from storage
        const { apiKey } = await chrome.storage.local.get(["apiKey"]);

        if (!apiKey) {
            console.warn("TextWarden: No API key found, skipping analysis");
            // No API key, send empty result
            sendAnalysisResult(tabId, elementId, text, []);
            return;
        }

        // Prepare request to backend
        const response = await fetch(`${API_URL}/ai/suggest`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-API-Key": apiKey,
            },
            body: JSON.stringify({
                text: text,
                checks: checks,
                apiKey: apiKey,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("TextWarden: API error", errorData);

            // Handle specific error cases
            if (response.status === 401 || response.status === 403) {
                // API key issues
                notifyApiKeyIssue(tabId, errorData.message);
            }

            sendAnalysisResult(tabId, elementId, text, []);
            return;
        }

        const data = await response.json();

        // Process suggestions
        let suggestions = [];
        if (data.suggestion) {
            // The backend should already return an array of suggestions
            if (Array.isArray(data.suggestion)) {
                suggestions = data.suggestion;
                console.log(
                    "Received array of suggestions from backend:",
                    suggestions.length
                );
            } else {
                // Fallback in case the backend returns a non-array
                console.warn(
                    "Backend returned non-array suggestion, converting to array"
                );
                suggestions = [
                    {
                        issue: "General improvement",
                        suggestion:
                            typeof data.suggestion === "string"
                                ? data.suggestion
                                : JSON.stringify(data.suggestion),
                        type: "general",
                        explanation:
                            "The backend returned a non-array suggestion",
                    },
                ];
            }
        }

        // Cache the result
        analysisCache.set(cacheKey, suggestions);

        // Send result to content script
        sendAnalysisResult(tabId, elementId, text, suggestions);
    } catch (error) {
        console.error("TextWarden: Error analyzing text", error);
        sendAnalysisResult(tabId, elementId, text, []);
    }
};

// Send analysis result to content script
const sendAnalysisResult = (tabId, elementId, text, suggestions) => {
    chrome.tabs.sendMessage(tabId, {
        action: "analysisResult",
        elementId: elementId,
        text: text,
        suggestions: suggestions,
    });
};

// Notify content script about API key issues
const notifyApiKeyIssue = (tabId, message) => {
    chrome.tabs.sendMessage(tabId, {
        action: "apiKeyIssue",
        message: message,
    });
};

// Handle setting change
const handleSettingChange = async (setting, value) => {
    // Update all tabs with the new setting
    const tabs = await chrome.tabs.query({});

    for (const tab of tabs) {
        try {
            // Get all settings to send a complete update
            const settings = await chrome.storage.local.get([
                "enabled",
                "grammarCheck",
                "spellingCheck",
                "styleCheck",
                "clarityCheck",
            ]);

            chrome.tabs.sendMessage(tab.id, {
                action: "settingsUpdated",
                settings: settings,
            });
        } catch (error) {
            console.error("TextWarden: Error updating tab settings", error);
        }
    }
};

// Initialize the background script
initialize();
