
**Textwarden - Product Requirements Document (PRD)**

**Document Version:** 1.2
**Last Updated:** [Current Date]
**Owner:** Chirag Singhal (acting PM/CTO)
**Status:** Final
**Prepared for:** AI Code Assistant (augment code assistant)
**Prepared by:** Chirag Singhal (based on developer input)

---

**0. Critical Instructions for the AI Code Assistant**

*   **Mandate:** You are tasked with building the Textwarden browser extension as defined in this PRD. Follow all requirements meticulously.
*   **Goal:** Deliver a **complete and production-ready** solution. This is **not** an MVP; do not leave features incomplete or marked as "TODO".
*   **Code Quality:** Ensure all code (frontend and backend) is well-documented, follows industry best practices (e.g., clean code principles, security standards), is modular, and easy to maintain.
*   **Testing:** Implement necessary tests to ensure the application is fully functional, stable, and performs as expected. The frontend must be delivered **error-free** in the browser console under normal operation.
*   **Technology Stack:**
    *   **Frontend:** Chrome Browser Extension (Manifest V3) using HTML, CSS, JavaScript.
    *   **Backend:** Node.js with Express.js framework (Stateless API Proxy).
    *   **AI Model:** Google Gemini (`gemini-2.5-flash-preview-04-17`).
    *   **Database:** **None Required.** The backend is stateless.
*   **Project Structure:**
    *   `extension/`: Contains all code for the browser extension frontend (Manifest V3 compatible).
    *   `backend/`: Contains all code for the stateless Express.js backend server.
*   **API Key Handling (CRITICAL - User Provided):**
    *   **Frontend:** Implement a settings area within the extension where users can input and save their *own* Gemini API key (use `chrome.storage.local` for secure local storage). When making AI-related requests to the backend, the extension **must** retrieve the saved key and send it securely (e.g., in an HTTP header like `X-User-API-Key`) along with the text prompt to the backend API. Implement UI feedback for missing keys or errors returned from the backend related to the key.
    *   **Backend:** API endpoints handling AI requests **must** expect the user's Gemini API key to be passed from the frontend with each request (e.g., via `X-User-API-Key` header). This key must **NOT** be stored persistently. It should be used *dynamically* to initialize the Google AI client or make the API call for that specific request only. Implement robust error handling for invalid/quota-exceeded keys provided by users and return appropriate error codes/messages to the frontend. **Ensure user-provided API keys are NEVER logged.**
*   **Backend Design:** The backend acts purely as a stateless proxy to mediate calls to the Gemini API using the user-provided key. Implement necessary error handling and logging (**excluding user API keys**).
*   **User Experience:** Build the extension with a focus on excellent user experience and performance. It should feel seamless and unobtrusive, with clear instructions for the required API key setup.
*   **Gemini Integration (Backend - Dynamic Key):** Use the structure where the backend function accepts the API key dynamically per request.

    ```javascript
    // Ensure these dependencies are included in backend/package.json:
    // npm install @google/genai mime

    import { GoogleGenAI } from '@google/genai';

    // This function accepts the user's API key dynamically
    async function getGeminiSuggestion(userInputText, userApiKey) {
      if (!userApiKey) {
        console.error("User API Key not provided in request.");
        // Return a specific error object/message for the frontend
        return { error: true, message: "API Key is missing. Please add it in the extension settings." };
      }

      try {
        // Initialize dynamically with the user's key for THIS request
        const ai = new GoogleGenAI(userApiKey);
        // Ensure the correct model name is used as specified

        // Use the model specified in the PRD
        const model = "gemini-2.5-flash-preview-04-17";
        // const model = 'gemini-2.0-flash-lite';

        // Configuration as provided by user (with minor adjustment from original example)
        const config = {
          // temperature: 1, // Example: uncomment or adjust as needed
          // topP: 0.95,
          // topK: 64,
          // maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        };
         // Removed thinkingConfig as it might not be standard/applicable for all models/methods
         // const config = { responseMimeType: "text/plain" }; // Simpler config if preferred

        const contents = [
          {
            role: 'user',
            parts: [
              { text: userInputText },
            ],
          },
        ];

        // Adjust based on whether streaming or single response is needed per feature
        const response = await ai.models.generateContent({
            model,
            contents,
            config,
        });
        const responseText = response.text; // Extract the text from the response
        // Log the response text for debugging
        console.log("Response Text:", responseText);

        // Return successful suggestion
        return { error: false, suggestion: responseText };

      } catch (error) {
        console.error("Error calling Gemini API with user key:", error.message); // Log error message, NOT the key
        let userMessage = "Error generating suggestion due to an issue with the AI service or your API key.";
        // Handle specific errors from Google and provide better user feedback
        if (error.message.includes('API key not valid')) {
          userMessage = "Error: The provided API Key is not valid. Please check your key in the extension settings.";
        } else if (error.message.includes('quota')) {
          userMessage = "Error: Your Gemini API key has exceeded its quota limit.";
        } else if (error.message.includes('billing')) {
           userMessage = "Error: There might be a billing issue associated with your API key.";
        }
        // Return error object for frontend handling
        return { error: true, message: userMessage };
      }
    }

    // --- Integrate this function into your Express routes ---
    // Example Express route structure:
    /*
    app.post('/api/ai/suggest', async (req, res) => {
        const { text } = req.body;
        // Retrieve key securely from header
        const userApiKey = req.headers['x-user-api-key']; // Ensure header name consistency

        if (!text) {
            return res.status(400).json({ error: true, message: 'Input text is required.' });
        }
        // No need to check for userApiKey here, getGeminiSuggestion handles it

        // CRITICAL: Do not log the userApiKey here!
        const result = await getGeminiSuggestion(text, userApiKey);

        if (result.error) {
             // Determine appropriate status code based on error type if possible
             let statusCode = 500; // General server/API error
             if (result.message.includes("API Key is missing")) statusCode = 401; // Unauthorized/Missing Key
             if (result.message.includes("not valid")) statusCode = 403; // Forbidden/Invalid Key
             if (result.message.includes("quota")) statusCode = 429; // Too Many Requests/Quota
             if (result.message.includes("billing")) statusCode = 402; // Payment Required (conceptually)
             return res.status(statusCode).json(result);
        }

        // Send successful suggestion (no error property needed here)
        res.json({ suggestion: result.suggestion });
    });
    */
    ```

---

**1. Introduction & Overview**

*   **1.1. Purpose:** This document outlines the requirements for Textwarden, a browser extension providing free, real-time writing assistance, leveraging the user's own Gemini API key for optional generative AI features.
*   **1.2. Problem Statement:** Users need seamless writing assistance (grammar, style) integrated into their browser. Some users also want to utilize their personal generative AI capabilities (via their own API key) for advanced tasks like drafting, without needing separate accounts or subscriptions for the extension itself.
*   **1.3. Vision / High-Level Solution:** Textwarden will be a free Chrome extension offering real-time writing suggestions. It allows users to optionally enter their Gemini API key to enable AI features (drafting, rewriting). AI requests are securely proxied through a stateless backend using the user's key. Core features (grammar, spelling, style, citations) work without an API key.

**2. Goals & Objectives**

*   **2.1. Business Goals:**
    *   Achieve widespread adoption as a useful, free writing utility.
    *   Establish Textwarden as a reliable and user-friendly extension.
*   **2.2. Product Goals:**
    *   Deliver high-quality real-time writing suggestions (grammar, spelling, style, etc.).
    *   Provide a secure and functional mechanism for users to optionally enable AI features using their own Gemini API key.
    *   Ensure a smooth, intuitive UI, including clear guidance for the optional API key setup.
    *   Maintain excellent performance and reliability.
*   **2.3. Success Metrics (KPIs):**
    *   Daily/Monthly Active Users (DAU/MAU).
    *   Adoption Rate of core features (grammar, spelling, citation).
    *   Adoption Rate of AI features (among users who provide a key).
    *   Suggestion Acceptance Rate.
    *   Backend API response times and error rates (excluding user key-related errors from Google).
    *   User satisfaction ratings/reviews.

**3. Scope**

*   **3.1. In Scope:**
    *   Chrome Browser Extension (Manifest V3).
    *   Real-time Grammar, Spelling, Punctuation Check (underline & suggest).
    *   Clarity, Style, Tone, Vocabulary, Fluency analysis and suggestions.
    *   **User Interface (in extension settings) for users to optionally enter and save their Gemini API key locally (`chrome.storage.local`).**
    *   **Mechanism to send user text + user API key (if provided) to the backend for AI processing.**
    *   **Stateless Backend API endpoint (Express.js) to receive text and user key, call Gemini API using the user's key, and return the result/error.**
    *   Generative AI features (drafts, ideas, replies) - **functional only if the user provides a valid API key.**
    *   Auto-citations (APA, MLA, Chicago) for online sources (does not require API key).
    *   Seamless integration with specified sites (Google Docs, Gmail, LinkedIn initially; design for broader web compatibility).
    *   Minimalist/unobtrusive UI/UX.
*   **3.2. Out of Scope (for this version):**
    *   User Authentication, Accounts, Login/Signup.
    *   Paid features, Subscriptions, Tiers, Team Features.
    *   Backend Database (e.g., MongoDB).
    *   Support for browsers other than Chrome.
    *   Offline functionality.
    *   Mobile/Desktop applications.
    *   Backend storage or management of user API keys.
    *   Providing a central API key or managing AI costs for the user.

**4. User Personas & Scenarios**

*   **4.1. Primary Persona(s):**
    *   **Alex (Student):** Uses Textwarden daily for grammar/spelling checks and citations. Occasionally pastes in their Gemini key (obtained for a class project) to use the AI rewrite feature for essays.
    *   **Priya (Professional):** Primarily relies on Textwarden's core checks for emails and posts. Doesn't use the AI features as they haven't set up a personal Gemini key.
    *   **Sam (Casual User):** Enjoys the free grammar and spelling corrections while browsing. Finds the API key setup too complex and ignores the AI features.
*   **4.2. Key User Scenarios / Use Cases:**
    *   **Core Feature Usage:** User types, gets real-time grammar/spelling suggestions, accepts/ignores them. Uses citation feature. (No API key needed).
    *   **Optional API Key Setup:** User decides they want AI features -> Goes to extension settings -> Reads info about needing own key -> Pastes key -> Saves.
    *   **AI Feature Usage (Key Provided):** User triggers AI action -> Extension retrieves key from storage -> Sends text+key to backend -> Backend calls Gemini -> Result/Error displayed.
    *   **AI Feature Attempt (No Key):** User triggers AI action -> Extension checks storage, finds no key -> Displays message "Please add your Gemini API key in settings to use this feature." (No backend call needed).
    *   **AI Feature Error (Invalid Key):** User triggers AI action -> Sends text+invalid key to backend -> Backend gets error from Google -> Returns specific error -> Extension displays "Invalid API Key..." message.

**5. User Stories**

*   **US1:** As a User, I want Textwarden to automatically check my spelling and grammar for free as I type online.
*   **US2:** As a User, I want Textwarden to suggest ways to make my sentences clearer and more concise.
*   **US3:** As a User, I want the option to securely enter my own Gemini API key into the extension's settings to unlock generative AI features.
*   **US4:** As a User who has entered my API key, I want to use AI features like rewriting, summarizing, or drafting text, with the processing handled via a backend using my key.
*   **US5:** As a User, I want clear instructions on how and why to add an API key if I choose to use the AI features.
*   **US6:** As a User attempting to use an AI feature without providing a key, I want to be clearly informed that a key is required.
*   **US7:** As a User, I want Textwarden to generate citations for web pages without needing an API key.
*   **US8:** As a User, I want clear feedback if my entered API key is invalid or has issues (like quota limits) when I try to use an AI feature.

**6. Functional Requirements (FR)**

*   **6.1. Real-time Writing Assistance (Core - No API Key Required):**
    *   (FR1.1 - FR1.8 from v1.1 remain valid for Grammar, Spelling, Punctuation, Clarity, Style, Tone, Vocabulary, Fluency checks and suggestions)
*   **6.2. Auto-Citations (Core - No API Key Required):**
    *   (FR3.1 - FR3.5 from v1.1 remain valid)
*   **6.3. Optional Generative AI Features (User API Key Required):**
    *   **FR3.1:** The extension UI must provide access points for AI functions (e.g., context menu, buttons). These UI elements might be disabled or trigger an informational message if no API key is found in storage.
    *   **FR3.2:** The extension UI must include a secure settings page/section for users to optionally input and save their Gemini API key locally (`chrome.storage.local`). Clear instructions must be provided.
    *   **FR3.3:** Before attempting a backend AI call, the extension must check `chrome.storage.local` for a saved user API key.
    *   **FR3.4:** If no key is found, the extension must inform the user that a key is required for this feature (without contacting the backend).
    *   **FR3.5:** If a key is found, the extension must send the text prompt AND the user's API key securely (HTTPS header `X-User-API-Key`) to the designated backend endpoint.
    *   **FR3.6:** The backend endpoint must receive the text and the user's API key.
    *   **FR3.7:** The backend **must not** store the received user API key persistently.
    *   **FR3.8:** The backend must dynamically use the received user API key to make the call to the Google Gemini API (using the specified model `gemini-2.5-flash-preview-04-17`).
    *   **FR3.9:** Supported AI functions: Generate draft, Rewrite text, Brainstorm ideas, Generate replies.
    *   **FR3.10:** AI-generated responses (or specific errors related to the user's key) from the backend must be displayed clearly to the user in the extension UI.
*   **6.4. Integration & Compatibility:**
    *   (FR5.1 - FR5.3 from v1.1 remain valid for GDocs, Gmail, LinkedIn, general web fields, Manifest V3).

**7. Non-Functional Requirements (NFR)**

*   **7.1. Performance:** (NFR1.1 - NFR1.3 - Same as before)
*   **7.2. Scalability:**
    *   **NFR2.1:** Backend architecture (stateless Express.js) must handle concurrent API proxy requests efficiently. Consider potential scaling mechanisms (e.g., load balancing) if usage grows significantly.
*   **7.3. Usability:**
    *   **NFR3.1:** UI must be intuitive. Instructions for the *optional* API key setup must be very clear, explaining the need and process without being overly technical.
    *   **NFR3.2:** Interactions remain unobtrusive.
    *   **NFR3.3:** Error messages (API errors, *user key specific errors*, missing key notifications) must be user-friendly and guide the user appropriately.
*   **7.4. Reliability / Availability:**
    *   **NFR4.1:** Backend service must aim for high availability.
    *   **NFR4.2:** Extension/Backend should handle Google API errors (originating from user key issues) gracefully and inform the user. Core features must remain functional if AI backend/API fails.
*   **7.5. Security:**
    *   **NFR5.1:** All communication between extension and backend **must** use HTTPS.
    *   **NFR5.2:** User's Gemini API key stored within the extension using `chrome.storage.local`.
    *   **NFR5.3:** User's Gemini API key transmitted securely (HTTPS header) to the backend for each request *if* provided.
    *   **NFR5.4:** Backend must handle the received user API key ephemerally (in-memory only for the request duration) and **must NOT** store it persistently.
    *   **NFR5.5:** Backend logging **must** be configured to **explicitly exclude** logging of user-provided API keys received in headers or request bodies.
    *   **NFR5.6:** Implement standard backend security (rate limiting on API endpoints, input validation).
    *   **NFR5.7:** Adhere to Chrome Web Store security policies for Manifest V3 extensions.
*   **7.6. Accessibility:** (NFR6.1 - Same as before)

**8. UI/UX Requirements & Design**

*   **8.1. Wireframes / Mockups:** None provided.
*   **8.2. Key UI Elements:**
    *   (Underlines, popovers, browser action popup - same as before).
    *   **Settings Section:** Clear input field for optional Gemini API key. Help text explaining *why* it's needed (for AI features), *that it's the user's own key*, and linking to Google's guide on obtaining one. Save button. Visual feedback on save.
    *   **AI Feature Triggers:** Buttons/menu items might appear greyed out or trigger a "Key required" message if no key is present in storage.
*   **8.3. User Flow Diagrams:**
    *   *Correction/Citation Flow:* (Standard, no key needed).
    *   *API Key Setup Flow:* User finds settings -> Reads explanation -> Pastes Key -> Saves -> Confirmation.
    *   *AI Action Flow (Key Present):* Trigger Action -> Ext gets key -> Ext calls Backend (w/ key) -> Backend calls Google -> Backend returns result -> Ext displays result.
    *   *AI Action Flow (No Key):* Trigger Action -> Ext checks storage (no key) -> Ext displays "API Key Required" message.
    *   *AI Action Flow (Invalid Key):* Trigger Action -> Ext gets key -> Ext calls Backend (w/ key) -> Backend calls Google (fails) -> Backend returns specific error -> Ext displays "Invalid API Key..." message.

**9. Data Requirements**

*   **9.1. Data Model:** **None.** Backend is stateless. Extension uses `chrome.storage.local` only for the user's API key (if provided) and potentially minor UI settings.
*   **9.2. Data Migration:** N/A.
*   **9.3. Analytics & Tracking:** Implement basic backend logging for API endpoint usage (counts, response times, errors - *excluding* key-related errors originating from Google). Extension could locally track usage counts of core vs AI features (if analytics consent is handled appropriately).

**10. Release Criteria**

*   **10.1. Functional Criteria:** All features in Sec 6 implemented. Core features work without API key. AI features work correctly *if* a valid key is provided. Correct error handling/messaging for missing/invalid keys.
*   **10.2. Non-Functional Criteria:** Meets NFRs, especially security around key handling (local storage, HTTPS transmission, ephemeral backend use, no logging).
*   **10.3. Testing Criteria:** Includes tests for core features (no key), API key input/storage, AI features (with valid key), and error states (no key, invalid key, quota exceeded).
*   **10.4. Documentation Criteria:** Code documentation. Clear user-facing explanation within the extension about the optional API key.

**11. Open Issues / Future Considerations**

*   **11.1. Open Issues:**
    *   Need precise wording/UI design for API key explanation and error messages.
*   **11.2. Future Enhancements (Post-Launch):**
    *   Support for additional browsers.
    *   User settings sync (would require introducing `chrome.storage.sync` and potentially simple auth if sync across devices is desired later).
    *   More advanced non-AI writing rules/suggestions.

**12. Appendix & Glossary**

*   **12.1. Glossary:** (Same, add `chrome.storage.local`)
*   **12.2. Related Documents:** (Same)

**13. Document History / Revisions**

*   **Version 1.0:** ([Date]) - Initial draft (backend-managed key, auth).
*   **Version 1.1:** ([Date]) - Revised to user-provided key, auth present.
*   **Version 1.2:** ([Current Date]) - Final version: User-provided key, **no auth**, **no database**, stateless backend proxy.

take context from D:\AM\GitHub\TextWarden\QuillBot-AI-Writing-and-Grammar-Checker-Tool-Chrome-Web-Store