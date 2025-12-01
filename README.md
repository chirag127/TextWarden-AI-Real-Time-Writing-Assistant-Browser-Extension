# TextWarden: AI-Powered Real-Time Writing Assistant

[![Build Status](https://img.shields.io/github/actions/workflow/ci.yml?style=flat-square&logo=github&label=Build&user=chirag127&repo=TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension)](https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension/actions/workflows/ci.yml)
[![Code Coverage](https://img.shields.io/codecov/c/github/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension?style=flat-square&label=Coverage&user=chirag127&repo=TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension)](https://app.codecov.io/gh/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension)
[![Tech Stack](https://img.shields.io/badge/Tech%20Stack-TypeScript%2C%20React%2C%20Vite%2C%20TailwindCSS-blue?style=flat-square&logo=typescript&logoColor=white)](https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension)
[![Lint/Format](https://img.shields.io/badge/Lint%2FFormat-Biome-green?style=flat-square&logo=biome&label=Lint&user=chirag127&repo=TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension)](https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension)
[![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg?style=flat-square)](https://creativecommons.org/licenses/by-nc/4.0/)
[![GitHub Stars](https://img.shields.io/github/stars/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension?style=flat-square&logo=github)](https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension/stargazers)


⭐ Star this Repo

## TextWarden: Elevate Your Writing Instantly

TextWarden is a privacy-focused AI writing assistant browser extension. It provides real-time grammar, style, and clarity enhancements, powered by the Google Gemini API. Built on Manifest V3, TextWarden ensures enterprise-grade security and performance for all users.

## Architecture

mermaid
graph LR
    subgraph Browser Extension
        A[Manifest V3] --> B(Background Script)
        B --> C{Content Script}
        C --> D(React Components)
        D --> E(TailwindCSS)
        E --> F(Google Gemini API)
    end
    B -- Communication --> C
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#ccf,stroke:#333,stroke-width:2px
    style C fill:#ccf,stroke:#333,stroke-width:2px
    style D fill:#ccf,stroke:#333,stroke-width:2px
    style E fill:#ccf,stroke:#333,stroke-width:2px
    style F fill:#f9f,stroke:#333,stroke-width:2px


## Table of Contents

-   [AI Agent Directives](#ai-agent-directives)
-   [Development Standards](#development-standards)

<details>
<summary>🤖 AI Agent Directives</summary>

### Tech Stack Definition

*   **Programming Languages:** TypeScript (Strict), JavaScript
*   **Frontend Framework:** React
*   **Build Tool:** Vite
*   **Styling:** TailwindCSS v4
*   **API Integration:** Google Gemini API
*   **Manifest:** Manifest V3
*   **Linter/Formatter:** Biome
*   **Testing:** Vitest (Unit), Playwright (E2E)
*   **Architecture:** Feature-Sliced Design (FSD)

### Architectural Patterns

*   **Feature-Sliced Design (FSD):** Structure the application into independent features, layers, and slices for enhanced maintainability and scalability.
*   **SOLID Principles:** Adhere to SOLID principles to create robust and reusable components.
*   **DRY (Don't Repeat Yourself):** Avoid code duplication by creating reusable functions and components.
*   **YAGNI (You Ain't Gonna Need It):** Focus on implementing only the necessary features.

### Verification Commands

*   **Linting:** `biome check .`
*   **Formatting:** `biome format .`
*   **Unit Tests:** `npm run test`
*   **E2E Tests:** `npm run test:e2e`
*   **Build:** `npm run build`
</details>

## Development Standards

### Setup

1.  Clone the repository:
    bash
    git clone https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension.git
    cd TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension
    
2.  Install dependencies:
    bash
    npm install
    

### Scripts

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Start development server                     |
| `npm run build`    | Build the extension for production         |
| `npm run test`     | Run unit tests                               |
| `npm run test:e2e` | Run end-to-end tests                         |
| `npm run lint`     | Run Biome linter                             |
| `npm run format`   | Format code with Biome                       |

### Principles

*   **SOLID:** Adhere to SOLID principles for a maintainable codebase.
*   **DRY:** Avoid code duplication.
*   **YAGNI:** Implement only the required features.
