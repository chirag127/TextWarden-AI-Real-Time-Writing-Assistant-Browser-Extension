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
            "enabled",
            "grammarCheck",
            "spellingCheck",
            "styleCheck",
            "clarityCheck",
        ]);

        isEnabled = settings.enabled !== false; // Default to true if not set
        grammarCheck = settings.grammarCheck !== false; // Default to true if not set
        spellingCheck = settings.spellingCheck !== false; // Default to true if not set
        styleCheck = settings.styleCheck !== false; // Default to true if not set
        clarityCheck = settings.clarityCheck !== false; // Default to true if not set
    } catch (error) {
        console.error("TextWarden: Error loading settings", error);
    }

    // Create suggestion popup
    createSuggestionPopup();

    // Start observing text fields
    observeTextFields();

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "settingsUpdated") {
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
        } else if (message.action === "analysisResult") {
            // Handle analysis result from background script
            handleAnalysisResult(
                message.elementId,
                message.text,
                message.suggestions
            );
        }

        // Always return true for async response
        return true;
    });
};

// Create suggestion popup
const createSuggestionPopup = () => {
    suggestionPopup = document.createElement("div");
    suggestionPopup.className = "textwarden-suggestion-popup";
    suggestionPopup.style.display = "none";
    document.body.appendChild(suggestionPopup);
};

// Observe text fields on the page
const observeTextFields = () => {
    // Find all text fields on page load
    findTextFields();

    // Create a MutationObserver to detect new text fields
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (
                mutation.type === "childList" &&
                mutation.addedNodes.length > 0
            ) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node is a text field
                        if (isTextField(node)) {
                            attachTextFieldListeners(node);
                        }

                        // Check for text fields within the added node
                        const textFields = node.querySelectorAll(
                            'input[type="text"], input[type="email"], textarea, [contenteditable="true"]'
                        );
                        textFields.forEach(attachTextFieldListeners);
                    }
                }
            }
        }
    });

    // Start observing the document
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
};

// Find all text fields on the page
const findTextFields = () => {
    const textFields = document.querySelectorAll(
        'input[type="text"], input[type="email"], textarea, [contenteditable="true"]'
    );
    textFields.forEach(attachTextFieldListeners);
};

// Check if an element is a text field
const isTextField = (element) => {
    if (!element || !element.tagName) return false;

    const tagName = element.tagName.toLowerCase();
    const type = element.type ? element.type.toLowerCase() : "";

    return (
        (tagName === "input" && (type === "text" || type === "email")) ||
        tagName === "textarea" ||
        element.getAttribute("contenteditable") === "true"
    );
};

// Attach event listeners to a text field
const attachTextFieldListeners = (element) => {
    if (!element || activeTextFields.has(element)) return;

    // Generate a unique ID for this element if it doesn't have one
    if (!element.id) {
        element.id =
            "textwarden-field-" + Math.random().toString(36).substr(2, 9);
    }

    // Add to active text fields map
    activeTextFields.set(element, {
        id: element.id,
        lastText: element.value || element.textContent || "",
    });

    // Add input event listener
    const inputHandler = () => {
        if (!isEnabled) return;

        const text = element.value || element.textContent || "";

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

    element.addEventListener("input", inputHandler);

    // Initial analysis if there's already text
    const initialText = element.value || element.textContent || "";
    if (isEnabled && initialText.length > 0) {
        analyzeText(element, initialText);
    }
};

// Analyze text for issues
const analyzeText = (element, text) => {
    if (!isEnabled || !text || text.length < 5) return;

    // Determine which checks to perform
    const checks = [];
    if (grammarCheck) checks.push("grammar");
    if (spellingCheck) checks.push("spelling");
    if (styleCheck) checks.push("style");
    if (clarityCheck) checks.push("clarity");

    if (checks.length === 0) return;

    // Send text to background script for analysis
    chrome.runtime.sendMessage({
        action: "analyzeText",
        elementId: element.id,
        text: text,
        checks: checks,
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
    if (
        element.tagName.toLowerCase() === "textarea" ||
        (element.tagName.toLowerCase() === "input" &&
            (element.type === "text" || element.type === "email"))
    ) {
        // For input/textarea, we need to create an overlay
        createHighlightOverlay(element, text, suggestions);
    } else if (element.getAttribute("contenteditable") === "true") {
        // For contenteditable elements, we can modify the HTML
        highlightContentEditable(element, text, suggestions);
    }

    // Store the highlights for this element
    highlightedIssues.set(element, suggestions);
};

// Create highlight overlay for input/textarea elements
const createHighlightOverlay = (element, text, suggestions) => {
    // Remove any existing highlights
    removeHighlights(element);

    // Create a wrapper for the element if it doesn't exist
    let wrapper = element.parentElement;
    if (
        !wrapper ||
        !wrapper.classList.contains("textwarden-highlight-wrapper")
    ) {
        // Create a wrapper div
        wrapper = document.createElement("div");
        wrapper.className = "textwarden-highlight-wrapper";

        // Set the wrapper's style to match the element's dimensions
        const elementStyle = window.getComputedStyle(element);
        wrapper.style.width = elementStyle.width;
        wrapper.style.height = elementStyle.height;
        wrapper.style.display = "inline-block";
        wrapper.style.position = "relative";

        // Insert the wrapper in the DOM
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
    }

    // Get the element's text content
    const elementText = text;

    // Create markers for each issue
    suggestions.forEach((suggestion, index) => {
        const issueText = suggestion.issue;
        if (!issueText) return;

        // Find the position of the issue text in the element's text
        const issueIndex = elementText.indexOf(issueText);
        if (issueIndex === -1) return;

        // Create a marker for this issue
        const marker = document.createElement("div");
        marker.className = `textwarden-issue-marker ${
            suggestion.type || "general"
        }`;
        marker.setAttribute("data-issue-index", index);

        // Position the marker over the issue text
        // This is a simplified approach - in a real extension, you would need more sophisticated positioning
        const textBeforeIssue = elementText.substring(0, issueIndex);

        // Create a temporary span to measure text width
        const measureSpan = document.createElement("span");
        measureSpan.style.visibility = "hidden";
        measureSpan.style.position = "absolute";
        measureSpan.style.whiteSpace = "pre";
        measureSpan.style.font = window.getComputedStyle(element).font;
        document.body.appendChild(measureSpan);

        // Measure the width of the text before the issue
        measureSpan.textContent = textBeforeIssue;
        const offsetLeft = measureSpan.offsetWidth;

        // Measure the width of the issue text
        measureSpan.textContent = issueText;
        const issueWidth = measureSpan.offsetWidth;

        // Clean up
        document.body.removeChild(measureSpan);

        // Set the marker's position and dimensions
        marker.style.left = `${offsetLeft}px`;
        marker.style.bottom = "0";
        marker.style.width = `${issueWidth}px`;
        marker.style.height = "2px";

        // Add the marker to the wrapper
        wrapper.appendChild(marker);
    });

    // Store the highlights for this element
    highlightedIssues.set(element, suggestions);

    // Show the popup automatically near the first issue
    if (suggestions && suggestions.length > 0) {
        // Get the first issue marker to position the popup near it
        const markers = wrapper.querySelectorAll(".textwarden-issue-marker");
        let targetElement = element;

        // If there are markers, use the first one as the target for positioning
        if (markers.length > 0) {
            // Use the first marker's position to better align with the issue
            const firstMarker = markers[0];
            const markerRect = firstMarker.getBoundingClientRect();
            const wrapperRect = wrapper.getBoundingClientRect();

            // Create a temporary element for positioning
            const tempTarget = document.createElement("div");
            tempTarget.style.position = "absolute";
            tempTarget.style.left = `${markerRect.left - wrapperRect.left}px`;
            tempTarget.style.top = `${markerRect.top - wrapperRect.top}px`;
            tempTarget.style.width = `${markerRect.width}px`;
            tempTarget.style.height = `${markerRect.height}px`;
            tempTarget.style.visibility = "hidden";
            wrapper.appendChild(tempTarget);

            // Use this temporary element for positioning
            targetElement = tempTarget;

            // Show the popup with a slight delay to ensure the highlighting is complete
            setTimeout(() => {
                // Calculate the optimal position for the popup
                const position = calculatePopupPosition(targetElement);
                showSuggestionPopup(
                    element,
                    position.x,
                    position.y,
                    suggestions
                );

                // Remove the temporary element
                wrapper.removeChild(tempTarget);
            }, 100);
        } else {
            // If no markers, just use the element itself
            setTimeout(() => {
                // Calculate the optimal position for the popup
                const position = calculatePopupPosition(element);
                showSuggestionPopup(
                    element,
                    position.x,
                    position.y,
                    suggestions
                );
            }, 100);
        }
    }
};

// Highlight issues in contenteditable elements
const highlightContentEditable = (element, _, suggestions) => {
    // We don't need the text parameter for contenteditable elements as we use innerHTML
    // Remove any existing highlights
    removeHighlights(element);

    // Get the original HTML content
    let html = element.innerHTML;

    // Process each suggestion
    suggestions.forEach((suggestion) => {
        const issueText = suggestion.issue;
        if (!issueText) return;

        // Escape the issue text for use in a regex
        const escapedIssueText = issueText.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        // Create a regex to find the issue text
        const regex = new RegExp(escapedIssueText, "g");

        // Replace the issue text with a highlighted version
        html = html.replace(
            regex,
            `<span class="textwarden-issue-marker ${
                suggestion.type || "general"
            }">${issueText}</span>`
        );
    });

    // Update the element's HTML
    element.innerHTML = html;

    // Store the highlights for this element
    highlightedIssues.set(element, suggestions);

    // Show the popup automatically near the first issue
    if (suggestions && suggestions.length > 0) {
        // Try to find the first issue marker
        const markers = element.querySelectorAll(".textwarden-issue-marker");
        let targetElement = element;

        // If there are markers, use the first one as the target for positioning
        if (markers.length > 0) {
            // Use the first marker for positioning
            targetElement = markers[0];

            // Show the popup with a slight delay to ensure the highlighting is complete
            setTimeout(() => {
                // Calculate the optimal position for the popup
                const position = calculatePopupPosition(targetElement);
                showSuggestionPopup(
                    element,
                    position.x,
                    position.y,
                    suggestions
                );
            }, 100);
        } else {
            // If no markers, just use the element itself
            setTimeout(() => {
                // Calculate the optimal position for the popup
                const position = calculatePopupPosition(element);
                showSuggestionPopup(
                    element,
                    position.x,
                    position.y,
                    suggestions
                );
            }, 100);
        }
    }
};

// Show suggestion popup
const showSuggestionPopup = (element, x, y, suggestions) => {
    if (!suggestionPopup) return;

    // Clear previous content
    suggestionPopup.innerHTML = "";

    // Create content container (we'll skip the header to improve scrolling)
    const contentContainer = document.createElement("div");
    contentContainer.className = "textwarden-popup-content";

    // Create suggestions list
    const list = document.createElement("ul");
    list.className = "textwarden-suggestions-list";

    suggestions.forEach((suggestion) => {
        const item = document.createElement("li");
        item.className = "textwarden-suggestion-item";

        // Create item header with apply button, issue text, type badge, and info button
        const itemHeader = document.createElement("div");
        itemHeader.className = "textwarden-item-header";

        // Small apply button on the left
        const smallApplyButton = document.createElement("button");
        smallApplyButton.className = "textwarden-small-apply-button";
        smallApplyButton.innerHTML = "&#10003;"; // Checkmark symbol
        smallApplyButton.title = "Apply this suggestion";
        smallApplyButton.addEventListener("click", () => {
            applySuggestion(element, suggestion);
            suggestionPopup.style.display = "none";
        });
        itemHeader.appendChild(smallApplyButton);

        // Suggestion text in the header (instead of issue text)
        const headerText = document.createElement("div");
        headerText.className = "textwarden-header-text";
        headerText.textContent =
            suggestion.suggestion || "No suggestion available";
        itemHeader.appendChild(headerText);

        // Type badge
        const typeBadge = document.createElement("span");
        const issueType = suggestion.type || "general";
        typeBadge.className = `textwarden-type-badge textwarden-type-${issueType}`;
        typeBadge.textContent = issueType;
        itemHeader.appendChild(typeBadge);

        // Info button on the right
        const infoButton = document.createElement("button");
        infoButton.className = "textwarden-info-button";
        infoButton.innerHTML = "&#9432;"; // Info symbol
        infoButton.title = "Show explanation";
        itemHeader.appendChild(infoButton);

        // Create tooltip for explanation (hidden by default)
        const explanationTooltip = document.createElement("div");
        explanationTooltip.className = "textwarden-explanation-tooltip";

        // Get default explanation based on issue type if none provided
        let explanation = suggestion.explanation;
        if (!explanation || explanation.trim() === "") {
            const issueType = suggestion.type || "general";
            switch (issueType) {
                case "grammar":
                    explanation =
                        "This appears to be a grammatical error that affects sentence structure.";
                    break;
                case "spelling":
                    explanation =
                        "This word may be misspelled or not recognized.";
                    break;
                case "style":
                    explanation =
                        "This phrasing could be improved for better readability or clarity.";
                    break;
                case "clarity":
                    explanation =
                        "This text may be confusing or ambiguous to readers.";
                    break;
                default:
                    explanation =
                        "This text could be improved for better writing quality.";
            }
        }
        explanationTooltip.textContent = explanation;

        // Add hover event listeners to show/hide the tooltip
        infoButton.addEventListener("mouseenter", () => {
            // Position the tooltip relative to the info button
            const infoRect = infoButton.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();

            // Set tooltip position
            explanationTooltip.style.top =
                infoRect.bottom - itemRect.top + 5 + "px";
            explanationTooltip.style.right = "0";
            explanationTooltip.style.display = "block";
        });

        infoButton.addEventListener("mouseleave", () => {
            explanationTooltip.style.display = "none";
        });

        // Add the tooltip to the item (with position: relative to enable absolute positioning)
        item.style.position = "relative";
        item.appendChild(explanationTooltip);

        // Add all elements to the item
        item.appendChild(itemHeader);
        list.appendChild(item);
    });

    // Add list to content container
    contentContainer.appendChild(list);

    // Add content container to popup
    suggestionPopup.appendChild(contentContainer);

    // Position the popup
    suggestionPopup.style.left = `${x}px`;
    suggestionPopup.style.top = `${y}px`;

    // Display the popup
    suggestionPopup.style.display = "block";

    // Close popup when clicking outside
    const closePopupHandler = (event) => {
        if (
            !suggestionPopup.contains(event.target) &&
            event.target !== element
        ) {
            suggestionPopup.style.display = "none";
            document.removeEventListener("click", closePopupHandler);
        }
    };

    // Add delay to avoid immediate closing
    setTimeout(() => {
        document.addEventListener("click", closePopupHandler);
    }, 100);
};

// Apply a suggestion to a text field
const applySuggestion = (element, suggestion) => {
    if (!element || !suggestion || !suggestion.suggestion) return;

    // Get the current text from the element
    let currentText = element.value || element.textContent || "";

    // Get the issue text and suggested replacement
    const issueText = suggestion.issue || "";
    const replacementText = suggestion.suggestion || "";

    if (!issueText || !replacementText) {
        console.error(
            "Missing issue text or replacement text in suggestion:",
            suggestion
        );
        return;
    }

    // Replace the issue text with the suggested text
    // Note: In a real implementation, you would need more sophisticated logic
    // to handle exact positions, partial matches, etc.
    const newText = currentText.replace(issueText, replacementText);

    // Apply the new text to the element based on its type
    if (
        element.tagName.toLowerCase() === "textarea" ||
        (element.tagName.toLowerCase() === "input" &&
            (element.type === "text" || element.type === "email"))
    ) {
        // For input/textarea elements
        element.value = newText;

        // Trigger input event to notify other scripts of the change
        const inputEvent = new Event("input", { bubbles: true });
        element.dispatchEvent(inputEvent);
    } else if (element.getAttribute("contenteditable") === "true") {
        // For contenteditable elements
        element.textContent = newText;

        // Trigger input event
        const inputEvent = new Event("input", { bubbles: true });
        element.dispatchEvent(inputEvent);
    }

    // Remove the highlight for this issue
    removeHighlights(element);

    // Update statistics
    updateCorrectionCount();

    console.log("Applied suggestion:", {
        element: element,
        originalText: currentText,
        issueText: issueText,
        replacementText: replacementText,
        newText: newText,
    });
};

// Remove highlights from an element
const removeHighlights = (element) => {
    if (!element) return;

    // For input/textarea elements with a wrapper
    const wrapper = element.parentElement;
    if (wrapper && wrapper.classList.contains("textwarden-highlight-wrapper")) {
        // Remove all issue markers
        const markers = wrapper.querySelectorAll(".textwarden-issue-marker");
        markers.forEach((marker) => marker.remove());
    }

    // For contenteditable elements
    if (element.getAttribute("contenteditable") === "true") {
        // Get the HTML content
        let html = element.innerHTML;

        // Remove all issue marker spans
        html = html.replace(
            /<span class="textwarden-issue-marker [^"]*">(.*?)<\/span>/g,
            "$1"
        );

        // Update the element's HTML
        element.innerHTML = html;
    }

    // Remove from highlighted issues map
    highlightedIssues.delete(element);
};

// Remove all highlights
const removeAllHighlights = () => {
    // Remove all issue markers from wrappers
    document.querySelectorAll(".textwarden-issue-marker").forEach((marker) => {
        marker.remove();
    });

    // Remove issue marker spans from contenteditable elements
    document.querySelectorAll("[contenteditable='true']").forEach((element) => {
        let html = element.innerHTML;
        html = html.replace(
            /<span class="textwarden-issue-marker [^"]*">(.*?)<\/span>/g,
            "$1"
        );
        element.innerHTML = html;
    });

    // Clear highlighted issues map
    highlightedIssues.clear();

    // Hide suggestion popup
    if (suggestionPopup) {
        suggestionPopup.style.display = "none";
    }
};

// Update suggestion count statistic
const updateSuggestionCount = (count) => {
    chrome.storage.local.get(["suggestionsCount"], (result) => {
        const currentCount = result.suggestionsCount || 0;
        chrome.storage.local.set({ suggestionsCount: currentCount + count });
    });
};

// Update correction count statistic
const updateCorrectionCount = () => {
    chrome.storage.local.get(["correctionsCount"], (result) => {
        const currentCount = result.correctionsCount || 0;
        chrome.storage.local.set({ correctionsCount: currentCount + 1 });
    });
};

// Calculate the optimal position for the popup
const calculatePopupPosition = (element) => {
    // Get the element's position
    const rect = element.getBoundingClientRect();

    // Get the viewport dimensions
    const viewportWidth = window.innerWidth;

    // Define the popup dimensions (approximate)
    const popupWidth = 300; // Width of the popup

    // Calculate x position (keep popup aligned with the input field)
    let x = rect.left;
    if (x + popupWidth > viewportWidth) {
        // If popup would go off the right edge, align it to the right edge of the element
        x = Math.max(0, rect.right - popupWidth);
    }

    // Always position below the element
    const y = rect.bottom + 5; // 5px below the element

    return { x, y };
};

// Initialize the content script
initialize();
