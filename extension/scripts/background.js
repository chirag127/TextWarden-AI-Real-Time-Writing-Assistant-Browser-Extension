// TextWarden Background Script
// Handles communication between content scripts and the backend API

// Constants
const BACKEND_URL = 'http://localhost:3000/api';
const MAX_TEXT_LENGTH = 5000; // Maximum text length to send in a single request

// Initialize extension when installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('TextWarden extension installed or updated');
  
  // Set default settings if not already set
  chrome.storage.local.get({
    enabled: true,
    apiKey: '',
    checkTypes: {
      grammar: true,
      spelling: true,
      style: true,
      clarity: true
    },
    disabledSites: [],
    statistics: {
      correctionsApplied: 0,
      suggestionsShown: 0
    }
  }, (result) => {
    chrome.storage.local.set(result);
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzeText') {
    analyzeText(message.text, message.checkTypes)
      .then(response => {
        sendResponse(response);
        
        // Update statistics if suggestions were found
        if (response && response.suggestions && response.suggestions.length > 0) {
          updateStatistics('suggestionsShown', response.suggestions.length);
        }
      })
      .catch(error => {
        console.error('Error analyzing text:', error);
        sendResponse({ error: true, message: error.message });
      });
    
    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
  
  if (message.action === 'applySuggestion') {
    // Update statistics when a suggestion is applied
    updateStatistics('correctionsApplied', 1);
  }
});

// Function to analyze text using the backend API
async function analyzeText(text, checkTypes) {
  // Skip empty text
  if (!text || text.trim() === '') {
    return { suggestions: [] };
  }
  
  // Get API key from storage
  const { apiKey, enabled } = await getStorageData(['apiKey', 'enabled']);
  
  // Check if extension is enabled
  if (!enabled) {
    return { suggestions: [] };
  }
  
  // Check if API key is provided
  if (!apiKey) {
    return { 
      error: true, 
      message: 'API Key is missing. Please add it in the extension settings.' 
    };
  }
  
  try {
    // Handle large text by splitting it into chunks
    if (text.length > MAX_TEXT_LENGTH) {
      return await processLargeText(text, checkTypes, apiKey);
    }
    
    // For smaller text, make a single API call
    return await makeApiCall(text, checkTypes, apiKey);
  } catch (error) {
    console.error('Error calling backend API:', error);
    return {
      error: true,
      message: 'Failed to connect to the TextWarden backend. Please make sure the backend server is running.'
    };
  }
}

// Function to process large text by splitting it into chunks
async function processLargeText(text, checkTypes, apiKey) {
  // Split text into sentences to avoid breaking in the middle of a sentence
  const sentences = splitIntoSentences(text);
  const chunks = [];
  let currentChunk = '';
  
  // Group sentences into chunks of appropriate size
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > MAX_TEXT_LENGTH) {
      chunks.push(currentChunk);
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  console.log(`Text split into ${chunks.length} chunks for processing`);
  
  // Process each chunk and collect results
  const chunkResults = await Promise.all(
    chunks.map(chunk => makeApiCall(chunk, checkTypes, apiKey))
  );
  
  // Merge results from all chunks
  return mergeResults(chunkResults, text);
}

// Function to split text into sentences
function splitIntoSentences(text) {
  // Simple sentence splitting - can be improved for better accuracy
  return text.match(/[^.!?]+[.!?]+/g) || [text];
}

// Function to make API call for a single chunk of text
async function makeApiCall(text, checkTypes, apiKey) {
  const response = await fetch(`${BACKEND_URL}/ai/suggest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-API-Key': apiKey
    },
    body: JSON.stringify({
      text,
      checks: Object.keys(checkTypes).filter(key => checkTypes[key]),
      apiKey // Also include the API key in the body as a fallback
    })
  });
  
  // Parse the response
  const data = await response.json();
  
  // Check for errors
  if (data.error) {
    return data;
  }
  
  return data;
}

// Function to merge results from multiple chunks
function mergeResults(results, originalText) {
  // Filter out error results
  const validResults = results.filter(result => !result.error);
  
  // If all results had errors, return the first error
  if (validResults.length === 0 && results.length > 0) {
    return results[0];
  }
  
  // Combine suggestions from all chunks
  let allSuggestions = [];
  
  validResults.forEach(result => {
    if (result.suggestion && Array.isArray(result.suggestion)) {
      allSuggestions = allSuggestions.concat(result.suggestion);
    }
  });
  
  // Remove duplicate suggestions
  const uniqueSuggestions = removeDuplicateSuggestions(allSuggestions);
  
  // Sort suggestions by their position in the text
  uniqueSuggestions.sort((a, b) => {
    return (a.position && b.position) ? a.position.start - b.position.start : 0;
  });
  
  return { suggestion: uniqueSuggestions };
}

// Function to remove duplicate suggestions
function removeDuplicateSuggestions(suggestions) {
  const uniqueSuggestions = [];
  const seenKeys = new Set();
  
  suggestions.forEach(suggestion => {
    // Create a unique key for each suggestion based on its content and position
    const key = `${suggestion.text}-${suggestion.position?.start}-${suggestion.position?.end}`;
    
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueSuggestions.push(suggestion);
    }
  });
  
  return uniqueSuggestions;
}

// Helper function to get data from storage
function getStorageData(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result);
    });
  });
}

// Helper function to update statistics
function updateStatistics(key, increment) {
  chrome.storage.local.get({ statistics: { correctionsApplied: 0, suggestionsShown: 0 } }, (result) => {
    const statistics = result.statistics;
    statistics[key] += increment;
    
    chrome.storage.local.set({ statistics });
  });
}
