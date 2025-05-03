/**
 * TextWarden Settings Script
 *
 * This script handles the settings page functionality.
 *
 * @author Chirag Singhal (chirag127)
 */

document.addEventListener("DOMContentLoaded", async () => {
    // Get UI elements
    const apiKeyInput = document.getElementById("apiKey");
    const toggleVisibilityBtn = document.getElementById("toggleVisibility");
    const saveApiKeyBtn = document.getElementById("saveApiKey");
    const apiKeySaveStatus = document.getElementById("apiKeySaveStatus");
    const backToPopupBtn = document.getElementById("backToPopup");
    const languageOptions = document.querySelectorAll('input[name="language"]');
    const disabledSitesList = document.getElementById("disabledSitesList");
    const newSiteInput = document.getElementById("newSiteInput");
    const addSiteBtn = document.getElementById("addSiteBtn");
    const siteActionStatus = document.getElementById("siteActionStatus");

    // Load saved settings
    const loadSettings = async () => {
        try {
            const settings = await chrome.storage.local.get([
                "apiKey",
                "language",
                "disabledSites",
            ]);

            // Set API key if it exists
            if (settings.apiKey) {
                apiKeyInput.value = settings.apiKey;
            }

            // Set language preference
            if (settings.language) {
                const languageOption = document.querySelector(
                    `input[name="language"][value="${settings.language}"]`
                );
                if (languageOption) {
                    languageOption.checked = true;
                }
            }

            // Load disabled sites
            renderDisabledSites(settings.disabledSites || []);
        } catch (error) {
            console.error("Error loading settings:", error);
            showSaveStatus(
                "error",
                "Failed to load settings. Please try again."
            );
        }
    };

    // Render the list of disabled sites
    const renderDisabledSites = (sites) => {
        // Clear the current list
        disabledSitesList.innerHTML = "";

        if (sites.length === 0) {
            // Show empty message if no sites are disabled
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "empty-list-message";
            emptyMessage.textContent = "No sites have been disabled yet.";
            disabledSitesList.appendChild(emptyMessage);
            return;
        }

        // Create a list item for each disabled site
        sites.forEach((site) => {
            const siteItem = document.createElement("div");
            siteItem.className = "site-item";

            const siteDomain = document.createElement("span");
            siteDomain.className = "site-domain";
            siteDomain.textContent = site;

            const removeButton = document.createElement("button");
            removeButton.className = "remove-site";
            removeButton.textContent = "Remove";
            removeButton.dataset.site = site;
            removeButton.addEventListener("click", () => removeSite(site));

            siteItem.appendChild(siteDomain);
            siteItem.appendChild(removeButton);
            disabledSitesList.appendChild(siteItem);
        });
    };

    // Remove a site from the disabled list
    const removeSite = async (site) => {
        try {
            const { disabledSites = [] } = await chrome.storage.local.get(
                "disabledSites"
            );
            const updatedSites = disabledSites.filter((s) => s !== site);

            await chrome.storage.local.set({ disabledSites: updatedSites });
            renderDisabledSites(updatedSites);

            showSiteActionStatus(
                "success",
                `Removed ${site} from disabled sites.`
            );
        } catch (error) {
            console.error("Error removing site:", error);
            showSiteActionStatus(
                "error",
                "Failed to remove site. Please try again."
            );
        }
    };

    // Add a new site to the disabled list
    const addSite = async () => {
        const site = newSiteInput.value.trim().toLowerCase();

        if (!site) {
            showSiteActionStatus("error", "Please enter a valid domain.");
            return;
        }

        try {
            const { disabledSites = [] } = await chrome.storage.local.get(
                "disabledSites"
            );

            // Check if site is already in the list
            if (disabledSites.includes(site)) {
                showSiteActionStatus(
                    "error",
                    `${site} is already in the disabled list.`
                );
                return;
            }

            const updatedSites = [...disabledSites, site];
            await chrome.storage.local.set({ disabledSites: updatedSites });

            // Update UI
            renderDisabledSites(updatedSites);
            newSiteInput.value = ""; // Clear input

            showSiteActionStatus("success", `Added ${site} to disabled sites.`);
        } catch (error) {
            console.error("Error adding site:", error);
            showSiteActionStatus(
                "error",
                "Failed to add site. Please try again."
            );
        }
    };

    // Show site action status message
    const showSiteActionStatus = (type, message) => {
        siteActionStatus.textContent = message;
        siteActionStatus.className = `save-status ${type}`;

        // Hide the message after 3 seconds
        setTimeout(() => {
            siteActionStatus.className = "save-status";
        }, 3000);
    };

    // Toggle API key visibility
    toggleVisibilityBtn.addEventListener("click", () => {
        if (apiKeyInput.type === "password") {
            apiKeyInput.type = "text";
            toggleVisibilityBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
          <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
          <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
        </svg>
      `;
        } else {
            apiKeyInput.type = "password";
            toggleVisibilityBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 2a6 6 0 0 0-6 6c0 1.53.582 2.92 1.535 3.97L2 13.5 3.5 15l1.53-1.535A5.975 5.975 0 0 0 8 14a5.975 5.975 0 0 0 2.97-.535L12.5 15 14 13.5l-1.535-1.53A5.97 5.97 0 0 0 14 8a6 6 0 0 0-6-6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
        </svg>
      `;
        }
    });

    // Save API key
    saveApiKeyBtn.addEventListener("click", async () => {
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            showSaveStatus("error", "Please enter an API key.");
            return;
        }

        try {
            await chrome.storage.local.set({ apiKey });

            // Notify the background script about the API key change
            chrome.runtime.sendMessage({
                action: "apiKeyChanged",
                apiKey: apiKey,
            });

            showSaveStatus("success", "API key saved successfully!");
        } catch (error) {
            console.error("Error saving API key:", error);
            showSaveStatus(
                "error",
                "Failed to save API key. Please try again."
            );
        }
    });

    // Show save status message
    const showSaveStatus = (type, message) => {
        apiKeySaveStatus.textContent = message;
        apiKeySaveStatus.className = `save-status ${type}`;

        // Hide the message after 3 seconds
        setTimeout(() => {
            apiKeySaveStatus.className = "save-status";
        }, 3000);
    };

    // Handle language option changes
    languageOptions.forEach((option) => {
        option.addEventListener("change", async () => {
            if (option.checked) {
                try {
                    await chrome.storage.local.set({ language: option.value });

                    // Notify the background script about the language change
                    chrome.runtime.sendMessage({
                        action: "languageChanged",
                        language: option.value,
                    });
                } catch (error) {
                    console.error("Error saving language preference:", error);
                }
            }
        });
    });

    // Back to popup button
    backToPopupBtn.addEventListener("click", () => {
        window.close();
    });

    // Add site button click handler
    addSiteBtn.addEventListener("click", addSite);

    // Enter key in input field
    newSiteInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            addSite();
        }
    });

    // Load settings when page loads
    await loadSettings();
});
