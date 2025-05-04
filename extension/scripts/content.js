// TextWarden Content Script
// Handles text field detection, highlighting, and suggestion display

// Global variables
let isEnabled = true;
let checkTypes = {
  grammar: true,
  spelling: true,
  style: true,
  clarity: true
};
let disabledForSite = false;
let activeFields = new Map(); // Map to track active text fields
let suggestionPopup = null; // Reference to the suggestion popup
let debounceTimers = new Map(); // Map to track debounce timers for each field
let currentHighlights = new Map(); // Map to track highlights for each field

// Initialize when the content script is loaded
initialize();

// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleExtension') {
    isEnabled = message.enabled;
    handleExtensionToggle();
  }
  
  if (message.action === 'updateCheckTypes') {
    checkTypes = message.checkTypes;
    refreshAllFields();
  }
  
  if (message.action === 'siteStatusChanged') {
    disabledForSite = message.disabled;
    handleExtensionToggle();
  }
});

// Initialize the content script
async function initialize() {
  // Load settings from storage
  const settings = await getStorageData([
    'enabled',
    'checkTypes',
    'disabledSites'
  ]);
  
  isEnabled = settings.enabled;
  checkTypes = settings.checkTypes || {
    grammar: true,
    spelling: true,
    style: true,
    clarity: true
  };
  
  // Check if the current site is in the disabled sites list
  const hostname = window.location.hostname;
  disabledForSite = settings.disabledSites && settings.disabledSites.includes(hostname);
  
  // Only proceed if the extension is enabled and not disabled for this site
  if (isEnabled && !disabledForSite) {
    // Add CSS for highlighting
    injectStyles();
    
    // Set up observers for text fields
    setupTextFieldObservers();
    
    // Find and initialize existing text fields
    findAndInitializeTextFields();
  }
}

// Handle extension toggle
function handleExtensionToggle() {
  if (isEnabled && !disabledForSite) {
    // Extension was enabled
    injectStyles();
    setupTextFieldObservers();
    findAndInitializeTextFields();
  } else {
    // Extension was disabled
    removeAllHighlights();
    removePopup();
    disconnectObservers();
  }
}

// Inject CSS styles for highlighting
function injectStyles() {
  if (document.getElementById('textwarden-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'textwarden-styles';
  style.textContent = `
    .textwarden-highlight {
      background-color: transparent;
      border-bottom: 2px solid #e53935;
      cursor: pointer;
      position: relative;
    }
    
    .textwarden-grammar {
      border-bottom-color: #e53935;
    }
    
    .textwarden-spelling {
      border-bottom-color: #fb8c00;
    }
    
    .textwarden-style {
      border-bottom-color: #7986cb;
    }
    
    .textwarden-clarity {
      border-bottom-color: #43a047;
    }
    
    .textwarden-popup {
      position: absolute;
      z-index: 9999;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 12px;
      max-width: 300px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      animation: textwarden-fadein 0.2s;
    }
    
    @keyframes textwarden-fadein {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .textwarden-popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    
    .textwarden-popup-title {
      font-weight: 600;
      color: #4a6fa5;
      margin: 0;
    }
    
    .textwarden-popup-close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      color: #999;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    
    .textwarden-popup-close:hover {
      background-color: #f5f5f5;
      color: #666;
    }
    
    .textwarden-issue {
      margin-bottom: 8px;
    }
    
    .textwarden-issue-text {
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .textwarden-issue-explanation {
      margin-bottom: 8px;
      color: #666;
    }
    
    .textwarden-suggestions {
      margin-bottom: 8px;
    }
    
    .textwarden-suggestion {
      display: block;
      width: 100%;
      text-align: left;
      background-color: #f5f7fa;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 6px 10px;
      margin-bottom: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .textwarden-suggestion:hover {
      background-color: #e8f0fe;
      border-color: #4a6fa5;
    }
    
    .textwarden-apply-all {
      background-color: #4a6fa5;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 12px;
      cursor: pointer;
      width: 100%;
      font-weight: 600;
      transition: background-color 0.2s;
    }
    
    .textwarden-apply-all:hover {
      background-color: #3a5a80;
    }
  `;
  
  document.head.appendChild(style);
}

// Set up observers for text fields
function setupTextFieldObservers() {
  // Create a mutation observer to detect new text fields
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is a text field
            if (isTextField(node)) {
              initializeTextField(node);
            }
            
            // Check for text fields within the added node
            const textFields = node.querySelectorAll(
              'input[type="text"], input[type="email"], input[type="search"], textarea, [contenteditable="true"]'
            );
            
            textFields.forEach(field => {
              initializeTextField(field);
            });
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
  
  // Store the observer for later disconnection
  window.textWardenObserver = observer;
}

// Disconnect observers when extension is disabled
function disconnectObservers() {
  if (window.textWardenObserver) {
    window.textWardenObserver.disconnect();
    window.textWardenObserver = null;
  }
}

// Find and initialize existing text fields
function findAndInitializeTextFields() {
  const textFields = document.querySelectorAll(
    'input[type="text"], input[type="email"], input[type="search"], textarea, [contenteditable="true"]'
  );
  
  textFields.forEach(field => {
    initializeTextField(field);
  });
}

// Initialize a text field
function initializeTextField(field) {
  // Skip if already initialized
  if (activeFields.has(field)) return;
  
  // Add event listeners
  field.addEventListener('input', handleInput);
  field.addEventListener('focus', handleFocus);
  field.addEventListener('blur', handleBlur);
  
  // Mark as initialized
  activeFields.set(field, {
    lastAnalyzed: '',
    highlights: []
  });
}

// Handle input event
function handleInput(event) {
  const field = event.target;
  
  // Skip if extension is disabled
  if (!isEnabled || disabledForSite) return;
  
  // Debounce the analysis to avoid too many requests
  const fieldId = getFieldId(field);
  
  if (debounceTimers.has(fieldId)) {
    clearTimeout(debounceTimers.get(fieldId));
  }
  
  debounceTimers.set(fieldId, setTimeout(() => {
    analyzeField(field);
  }, 1000)); // Wait 1 second after typing stops
}

// Handle focus event
function handleFocus(event) {
  const field = event.target;
  
  // Skip if extension is disabled
  if (!isEnabled || disabledForSite) return;
  
  // Analyze the field if it hasn't been analyzed yet
  if (activeFields.has(field)) {
    const fieldData = activeFields.get(field);
    
    if (fieldData.lastAnalyzed !== getFieldText(field)) {
      analyzeField(field);
    }
  }
}

// Handle blur event
function handleBlur(event) {
  // Close popup when field loses focus
  // But with a small delay to allow clicking on the popup
  setTimeout(() => {
    if (!document.activeElement || !document.activeElement.closest('.textwarden-popup')) {
      removePopup();
    }
  }, 200);
}

// Analyze a text field
async function analyzeField(field) {
  // Skip if extension is disabled
  if (!isEnabled || disabledForSite) return;
  
  // Get the text from the field
  const text = getFieldText(field);
  
  // Skip if text is empty or too short
  if (!text || text.length < 3) {
    removeHighlightsFromField(field);
    return;
  }
  
  // Skip if text hasn't changed since last analysis
  if (activeFields.has(field) && activeFields.get(field).lastAnalyzed === text) {
    return;
  }
  
  // Update last analyzed text
  if (activeFields.has(field)) {
    activeFields.get(field).lastAnalyzed = text;
  }
  
  // Remove existing highlights
  removeHighlightsFromField(field);
  
  try {
    // Send text to background script for analysis
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeText',
      text: text,
      checkTypes: checkTypes
    });
    
    // Handle errors
    if (response.error) {
      console.error('Error analyzing text:', response.message);
      return;
    }
    
    // Apply highlights based on suggestions
    if (response.suggestion && Array.isArray(response.suggestion)) {
      applyHighlights(field, text, response.suggestion);
    }
  } catch (error) {
    console.error('Error communicating with background script:', error);
  }
}

// Apply highlights based on suggestions
function applyHighlights(field, text, suggestions) {
  // Skip if no suggestions
  if (!suggestions || suggestions.length === 0) return;
  
  // Store highlights for this field
  if (!currentHighlights.has(field)) {
    currentHighlights.set(field, []);
  }
  
  // Process each suggestion
  suggestions.forEach(suggestion => {
    try {
      if (suggestion.position && suggestion.position.start !== undefined && suggestion.position.end !== undefined) {
        const highlightInfo = highlightIssue(field, text, suggestion);
        
        if (highlightInfo) {
          currentHighlights.get(field).push({
            element: highlightInfo.element,
            suggestion: suggestion
          });
        }
      }
    } catch (error) {
      console.error('Error highlighting issue:', error);
    }
  });
}

// Highlight an issue in the text
function highlightIssue(field, text, suggestion) {
  // Skip if no position information
  if (!suggestion.position) return null;
  
  const { start, end } = suggestion.position;
  const issueText = text.substring(start, end);
  
  // Skip if issue text is empty
  if (!issueText) return null;
  
  // Create highlight element
  const highlight = document.createElement('span');
  highlight.className = `textwarden-highlight textwarden-${suggestion.type || 'grammar'}`;
  highlight.textContent = issueText;
  highlight.dataset.start = start;
  highlight.dataset.end = end;
  highlight.dataset.suggestionId = suggestion.id || generateId();
  
  // Add event listeners
  highlight.addEventListener('mouseover', () => {
    showSuggestionPopup(field, highlight, suggestion);
  });
  
  // Replace text with highlight
  if (field.isContentEditable) {
    // For contenteditable fields
    replaceTextInContentEditable(field, start, end, highlight);
  } else if (field.tagName === 'TEXTAREA' || field.tagName === 'INPUT') {
    // For textarea and input fields
    replaceTextInInputField(field, start, end, highlight);
  }
  
  return { element: highlight, start, end };
}

// Replace text in a contenteditable field
function replaceTextInContentEditable(field, start, end, highlight) {
  // This is a simplified implementation and may need to be adjusted
  // for complex contenteditable elements with nested structures
  
  const text = field.textContent;
  const range = document.createRange();
  const selection = window.getSelection();
  
  // Find the text node containing the start position
  let currentPos = 0;
  let startNode = null;
  let startOffset = 0;
  let endNode = null;
  let endOffset = 0;
  
  // Helper function to traverse nodes
  function traverseNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const nodeLength = node.nodeValue.length;
      
      if (!startNode && currentPos + nodeLength >= start) {
        startNode = node;
        startOffset = start - currentPos;
      }
      
      if (!endNode && currentPos + nodeLength >= end) {
        endNode = node;
        endOffset = end - currentPos;
        return true; // Stop traversal
      }
      
      currentPos += nodeLength;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (let i = 0; i < node.childNodes.length; i++) {
        if (traverseNodes(node.childNodes[i])) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  traverseNodes(field);
  
  // If we found the nodes, replace the text
  if (startNode && endNode) {
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    
    // Delete the selected text
    range.deleteContents();
    
    // Insert the highlight
    range.insertNode(highlight);
  }
}

// Replace text in an input or textarea field
function replaceTextInInputField(field, start, end, highlight) {
  // For input and textarea fields, we can't directly insert HTML
  // So we'll use a different approach with a wrapper element
  
  // Create a wrapper element
  const wrapper = document.createElement('div');
  wrapper.className = 'textwarden-wrapper';
  wrapper.style.position = 'absolute';
  wrapper.style.pointerEvents = 'none';
  wrapper.style.userSelect = 'none';
  wrapper.style.zIndex = '1';
  
  // Position the wrapper over the field
  const fieldRect = field.getBoundingClientRect();
  wrapper.style.top = `${fieldRect.top + window.scrollY}px`;
  wrapper.style.left = `${fieldRect.left + window.scrollX}px`;
  wrapper.style.width = `${fieldRect.width}px`;
  wrapper.style.height = `${fieldRect.height}px`;
  
  // Calculate the position of the highlight
  const textBeforeIssue = field.value.substring(0, start);
  const issueText = field.value.substring(start, end);
  
  // Create a temporary element to measure text width
  const measureEl = document.createElement('div');
  measureEl.style.position = 'absolute';
  measureEl.style.visibility = 'hidden';
  measureEl.style.whiteSpace = 'pre';
  measureEl.style.font = window.getComputedStyle(field).font;
  measureEl.textContent = textBeforeIssue;
  document.body.appendChild(measureEl);
  
  const beforeWidth = measureEl.offsetWidth;
  measureEl.textContent = issueText;
  const issueWidth = measureEl.offsetWidth;
  document.body.removeChild(measureEl);
  
  // Position the highlight
  highlight.style.position = 'absolute';
  highlight.style.left = `${beforeWidth}px`;
  highlight.style.top = '0';
  highlight.style.pointerEvents = 'auto';
  
  // Add the highlight to the wrapper
  wrapper.appendChild(highlight);
  
  // Add the wrapper to the document
  document.body.appendChild(wrapper);
  
  // Store the wrapper for later removal
  if (!field.textWardenWrappers) {
    field.textWardenWrappers = [];
  }
  
  field.textWardenWrappers.push(wrapper);
  
  return wrapper;
}

// Show suggestion popup
function showSuggestionPopup(field, highlight, suggestion) {
  // Remove existing popup
  removePopup();
  
  // Create popup
  const popup = document.createElement('div');
  popup.className = 'textwarden-popup';
  
  // Create popup header
  const header = document.createElement('div');
  header.className = 'textwarden-popup-header';
  
  const title = document.createElement('h3');
  title.className = 'textwarden-popup-title';
  title.textContent = getIssueTitle(suggestion.type);
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'textwarden-popup-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', removePopup);
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  // Create issue section
  const issueSection = document.createElement('div');
  issueSection.className = 'textwarden-issue';
  
  const issueText = document.createElement('div');
  issueText.className = 'textwarden-issue-text';
  issueText.textContent = suggestion.text || highlight.textContent;
  
  const explanation = document.createElement('div');
  explanation.className = 'textwarden-issue-explanation';
  explanation.textContent = suggestion.explanation || 'No explanation provided.';
  
  issueSection.appendChild(issueText);
  issueSection.appendChild(explanation);
  
  // Create suggestions section
  const suggestionsSection = document.createElement('div');
  suggestionsSection.className = 'textwarden-suggestions';
  
  if (suggestion.replacements && suggestion.replacements.length > 0) {
    suggestion.replacements.forEach(replacement => {
      const suggestionBtn = document.createElement('button');
      suggestionBtn.className = 'textwarden-suggestion';
      suggestionBtn.textContent = replacement;
      suggestionBtn.addEventListener('click', () => {
        applySuggestion(field, highlight, replacement);
        removePopup();
      });
      
      suggestionsSection.appendChild(suggestionBtn);
    });
    
    // Add "Apply All" button if there are multiple suggestions
    if (suggestion.replacements.length > 1) {
      const applyAllBtn = document.createElement('button');
      applyAllBtn.className = 'textwarden-apply-all';
      applyAllBtn.textContent = 'Apply All Suggestions';
      applyAllBtn.addEventListener('click', () => {
        applyAllSuggestions(field);
        removePopup();
      });
      
      suggestionsSection.appendChild(applyAllBtn);
    }
  } else {
    const noSuggestions = document.createElement('div');
    noSuggestions.textContent = 'No suggestions available.';
    suggestionsSection.appendChild(noSuggestions);
  }
  
  // Assemble popup
  popup.appendChild(header);
  popup.appendChild(issueSection);
  popup.appendChild(suggestionsSection);
  
  // Position popup
  positionPopup(popup, highlight);
  
  // Add popup to document
  document.body.appendChild(popup);
  
  // Store reference to popup
  suggestionPopup = popup;
}

// Position popup relative to the highlight
function positionPopup(popup, highlight) {
  const highlightRect = highlight.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  // Default position (below the highlight)
  let top = highlightRect.bottom + window.scrollY + 5;
  
  // Check if popup would go off the bottom of the screen
  if (highlightRect.bottom + 200 > viewportHeight) {
    // Position above the highlight instead
    top = highlightRect.top + window.scrollY - 5;
    popup.style.transform = 'translateY(-100%)';
  }
  
  popup.style.left = `${highlightRect.left + window.scrollX}px`;
  popup.style.top = `${top}px`;
}

// Apply a suggestion to the text
function applySuggestion(field, highlight, replacement) {
  const start = parseInt(highlight.dataset.start);
  const end = parseInt(highlight.dataset.end);
  
  if (field.isContentEditable) {
    // For contenteditable fields
    applySuggestionToContentEditable(field, highlight, replacement);
  } else if (field.tagName === 'TEXTAREA' || field.tagName === 'INPUT') {
    // For textarea and input fields
    applySuggestionToInputField(field, start, end, replacement);
  }
  
  // Notify background script that a suggestion was applied
  chrome.runtime.sendMessage({
    action: 'applySuggestion'
  });
  
  // Re-analyze the field after applying the suggestion
  setTimeout(() => {
    analyzeField(field);
  }, 500);
}

// Apply a suggestion to a contenteditable field
function applySuggestionToContentEditable(field, highlight, replacement) {
  // Replace the highlight with the replacement text
  const textNode = document.createTextNode(replacement);
  highlight.parentNode.replaceChild(textNode, highlight);
}

// Apply a suggestion to an input or textarea field
function applySuggestionToInputField(field, start, end, replacement) {
  const text = field.value;
  field.value = text.substring(0, start) + replacement + text.substring(end);
  
  // Remove the highlight wrapper
  if (field.textWardenWrappers) {
    field.textWardenWrappers.forEach(wrapper => {
      if (document.body.contains(wrapper)) {
        document.body.removeChild(wrapper);
      }
    });
    
    field.textWardenWrappers = [];
  }
  
  // Set cursor position after the replacement
  field.selectionStart = start + replacement.length;
  field.selectionEnd = start + replacement.length;
  field.focus();
}

// Apply all suggestions to a field
function applyAllSuggestions(field) {
  // Get all highlights for this field
  if (!currentHighlights.has(field)) return;
  
  const highlights = currentHighlights.get(field);
  
  // Apply suggestions in reverse order (to avoid position shifts)
  highlights.sort((a, b) => {
    const aStart = parseInt(a.element.dataset.start);
    const bStart = parseInt(b.element.dataset.start);
    return bStart - aStart;
  });
  
  highlights.forEach(highlight => {
    if (highlight.suggestion.replacements && highlight.suggestion.replacements.length > 0) {
      // Apply the first suggestion
      applySuggestion(field, highlight.element, highlight.suggestion.replacements[0]);
    }
  });
  
  // Clear highlights
  currentHighlights.set(field, []);
}

// Remove popup
function removePopup() {
  if (suggestionPopup && document.body.contains(suggestionPopup)) {
    document.body.removeChild(suggestionPopup);
  }
  
  suggestionPopup = null;
}

// Remove highlights from a field
function removeHighlightsFromField(field) {
  if (field.isContentEditable) {
    // For contenteditable fields
    const highlights = field.querySelectorAll('.textwarden-highlight');
    
    highlights.forEach(highlight => {
      const text = document.createTextNode(highlight.textContent);
      highlight.parentNode.replaceChild(text, highlight);
    });
  } else if (field.tagName === 'TEXTAREA' || field.tagName === 'INPUT') {
    // For textarea and input fields
    if (field.textWardenWrappers) {
      field.textWardenWrappers.forEach(wrapper => {
        if (document.body.contains(wrapper)) {
          document.body.removeChild(wrapper);
        }
      });
      
      field.textWardenWrappers = [];
    }
  }
  
  // Clear highlights for this field
  if (currentHighlights.has(field)) {
    currentHighlights.set(field, []);
  }
}

// Remove all highlights
function removeAllHighlights() {
  // Remove highlights from all fields
  activeFields.forEach((data, field) => {
    removeHighlightsFromField(field);
  });
  
  // Remove popup
  removePopup();
}

// Refresh all fields
function refreshAllFields() {
  // Re-analyze all active fields
  activeFields.forEach((data, field) => {
    analyzeField(field);
  });
}

// Helper function to get text from a field
function getFieldText(field) {
  if (field.isContentEditable) {
    return field.textContent;
  } else {
    return field.value;
  }
}

// Helper function to check if an element is a text field
function isTextField(element) {
  if (!element || !element.tagName) return false;
  
  const tagName = element.tagName.toLowerCase();
  const type = element.type && element.type.toLowerCase();
  
  return (
    (tagName === 'textarea') ||
    (tagName === 'input' && ['text', 'email', 'search'].includes(type)) ||
    (element.isContentEditable)
  );
}

// Helper function to get a unique ID for a field
function getFieldId(field) {
  if (!field.dataset.textwardenId) {
    field.dataset.textwardenId = generateId();
  }
  
  return field.dataset.textwardenId;
}

// Helper function to generate a unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// Helper function to get issue title based on type
function getIssueTitle(type) {
  switch (type) {
    case 'grammar':
      return 'Grammar Issue';
    case 'spelling':
      return 'Spelling Issue';
    case 'style':
      return 'Style Suggestion';
    case 'clarity':
      return 'Clarity Improvement';
    default:
      return 'Writing Suggestion';
  }
}

// Helper function to get data from storage
function getStorageData(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result);
    });
  });
}
