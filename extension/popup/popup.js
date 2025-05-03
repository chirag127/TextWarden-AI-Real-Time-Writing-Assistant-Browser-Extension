/**
 * TextWarden Popup Script
 *
 * This script handles the popup UI functionality.
 *
 * @author Chirag Singhal (chirag127)
 */

document.addEventListener("DOMContentLoaded", async () => {
    // Get UI elements
    const enableToggle = document.getElementById("enableToggle");
    const statusText = document.getElementById("statusText");
    const grammarCheck = document.getElementById("grammarCheck");
    const spellingCheck = document.getElementById("spellingCheck");
    const styleCheck = document.getElementById("styleCheck");
    const clarityCheck = document.getElementById("clarityCheck");
    const correctionsCount = document.getElementById("correctionsCount");
    const suggestionsCount = document.getElementById("suggestionsCount");
    const resetStats = document.getElementById("resetStats");
    const apiKeyStatus = document.getElementById("apiKeyStatus");
    const apiKeyStatusText = document.getElementById("apiKeyStatusText");
    const goToSettings = document.getElementById("goToSettings");
    const openSettings = document.getElementById("openSettings");
    const disableSiteBtn = document.getElementById("disableSiteBtn");
    const siteStatusText = document.getElementById("siteStatusText");

    // Current site hostname
    let currentHostname = "";

    // Get current tab URL
    const getCurrentTabUrl = async () => {
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            if (tabs && tabs.length > 0 && tabs[0].url) {
                const url = new URL(tabs[0].url);
                currentHostname = url.hostname;
                return url.href;
            }
            return null;
        } catch (error) {
            console.error("Error getting current tab URL:", error);
            return null;
        }
    };

    // Check if current site is disabled
    const checkSiteDisabled = async () => {
        if (!currentHostname) return false;

        try {
            const { disabledSites = [] } = await chrome.storage.local.get(
                "disabledSites"
            );
            return disabledSites.includes(currentHostname);
        } catch (error) {
            console.error("Error checking if site is disabled:", error);
            return false;
        }
    };

    // Update site status UI
    const updateSiteStatus = async () => {
        if (!currentHostname) return;

        const isDisabled = await checkSiteDisabled();

        if (isDisabled) {
            disableSiteBtn.textContent = "Enable for this site";
            siteStatusText.textContent = `${currentHostname} is disabled`;
            siteStatusText.classList.add("disabled");
        } else {
            disableSiteBtn.textContent = "Disable for this site";
            siteStatusText.textContent = "";
            siteStatusText.classList.remove("disabled");
        }
    };

    // Load saved settings
    const loadSettings = async () => {
        try {
            // Get current tab URL first
            await getCurrentTabUrl();

            const settings = await chrome.storage.local.get([
                "enabled",
                "grammarCheck",
                "spellingCheck",
                "styleCheck",
                "clarityCheck",
                "correctionsCount",
                "suggestionsCount",
                "apiKey",
                "disabledSites",
            ]);

            // Set toggle state
            enableToggle.checked = settings.enabled !== false; // Default to true if not set
            statusText.textContent = enableToggle.checked
                ? "Enabled"
                : "Disabled";

            // Set check options
            grammarCheck.checked = settings.grammarCheck !== false; // Default to true if not set
            spellingCheck.checked = settings.spellingCheck !== false; // Default to true if not set
            styleCheck.checked = settings.styleCheck !== false; // Default to true if not set
            clarityCheck.checked = settings.clarityCheck !== false; // Default to true if not set

            // Set statistics
            correctionsCount.textContent = settings.correctionsCount || 0;
            suggestionsCount.textContent = settings.suggestionsCount || 0;

            // Set API key status
            updateApiKeyStatus(settings.apiKey);
        } catch (error) {
            console.error("Error loading settings:", error);
        }
    };

    // Update API key status UI
    const updateApiKeyStatus = (apiKey) => {
        if (!apiKey) {
            apiKeyStatus.className = "api-status not-set";
            apiKeyStatusText.textContent = "No API key set";
            goToSettings.textContent = "Add API Key";
        } else {
            // We don't validate the key here, just check if it exists
            apiKeyStatus.className = "api-status valid";
            apiKeyStatusText.textContent = "API key set";
            goToSettings.textContent = "Change API Key";
        }
    };

    // Save settings
    const saveSettings = async (key, value) => {
        try {
            await chrome.storage.local.set({ [key]: value });

            // Notify the background script about the setting change
            chrome.runtime.sendMessage({
                action: "settingChanged",
                setting: key,
                value: value,
            });
        } catch (error) {
            console.error(`Error saving setting ${key}:`, error);
        }
    };

    // Event listeners
    enableToggle.addEventListener("change", () => {
        statusText.textContent = enableToggle.checked ? "Enabled" : "Disabled";
        saveSettings("enabled", enableToggle.checked);
    });

    grammarCheck.addEventListener("change", () => {
        saveSettings("grammarCheck", grammarCheck.checked);
    });

    spellingCheck.addEventListener("change", () => {
        saveSettings("spellingCheck", spellingCheck.checked);
    });

    styleCheck.addEventListener("change", () => {
        saveSettings("styleCheck", styleCheck.checked);
    });

    clarityCheck.addEventListener("change", () => {
        saveSettings("clarityCheck", clarityCheck.checked);
    });

    resetStats.addEventListener("click", async () => {
        try {
            await chrome.storage.local.set({
                correctionsCount: 0,
                suggestionsCount: 0,
            });
            correctionsCount.textContent = "0";
            suggestionsCount.textContent = "0";
        } catch (error) {
            console.error("Error resetting stats:", error);
        }
    });

    goToSettings.addEventListener("click", () => {
        chrome.runtime.openOptionsPage();
    });

    openSettings.addEventListener("click", () => {
        chrome.runtime.openOptionsPage();
    });

    // Toggle site disable/enable
    disableSiteBtn.addEventListener("click", async () => {
        if (!currentHostname) return;

        try {
            const { disabledSites = [] } = await chrome.storage.local.get(
                "disabledSites"
            );
            const isCurrentlyDisabled = disabledSites.includes(currentHostname);

            let updatedDisabledSites;
            if (isCurrentlyDisabled) {
                // Enable the site (remove from disabled list)
                updatedDisabledSites = disabledSites.filter(
                    (site) => site !== currentHostname
                );
            } else {
                // Disable the site (add to disabled list)
                updatedDisabledSites = [...disabledSites, currentHostname];
            }

            // Save updated list
            await chrome.storage.local.set({
                disabledSites: updatedDisabledSites,
            });

            // Update UI
            await updateSiteStatus();

            // Notify content script about the change
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "siteDisableStatusChanged",
                        hostname: currentHostname,
                        isDisabled: !isCurrentlyDisabled,
                    });
                }
            });
        } catch (error) {
            console.error("Error toggling site disable status:", error);
        }
    });

    // Load settings when popup opens
    await loadSettings();

    // Update site status
    await updateSiteStatus();
});
