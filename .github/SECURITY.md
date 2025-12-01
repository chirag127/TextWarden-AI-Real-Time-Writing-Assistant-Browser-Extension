# Security Policy for TextWarden-AI-Writing-Assistant-Browser-Extension

At TextWarden, the security of our users and their data is paramount. We are committed to maintaining a robust and secure browser extension. This document outlines our security policy and provides guidelines for reporting vulnerabilities.

## 1. Reporting a Vulnerability

We appreciate the efforts of security researchers and the community in helping us maintain a secure product. If you discover a security vulnerability in TextWarden, we ask that you report it to us immediately and responsibly.

**Please DO NOT open a public GitHub issue.**

To report a vulnerability, please send an email to: `security@textwarden.com` (placeholder - replace with actual security contact).

**In your report, please include:**

*   **Clear Description:** A detailed description of the vulnerability, its potential impact, and the affected components.
*   **Reproduction Steps:** Step-by-step instructions to reproduce the vulnerability. This is crucial for us to verify and address the issue efficiently. Include any specific configurations, API keys, or conditions required.
*   **Proof of Concept (PoC):** If possible, provide a Proof of Concept (PoC) code or demonstration that clearly illustrates the vulnerability.
*   **Severity Assessment:** Your assessment of the vulnerability's severity (e.g., Critical, High, Medium, Low), along with any relevant CVSS scores if applicable.
*   **Your Contact Information:** We may need to contact you for further clarification.

## 2. Our Commitment to Responsible Disclosure

We adhere to responsible disclosure principles and ask reporters to do the same. We commit to:

*   **Prompt Acknowledgment:** We will acknowledge receipt of your report within 2 business days.
*   **Timely Investigation:** We will investigate your report promptly and provide an estimated timeline for resolution.
*   **Communication:** We will keep you informed of our progress throughout the vulnerability resolution process.
*   **Public Disclosure (Post-Fix):** Once the vulnerability is resolved, we will disclose it publicly via GitHub Security Advisories, crediting the discoverer (unless anonymity is requested).

## 3. Supported Versions

We are committed to providing security updates for the following versions of TextWarden:

*   **Latest Major Version:** We actively maintain and provide security patches for the latest major release of the extension.
*   **Previous Major Version:** Security patches for the immediately preceding major version may be provided on a case-by-case basis, depending on the severity of the vulnerability and resource availability. However, we strongly encourage users to update to the latest version for the best security posture.

Versions older than the two most recent major releases are **not officially supported** for security updates.

## 4. General Security Practices

TextWarden incorporates robust security practices into its development lifecycle:

*   **Input Validation:** Strict validation and sanitization of all user inputs to prevent common injection attacks (XSS, etc.).
*   **Least Privilege:** Following the principle of least privilege in both code execution and permission requests within the browser extension.
*   **Dependency Scanning:** Regular scanning of third-party dependencies for known vulnerabilities using automated tools.
*   **Content Security Policy (CSP):** A strong CSP is enforced to mitigate cross-site scripting (XSS) and data injection attacks.
*   **Data Encryption:** Sensitive data (e.g., API keys, if stored locally) is handled with appropriate encryption and user control.
*   **Privacy-First Design:** The extension is designed with privacy as a core principle, minimizing data collection and processing locally where possible.

## 5. Security Advisories

All past and future security advisories for TextWarden will be published on our [GitHub Security Advisories page](https://github.com/TextWarden/TextWarden-AI-Writing-Assistant-Browser-Extension/security/advisories).

We thank you for helping us make TextWarden a safer and more reliable tool for everyone.