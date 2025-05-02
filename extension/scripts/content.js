/**
 * TextWarden Content Script
 * 
 * This script is injected into web pages and handles:
 * - Detecting text fields
 * - Monitoring text changes
 * - Highlighting issues
 * - Displaying suggestions
 * 
 * @author Chirag Singhal (chirag127)
 */

// Global variables
let isEnabled = true;
let grammarCheck = true;
let spellingCheck = true;
let styleCheck = true;
let clarityCheck = true;
let debounceTimer;
let activeTextFields = new Map();
let highlightedIssues = new Map();
let suggestionPopup = null;

// Initialize the content script
const initialize = async () => {
  // Load settings from storage
  try {
    const settings = await chrome.storage.local.get([
      'enabled',
      'grammarCheck',
      'spellingCheck',
      'styleCheck',
      'clarityCheck'
    ]);
    
    isEnabled = settings.enabled !== false; // Default to true if not set
    grammarCheck = settings.grammarCheck !== false; // Default to true if not set
    spellingCheck = settings.spellingCheck !== false; // Default to true if not set
    styleCheck = settings.styleCheck !== false; // Default to true if not set
    clarityCheck = settings.clarityCheck !== false; // Default to true if not set
  } catch (error) {
    console.error('TextWarden: Error loading settings', error);
  }
  
  // Create suggestion popup
  createSuggestionPopup();
  
  // Start observing text fields
  observeTextFields();
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'settingsUpdated') {
      // Update settings
      isEnabled = message.settings.enabled !== false;
      grammarCheck = message.settings.grammarCheck !== false;
      spellingCheck = message.settings.spellingCheck !== false;
      styleCheck = message.settings.styleCheck !== false;
      clarityCheck = message.settings.clarityCheck !== false;
      
      // Re-analyze active text fields with new settings
      if (isEnabled) {
        activeTextFields.forEach((value, element) => {
          analyzeText(element, element.value || element.textContent);
        });
      } else {
        // Remove all highlights if disabled
        removeAllHighlights();
      }
    } else if (message.action === 'analysisResult') {
      // Handle analysis result from background script
      handleAnalysisResult(message.elementId, message.text, message.suggestions);
    }
    
    // Always return true for async response
    return true;
  });
};

// Create suggestion popup
const createSuggestionPopup = () => {
  suggestionPopup = document.createElement('div');
  suggestionPopup.className = 'textwarden-suggestion-popup';
  suggestionPopup.style.display = 'none';
  document.body.appendChild(suggestionPopup);
};

// Observe text fields on the page
const observeTextFields = () => {
  // Find all text fields on page load
  findTextFields();
  
  // Create a MutationObserver to detect new text fields
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is a text field
            if (isTextField(node)) {
              attachTextFieldListeners(node);
            }
            
            // Check for text fields within the added node
            const textFields = node.querySelectorAll('input[type="text"], input[type="email"], textarea, [contenteditable="true"]');
            textFields.forEach(attachTextFieldListeners);
          }
        }
      }
    }
  });
  
  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

// Find all text fields on the page
const findTextFields = () => {
  const textFields = document.querySelectorAll('input[type="text"], input[type="email"], textarea, [contenteditable="true"]');
  textFields.forEach(attachTextFieldListeners);
};

// Check if an element is a text field
const isTextField = (element) => {
  if (!element || !element.tagName) return false;
  
  const tagName = element.tagName.toLowerCase();
  const type = element.type ? element.type.toLowerCase() : '';
  
  return (
    (tagName === 'input' && (type === 'text' || type === 'email')) ||
    tagName === 'textarea' ||
    (element.getAttribute('contenteditable') === 'true')
  );
};

// Attach event listeners to a text field
const attachTextFieldListeners = (element) => {
  if (!element || activeTextFields.has(element)) return;
  
  // Generate a unique ID for this element if it doesn't have one
  if (!element.id) {
    element.id = 'textwarden-field-' + Math.random().toString(36).substr(2, 9);
  }
  
  // Add to active text fields map
  activeTextFields.set(element, {
    id: element.id,
    lastText: element.value || element.textContent || ''
  });
  
  // Add input event listener
  const inputHandler = () => {
    if (!isEnabled) return;
    
    const text = element.value || element.textContent || '';
    
    // Debounce to avoid too many requests
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      // Only analyze if text has changed and is not empty
      if (text && text !== activeTextFields.get(element).lastText) {
        analyzeText(element, text);
        activeTextFields.get(element).lastText = text;
      }
    }, 1000); // 1 second debounce
  };
  
  element.addEventListener('input', inputHandler);
  
  // Initial analysis if there's already text
  const initialText = element.value || element.textContent || '';
  if (isEnabled && initialText.length > 0) {
    analyzeText(element, initialText);
  }
};

// Analyze text for issues
const analyzeText = (element, text) => {
  if (!isEnabled || !text || text.length < 5) return;
  
  // Determine which checks to perform
  const checks = [];
  if (grammarCheck) checks.push('grammar');
  if (spellingCheck) checks.push('spelling');
  if (styleCheck) checks.push('style');
  if (clarityCheck) checks.push('clarity');
  
  if (checks.length === 0) return;
  
  // Send text to background script for analysis
  chrome.runtime.sendMessage({
    action: 'analyzeText',
    elementId: element.id,
    text: text,
    checks: checks
  });
};

// Handle analysis result from background script
const handleAnalysisResult = (elementId, text, suggestions) => {
  const element = document.getElementById(elementId);
  if (!element || !suggestions || suggestions.length === 0) return;
  
  // Remove existing highlights for this element
  removeHighlights(element);
  
  // Add new highlights
  addHighlights(element, text, suggestions);
  
  // Update statistics
  updateSuggestionCount(suggestions.length);
};

// Add highlights to text
const addHighlights = (element, text, suggestions) => {
  // Implementation depends on the element type
  if (element.tagName.toLowerCase() === 'textarea' || 
      (element.tagName.toLowerCase() === 'input' && 
       (element.type === 'text' || element.type === 'email'))) {
    // For input/textarea, we need to create an overlay
    createHighlightOverlay(element, text, suggestions);
  } else if (element.getAttribute('contenteditable') === 'true') {
    // For contenteditable elements, we can modify the HTML
    highlightContentEditable(element, text, suggestions);
  }
  
  // Store the highlights for this element
  highlightedIssues.set(element, suggestions);
};

// Create highlight overlay for input/textarea elements
const createHighlightOverlay = (element, text, suggestions) => {
  // This is a simplified implementation
  // In a real extension, this would be more complex to handle scrolling, positioning, etc.
  console.log('Would create highlight overlay for', element, 'with suggestions:', suggestions);
  
  // For now, just add a class to indicate there are issues
  element.classList.add('textwarden-has-issues');
  
  // Add click event to show suggestions
  element.addEventListener('click', (event) => {
    const suggestions = highlightedIssues.get(element);
    if (suggestions && suggestions.length > 0) {
      showSuggestionPopup(element, event.clientX, event.clientY, suggestions);
    }
  });
};

// Highlight issues in contenteditable elements
const highlightContentEditable = (element, text, suggestions) => {
  // This is a simplified implementation
  // In a real extension, this would use a more sophisticated approach
  console.log('Would highlight contenteditable', element, 'with suggestions:', suggestions);
  
  // For now, just add a class to indicate there are issues
  element.classList.add('textwarden-has-issues');
  
  // Add click event to show suggestions
  element.addEventListener('click', (event) => {
    const suggestions = highlightedIssues.get(element);
    if (suggestions && suggestions.length > 0) {
      showSuggestionPopup(element, event.clientX, event.clientY, suggestions);
    }
  });
};

// Show suggestion popup
const showSuggestionPopup = (element, x, y, suggestions) => {
  if (!suggestionPopup) return;
  
  // Clear previous content
  suggestionPopup.innerHTML = '';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'textwarden-popup-header';
  header.textContent = 'TextWarden Suggestions';
  suggestionPopup.appendChild(header);
  
  // Create suggestions list
  const list = document.createElement('ul');
  list.className = 'textwarden-suggestions-list';
  
  suggestions.forEach((suggestion, index) => {
    const item = document.createElement('li');
    item.className = 'textwarden-suggestion-item';
    
    const issueText = document.createElement('div');
    issueText.className = 'textwarden-issue-text';
    issueText.textContent = suggestion.issue || 'Issue detected';
    
    const suggestionText = document.createElement('div');
    suggestionText.className = 'textwarden-suggestion-text';
    suggestionText.textContent = suggestion.suggestion || 'No suggestion available';
    
    const applyButton = document.createElement('button');
    applyButton.className = 'textwarden-apply-button';
    applyButton.textContent = 'Apply';
    applyButton.addEventListener('click', () => {
      applySuggestion(element, suggestion);
      suggestionPopup.style.display = 'none';
    });
    
    item.appendChild(issueText);
    item.appendChild(suggestionText);
    item.appendChild(applyButton);
    list.appendChild(item);
  });
  
  suggestionPopup.appendChild(list);
  
  // Position the popup
  suggestionPopup.style.left = `${x}px`;
  suggestionPopup.style.top = `${y}px`;
  suggestionPopup.style.display = 'block';
  
  // Close popup when clicking outside
  const closePopupHandler = (event) => {
    if (!suggestionPopup.contains(event.target) && event.target !== element) {
      suggestionPopup.style.display = 'none';
      document.removeEventListener('click', closePopupHandler);
    }
  };
  
  // Add delay to avoid immediate closing
  setTimeout(() => {
    document.addEventListener('click', closePopupHandler);
  }, 100);
};

// Apply a suggestion to a text field
const applySuggestion = (element, suggestion) => {
  // Implementation depends on the element type and suggestion type
  console.log('Would apply suggestion', suggestion, 'to', element);
  
  // For now, just log it
  // In a real extension, this would modify the text in the element
  
  // Update statistics
  updateCorrectionCount();
};

// Remove highlights from an element
const removeHighlights = (element) => {
  if (!element) return;
  
  // Remove highlight class
  element.classList.remove('textwarden-has-issues');
  
  // Remove from highlighted issues map
  highlightedIssues.delete(element);
};

// Remove all highlights
const removeAllHighlights = () => {
  // Remove highlight class from all elements
  document.querySelectorAll('.textwarden-has-issues').forEach(element => {
    element.classList.remove('textwarden-has-issues');
  });
  
  // Clear highlighted issues map
  highlightedIssues.clear();
  
  // Hide suggestion popup
  if (suggestionPopup) {
    suggestionPopup.style.display = 'none';
  }
};

// Update suggestion count statistic
const updateSuggestionCount = (count) => {
  chrome.storage.local.get(['suggestionsCount'], (result) => {
    const currentCount = result.suggestionsCount || 0;
    chrome.storage.local.set({ suggestionsCount: currentCount + count });
  });
};

// Update correction count statistic
const updateCorrectionCount = () => {
  chrome.storage.local.get(['correctionsCount'], (result) => {
    const currentCount = result.correctionsCount || 0;
    chrome.storage.local.set({ correctionsCount: currentCount + 1 });
  });
};

// Initialize the content script
initialize();
