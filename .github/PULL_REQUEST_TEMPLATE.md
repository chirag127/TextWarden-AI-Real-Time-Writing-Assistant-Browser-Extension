```markdown
## Pull Request

Thank you for contributing to TextWarden! Before submitting this PR, please ensure the following:

### Checklist:

-   [ ] I have read the [CONTRIBUTING.md](.github/CONTRIBUTING.md) guide.
-   [ ] My code follows the project's coding style and conventions.
-   [ ] I have added unit tests for my changes (if applicable).
-   [ ] All existing tests pass.
-   [ ] I have updated the documentation (if applicable).
-   [ ] My changes have been reviewed and approved by at least one other contributor.

### Description of Changes:

<!-- Briefly describe the changes made in this pull request.  Include details about the problem being solved and the approach taken. -->

### Related Issues:

<!-- Link any related issues here.  Use the format:  `Closes #<issue_number>`.  For example: `Closes #123` -->

### Screenshots/Visuals (if applicable):

<!-- Add screenshots or other visuals to demonstrate the changes. -->

### Additional Notes:

<!-- Any other information or context that might be helpful for reviewers. -->

--- 

<details>
<summary>🤖 AI Agent Directives - TextWarden</summary>

This project is an AI-powered browser extension for enhancing written communication.  The tech stack is:

-   **Language:** JavaScript (ESNext)
-   **Framework:**  Likely using a framework like React, Vue, or Svelte for the extension's UI.  Specify which one when known.
-   **Build System:** Vite (for fast builds and hot module replacement)
-   **Extension API:** Browser Extension APIs (Manifest V3)
-   **AI Integration:**  User-provided API keys to access AI models (e.g., OpenAI, Gemini).
-   **Testing:** Vitest (Unit Tests), Playwright (E2E Tests), Biome (Linting & Formatting)

**Architectural Patterns:**

-   **Feature-Sliced Design (FSD):** Organize code by features (e.g., grammar-check, spell-check, style-suggestions), with clear separation of concerns.
-   **Clean Architecture:**
    -   Independent of Frameworks:  No framework dependency.
    -   Testable:  Easily testable code.
    -   Independent of UI: The UI can change without affecting the business logic.
    -   Independent of Database:  Data access is abstracted.
    -   Independent of External Agencies: AI API interactions are abstracted.

**Verification Commands:**

-   `npm install`: Install dependencies.
-   `npm run build`: Build the extension (creates production-ready bundle).
-   `npm run test`: Run all tests (unit and integration).
-   `npm run lint`: Run the linter and formatter (Biome).

</details>
