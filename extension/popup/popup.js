document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const enableToggle = document.getElementById('enableToggle');
  const statusText = document.getElementById('statusText');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveApiKeyBtn = document.getElementById('saveApiKey');
  const grammarCheck = document.getElementById('grammarCheck');
  const spellingCheck = document.getElementById('spellingCheck');
  const styleCheck = document.getElementById('styleCheck');
  const clarityCheck = document.getElementById('clarityCheck');
  const disableSiteBtn = document.getElementById('disableSiteBtn');
  const disabledSitesList = document.getElementById('disabledSitesList');
  const correctionsApplied = document.getElementById('correctionsApplied');
  const suggestionsShown = document.getElementById('suggestionsShown');
  const resetStatsBtn = document.getElementById('resetStats');

  // Load saved settings
  const settings = await loadSettings();
  
  // Initialize UI with saved settings
  initializeUI(settings);

  // Event Listeners
  enableToggle.addEventListener('change', toggleExtension);
  saveApiKeyBtn.addEventListener('click', saveApiKey);
  grammarCheck.addEventListener('change', updateCheckTypes);
  spellingCheck.addEventListener('change', updateCheckTypes);
  styleCheck.addEventListener('change', updateCheckTypes);
  clarityCheck.addEventListener('change', updateCheckTypes);
  disableSiteBtn.addEventListener('click', disableForCurrentSite);
  resetStatsBtn.addEventListener('click', resetStatistics);

  // Functions
  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get({
        enabled: true,
        apiKey: '',
        checkTypes: {
          grammar: true,
          spelling: true,
          style: true,
          clarity: true
        },
        disabledSites: [],
        statistics: {
          correctionsApplied: 0,
          suggestionsShown: 0
        }
      }, (result) => {
        resolve(result);
      });
    });
  }

  function initializeUI(settings) {
    // Enable/disable toggle
    enableToggle.checked = settings.enabled;
    statusText.textContent = settings.enabled ? 'Enabled' : 'Disabled';
    
    // API Key
    apiKeyInput.value = settings.apiKey;
    
    // Check types
    grammarCheck.checked = settings.checkTypes.grammar;
    spellingCheck.checked = settings.checkTypes.spelling;
    styleCheck.checked = settings.checkTypes.style;
    clarityCheck.checked = settings.checkTypes.clarity;
    
    // Statistics
    correctionsApplied.textContent = settings.statistics.correctionsApplied;
    suggestionsShown.textContent = settings.statistics.suggestionsShown;
    
    // Disabled sites
    renderDisabledSites(settings.disabledSites);
    
    // Check if current site is disabled
    getCurrentTab().then(tab => {
      const url = new URL(tab.url);
      const hostname = url.hostname;
      
      if (settings.disabledSites.includes(hostname)) {
        disableSiteBtn.textContent = 'Enable for this site';
      } else {
        disableSiteBtn.textContent = 'Disable for this site';
      }
    });
  }

  function toggleExtension() {
    const enabled = enableToggle.checked;
    statusText.textContent = enabled ? 'Enabled' : 'Disabled';
    
    chrome.storage.local.set({ enabled }, () => {
      // Notify content scripts about the change
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'toggleExtension',
            enabled: enabled
          });
        }
      });
    });
  }

  function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showMessage('Please enter a valid API key', 'error');
      return;
    }
    
    chrome.storage.local.set({ apiKey }, () => {
      showMessage('API key saved successfully', 'success');
    });
  }

  function updateCheckTypes() {
    const checkTypes = {
      grammar: grammarCheck.checked,
      spelling: spellingCheck.checked,
      style: styleCheck.checked,
      clarity: clarityCheck.checked
    };
    
    chrome.storage.local.set({ checkTypes }, () => {
      // Notify content scripts about the change
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'updateCheckTypes',
            checkTypes: checkTypes
          });
        }
      });
    });
  }

  async function disableForCurrentSite() {
    const tab = await getCurrentTab();
    const url = new URL(tab.url);
    const hostname = url.hostname;
    
    chrome.storage.local.get({ disabledSites: [] }, (result) => {
      let disabledSites = result.disabledSites;
      
      if (disabledSites.includes(hostname)) {
        // Enable for this site
        disabledSites = disabledSites.filter(site => site !== hostname);
        disableSiteBtn.textContent = 'Disable for this site';
        showMessage(`TextWarden enabled for ${hostname}`, 'success');
      } else {
        // Disable for this site
        disabledSites.push(hostname);
        disableSiteBtn.textContent = 'Enable for this site';
        showMessage(`TextWarden disabled for ${hostname}`, 'success');
      }
      
      chrome.storage.local.set({ disabledSites }, () => {
        renderDisabledSites(disabledSites);
        
        // Notify content scripts about the change
        chrome.tabs.sendMessage(tab.id, { 
          action: 'siteStatusChanged',
          disabled: disabledSites.includes(hostname)
        });
      });
    });
  }

  function renderDisabledSites(disabledSites) {
    disabledSitesList.innerHTML = '';
    
    if (disabledSites.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No sites disabled';
      disabledSitesList.appendChild(li);
      return;
    }
    
    disabledSites.forEach(site => {
      const li = document.createElement('li');
      
      const siteText = document.createElement('span');
      siteText.textContent = site;
      
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.className = 'remove-site';
      removeBtn.addEventListener('click', () => removeSiteFromDisabled(site));
      
      li.appendChild(siteText);
      li.appendChild(removeBtn);
      disabledSitesList.appendChild(li);
    });
  }

  function removeSiteFromDisabled(site) {
    chrome.storage.local.get({ disabledSites: [] }, (result) => {
      const disabledSites = result.disabledSites.filter(s => s !== site);
      
      chrome.storage.local.set({ disabledSites }, () => {
        renderDisabledSites(disabledSites);
        showMessage(`${site} removed from disabled sites`, 'success');
        
        // Update button text if current site was removed
        getCurrentTab().then(tab => {
          const url = new URL(tab.url);
          const hostname = url.hostname;
          
          if (site === hostname) {
            disableSiteBtn.textContent = 'Disable for this site';
            
            // Notify content scripts about the change
            chrome.tabs.sendMessage(tab.id, { 
              action: 'siteStatusChanged',
              disabled: false
            });
          }
        });
      });
    });
  }

  function resetStatistics() {
    const statistics = {
      correctionsApplied: 0,
      suggestionsShown: 0
    };
    
    chrome.storage.local.set({ statistics }, () => {
      correctionsApplied.textContent = '0';
      suggestionsShown.textContent = '0';
      showMessage('Statistics reset successfully', 'success');
    });
  }

  function getCurrentTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve(tabs[0]);
      });
    });
  }

  function showMessage(message, type) {
    // Create message element if it doesn't exist
    let messageEl = document.querySelector('.message');
    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.className = 'message';
      document.body.appendChild(messageEl);
    }
    
    // Set message content and style
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    
    // Show message
    messageEl.style.display = 'block';
    
    // Hide message after 3 seconds
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 3000);
  }
});
