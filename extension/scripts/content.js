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

        // Copy relevant styles from the element to ensure proper positioning
        const stylesToCopy = [
            "margin",
            "marginTop",
            "marginRight",
            "marginBottom",
            "marginLeft",
            "padding",
            "paddingTop",
            "paddingRight",
            "paddingBottom",
            "paddingLeft",
            "border",
            "borderWidth",
            "borderStyle",
            "borderColor",
            "borderRadius",
            "boxSizing",
        ];

        stylesToCopy.forEach((style) => {
            wrapper.style[style] = elementStyle[style];
        });

        // Insert the wrapper in the DOM
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
    }

    // Get the element's text content
    const elementText = text;

    // Create a canvas for more accurate text measurements
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const elementStyle = window.getComputedStyle(element);
    ctx.font = elementStyle.font;

    // Get element dimensions for line wrapping calculations
    const elementWidth =
        element.clientWidth -
        (parseFloat(elementStyle.paddingLeft) +
            parseFloat(elementStyle.paddingRight));

    // Create markers for each issue
    suggestions.forEach((suggestion, index) => {
        const issueText = suggestion.issue;
        if (!issueText) return;

        // Find all occurrences of the issue text in the element's text
        const issueIndices = findAllOccurrences(elementText, issueText);
        if (issueIndices.length === 0) return;

        // Create a marker for each occurrence of this issue
        issueIndices.forEach((issueIndex) => {
            // Create a marker for this issue
            const marker = document.createElement("div");
            marker.className = `textwarden-issue-marker ${
                suggestion.type || "general"
            }`;
            marker.setAttribute("data-issue-index", index);
            marker.setAttribute("data-issue-text", issueText);
            marker.setAttribute("data-suggestion", suggestion.suggestion || "");

            // Calculate position based on text wrapping and line breaks
            const { left, top, width, height, lineCount } =
                calculateTextPosition(
                    element,
                    elementText,
                    issueIndex,
                    issueText.length,
                    ctx,
                    elementWidth
                );

            // Set the marker's position and dimensions
            marker.style.left = `${left}px`;
            marker.style.top = `${top}px`;
            marker.style.width = `${width}px`;
            marker.style.height = `${height}px`;

            // For multi-line issues, use a different style
            if (lineCount > 1) {
                marker.classList.add("textwarden-multiline-issue");
            }

            // Add the marker to the wrapper
            wrapper.appendChild(marker);

            // Add click event to the marker to show popup
            marker.addEventListener("click", (event) => {
                event.stopPropagation();

                // Find all suggestions for this issue text
                const relevantSuggestions = suggestions.filter(
                    (s) => s.issue === issueText
                );

                // Calculate position for the popup
                const markerRect = marker.getBoundingClientRect();
                const position = calculatePopupPosition(marker, markerRect);

                // Show the popup
                showSuggestionPopup(
                    element,
                    position.x,
                    position.y,
                    relevantSuggestions
                );
            });
        });
    });

    // Store the highlights for this element
    highlightedIssues.set(element, suggestions);

    // Show the popup automatically near the first issue
    if (suggestions && suggestions.length > 0) {
        // Get the first issue marker to position the popup near it
        const markers = wrapper.querySelectorAll(".textwarden-issue-marker");

        // If there are markers, use the first one as the target for positioning
        if (markers.length > 0) {
            // Use the first marker's position to better align with the issue
            const firstMarker = markers[0];
            const markerRect = firstMarker.getBoundingClientRect();

            // Calculate position for the popup
            const position = calculatePopupPosition(firstMarker, markerRect);

            // Show the popup with a slight delay to ensure the highlighting is complete
            setTimeout(() => {
                showSuggestionPopup(
                    element,
                    position.x,
                    position.y,
                    suggestions,
                    position.position
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
                    suggestions,
                    position.position
                );
            }, 100);
        }
    }

    // Add resize event listener to reposition markers when window is resized
    const resizeHandler = debounce(() => {
        // Remove existing markers
        const existingMarkers = wrapper.querySelectorAll(
            ".textwarden-issue-marker"
        );
        existingMarkers.forEach((marker) => marker.remove());

        // Re-create markers with updated positions
        createHighlightOverlay(element, text, suggestions);
    }, 250);

    // Store the resize handler in a data attribute for cleanup
    wrapper.setAttribute("data-resize-handler-id", Date.now().toString());
    window.addEventListener("resize", resizeHandler);
};

// Highlight issues in contenteditable elements
const highlightContentEditable = (element, _, suggestions) => {
    // Remove any existing highlights
    removeHighlights(element);

    // Get the original HTML content
    let html = element.innerHTML;

    // Process each suggestion
    suggestions.forEach((suggestion, index) => {
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
            }" data-issue-index="${index}" data-issue-text="${issueText.replace(
                /"/g,
                "&quot;"
            )}" data-suggestion="${(suggestion.suggestion || "").replace(
                /"/g,
                "&quot;"
            )}">${issueText}</span>`
        );
    });

    // Update the element's HTML
    element.innerHTML = html;

    // Store the highlights for this element
    highlightedIssues.set(element, suggestions);

    // Add click event listeners to all issue markers
    const markers = element.querySelectorAll(".textwarden-issue-marker");
    markers.forEach((marker) => {
        marker.addEventListener("click", (event) => {
            event.stopPropagation();

            // Get the issue text from the marker
            const issueText = marker.getAttribute("data-issue-text");

            // Find all suggestions for this issue text
            const relevantSuggestions = suggestions.filter(
                (s) => s.issue === issueText
            );

            if (relevantSuggestions.length === 0) return;

            // Calculate position for the popup
            const markerRect = marker.getBoundingClientRect();
            const position = calculatePopupPosition(marker, markerRect);

            // Show the popup
            showSuggestionPopup(
                element,
                position.x,
                position.y,
                relevantSuggestions,
                position.position
            );
        });
    });

    // Show the popup automatically near the first issue
    if (suggestions && suggestions.length > 0 && markers.length > 0) {
        // Get the first marker's position
        const firstMarker = markers[0];
        const markerRect = firstMarker.getBoundingClientRect();

        // Calculate position for the popup
        const position = calculatePopupPosition(firstMarker, markerRect);

        // Show the popup with a slight delay to ensure the highlighting is complete
        setTimeout(() => {
            showSuggestionPopup(
                element,
                position.x,
                position.y,
                suggestions,
                position.position
            );
        }, 100);
    }
};

// Show suggestion popup
const showSuggestionPopup = (element, x, y, suggestions, position = null) => {
    if (!suggestionPopup) return;

    // Clear previous content
    suggestionPopup.innerHTML = "";

    // Remove any existing position classes
    suggestionPopup.classList.remove(
        "textwarden-popup-above-right",
        "textwarden-popup-above-left",
        "textwarden-popup-below-right",
        "textwarden-popup-below-left"
    );

    // Add position class if provided
    if (position) {
        suggestionPopup.classList.add(`textwarden-popup-${position}`);
    }

    // Create content container (we'll skip the header to improve scrolling)
    const contentContainer = document.createElement("div");
    contentContainer.className = "textwarden-popup-content";

    // Create Apply All button at the top of the popup
    if (suggestions.length > 1) {
        const applyAllContainer = document.createElement("div");
        applyAllContainer.className = "textwarden-apply-all-container";

        const applyAllButton = document.createElement("button");
        applyAllButton.className = "textwarden-apply-all-button";
        applyAllButton.textContent = "Apply All Suggestions";
        applyAllButton.title = "Apply all suggestions at once";
        applyAllButton.addEventListener("click", () => {
            applyAllSuggestions(element, suggestions);
            suggestionPopup.style.display = "none";
        });

        applyAllContainer.appendChild(applyAllButton);
        contentContainer.appendChild(applyAllContainer);
    }

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

        // Create a container for the issue and suggestion text
        const textContainer = document.createElement("div");
        textContainer.className = "textwarden-text-container";

        // Add the issue text
        const issueText = document.createElement("div");
        issueText.className = "textwarden-issue-text";
        issueText.textContent = suggestion.issue || "No issue text available";
        textContainer.appendChild(issueText);

        // Add the suggestion text
        const suggestionText = document.createElement("div");
        suggestionText.className = "textwarden-header-text";
        suggestionText.textContent =
            suggestion.suggestion || "No suggestion available";
        textContainer.appendChild(suggestionText);

        // Add the text container to the header
        itemHeader.appendChild(textContainer);

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

    // Add scroll event listener to reposition popup when page is scrolled
    const scrollHandler = debounce(() => {
        // Recalculate position
        const newPosition = calculatePopupPosition(element);

        // Update popup position
        suggestionPopup.style.left = `${newPosition.x}px`;
        suggestionPopup.style.top = `${newPosition.y}px`;

        // Update position class
        suggestionPopup.classList.remove(
            "textwarden-popup-above-right",
            "textwarden-popup-above-left",
            "textwarden-popup-below-right",
            "textwarden-popup-below-left"
        );
        suggestionPopup.classList.add(
            `textwarden-popup-${newPosition.position}`
        );
    }, 100);

    // Add scroll event listener
    window.addEventListener("scroll", scrollHandler);

    // Store the scroll handler for cleanup
    suggestionPopup.setAttribute(
        "data-scroll-handler-id",
        Date.now().toString()
    );

    // Close popup when clicking outside
    const closePopupHandler = (event) => {
        if (
            !suggestionPopup.contains(event.target) &&
            event.target !== element
        ) {
            suggestionPopup.style.display = "none";
            document.removeEventListener("click", closePopupHandler);
            window.removeEventListener("scroll", scrollHandler);
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

    return newText; // Return the new text for chaining
};

// Apply all suggestions to a text field
const applyAllSuggestions = (element, suggestions) => {
    if (!element || !suggestions || suggestions.length === 0) return;

    // Sort suggestions by their position in the text (from end to beginning)
    // This prevents position shifts when applying multiple suggestions
    const sortedSuggestions = [...suggestions].sort((a, b) => {
        const textContent = element.value || element.textContent || "";
        const posA = textContent.indexOf(a.issue);
        const posB = textContent.indexOf(b.issue);
        return posB - posA; // Sort in reverse order (end to beginning)
    });

    // Apply each suggestion in reverse order
    let currentText = element.value || element.textContent || "";
    let appliedCount = 0;

    for (const suggestion of sortedSuggestions) {
        if (!suggestion.issue || !suggestion.suggestion) continue;

        // Replace the issue text with the suggested text
        currentText = currentText.replace(
            suggestion.issue,
            suggestion.suggestion
        );
        appliedCount++;
    }

    // Apply the final text to the element
    if (
        element.tagName.toLowerCase() === "textarea" ||
        (element.tagName.toLowerCase() === "input" &&
            (element.type === "text" || element.type === "email"))
    ) {
        // For input/textarea elements
        element.value = currentText;
    } else if (element.getAttribute("contenteditable") === "true") {
        // For contenteditable elements
        element.textContent = currentText;
    }

    // Trigger input event to notify other scripts of the change
    const inputEvent = new Event("input", { bubbles: true });
    element.dispatchEvent(inputEvent);

    // Remove all highlights
    removeHighlights(element);

    // Update statistics for each applied suggestion
    for (let i = 0; i < appliedCount; i++) {
        updateCorrectionCount();
    }

    console.log(`Applied ${appliedCount} suggestions:`, {
        element: element,
        finalText: currentText,
    });
};

// Remove highlights from an element
const removeHighlights = (element) => {
    if (!element) return;

    // For input/textarea elements with a wrapper
    const wrapper = element.parentElement;
    if (wrapper && wrapper.classList.contains("textwarden-highlight-wrapper")) {
        // Remove resize event listener if it exists
        const resizeHandlerId = wrapper.getAttribute("data-resize-handler-id");
        if (resizeHandlerId) {
            window.removeEventListener("resize", resizeHandlerId);
            wrapper.removeAttribute("data-resize-handler-id");
        }

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
            /<span class="textwarden-issue-marker [^"]*"[^>]*>(.*?)<\/span>/g,
            "$1"
        );

        // Update the element's HTML
        element.innerHTML = html;
    }

    // Hide popup if it's visible
    if (suggestionPopup && suggestionPopup.style.display === "block") {
        // Remove scroll event listener if it exists
        const scrollHandlerId = suggestionPopup.getAttribute(
            "data-scroll-handler-id"
        );
        if (scrollHandlerId) {
            window.removeEventListener("scroll", scrollHandlerId);
            suggestionPopup.removeAttribute("data-scroll-handler-id");
        }

        // Hide the popup
        suggestionPopup.style.display = "none";
    }

    // Remove from highlighted issues map
    highlightedIssues.delete(element);
};

// Remove all highlights
const removeAllHighlights = () => {
    // Remove resize event listeners from wrappers
    document
        .querySelectorAll(".textwarden-highlight-wrapper")
        .forEach((wrapper) => {
            const resizeHandlerId = wrapper.getAttribute(
                "data-resize-handler-id"
            );
            if (resizeHandlerId) {
                window.removeEventListener("resize", resizeHandlerId);
                wrapper.removeAttribute("data-resize-handler-id");
            }
        });

    // Remove all issue markers from wrappers
    document.querySelectorAll(".textwarden-issue-marker").forEach((marker) => {
        marker.remove();
    });

    // Remove issue marker spans from contenteditable elements
    document.querySelectorAll("[contenteditable='true']").forEach((element) => {
        let html = element.innerHTML;
        html = html.replace(
            /<span class="textwarden-issue-marker [^"]*"[^>]*>(.*?)<\/span>/g,
            "$1"
        );
        element.innerHTML = html;
    });

    // Clear highlighted issues map
    highlightedIssues.clear();

    // Hide suggestion popup and remove scroll event listener
    if (suggestionPopup) {
        const scrollHandlerId = suggestionPopup.getAttribute(
            "data-scroll-handler-id"
        );
        if (scrollHandlerId) {
            window.removeEventListener("scroll", scrollHandlerId);
            suggestionPopup.removeAttribute("data-scroll-handler-id");
        }

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

// Helper function to find all occurrences of a substring in a string
const findAllOccurrences = (text, subtext) => {
    const indices = [];
    let index = 0;
    while ((index = text.indexOf(subtext, index)) !== -1) {
        indices.push(index);
        index += 1; // Move past the current match to find the next one
    }
    return indices;
};

// Helper function to create a debounced function
const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

// Calculate text position considering line breaks and wrapping
const calculateTextPosition = (
    element,
    fullText,
    startIndex,
    length,
    ctx,
    maxWidth
) => {
    // Get element's padding
    const style = window.getComputedStyle(element);
    const paddingLeft = parseFloat(style.paddingLeft);
    const paddingTop = parseFloat(style.paddingTop);
    const lineHeight =
        parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;

    // Text before the issue
    const textBefore = fullText.substring(0, startIndex);

    // The issue text
    const issueText = fullText.substring(startIndex, startIndex + length);

    // Split text by line breaks
    const linesBefore = textBefore.split("\n");
    const lastLineBeforeIssue = linesBefore[linesBefore.length - 1];

    // Check if issue text contains line breaks
    const issueLines = issueText.split("\n");
    const lineCount = issueLines.length;

    // Calculate line wrapping for the last line before the issue
    let currentLineWidth = 0;
    let currentLine = "";
    let lineNumber = linesBefore.length - 1;
    let lineStartIndex = textBefore.lastIndexOf("\n") + 1;

    // Process each word in the last line before the issue to calculate wrapping
    const words = lastLineBeforeIssue.split(" ");
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const wordWidth = ctx.measureText(word + " ").width;

        if (currentLineWidth + wordWidth <= maxWidth) {
            currentLine += word + " ";
            currentLineWidth += wordWidth;
        } else {
            // Word wraps to next line
            currentLine = word + " ";
            currentLineWidth = wordWidth;
            lineNumber++;
            lineStartIndex = textBefore.indexOf(word, lineStartIndex);
        }
    }

    // Calculate the left position (horizontal offset)
    const left = ctx.measureText(currentLine).width + paddingLeft;

    // Calculate the top position (vertical offset)
    const top = lineNumber * lineHeight + paddingTop;

    // Calculate width and height for the issue text
    let width, height;

    if (lineCount === 1) {
        // Single line issue
        width = ctx.measureText(issueText).width;
        height = 2; // Underline height
    } else {
        // Multi-line issue
        // For simplicity, we'll use the width of the first line
        // and set the height to cover all lines
        width = ctx.measureText(issueLines[0]).width;
        height = lineCount * lineHeight;
    }

    return { left, top, width, height, lineCount };
};

// Calculate the optimal position for the popup
const calculatePopupPosition = (element, rect = null) => {
    // Get the element's position
    const elementRect = rect || element.getBoundingClientRect();

    // Get the viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get scroll position
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Define the popup dimensions (approximate)
    const popupWidth = 300; // Width of the popup
    const popupHeight = 250; // Approximate height of the popup

    // Calculate the available space in different directions
    const spaceAbove = elementRect.top;
    const spaceBelow = viewportHeight - elementRect.bottom;
    const spaceLeft = elementRect.left;
    const spaceRight = viewportWidth - elementRect.right;

    // Determine the best position based on available space
    let position = "below"; // Default position

    if (spaceBelow < popupHeight && spaceAbove > spaceBelow) {
        position = "above";
    }

    if (spaceRight < popupWidth && spaceLeft > spaceRight) {
        position = position === "above" ? "above-left" : "below-left";
    } else {
        position = position === "above" ? "above-right" : "below-right";
    }

    // Calculate coordinates based on the determined position
    let x, y;

    switch (position) {
        case "below-right":
            x = elementRect.left + scrollX;
            y = elementRect.bottom + scrollY + 5;
            break;
        case "below-left":
            x = elementRect.right - popupWidth + scrollX;
            y = elementRect.bottom + scrollY + 5;
            break;
        case "above-right":
            x = elementRect.left + scrollX;
            y = elementRect.top + scrollY - popupHeight - 5;
            break;
        case "above-left":
            x = elementRect.right - popupWidth + scrollX;
            y = elementRect.top + scrollY - popupHeight - 5;
            break;
        default:
            x = elementRect.left + scrollX;
            y = elementRect.bottom + scrollY + 5;
    }

    // Ensure the popup stays within the viewport
    x = Math.max(
        scrollX + 5,
        Math.min(x, scrollX + viewportWidth - popupWidth - 5)
    );
    y = Math.max(
        scrollY + 5,
        Math.min(y, scrollY + viewportHeight - popupHeight - 5)
    );

    return { x, y, position };
};

// Initialize the content script
initialize();
