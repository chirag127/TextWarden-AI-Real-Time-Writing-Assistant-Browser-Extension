# Contributing to TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension

Welcome to **TextWarden**, an enterprise-grade, privacy-centric AI-powered browser extension designed for superior linguistic precision. We're thrilled you're considering contributing to this project. Your expertise and efforts are invaluable in making TextWarden even better.

This guide outlines the standards and procedures for contributing to TextWarden, ensuring a smooth and efficient collaboration for everyone involved.

## 🚀 Getting Started

### Code of Conduct
We are committed to fostering an open and welcoming environment. Please review and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) (implicit, as it's not a required file, but good practice) to ensure a positive experience for all contributors.

### Prerequisites
Before you begin, ensure you have the following installed:

*   **Node.js** (LTS version)
*   **pnpm** (preferred package manager for speed and efficiency)
*   **Git**

### Setup Instructions

1.  **Fork the repository:** Start by forking the `TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension` repository to your GitHub account.
2.  **Clone your forked repository:**
    ```bash
    git clone https://github.com/YOUR_GITHUB_USERNAME/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension.git
    cd TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension
    ```
3.  **Install dependencies:**
    ```bash
    pnpm install
    ```
4.  **Start the development server:**
    ```bash
    pnpm dev
    ```
    This will typically build the extension for development and watch for changes. Refer to the project's `README.md` for specific instructions on loading the extension into your browser during development (e.g., via `WXT`).

## 🛠️ Development Workflow

### Branching Strategy
All contributions should be made via feature branches. Please follow this convention:

*   **`main`**: The stable, production-ready branch. Do not commit directly to `main`.
*   **`feature/<descriptive-name>`**: For new features (e.g., `feature/add-dark-mode`).
*   **`fix/<descriptive-name>`**: For bug fixes (e.g., `fix/grammar-engine-bug`).
*   **`docs/<descriptive-name>`**: For documentation updates.

Create your branch from the latest `main` branch:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### Commit Guidelines
We enforce **Conventional Commits** for clear, semantic commit history. This helps with automated changelog generation and semantic versioning.

*   **Format:** `<type>(<scope>): <description>`
    *   `type`: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
    *   `scope` (optional): The part of the codebase affected (e.g., `popup`, `background`, `api`).
    *   `description`: A concise, imperative statement.

*   **Examples:**
    *   `feat(grammar): add real-time passive voice detection`
    *   `fix(popup): correct settings persistence issue`
    *   `docs(readme): update installation section`

### Coding Standards

TextWarden adheres to the highest coding standards, enforced by `Biome` for linting and formatting, and strict TypeScript rules. We champion:

*   **SOLID Principles**: Ensuring maintainability, flexibility, and extensibility.
*   **DRY (Don't Repeat Yourself)**: Avoid code duplication through modular design.
*   **KISS (Keep It Simple, Stupid)**: Prioritize clarity and simplicity over unnecessary complexity.
*   **Clean Code**: Write code that is easy to read, understand, and modify.
*   **Self-Documenting Code**: Code should explain itself, minimizing the need for comments (comments are reserved for explaining *why*, not *what*).
*   **TypeScript Strictness**: Leverage TypeScript's powerful type system to catch errors early.

Before committing, always run:

```bash
pnpm run lint
pnpm run format
```

### Testing

All new features and bug fixes **must** be accompanied by comprehensive tests. We aim for high test coverage to ensure reliability and prevent regressions.

*   **Unit Tests**: Use `Vitest` for individual functions and components.
*   **End-to-End (E2E) Tests**: Use `Playwright` for testing user flows within the browser extension.

To run tests:

```bash
pnpm test
```

Ensure all tests pass and aim for 100% test coverage for new or modified code paths.

## 📤 Submitting Changes

### Pull Request Process

1.  **Sync your branch:** Before creating a Pull Request (PR), ensure your branch is up-to-date with the `main` branch:
    ```bash
    git checkout feature/your-feature-name
    git pull origin main
    git push origin feature/your-feature-name
    ```
2.  **Create a Pull Request:** Open a PR from your feature branch to the `main` branch of the upstream repository.
3.  **Fill out the template:** Our PR template (`.github/PULL_REQUEST_TEMPLATE.md`) will guide you through providing necessary information, including a clear description of your changes, motivation, and testing details.
4.  **Address feedback:** Participate in the code review process, respond to comments, and make necessary adjustments. Our CI/CD pipeline will automatically run linting and tests to ensure code quality.

## 🐞 Reporting Issues and Requesting Features

*   **Bugs**: If you find a bug, please open an issue using our [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md). Provide clear steps to reproduce, expected behavior, and actual behavior.
*   **Feature Requests**: Have an idea for a new feature or improvement? Open an issue and describe your proposal in detail. We appreciate well-thought-out suggestions.

## 🔒 Security Vulnerabilities

If you discover a security vulnerability, please **do not** open a public issue. Instead, refer to our [Security Policy](.github/SECURITY.md) for instructions on how to responsibly disclose it. We take security seriously and appreciate your efforts to help keep TextWarden secure.

## 📄 License

By contributing to TextWarden, you agree that your contributions will be licensed under the [CC BY-NC License](LICENSE). Please ensure you are authorized to contribute the code you submit.

Thank you for making TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension better!