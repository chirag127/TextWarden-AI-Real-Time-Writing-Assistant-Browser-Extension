# Security Policy

## Supported Versions

We are committed to maintaining a secure product. Currently, only the latest version of TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension is actively maintained and supported with security patches.

## Reporting a Vulnerability

We take security very seriously. If you discover any security vulnerabilities within TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension, please report it to us immediately. We appreciate your help in keeping our community safe.

To report a vulnerability, please:

1.  **Do NOT** disclose the vulnerability publicly until it has been resolved.
2.  **DO** use the secure reporting channel:
    *   **Email:** [security@example.com](mailto:security@example.com) (Please replace with a real security contact email).
    *   **Subject:** `Security Vulnerability Report: [Project Name]`
    *   **Content:** Provide a clear and concise description of the vulnerability, including:
        *   The affected version(s).
        *   Detailed steps to reproduce the vulnerability.
        *   Any supporting evidence (screenshots, logs, code snippets).
        *   Your recommended mitigation or fix (if known).

We will acknowledge receipt of your report within **48 hours** and will provide an estimated timeline for resolution.

## Vulnerability Disclosure Policy

Once a vulnerability is reported and confirmed, we will work diligently to address it. We will follow these principles:

*   **Triaging:** We will assess the severity and impact of the reported vulnerability.
*   **Remediation:** We will develop and test a fix.
*   **Disclosure:** We will work with the reporter to determine a coordinated public disclosure timeline, typically after a fix is available. This allows users to update and protect themselves.
*   **Acknowledgement:** We will acknowledge the contributions of security researchers who report valid vulnerabilities in good faith.

## Security Best Practices

As a user of TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension, please adhere to the following security best practices:

*   **Install Updates Promptly:** Always keep the extension updated to the latest version to benefit from the most recent security patches.
*   **Review Permissions:** Be mindful of the permissions requested by browser extensions. While TextWarden is designed with privacy and security as top priorities, always be aware of what an extension can access.
*   **API Key Security:** If you are developing custom integrations or using TextWarden in a specific enterprise context requiring API keys (e.g., Google Gemini API), ensure these keys are stored securely and are not exposed in client-side code or public repositories.
*   **Browser Security:** Maintain good general browser security hygiene, including using strong, unique passwords, enabling two-factor authentication where possible, and being cautious of phishing attempts.

## DevSecOps Protocol Adherence

This project adheres to the following DevSecOps principles:

*   **Zero Trust:** All inputs are considered untrusted and are sanitized. This includes user inputs, API responses, and any data processed by the extension.
*   **Supply Chain Security:** Dependency audits are performed regularly, and Software Bill of Materials (SBOMs) are generated to track all components.
*   **Fail Fast:** Errors and invalid states are detected and reported immediately to prevent propagation of security risks.
*   **Data Encryption:** Sensitive data, if handled and stored, will be encrypted at rest and in transit, adhering to industry-standard encryption protocols.

Thank you for helping us maintain the security and integrity of TextWarden-AI-Real-Time-Writing-Assistant-Browser-Extension.