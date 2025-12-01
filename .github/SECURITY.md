# Security Policy for TextWarden

## 1. Our Commitment to Security

TextWarden is engineered with a **privacy-first and security-by-design** philosophy. As a browser extension that processes user input, we recognize the immense responsibility we have to protect our users. The security of our codebase, infrastructure, and user data is our highest priority. This document outlines our security procedures and how to report vulnerabilities.

## 2. Supported Versions

Security updates are only applied to the most recent version of the TextWarden extension available on official browser web stores (e.g., Chrome Web Store, Firefox Add-ons). We strongly advise all users to keep their browsers and extensions updated to ensure they have the latest security patches.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < 1.0.0 | :x:                |

## 3. Reporting a Vulnerability

We take all security reports seriously. If you believe you have discovered a security vulnerability in TextWarden, please report it to us privately to protect our users.

**Do not disclose the vulnerability publicly until a resolution has been issued.**

### How to Report

Please use GitHub's private vulnerability reporting feature to submit your findings.

**[Report a private vulnerability here](https://github.com/chirag127/TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension/security/advisories/new)**

### What to Include

To help us resolve the issue quickly, please provide a detailed report including:

*   **A clear description** of the vulnerability and its potential impact.
*   **Precise steps to reproduce** the issue, including any required environment setup, code snippets, or proof-of-concept exploits.
*   The **version** of the extension and browser you were using.
*   Any **screenshots or logs** that could aid in the investigation.

### Our Process

1.  **Acknowledgment:** We will acknowledge receipt of your report within 48 business hours.
2.  **Investigation:** Our team will investigate the report to validate the vulnerability.
3.  **Updates:** We will provide regular updates on our progress.
4.  **Remediation:** We will work to release a patch as quickly as possible. The timeline will depend on the complexity of the vulnerability.
5.  **Disclosure:** Once the vulnerability is patched and the update is available, we will coordinate with you on public disclosure if desired.

## 4. Security Design Principles

*   **Principle of Least Privilege:** TextWarden's `manifest.json` requests only the minimum permissions required for its core functionality. We avoid broad permissions like `<all_urls>`.
*   **Data Minimization & Ephemeral Processing:** TextWarden is designed to be stateless. We **do not** store, log, or transmit any user-written content or personally identifiable information (PII) to our servers. All AI processing is done via ephemeral, anonymized requests to the Google Gemini API.
*   **API Key Security:** API keys are managed securely and are never exposed on the client-side.
*   **Dependency Management:** We use tools like Dependabot and `npm audit` to continuously monitor our dependencies for known vulnerabilities and apply patches promptly.
*   **Content Security Policy (CSP):** We enforce a strict CSP to mitigate the risk of Cross-Site Scripting (XSS) and other injection attacks.

Thank you for helping us keep TextWarden and our users safe.