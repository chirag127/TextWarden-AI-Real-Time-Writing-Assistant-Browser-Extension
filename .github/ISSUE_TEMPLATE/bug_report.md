---
name: 🐞 Bug Report
abel_type: bug
about: Report an unexpected behavior or functional defect.
labels: bug, triage

---

# 🐞 Bug Report: TextWarden Integrity Check

This template ensures rapid diagnosis and resolution. **Failure to provide all requested details will result in triage delay.**

## 1. EXECUTIVE SUMMARY (BLUF)

**In one sentence, what is the unexpected behavior?**

> [Provide a concise, actionable summary here. Example: 'Grammar correction fails silently when user is on a dark-mode webpage.']


## 2. OBSERVABLE BEHAVIOR (WHAT HAPPENED)

Describe exactly what you observed when the bug occurred.

*   **Expected Result:** What should have happened according to the documentation/intent?
*   **Actual Result:** What actually happened?
*   **Impact Assessment:** (Critical, High, Medium, Low) How severely does this impact content creation quality or user workflow?


## 3. REPLICATION STEPS (THE RECIPE FOR FAILURE)

Provide precise, ordered steps to reproduce the issue reliably. If the bug is intermittent, state the observed frequency (e.g., 1 in 5 attempts).

1.  Navigate to: `[URL or Application Context]`
2.  Ensure Extension State: `[Enabled/Disabled/Specific Settings]`
3.  Action Performed: `[e.g., Typed 'Their going to the store']`
4.  Observed Failure Trigger: `[e.g., Pressed Spacebar]`


## 4. ENVIRONMENT (THE ARCHITECTURAL CONTEXT)

To ensure alignment with the Apex Toolchain standards, provide the following telemetry.

### Browser Environment

*   **Browser & Version:** (e.g., Chrome 125.0.6422.142, Firefox 126)
*   **Operating System:** (e.g., macOS Sonoma 14.5, Windows 11 Build 22621)
*   **Extension Version:** (Find in `chrome://extensions` details page or `about:debugging`)

### TextWarden Configuration

*   **Gemini Model Selected (If configurable):** (e.g., `gemini-3-pro-preview` or Default)
*   **Privacy Mode Active:** (Yes/No)
*   **Specific Custom Rules/Overrides:** (If any)


## 5. TELEMETRY & ARTIFACTS

**Attach any relevant console logs, network traffic data, or screenshots.**

### Console Logs (Crucial)

Please open the browser Developer Tools (F12) -> Console tab, reproduce the error, and paste the **entire** output here. Filter for errors/warnings related to `TextWarden`.

```log
[Paste Full Console Log Here]
```

### Network Artifacts (If relevant to API calls)

If the issue seems related to the Gemini API connection, attach HAR data or relevant failed request details.


## 🤖 AGENT DIRECTIVE CHECK

*   **AI Verification:** Has this issue been confirmed via automated integration tests in the `tests/integration/bugs` suite? (If known)
*   **Priority Assignment:** Based on severity, the initial priority should be: `[Critical/High/Medium/Low]`

--- 

*Thank you for contributing to the integrity of TextWarden. Your precision aids our recursive perfection loop.*