# 🔒 Security Policy for TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension

This document outlines the security model, vulnerability reporting procedures, and best practices for maintaining the integrity and privacy of the TextWarden extension.

## 1. Security Commitment: Privacy-First Architecture

TextWarden is designed with a **Zero Trust** approach, particularly concerning user input and interaction with the Google Gemini API. Our core commitment is that user data processed by the extension remains local or is handled via the most secure, non-logging endpoints available, adhering strictly to the security posture required by Manifest V3.

### Architectural Security Principles Enforced:

1.  **Input Sanitization:** All data transmitted to the Gemini API is aggressively validated and sanitized on the client-side and server-side (if a proxy exists) to prevent injection attacks (XSS, prompt injection). **(OWASP Top 10 2025 Focus)**.
2.  **Key Management:** API keys are never hardcoded. They are managed via secure environment variables during the build process and are **never** shipped to the client bundle.
3.  **Manifest V3 Compliance:** Strict adherence to MV3 rules regarding background service workers, network requests, and content script isolation.
4.  **Data Minimization:** Only textual content required for linguistic analysis is sent; no PII or historical navigation data is collected or transmitted unless explicitly consented to for feature improvement.

## 2. Supported Versions

| Version Range | Status | Security Updates | Reporting Path |
| :--- | :--- | :--- | :--- |
| `v2.x.x` (Current) | Maintained | Weekly | Immediate |
| `v1.x.x` | Legacy | None | Upgrade Recommended |

## 3. Vulnerability Reporting

We value external security researchers. If you discover a security vulnerability, please follow the process below to ensure responsible disclosure.

### 3.1. Responsible Disclosure Process

**DO NOT** disclose vulnerabilities publicly (e.g., GitHub Issues, public forums) before coordinating with the maintainers.

1.  **Report:** Create a **private security report** via GitHub's private vulnerability reporting feature. This ensures that only core maintainers have access to the details.
2.  **Details:** Provide sufficient detail for reproduction, including:
    *   The affected version(s).
    *   Steps to reproduce the vulnerability.
    *   The potential impact.
3.  **Acknowledgement:** We will acknowledge receipt of your report within **48 hours**.
4.  **Remediation:** We aim to deploy a fix for critical and high-severity issues within **14 days** of confirmation. We will coordinate with you before public disclosure.
5.  **Public Disclosure:** Public disclosure will occur after a patch has been released and sufficient time has passed for users to update.

### 3.2. Severity Classification

We classify issues based on potential impact on user data confidentiality, integrity, and extension availability:

*   **Critical:** Remote Code Execution in Service Worker, Complete API Key Leakage, Massive Data Exfiltration.
*   **High:** Prompt Injection leading to unauthorized API calls, CSP bypass, Persistent Cross-Site Scripting (XSS).
*   **Medium:** Information disclosure of non-sensitive runtime data, minor denial of service.
*   **Low:** Informational findings, best practice violations without direct exploit path.

## 4. Automated Security Scanning

This repository enforces automated security checks in the CI pipeline (`.github/workflows/ci.yml`):

*   **Dependency Auditing:** Uses **Dependabot/Snyk** integration to scan all NPM dependencies for known CVEs on every push.
*   **Static Analysis:** **Biome** is configured with strict rulesets to catch common JavaScript security anti-patterns before merge.
*   **Supply Chain Integrity:** A **Software Bill of Materials (SBOM)** is generated as part of the release artifact process to track all transitive dependencies.

## 5. Development Security Guidelines

Developers working on this project must adhere to the following guidelines:

*   **No Secrets in Code:** API keys, tokens, or credentials must ONLY be loaded via runtime environment variables or secure secrets management (e.g., GitHub Secrets).
*   **Principle of Least Privilege:** Content scripts and service workers are designed with the minimum necessary permissions (`permissions` in `manifest.json`).
*   **External Code:** Avoid loading unvetted third-party libraries. All additions must pass the dependency audit step in CI.
*   **Error Handling:** Utilize robust `try...catch` blocks around I/O operations to prevent state corruption or unexpected shutdowns.