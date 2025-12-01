<!-- Hero Banner/Logo Placeholder -->
<p align="center">
  <img src="https://assets-global.website-files.com/65306353380026e632d4317f/653d9e802098679461f8797b_TextWarden_Logo.png" alt="TextWarden Logo" width="150" height="150">
</p>
<h1 align="center">TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension</h1>

<p align="center">
  <!-- Badges - All flat-square, chirag127, dynamic repo name -->
  <a href="https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension/ci.yml?branch=main&style=flat-square&label=Build%20Status" alt="Build Status">
  </a>
  <a href="https://codecov.io/gh/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension">
    <img src="https://img.shields.io/codecov/c/github/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension?style=flat-square&token=YOUR_CODECOV_TOKEN" alt="Code Coverage">
  </a>
  <a href="https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension">
    <img src="https://img.shields.io/badge/Tech_Stack-TS%20%7C%20React%20%7C%20Vite%20%7C%20TailwindCSS%20%7C%20WXT-007ACC?style=flat-square" alt="Tech Stack">
  </a>
  <a href="https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension">
    <img src="https://img.shields.io/badge/Code_Quality-BiomeJS-3E8EFF?style=flat-square" alt="Code Quality">
  </a>
  <a href="https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-CC_BY--NC_4.0-lightgrey?style=flat-square" alt="License">
  </a>
  <a href="https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension">
    <img src="https://img.shields.io/github/stars/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension?style=flat-square&cacheSeconds=3600" alt="GitHub Stars">
  </a>
</p>

<p align="center">
  <a href="https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension">
    <img src="https://img.shields.io/badge/Star%20%E2%AD%90%20this%20Repo-lightgrey?style=social&label=Stars" alt="Star this Repo">
  </a>
</p>

## 🚀 Overview

TextWarden is a privacy-first AI writing assistant browser extension, engineered to deliver real-time grammar, style, and clarity enhancements. Leveraging the advanced Google Gemini API, it provides intelligent suggestions directly in your browser, ensuring your communication is always precise and professional. Built on Manifest V3, TextWarden offers enterprise-grade security, performance, and a seamless user experience.

## 🌟 Features

*   **Real-time AI-Powered Suggestions:** Instant feedback on grammar, spelling, punctuation, style, and clarity using Google Gemini.
*   **Privacy-First Design:** Employs local processing where possible and minimal data transmission for AI interactions.
*   **Manifest V3 Compliant:** Ensures enhanced security, performance, and future-proof compatibility with modern browser standards.
*   **Contextual Writing Enhancement:** Provides intelligent recommendations tailored to the writing context.
*   **Configurable Settings:** Customize AI assistance levels and preferences.
*   **Seamless Browser Integration:** Works across various web applications and text input fields.

## 🏗️ Architecture

TextWarden adheres to the **Feature-Sliced Design (FSD)** methodology, promoting strict layer isolation and feature-driven development for scalability and maintainability. This structure ensures that features are independent and reusable, minimizing cross-cutting concerns.

mermaid
graph TD
    A[App Layer] --> B(Pages/Screens)
    B --> C(Widgets)
    C --> D(Features)
    D --> E(Entities)
    E --> F(Shared/UI Kit)
    F --> G(Processes/Config)

    subgraph Layers
        A -- Provides global logic & routing --> B
        B -- Composes widgets into full views --> C
        C -- Composes features into meaningful UI blocks --> D
        D -- Implements specific business capabilities --> E
        E -- Defines domain objects & data structures --> F
        F -- Contains reusable UI components & utilities --> G
        G -- Handles inter-layer communication & configurations --> E
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bfb,stroke:#333,stroke-width:2px
    style D fill:#fbe,stroke:#333,stroke-width:2px
    style E fill:#fef,stroke:#333,stroke-width:2px
    style F fill:#eef,stroke:#333,stroke-width:2px
    style G fill:#ffb,stroke:#333,stroke-width:2px


## 📋 Table of Contents

*   [🚀 Overview](#-overview)
*   [🌟 Features](#-features)
*   [🏗️ Architecture](#️-architecture)
*   [📋 Table of Contents](#-table-of-contents)
*   [🤖 AI Agent Directives](#-ai-agent-directives)
*   [⚙️ Getting Started](#️-getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Development Setup](#development-setup)
    *   [Building the Extension](#building-the-extension)
    *   [Loading into Browser](#loading-into-browser)
*   [📚 Scripts & Commands](#-scripts--commands)
*   [🤝 Contributing](#-contributing)
*   [🛡️ Security](#️-security)
*   [📜 License](#-license)
*   [📞 Contact](#-contact)

## 🤖 AI Agent Directives

<details>
<summary><b>SYSTEM: APEX TECHNICAL AUTHORITY & ELITE ARCHITECT (DECEMBER 2025 EDITION)</b></summary>
<br>

# SYSTEM: APEX TECHNICAL AUTHORITY & ELITE ARCHITECT (DECEMBER 2025 EDITION)

## 1. IDENTITY & PRIME DIRECTIVE
**Role:** You are a Senior Principal Software Architect and Master Technical Copywriter with **40+ years of elite industry experience**. You operate with absolute precision, enforcing FAANG-level standards and the wisdom of "Managing the Unmanageable."
**Context:** Current Date is **December 2025**. You are building for the 2026 standard.
**Output Standard:** Deliver **EXECUTION-ONLY** results. No plans, no "reporting"—only executed code, updated docs, and applied fixes.
**Philosophy:** "Zero-Defect, High-Velocity, Future-Proof."

---

## 2. INPUT PROCESSING & COGNITION
*   **SPEECH-TO-TEXT INTERPRETATION PROTOCOL:**
    *   **Context:** User inputs may contain phonetic errors (homophones, typos).
    *   **Semantic Correction:** **STRICTLY FORBIDDEN** from executing literal typos. You must **INFER** technical intent based on the project context.
    *   **Logic Anchor:** Treat the `README.md` as the **Single Source of Truth (SSOT)**.
*   **MANDATORY MCP INSTRUMENTATION:**
    *   **No Guessing:** Do not hallucinate APIs.
    *   **Research First:** Use `linkup`/`brave` to search for **December 2025 Industry Standards**, **Security Threats**, and **2026 UI Trends**.
    *   **Validation:** Use `docfork` to verify *every* external API signature.
    *   **Reasoning:** Engage `clear-thought-two` to architect complex flows *before* writing code.

---

## 3. CONTEXT-AWARE APEX TECH STACKS (LATE 2025 STANDARDS)
**Directives:** This project, `TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension`, is a modern TypeScript-based browser extension leveraging AI.

*   **PRIMARY SCENARIO: WEB / APP / EXTENSION (TypeScript)**
    *   **Stack:** This project leverages **TypeScript 6.x (Strict)**, **React 19+** for the UI, **Vite 7** (with Rolldown) for blazing-fast development and optimized builds, and **TailwindCSS v4** for utility-first styling. **WXT** is used as the browser extension framework for Manifest V3 compliance and streamlined development across browsers.
    *   **Architecture:** Adheres strictly to **Feature-Sliced Design (FSD)**, ensuring atomic, independent features, robust state management, and clear separation of concerns across `app`, `pages`, `widgets`, `features`, `entities`, and `shared` layers.
    *   **AI Integration:** Deeply integrated with **Google Gemini API** (`gemini-3-pro` by default) for real-time text analysis, grammar, style, and clarity enhancements. Prioritize modular design, secure API key management, robust error handling, and privacy-preserving data transmission for all AI model interactions.
    *   **State Management:** Utilizes **Signals** (e.g., Preact Signals, Qwik Signals, or similar pattern with React `useSyncExternalStore`) for reactive and performant state management.

*   **SECONDARY SCENARIO A: SYSTEMS / PERFORMANCE (Low Level) - *Not applicable for this project's primary function. Reference only.***
    *   **Stack:** Rust (Cargo) or Go (Modules).
    *   **Lint:** Clippy / GolangCI-Lint.
    *   **Architecture:** Hexagonal Architecture (Ports & Adapters).

*   **SECONDARY SCENARIO B: DATA / AI / SCRIPTS (Python) - *Not applicable for this project's primary function. Reference only.***
    *   **Stack:** uv (Manager), Ruff (Linter), Pytest (Test).
    *   **Architecture:** Modular Monolith or Microservices.

---

## 4. DEVELOPMENT STANDARDS & VERIFICATION PROTOCOLS
*   **CODE QUALITY & CONSISTENCY:**
    *   **Linter/Formatter:** **BiomeJS** is the sole source of truth for all code formatting and linting. Auto-fix on commit is mandatory.
    *   **TypeScript Strictness:** All TypeScript code **MUST** pass with `strict: true` and no implicit any.
    *   **Testing Frameworks:**
        *   **Unit/Component Tests:** **Vitest** for all unit tests and isolated component tests.
        *   **End-to-End (E2E) Tests:** **Playwright** for robust, real-browser E2E testing of extension functionality and UI interactions.
*   **ARCHITECTURAL PRINCIPLES:**
    *   **Feature-Sliced Design (FSD):** Adhere to FSD for clear separation of concerns, scalability, and maintainability.
    *   **SOLID Principles:** Ensure all components and modules adhere to Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.
    *   **DRY (Don't Repeat Yourself):** Avoid redundant code; abstract common functionalities.
    *   **YAGNI (You Ain't Gonna Need It):** Implement only features that are currently required. Avoid premature optimization or over-engineering.
*   **VERIFICATION COMMANDS:**
    *   **Installation:** `pnpm install` (or `npm install` if pnpm isn't preferred)
    *   **Linting & Formatting:** `pnpm biome check --apply-unsafe`
    *   **Unit Tests:** `pnpm vitest run`
    *   **E2E Tests:** `pnpm playwright test`
    *   **Type Checking:** `pnpm tsc --noEmit`
    *   **Build:** `pnpm build` (generates production-ready extension)
    *   **Dev Server:** `pnpm dev`
*   **CODE REVIEWS:** All code **MUST** pass through a peer review process, adhering to the CONTRIBUTING.md guidelines.

---

## 5. SECURITY & COMPLIANCE
*   **Manifest V3:** Strict adherence to Manifest V3 permissions and security best practices for browser extensions.
*   **CSP (Content Security Policy):** Rigorous CSP implementation to mitigate XSS and data injection attacks.
*   **API Key Management:** Environment variables and secure backend for sensitive API keys. Never commit API keys to source control.
*   **Dependency Audits:** Regular audits of `package.json` dependencies for vulnerabilities using `pnpm audit` or equivalent.

---

## 6. DOCUMENTATION & KNOWLEDGE TRANSFER
*   **Self-Documenting Code:** Prioritize clear, concise code that explains its intent.
*   **JSDoc/TSDoc:** Comprehensive TSDoc for all public APIs, components, and utility functions.
*   **Up-to-Date README:** The `README.md` is the primary source of operational truth.

</details>

## ⚙️ Getting Started

Follow these instructions to get a copy of TextWarden up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18.x or higher)
*   pnpm (recommended package manager) or npm/yarn
*   Git
*   Google Gemini API Key (obtain from [Google AI Studio](https://ai.google.dev/))

### Installation

1.  **Clone the repository:**
    bash
    git clone https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension.git
    cd TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension
    

2.  **Install dependencies:**
    bash
    pnpm install
    
    (or `npm install` / `yarn install`)

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    
    VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
    

### Development Setup

To run the extension in development mode with hot-reloading:

bash
pnpm dev


This will build the extension and watch for changes. The output will indicate where the unpacked extension is located (e.g., `dist`).

### Building the Extension

For a production-ready build:

bash
pnpm build


This command compiles the project into the `dist` directory, optimized for performance.

### Loading into Browser

After building (either `dev` or `build`):

#### Chrome

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable "Developer mode" in the top right corner.
3.  Click "Load unpacked".
4.  Select the `dist` directory from your cloned repository.
5.  The TextWarden icon should now appear in your browser toolbar.

#### Firefox

1.  Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2.  Click "Load Temporary Add-on...".
3.  Select the `manifest.json` file inside the `dist` directory.
4.  The TextWarden icon should now appear in your browser toolbar.

## 📚 Scripts & Commands

| Command                     | Description                                                                 |
| :-------------------------- | :-------------------------------------------------------------------------- |
| `pnpm dev`                  | Starts the development server with hot-reloading.                           |
| `pnpm build`                | Builds the extension for production.                                        |
| `pnpm biome check`          | Lints and formats all source code using BiomeJS.                            |
| `pnpm biome check --apply`  | Applies automatic fixes suggested by BiomeJS.                               |
| `pnpm biome check --apply-unsafe` | Applies automatic fixes including potentially unsafe ones.                  |
| `pnpm tsc --noEmit`         | Performs TypeScript type checking without emitting output.                  |
| `pnpm vitest run`           | Runs all unit and component tests.                                          |
| `pnpm vitest watch`         | Runs unit/component tests in watch mode.                                    |
| `pnpm playwright test`      | Runs end-to-end tests using Playwright.                                     |
| `pnpm test`                 | Executes both `vitest` and `playwright` tests.                              |

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension/blob/main/.github/CONTRIBUTING.md) for guidelines on how to submit pull requests, report bugs, and suggest features.

## 🛡️ Security

For information on security practices and how to report vulnerabilities, please refer to our [SECURITY.md](https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension/blob/main/.github/SECURITY.md) document. We prioritize the security and privacy of our users.

## 📜 License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension/blob/main/LICENSE) License.

## 📞 Contact

For questions or support, please open an issue on the GitHub repository.
