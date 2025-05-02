

**Textwarden - Product Requirements Document (PRD)**

**Document Version:** 1.0
**Last Updated:** [Current Date]
**Owner:** Chirag Singhal (acting PM/CTO)
**Status:** Final
**Prepared for:** AI Code Assistant (augment code assistant)
**Prepared by:** Chirag Singhal (based on developer input)

---

**0. Critical Instructions for the AI Code Assistant**

*   **Mandate:** You are tasked with building the Textwarden browser extension as defined in this PRD. Follow all requirements meticulously.
*   **Goal:** Deliver a **complete and production-ready** solution. This is **not** an MVP; do not leave features incomplete or marked as "TODO" for future implementation unless explicitly stated in the "Future Considerations" section.
*   **Code Quality:** Ensure all code (frontend and backend) is well-documented, follows industry best practices (e.g., clean code principles, security standards), is modular, and easy to maintain.
*   **Testing:** Implement necessary tests to ensure the application is fully functional, stable, and performs as expected. The frontend must be delivered **error-free** in the browser console under normal operation.
*   **Technology Stack:**
    *   **Frontend:** Chrome Browser Extension (Manifest V3) using HTML, CSS, JavaScript.
    *   **Backend:** Node.js with Express.js framework.
    *   **AI Model:** Google Gemini (`gemini-2.5-flash-preview-04-17`) via the `@google/genai` npm package.
    *   **Database:** MongoDB.
*   **Project Structure:**
    *   `extension/`: Contains all code for the browser extension frontend (Manifest V3 compatible).
    *   `backend/`: Contains all code for the Express.js backend server.
*   **Backend Design:** The backend must be designed to handle API requests (especially AI model interactions) efficiently and securely. Implement necessary error handling and logging. Manage API keys securely; they should **never** be exposed in the frontend code. The user will provide the Gemini API key separately to be configured in the backend environment.
*   **User Experience:** Build the extension with a focus on excellent user experience and performance. It should feel seamless and unobtrusive.
*   **Gemini Integration:** Use the following structure for Gemini API calls within the backend. The user will provide the API key.

    ```javascript
    // Ensure these dependencies are included in backend/package.json:
    // npm install @google/genai mime

    import { GoogleGenAI } from '@google/genai';

    // Assume API key is loaded securely, e.g., from environment variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("Gemini API Key not found. Please set the GEMINI_API_KEY environment variable.");
      // Handle the error appropriately - perhaps disable AI features or throw an error
    }

        // Initialize Google GenAI with the provided API key
        const ai = new GoogleGenAI({ apiKey });


        // Use the model specified in the PRD
        const model = "gemini-2.5-flash-preview-04-17";
        // const model = 'gemini-2.0-flash-lite';

    async function getGeminiSuggestion(userInputText) {
      try {
        // Configure the request
        const config = {
            thinkingConfig: {
                thinkingBudget: 0,
            },
            responseMimeType: "text/plain",
        };

        const contents = [
          {
            role: 'user',
            parts: [
              {
                text: userInputText, // Use the actual input text here
              },
            ],
          },
        ];

        // Example: Using generateContent for a single response
        // Adjust based on whether streaming or single response is needed per feature
        const response = await ai.models.generateContent({
            model,
            contents,
            config,
        });
        const responseText = response.text; // Extract the text from the response
        // Log the response text for debugging
        console.log("Response Text:", responseText);

        /* // Example for streaming response if needed for specific features:
        const responseStream = await model.generateContentStream({ contents, generationConfig: config });
        let accumulatedText = "";
        for await (const chunk of responseStream.stream) {
           const chunkText = chunk.text();
           console.log(chunkText); // Or stream to frontend
           accumulatedText += chunkText;
        }
        return accumulatedText;
        */
       return responseText; // Return the generated suggestion text

      } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Implement robust error handling, potentially return a specific error message
        return "Error generating suggestion.";
      }
    }

    // --- Integrate this function into your Express routes ---
    // Example Express route structure:
    /*
    app.post('/api/ai/suggest', async (req, res) => {
        const { text } = req.body;
        if (!text) {
            return res.status(400).send({ error: 'Input text is required.' });
        }
        const suggestion = await getGeminiSuggestion(text);
        res.send({ suggestion });
    });
    */
    ```

---

**1. Introduction & Overview**

*   **1.1. Purpose:** This document outlines the requirements for Textwarden, a browser extension designed to provide comprehensive, real-time writing assistance to users across various web platforms.
*   **1.2. Problem Statement:** Users often struggle with grammar, spelling, clarity, tone, and style while writing online. Existing tools may be basic, lack integration, or not offer advanced AI-powered generation capabilities. There's a need for an all-in-one, seamless writing assistant.
*   **1.3. Vision / High-Level Solution:** Textwarden will be a Chrome browser extension that analyzes user text in real-time, offering suggestions for improvement (grammar, spelling, punctuation, clarity, style, tone, vocabulary, fluency). It will also integrate generative AI features (powered by Gemini) for drafting, idea generation, and replies, alongside an auto-citation feature. It aims to be an indispensable tool for confident and effective online communication.

**2. Goals & Objectives**

*   **2.1. Business Goals:**
    *   Acquire a significant user base within the target audience (students, professionals, general web users).
    *   Establish Textwarden as a leading comprehensive writing assistant extension.
    *   (If applicable based on tiering) Achieve a target conversion rate from free to premium/team users.
*   **2.2. Product Goals:**
    *   Deliver accurate and helpful real-time writing suggestions across supported websites.
    *   Provide valuable generative AI capabilities seamlessly within the user's writing workflow.
    *   Ensure a smooth, intuitive, and unobtrusive user experience.
    *   Maintain high performance and reliability.
    *   Support user accounts for personalization and team features.
*   **2.3. Success Metrics (KPIs):**
    *   Daily/Monthly Active Users (DAU/MAU).
    *   Feature Adoption Rate (Usage frequency of specific features like AI generation, citation).
    *   Suggestion Acceptance Rate.
    *   User satisfaction ratings/reviews (if feedback mechanism implemented).
    *   Backend API response times and error rates.
    *   (If applicable) Premium tier conversion rate.

**3. Scope**

*   **3.1. In Scope:**
    *   Chrome Browser Extension (Manifest V3).
    *   Real-time Grammar, Spelling, Punctuation Check (underline & suggest).
    *   Clarity, Style, Tone, Vocabulary, Fluency analysis and suggestions.
    *   Generative AI features (drafts, ideas, replies) using Gemini model via backend API.
    *   Auto-citations (APA, MLA, Chicago) for online sources.
    *   Seamless integration with specified sites (Google Docs, Gmail, LinkedIn initially; design for broader web compatibility).
    *   User Account System (Registration, Login, Profile/Settings Management).
    *   Team Features (Requires user accounts; specific features TBD but account structure needed).
    *   Backend API (Express.js) to handle authentication, data persistence, and AI requests.
    *   Data Storage (MongoDB) for user data, settings, etc.
    *   Minimalist/unobtrusive UI/UX as described.
    *   Tiered feature access mechanism (Backend flags based on user account type - free/premium/team).
*   **3.2. Out of Scope (for this version):**
    *   Support for browsers other than Chrome (e.g., Firefox, Safari, Edge).
    *   Offline functionality (Internet connection is required).
    *   Mobile application version.
    *   Desktop application version.
    *   Features not explicitly listed in section 3.1.

**4. User Personas & Scenarios**

*   **4.1. Primary Persona(s):**
    *   **Alex (Student):** Needs help proofreading essays, ensuring correct citations (MLA/APA), and improving clarity in academic writing within Google Docs. Uses generative AI for brainstorming essay ideas.
    *   **Priya (Professional):** Writes frequent emails (Gmail), LinkedIn posts, and reports (Google Docs). Needs to ensure professional tone, conciseness, and grammatical accuracy. Uses generative AI to draft quick email replies.
    *   **Sam (Casual User):** Writes social media posts, comments, and forum entries. Wants basic grammar/spelling checks and occasional help phrasing things better.
*   **4.2. Key User Scenarios / Use Cases:**
    *   **Real-time Correction:** User types in a Gmail compose window; Textwarden underlines a grammatical error; User clicks underline, sees suggestion, clicks to accept.
    *   **AI Drafting:** User selects a short email prompt in Gmail, clicks the Textwarden icon/button, chooses "Draft Reply", AI generates a draft via backend call, User inserts/edits draft.
    *   **Citation Generation:** User is on a research article webpage, clicks Textwarden icon, selects "Generate Citation", chooses citation style (e.g., APA), copies generated citation.
    *   **Tone Check:** User writes a potentially harsh sentence; Textwarden flags it and suggests alternative, more neutral phrasing.
    *   **Account Login:** User installs extension, is prompted to log in or sign up to access all features/sync settings.

**5. User Stories**

*   **US1:** As a User, I want Textwarden to automatically check my spelling and grammar as I type in web text fields, so I can correct mistakes easily.
*   **US2:** As a User, I want Textwarden to suggest ways to make my sentences clearer and more concise, so my writing is more impactful.
*   **US3:** As a User, I want to be able to select text and ask Textwarden's AI to rewrite it, shorten it, expand on it, or change its tone, so I can improve my drafts quickly.
*   **US4:** As a Student, I want Textwarden to generate citations for web pages I'm viewing in APA, MLA, or Chicago style, so I can easily create my bibliography.
*   **US5:** As a User, I want to create an account to save my preferences and potentially access premium features.
*   **US6:** As a User, I want Textwarden to work seamlessly within Google Docs, Gmail, and LinkedIn without disrupting my workflow.

**6. Functional Requirements (FR)**

*   **6.1. Real-time Writing Assistance:**
    *   **FR1.1:** The extension must detect and analyze text entered by the user in designated web page elements (e.g., `<textarea>`, `contenteditable` divs).
    *   **FR1.2:** Spelling errors must be identified and underlined (e.g., red wavy underline). Clicking/hovering should show correction suggestions.
    *   **FR1.3:** Grammatical errors must be identified and underlined (e.g., blue underline). Clicking/hovering should show suggestions and brief explanations.
    *   **FR1.4:** Punctuation errors must be identified and underlined. Clicking/hovering should show correction suggestions.
    *   **FR1.5:** Issues related to clarity, style, wordiness, and fluency must be identified and flagged (e.g., different color underline). Clicking/hovering should show rewrite suggestions.
    *   **FR1.6:** The extension must provide a mechanism (e.g., click) to accept and apply a suggested change directly into the text field.
    *   **FR1.7:** Tone detection should analyze sentences/paragraphs and provide feedback or suggestions for adjustment via the extension UI.
    *   **FR1.8:** Vocabulary suggestions (synonyms, formality adjustments) should be offered for selected words or phrases.
*   **6.2. Generative AI Features (via Backend):**
    *   **FR2.1:** The extension UI must provide access points (e.g., context menu on selection, button in popup/sidebar) to trigger AI functions.
    *   **FR2.2:** Users must be able to provide text prompts or select existing text to send to the backend AI service.
    *   **FR2.3:** The backend must securely call the Gemini API using the provided code structure and API key.
    *   **FR2.4:** Supported AI functions: Generate draft text based on prompt, Rewrite selected text (e.g., shorten, expand, change tone), Brainstorm ideas based on prompt, Generate replies based on context (e.g., email).
    *   **FR2.5:** AI-generated responses must be displayed clearly to the user within the extension UI, with options to copy or insert the text.
*   **6.3. Auto-Citations:**
    *   **FR3.1:** The extension UI (e.g., popup) must offer a "Generate Citation" feature when on a detectable article/source page.
    *   **FR3.2:** The extension must attempt to extract relevant metadata (author, title, URL, publication date, site name) from the current web page.
    *   **FR3.3:** Users must be able to select the desired citation style (APA, MLA, Chicago).
    *   **FR3.4:** The extension must format the extracted metadata into the selected citation style.
    *   **FR3.5:** The formatted citation must be displayed to the user with an easy way to copy it.
*   **6.4. User Authentication & Accounts:**
    *   **FR4.1:** The extension must provide Sign Up and Login functionality.
    *   **FR4.2:** Authentication must be handled securely by the backend (e.g., using JWT tokens stored securely).
    *   **FR4.3:** The backend must store user credentials securely (hashed passwords).
    *   **FR4.4:** Logged-in users should have access to potentially personalized settings or tiered features.
    *   **FR4.5:** The backend must associate users with a tier (e.g., free, premium, team) to enable feature flagging.
*   **6.5. Integration & Compatibility:**
    *   **FR5.1:** The extension must function correctly within Google Docs, Gmail (compose view), and LinkedIn (post creation/messaging).
    *   **FR5.2:** The extension should be designed to generally work on standard HTML text input fields across the web, though initial focus is on the sites above.
    *   **FR5.3:** The extension must adhere to Chrome's Manifest V3 policies and requirements.

**7. Non-Functional Requirements (NFR)**

*   **7.1. Performance:**
    *   **NFR1.1:** Real-time analysis should not introduce noticeable lag during typing. Suggestion underlining should appear within milliseconds (<500ms) of pausing typing or completing a sentence.
    *   **NFR1.2:** Backend API responses (especially for AI) should be reasonably fast. Aim for < 2-3 seconds for typical AI generation tasks, acknowledging model latency.
    *   **NFR1.3:** Extension should have minimal impact on browser performance and page load times.
*   **7.2. Scalability:**
    *   **NFR2.1:** The backend architecture (Express.js, MongoDB) must be designed to handle a growing number of users and API requests (support horizontal scaling).
    *   **NFR2.2:** Database queries must be optimized.
*   **7.3. Usability:**
    *   **NFR3.1:** The extension's UI must be intuitive and easy to understand with minimal learning curve.
    *   **NFR3.2:** Interactions (underlines, popups) should be unobtrusive and not interfere significantly with the user's primary task of writing.
    *   **NFR3.3:** Error messages (e.g., API errors, login failures) must be user-friendly.
*   **7.4. Reliability / Availability:**
    *   **NFR4.1:** The backend service must aim for high availability (e.g., >99.9% uptime).
    *   **NFR4.2:** The extension should handle backend API failures gracefully (e.g., disable relevant features temporarily, inform the user).
*   **7.5. Security:**
    *   **NFR5.1:** All communication between the extension and the backend must use HTTPS.
    *   **NFR5.2:** User authentication credentials must be handled securely (hashing, secure token transmission/storage).
    *   **NFR5.3:** The backend must securely manage the Gemini API key (e.g., via environment variables, secret management service); it must **never** be exposed in frontend code.
    *   **NFR5.4:** Implement standard security measures on the backend (e.g., rate limiting, input validation/sanitization) to prevent abuse.
    *   **NFR5.5:** Adhere to Chrome Web Store security policies for Manifest V3 extensions (e.g., minimize permissions).
*   **7.6. Accessibility:**
    *   **NFR6.1:** Extension UI elements (popups, buttons) should adhere to basic web accessibility standards (WCAG AA where feasible), including keyboard navigation and screen reader compatibility.

**8. UI/UX Requirements & Design**

*   **8.1. Wireframes / Mockups:** None provided. Base UI on functional descriptions.
*   **8.2. Key UI Elements:**
    *   Subtle underlines for suggestions (different colors/styles for different issue types recommended).
    *   On-hover or on-click popovers/tooltips displaying suggestions and actions (Accept, Ignore, Learn More - if applicable).
    *   Browser action popup (when clicking the extension icon) for settings, login/logout, triggering citations, possibly some AI actions.
    *   Potentially a small, dismissible sidebar or inline icon for triggering context-aware AI actions.
    *   Overall aesthetic: Clean, modern, minimalist, fitting seamlessly into web pages.
*   **8.3. User Flow Diagrams:** (Conceptual - Implement based on these)
    *   *Correction Flow:* Type -> Pause -> Underline appears -> Hover/Click -> See suggestion -> Click 'Accept' -> Text updates.
    *   *AI Draft Flow:* Click Extension Icon/Button -> Select 'Draft Email' -> Enter prompt -> Click 'Generate' -> Backend call -> View result -> Click 'Insert'.
    *   *Citation Flow:* Navigate to source page -> Click Extension Icon -> Click 'Generate Citation' -> Select Style -> View/Copy Citation.

**9. Data Requirements**

*   **9.1. Data Model (Conceptual - MongoDB Collections):**
    *   `Users`: { `_id`, `email`, `hashedPassword`, `name` (optional), `tier` ('free'/'premium'/'team'), `settings` (object, e.g., { `enabledSites`: [], `disabledRules`: [] }), `createdAt`, `updatedAt` }
    *   `Teams`: { `_id`, `teamName`, `ownerUserId`, `memberUserIds`: [], `teamSettings`: {}, `createdAt`, `updatedAt` } (Basic structure for future team features)
    *   (Potentially) `CustomDictionary`: { `_id`, `userId`, `word`, `createdAt` }
*   **9.2. Data Migration:** Not applicable (new product).
*   **9.3. Analytics & Tracking:** Implement basic backend logging for API usage (feature calls, response times, errors), user signups. Avoid logging user-written text content itself unless explicitly for debugging specific errors and anonymized.

**10. Release Criteria**

*   **10.1. Functional Criteria:** All features listed in Section 6 (Functional Requirements) are implemented and working correctly on target platforms (Gmail, GDocs, LinkedIn).
*   **10.2. Non-Functional Criteria:** Performance, security, usability, and reliability meet the standards outlined in Section 7. Backend passes stress tests for anticipated load.
*   **10.3. Testing Criteria:** Comprehensive testing (unit, integration, end-to-end) covers core functionalities. Manual testing confirms usability and cross-site compatibility (on target sites). Frontend console is free of errors during normal operation.
*   **10.4. Documentation Criteria:** Code is well-documented (comments, READMEs for extension and backend). Basic setup instructions are clear.

**11. Open Issues / Future Considerations**

*   **11.1. Open Issues:**
    *   User needs to provide the Gemini API Key for backend configuration.
    *   Specific details of "Team Features" beyond the account structure need definition (considered post-launch).
    *   Exact list of websites for initial broad compatibility beyond the primary targets (GDocs, Gmail, LinkedIn).
*   **11.2. Future Enhancements (Post-Launch):**
    *   Support for additional browsers (Firefox, Edge).
    *   Offline mode for basic grammar/spelling rules.
    *   User-defined custom dictionaries.
    *   More advanced AI features or fine-tuning.
    *   Deeper integrations with more web applications.
    *   Admin panel for managing users/teams (if required).
    *   More granular user settings/preferences.

**12. Appendix & Glossary**

*   **12.1. Glossary:**
    *   **Manifest V3:** The current standard for Chrome browser extensions, focusing on security, performance, and privacy.
    *   **Gemini:** Google's family of large language models.
    *   **Express.js:** A minimal and flexible Node.js web application framework.
    *   **MongoDB:** A NoSQL document database.
    *   **API:** Application Programming Interface.
    *   **JWT:** JSON Web Token, a standard for securely transmitting information between parties as a JSON object.
    *   **KPI:** Key Performance Indicator.
*   **12.2. Related Documents:** Link to original user request/conversation (if available).

**13. Document History / Revisions**

*   **Version 1.0:** ([Current Date]) - Initial draft based on developer input and CTO discussion.
take context from D:\AM\GitHub\TextWarden\QuillBot-AI-Writing-and-Grammar-Checker-Tool-Chrome-Web-Store 