/**
 * TextWarden Popup Script
 * 
 * This script handles the popup UI functionality.
 * 
 * @author Chirag Singhal (chirag127)
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Get UI elements
  const enableToggle = document.getElementById('enableToggle');
  const statusText = document.getElementById('statusText');
  const grammarCheck = document.getElementById('grammarCheck');
  const spellingCheck = document.getElementById('spellingCheck');
  const styleCheck = document.getElementById('styleCheck');
  const clarityCheck = document.getElementById('clarityCheck');
  const correctionsCount = document.getElementById('correctionsCount');
  const suggestionsCount = document.getElementById('suggestionsCount');
  const resetStats = document.getElementById('resetStats');
  const apiKeyStatus = document.getElementById('apiKeyStatus');
  const apiKeyStatusText = document.getElementById('apiKeyStatusText');
  const goToSettings = document.getElementById('goToSettings');
  const openSettings = document.getElementById('openSettings');

  // Load saved settings
  const loadSettings = async () => {
    try {
      const settings = await chrome.storage.local.get([
        'enabled',
        'grammarCheck',
        'spellingCheck',
        'styleCheck',
        'clarityCheck',
        'correctionsCount',
        'suggestionsCount',
        'apiKey'
      ]);

      // Set toggle state
      enableToggle.checked = settings.enabled !== false; // Default to true if not set
      statusText.textContent = enableToggle.checked ? 'Enabled' : 'Disabled';

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
      console.error('Error loading settings:', error);
    }
  };

  // Update API key status UI
  const updateApiKeyStatus = (apiKey) => {
    if (!apiKey) {
      apiKeyStatus.className = 'api-status not-set';
      apiKeyStatusText.textContent = 'No API key set';
      goToSettings.textContent = 'Add API Key';
    } else {
      // We don't validate the key here, just check if it exists
      apiKeyStatus.className = 'api-status valid';
      apiKeyStatusText.textContent = 'API key set';
      goToSettings.textContent = 'Change API Key';
    }
  };

  // Save settings
  const saveSettings = async (key, value) => {
    try {
      await chrome.storage.local.set({ [key]: value });
      
      // Notify the background script about the setting change
      chrome.runtime.sendMessage({
        action: 'settingChanged',
        setting: key,
        value: value
      });
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
    }
  };

  // Event listeners
  enableToggle.addEventListener('change', () => {
    statusText.textContent = enableToggle.checked ? 'Enabled' : 'Disabled';
    saveSettings('enabled', enableToggle.checked);
  });

  grammarCheck.addEventListener('change', () => {
    saveSettings('grammarCheck', grammarCheck.checked);
  });

  spellingCheck.addEventListener('change', () => {
    saveSettings('spellingCheck', spellingCheck.checked);
  });

  styleCheck.addEventListener('change', () => {
    saveSettings('styleCheck', styleCheck.checked);
  });

  clarityCheck.addEventListener('change', () => {
    saveSettings('clarityCheck', clarityCheck.checked);
  });

  resetStats.addEventListener('click', async () => {
    try {
      await chrome.storage.local.set({
        correctionsCount: 0,
        suggestionsCount: 0
      });
      correctionsCount.textContent = '0';
      suggestionsCount.textContent = '0';
    } catch (error) {
      console.error('Error resetting stats:', error);
    }
  });

  goToSettings.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  openSettings.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Load settings when popup opens
  await loadSettings();
});
