

**Textwarden - AI Paraphrasing and Grammar Tool - Product Requirements Document (PRD)**

**Document Version:** 1.0
**Last Updated:** [current date]
**Owner:** Chirag Singhal
**Status:** Final
**Prepared for:** AI Code Assistant (Augment Code Assistant)
**Prepared by:** Chirag Singhal (CTO Advisor)

---

**1. Introduction & Overview**

*   **1.1. Purpose:** This document outlines the requirements for "Textwarden," a Google Chrome browser extension designed to enhance user writing across the web by providing AI-powered paraphrasing, grammar correction, text generation, translation, and tone adjustment capabilities directly within the user's workflow.
*   **1.2. Problem Statement:** Users often struggle with expressing themselves clearly, concisely, and appropriately in different online contexts. Switching between writing platforms and separate AI tools is inefficient. Ensuring grammatical correctness, avoiding plagiarism, and adapting writing tone requires significant effort.
*   **1.3. Vision / High-Level Solution:** Textwarden aims to be an indispensable writing companion integrated directly into the Chrome browser. It empowers users to write with confidence and clarity by offering context-aware AI assistance (powered by Google Gemini) seamlessly on any website. Users interact via intuitive inline icons, context menus, and a persistent sidebar, leveraging their own Gemini API key for direct processing.

**2. Goals & Objectives**

*   **2.1. Business Goals:**
    *   Achieve significant user adoption within the Chrome Web Store.
    *   Generate positive user reviews and ratings.
    *   Establish Textwarden as a reliable and helpful writing tool.
*   **2.2. Product Goals:**
    *   Deliver all core features (Paraphrase, Grammar, Generate, Translate, Tone, Plagiarism/AI Resistance) reliably and accurately.
    *   Provide a seamless and intuitive user experience across different websites.
    *   Ensure high performance with AI suggestions delivered quickly (< 2 seconds).
    *   Implement robust error handling and clear user feedback mechanisms.
    *   Enable users to easily configure the extension, including providing their Gemini API key and defining custom tones.
*   **2.3. Success Metrics (KPIs):**
    *   Daily Active Users (DAU) / Weekly Active Users (WAU).
    *   Frequency of use per core feature (e.g., # paraphrases/user/day).
    *   Average Chrome Web Store Rating.
    *   Volume and sentiment of user feedback (via CWS reviews and in-app feedback mechanism).
    *   Task completion rate (e.g., successful paraphrasing action).

**3. Scope**

*   **3.1. In Scope:**
    *   **Core Features:** Paraphrasing, Grammar Perfection, Text Generation (Contextual & Prompt-based), Translation (to English), Plagiarism Minimization (via original generation/paraphrasing), AI Detection Resistance (humanized output), Custom Writing Tones (predefined + user-defined).
    *   **Platform:** Google Chrome Browser Extension.
    *   **Integration:** Functionality available on most websites where users input text (e.g., text areas, content-editable divs).
    *   **User Interaction:** Inline icon on text selection, Right-click context menu, Persistent (closable) sidebar.
    *   **AI Backend:** Direct integration with Google Gemini API using the user's API key.
    *   **Configuration:** Settings page/popup for API key input and custom tone management.
    *   **Storage:** Browser local/sync storage for API key and settings (including custom tones).
    *   **Error Handling:** Inline and popup/sidebar notifications.
    *   **Analytics:** Basic usage tracking (feature counts, active status - anonymized if possible).
    *   **Feedback:** In-extension mechanism for users to provide feedback.
*   **3.2. Out of Scope (for this version):**
    *   Support for browsers other than Chrome.
    *   User accounts, login/signup, or cloud synchronization of settings.
    *   Backend server for processing AI requests or storing user data (AI calls are client-to-Gemini).
    *   Advanced document management features.
    *   Offline functionality (Requires active internet connection for AI features).
    *   Team/collaboration features.

**4. User Personas & Scenarios**

*   **4.1. Primary Persona(s):**
    *   **Alex the Professional Communicator:** Writes emails, reports, social media posts, and internal documents daily. Needs to ensure clarity, professionalism, and grammatical accuracy quickly without disrupting workflow. Values efficiency and confidence in their writing.
    *   **Sam the Student/Researcher:** Drafts essays, research papers, and online discussions. Needs help paraphrasing sources, checking grammar, adapting tone (e.g., formal academic), and ensuring originality.
*   **4.2. Key User Scenarios / Use Cases:**
    *   **Scenario 1 (Paraphrase):** Alex selects a sentence in an email draft -> Clicks the inline Textwarden icon -> Selects "Paraphrase" -> Sees several alternative phrasings -> Clicks one to replace the original text.
    *   **Scenario 2 (Grammar Check):** Sam highlights a paragraph in Google Docs -> Right-clicks -> Selects "Textwarden: Check Grammar" -> Errors are highlighted with suggestions -> Sam accepts/rejects corrections.
    *   **Scenario 3 (Generate Text):** Alex opens the Textwarden sidebar -> Types prompt "Write a short, friendly follow-up email asking about project status" -> Clicks "Generate" -> Copies the generated text into their email client.
    *   **Scenario 4 (Change Tone):** Sam selects text -> Clicks inline icon -> Selects "Tone" -> Chooses "Formal" -> The selected text is rewritten in a more formal style.
    *   **Scenario 5 (Setup):** A new user installs Textwarden -> Clicks the extension icon -> Opens Settings -> Pastes their Gemini API Key into the designated field -> Saves settings.
    *   **Scenario 6 (Custom Tone):** Alex goes to Textwarden settings -> Defines a new custom tone named "Concise & Direct" with specific instructions -> Uses this tone later via the inline icon/sidebar.

**5. User Stories**

*   **US1:** As a user, I want to select text on any webpage and see an inline icon, so I can quickly access Textwarden's core features (Paraphrase, Grammar, Tone).
*   **US2:** As a user, I want to select text and use a right-click context menu option, so I can invoke Textwarden features without needing the inline icon.
*   **US3:** As a user, I want a persistent sidebar I can open/close, so I can perform more complex actions like text generation from prompts or access settings.
*   **US4:** As a user, I want to paraphrase selected text, so I can rephrase my ideas for clarity, style, or avoiding repetition.
*   **US5:** As a user, I want Textwarden to check and correct grammar and spelling mistakes in my selected text, so my writing is error-free.
*   **US6:** As a user, I want to generate text based on a prompt I provide in the sidebar, so I can quickly draft content like emails or ideas.
*   **US7:** As a user, I want to generate text based on selected context, so the AI can continue my thought or expand on a point.
*   **US8:** As a user, I want to translate selected text from my native language (detected or specified) into well-worded English, so I can communicate effectively across language barriers.
*   **US9:** As a user, I want to change the tone of selected text (e.g., Formal, Casual, Confident, Friendly), so my writing matches the intended audience and context.
*   **US10:** As a user, I want to define and save custom writing tones in the settings, so I can reuse specific styles consistently.
*   **US11:** As a user, I want the generated and paraphrased content to be original and human-like, so it minimizes plagiarism risks and avoids AI detection flags.
*   **US12:** As a user, I need to securely input and store my Google Gemini API key within the extension's settings (local storage), so Textwarden can make API calls on my behalf.
*   **US13:** As a user, I want to receive clear, non-intrusive feedback if an AI operation fails or takes too long, so I understand the status.
*   **US14:** As a user, I expect the AI features to respond quickly (ideally under 2 seconds), so my writing flow is not interrupted.
*   **US15:** As a user, I want a way to provide feedback on the extension's functionality or report bugs, so I can help improve the tool.

**6. Functional Requirements (FR)**

*   **6.1. Core AI Features (via Gemini API)**
    *   **FR1.1 (Paraphrase):** Allow users to select text and request paraphrased alternatives. Display multiple options for user selection. Replace original text with selected option.
    *   **FR1.2 (Grammar/Spelling Check):** Allow users to select text and request grammar/spelling correction. Highlight errors and provide suggested fixes. Allow users to accept/reject individual suggestions.
    *   **FR1.3 (Text Generation - Prompt):** Provide an input area (likely in sidebar) for users to enter text prompts. Generate relevant text content based on the prompt. Allow users to copy the generated text.
    *   **FR1.4 (Text Generation - Contextual):** Allow users to select existing text as context and request the AI to continue, expand, or summarize it.
    *   **FR1.5 (Translate to English):** Allow users to select text and request translation into English. Attempt auto-detection of source language, potentially allow manual selection.
    *   **FR1.6 (Tone Adjustment):** Allow users to select text and apply predefined tones (Formal, Casual, Confident, Friendly) or user-defined custom tones. Replace original text with re-toned version.
    *   **FR1.7 (Plagiarism Minimization):** Ensure paraphrasing and generation aim for originality. (This is inherent in the quality of the AI model and prompting).
    *   **FR1.8 (AI Detection Resistance):** Ensure AI outputs are phrased in a human-like manner. (Inherent in model quality/prompting).
*   **6.2. User Interface & Interaction**
    *   **FR2.1 (Inline Icon):** On text selection in editable fields/areas, display a small, non-intrusive icon near the selection. Clicking the icon reveals a menu with primary actions (Paraphrase, Grammar, Tone, etc.).
    *   **FR2.2 (Context Menu):** Add a "Textwarden" entry to the right-click context menu when text is selected, offering access to core features.
    *   **FR2.3 (Sidebar):** Implement a browser action button (extension icon in toolbar) that toggles a persistent sidebar. Sidebar contains input for prompts, displays longer results, provides access to settings, and potentially history (future). Sidebar should be closable.
    *   **FR2.4 (Settings):** Provide a settings page/view accessible via the sidebar or extension icon. Include fields for:
        *   Entering/Updating Google Gemini API Key.
        *   Managing Custom Tones (Add, Edit, Delete).
        *   Potentially other preferences (e.g., default language for translation).
    *   **FR2.5 (Feedback Mechanism):** Include a simple form or link (e.g., mailto:, Google Form) within the settings or sidebar for users to submit feedback/bug reports.
*   **6.3. API Integration & Management**
    *   **FR3.1 (Gemini API Client):** Integrate the `@google/genai` JavaScript library within the extension's scripts (content scripts/background script as appropriate).
    *   **FR3.2 (API Key Handling):**
        *   Prompt users (via Settings UI) to enter their own Gemini API key.
        *   Store the API key securely using Chrome's local or sync storage (`chrome.storage.local` or `chrome.storage.sync`). **Do not hardcode keys.**
        *   Retrieve the stored API key when making calls to the Gemini API.
        *   Handle cases where the API key is missing or invalid, prompting the user to enter/fix it.
    *   **FR3.3 (API Call Construction):** Construct appropriate prompts for the Gemini API based on the user's selected action (paraphrase, generate, translate, tone, etc.), selected text (context), and chosen settings (e.g., custom tone instructions). Utilize streaming responses where appropriate for better perceived performance.
*   **6.4. Custom Tones**
    *   **FR4.1 (Predefined Tones):** Offer built-in tone options: Formal, Casual, Confident, Friendly.
    *   **FR4.2 (Custom Tone Definition):** Allow users to define custom tones via the Settings UI. Each custom tone should have a name and a text description/instruction field for the AI (e.g., "Write like an academic expert, using precise language").
    *   **FR4.3 (Custom Tone Storage):** Store user-defined custom tones in `chrome.storage.sync` or `chrome.storage.local`.
    *   **FR4.4 (Custom Tone Application):** Make custom tones available alongside predefined tones in the Tone adjustment feature UI. Pass the custom tone's instructions within the API prompt when selected.

**7. Non-Functional Requirements (NFR)**

*   **7.1. Performance:**
    *   **NFR1.1 (Response Time):** AI suggestions/results for core features (paraphrase, grammar, tone) should ideally appear within 1-2 seconds after user request under typical network conditions. Generation might take slightly longer depending on complexity. Utilize streaming responses from the API.
    *   **NFR1.2 (UI Responsiveness):** Extension UI elements (icon, menu, sidebar) must remain responsive and not freeze during API calls.
    *   **NFR1.3 (Resource Usage):** Extension should be mindful of CPU and memory usage, avoiding significant impact on browser performance.
*   **7.2. Scalability:**
    *   **NFR2.1 (Client-Side Focus):** Scalability primarily depends on the user's machine, network, and the Google Gemini API's rate limits/capacity associated with the user's key. The extension itself does not have server-side scaling constraints for AI processing.
*   **7.3. Usability:**
    *   **NFR3.1 (Intuitiveness):** Interactions (icon, menu, sidebar) should be easy to discover and use.
    *   **NFR3.2 (Clarity):** AI suggestions and corrections should be clearly presented and easy to apply/reject.
    *   **NFR3.3 (Minimal Intrusion):** The inline icon and notifications should assist without being overly disruptive to the user's writing flow.
    *   **NFR3.4 (Configuration Ease):** Setting up the API key and managing custom tones should be straightforward. Provide clear instructions.
*   **7.4. Reliability / Availability:**
    *   **NFR4.1 (Error Handling):** Gracefully handle API errors (e.g., invalid key, rate limits, network issues, Gemini service downtime). Provide clear, user-understandable error messages.
    *   **NFR4.2 (Consistency):** Features should work consistently across different websites (within limits of web tech compatibility).
*   **7.5. Security:**
    *   **NFR5.1 (API Key Storage):** Store the user-provided API key in Chrome's storage (`chrome.storage.local` recommended over `sync` unless sync is a desired feature, local is slightly more contained). **Acknowledge that storing sensitive keys client-side carries inherent risks.**
    *   **NFR5.2 (API Calls):** All API calls to Gemini must use HTTPS.
    *   **NFR5.3 (Permissions):** Request only necessary Chrome extension permissions (e.g., `storage`, `contextMenus`, `activeTab`, potentially script injection for inline icon).
*   **7.6. Accessibility:**
    *   **NFR6.1 (WCAG Compliance):** Aim for compliance with WCAG 2.1 Level AA guidelines for UI elements (popup, sidebar, settings page). Ensure keyboard navigability and screen reader compatibility where applicable.
*   **7.7. Maintainability:**
    *   **NFR7.1 (Code Quality):** Code should be well-documented, follow standard JavaScript/HTML/CSS best practices, and be organized logically within the `extension/` folder structure.
    *   **NFR7.2 (Modularity):** Structure code into logical modules (e.g., UI components, API interaction logic, settings management).

**8. UI/UX Requirements & Design**

*   **8.1. Wireframes / Mockups:** None provided. The AI agent must infer a suitable design based on functional requirements. Prioritize clarity, ease of use, and minimal intrusion.
*   **8.2. Key UI Elements:**
    *   Inline icon (appears on text selection).
    *   Context menu integration.
    *   Browser action popup (potentially minimal, leading to settings or sidebar).
    *   Sidebar panel (for generation prompts, results, settings access).
    *   Settings page (API Key input, Custom Tone management).
    *   Notifications/Feedback elements (inline or within sidebar/popup).
*   **8.3. User Flow Diagrams:** (Conceptual - AI agent should infer detailed flows)
    *   Setup Flow: Install -> Open Settings -> Enter API Key -> Save.
    *   Paraphrase Flow: Select Text -> Click Inline Icon/Menu -> Choose Paraphrase -> View Options -> Click to Replace.
    *   Generate Flow: Open Sidebar -> Enter Prompt -> Click Generate -> View/Copy Result.

**9. Data Requirements**

*   **9.1. Data Model (Client-Side):**
    *   Stored using `chrome.storage.local` or `chrome.storage.sync`:
        *   `geminiApiKey`: User's encrypted or plaintext API key (string). Consider security implications.
        *   `customTones`: Array of objects, each with `{ name: string, instructions: string }`.
        *   `userPreferences`: (Optional) Object for storing other settings like default language, UI preferences etc.
*   **9.2. Data Migration:** N/A for V1.
*   **9.3. Analytics & Tracking:** Implement basic, anonymized tracking of feature usage counts (e.g., paraphrase clicks, generation requests) if feasible without compromising privacy. Store/send counts aggregatedly if backend added later, or use a dedicated analytics service client-side (e.g., Google Analytics for extensions, respecting privacy policies).

**10. Release Criteria**

*   **10.1. Functional Criteria:** All core features (FR sections 6.1 - 6.4) implemented and working as described. API key setup and usage are functional. Custom tones can be created and applied.
*   **10.2. Non-Functional Criteria:** Performance target (<2s response time) met for key features under normal conditions. No major usability issues reported during testing. Extension operates reliably without frequent crashes or errors. Security measures for API key storage implemented as specified.
*   **10.3. Testing Criteria:** Successful testing across a range of common websites (e.g., Gmail, Google Docs, social media sites, WordPress). Error handling scenarios tested (invalid key, network offline, API errors). Cross-browser testing NOT required (Chrome only).
*   **10.4. Documentation Criteria:** Basic user guide explaining setup (especially API key), features, and usage. Inline documentation within the code.

**11. Open Issues / Future Considerations**

*   **11.1. Open Issues:**
    *   **Security of Client-Side API Key:** Storing the user's Gemini API key in browser storage is convenient but less secure than a backend proxy. Clearly communicate this risk/trade-off to the user during setup. Consider obfuscation or prompting for key on demand as alternatives, though potentially worse UX.
*   **11.2. Future Enhancements (Post-Launch):**
    *   Support for Firefox, Edge, other browsers.
    *   Optional user accounts and cloud sync for settings/custom tones.
    *   Backend server implementation for advanced features, potentially offering a freemium model not requiring user keys.
    *   More sophisticated text generation controls (e.g., length, creativity).
    *   Usage history within the sidebar.
    *   Integration with specific web apps via tailored selectors/logic.
    *   Advanced analytics dashboard (if backend implemented).

**12. Appendix & Glossary**

*   **12.1. Glossary:**
    *   **AI:** Artificial Intelligence.
    *   **API Key:** Secret token used to authenticate requests to the Gemini service.
    *   **Gemini:** Google's family of large language models used for AI features.
    *   **Inline Icon:** Small graphical element appearing near selected text.
    *   **Context Menu:** Right-click menu.
    *   **Sidebar:** Panel anchored to the side of the browser window, toggled by the extension icon.
    *   **Tone:** The stylistic quality of writing (e.g., Formal, Casual).
    *   **Paraphrase:** Rephrase text in different words while keeping the meaning.
*   **12.2. Related Documents:** N/A

**13. Document History / Revisions**

*   **Version 1.0 (\[current date]):** Initial draft based on user requirements gathering.

---

**Instructions for the AI Code Assistant:**

1.  **Target Platform:** Build a Google Chrome Extension using standard web technologies (HTML, CSS, JavaScript).
2.  **Architecture:** The extension will operate primarily client-side. **No backend server is required for core AI functionality in this version.** AI calls are made directly from the extension's JavaScript to the Google Gemini API.
3.  **Project Structure:** Use a single `extension/` folder containing all necessary files (manifest.json, background scripts, content scripts, popup/sidebar/settings HTML/CSS/JS).
4.  **Gemini Integration:**
    *   Use the `@google/genai` JavaScript library for interacting with the Gemini API.
    *   **Adapt the provided Node.js code snippet for browser execution.** The API key must be retrieved from `chrome.storage.local` (or `sync`) where the user stores it, **not** from environment variables.
    *   Implement calls for all required AI features (Paraphrase, Grammar, Generate, Translate, Tone) using appropriate prompts and configurations (like `responseMimeType: 'text/plain'`, model `gemini-1.5-flash-latest` or similar suitable for text tasks).
    *   **Utilize streaming responses (`generateContentStream`)** for features like generation or potentially paraphrasing to improve perceived performance. Handle the streamed chunks correctly in the UI.
5.  **API Key Management:** Implement the settings UI for users to input/update their Gemini API key. Store this key securely using `chrome.storage`. Handle cases where the key is missing or invalid gracefully during API calls.
6.  **UI Implementation:** Create the required UI elements (inline icon on selection, context menu, sidebar, settings page) ensuring they are user-friendly and performant. Follow the interaction patterns described (FR 2.1 - 2.5).
7.  **Core Features:** Implement all functional requirements listed in Section 6. Ensure features work reliably across common websites where text input occurs.
8.  **Error Handling:** Implement robust error handling for API calls, network issues, and invalid user input (e.g., missing API key). Provide clear user feedback (NFR 4.1, FR 2.5).
9.  **Performance:** Prioritize responsiveness (< 2 seconds for core AI tasks) and efficient resource usage (NFR 1.1, NFR 1.3).
10. **Code Quality:** Generate well-documented, clean, maintainable code following best practices for Chrome extension development.
11. **Final Product:** This PRD describes the final, intended product, not just an MVP. Ensure all features are fully implemented and tested.
12. **Testing:** Thoroughly test all features, UI interactions, and error handling scenarios. Ensure frontend is error-free via browser console checks.

This PRD should provide a clear roadmap for building Textwarden. Good luck!