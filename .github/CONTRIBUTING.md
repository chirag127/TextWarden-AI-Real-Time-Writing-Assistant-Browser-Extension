# Contributing to TextWarden

First, thank you for considering contributing to TextWarden. This project adheres to the highest engineering standards to deliver a secure, performant, and reliable AI writing assistant. We welcome contributions that align with this mission.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior.

## How to Contribute

We welcome contributions in several forms, from bug reports to feature development. All contributions begin with a GitHub Issue.

- **Reporting Bugs:** If you find a bug, please create an issue using the [Bug Report Template](https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension/issues/new?template=bug_report.md). Provide as much detail as possible, including steps to reproduce, browser version, and operating system.

- **Suggesting Enhancements:** For new features or improvements, create an issue to start a discussion. This allows us to align on the technical approach before any development work begins.

- **Pull Requests:** If you have a bug fix or an approved enhancement, you can submit a Pull Request.

## Pull Request Process (FAANG Standard)

We enforce a strict, professional development workflow to maintain code quality and architectural integrity.

### 1. Fork & Branch

1.  **Fork** the repository to your own GitHub account.
2.  **Clone** your fork locally:
    bash
    git clone https://github.com/YOUR_USERNAME/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension.git
    cd TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension
    
3.  Create a new branch with a descriptive name based on the issue number and feature:
    bash
    # Example for a new feature
    git checkout -b feature/123-real-time-thesaurus

    # Example for a bug fix
    git checkout -b fix/456-grammar-engine-crash
    

### 2. Set Up The Development Environment

This project uses Node.js and `npm` for dependency management. Ensure you have Node.js v18 or later.

bash
npm install


To run the extension in development mode:

bash
npm run dev


### 3. Adhere to Code Quality Standards

- **Architecture:** The project follows **Feature-Sliced Design (FSD)**. All new code must adhere to this pattern for maintainability and scalability.
- **Linting & Formatting:** We use **BiomeJS** for ultra-fast linting and formatting. Before committing, run the following command to ensure your code complies with the project's style guide:
    bash
    npm run format:fix
    npm run lint:fix
    
- **Commit Messages:** All commit messages **MUST** follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This is non-negotiable as it automates changelog generation and versioning.
    - `feat:` for new features.
    - `fix:` for bug fixes.
    - `docs:` for documentation changes.
    - `style:` for code style changes (formatting, etc.).
    - `refactor:` for code changes that neither fix a bug nor add a feature.
    - `test:` for adding or correcting tests.
    - `chore:` for build process or auxiliary tool changes.

### 4. Write Comprehensive Tests

- All new features must be accompanied by **unit tests** (using Vitest) to cover the logic.
- All bug fixes must include a **regression test** to prevent the issue from recurring.
- Critical user flows should have **end-to-end tests** (using Playwright).
- Ensure all tests pass before submitting your pull request:
    bash
    npm test
    

### 5. Submit the Pull Request

1.  Push your branch to your fork:
    bash
    git push origin feature/123-real-time-thesaurus
    
2.  Open a Pull Request from your forked repository to the `main` branch of the original repository.
3.  Fill out the **Pull Request Template** completely. Link the PR to the relevant issue using keywords like `Closes #123`.
4.  Provide a clear and concise description of the changes and the reasoning behind them.
5.  Await a code review. Be prepared to make changes based on feedback.

## Core Engineering Principles

Contributions should reflect these foundational principles:

-   **SOLID:** Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
-   **DRY:** Don't Repeat Yourself.
-   **YAGNI:** You Aren't Gonna Need It.

Thank you for contributing to the future of privacy-first, AI-powered writing assistance.