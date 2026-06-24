// =============================================
// CONTENT SCRIPT - UPDATES PINE SCRIPT INPUTS
// =============================================

let updateTimeout = null;

// Listen for messages from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateLevels') {
    updatePineInputs(request.data);
    sendResponse({ success: true });
  }
});

// Main function to update Pine Script inputs
function updatePineInputs(data) {
  console.log('📊 Updating Pine Script with:', data);
  
  // Wait for TradingView to be fully loaded
  if (!document.querySelector('[class*="chart-container"]')) {
    console.log('⏳ TradingView not ready, waiting...');
    setTimeout(() => updatePineInputs(data), 2000);
    return;
  }
  
  // Try multiple methods to find inputs
  
  // METHOD 1: Find by label text (most reliable)
  const labels = document.querySelectorAll('span, label, div, .input-label');
  const inputMap = {
    'CE 2nd Highest OI': data.ceSecondHighest,
    'PE 2nd Highest OI': data.peSecondHighest,
    'CE Highest Volume': data.ceHighestVolume,
    'PE Highest Volume': data.peHighestVolume,
    'Buy Entry': data.targets.buy.entry || 0,
    'Buy SL': data.targets.buy.sl || 0,
    'Buy Target 1': data.targets.buy.target1 || 0,
    'Buy Target 2': data.targets.buy.target2 || 0,
    'Sell Entry': data.targets.sell.entry || 0,
    'Sell SL': data.targets.sell.sl || 0,
    'Sell Target 1': data.targets.sell.target1 || 0,
    'Sell Target 2': data.targets.sell.target2 || 0
  };

  let updated = 0;

  labels.forEach(label => {
    const labelText = label.textContent.trim();
    
    // Check if this label matches any of our inputs
    for (const [key, value] of Object.entries(inputMap)) {
      if (labelText.includes(key) && value !== null && value !== 0) {
        // Find the input field
        let input = null;
        
        // Try: sibling input
        if (label.nextElementSibling?.tagName === 'INPUT') {
          input = label.nextElementSibling;
        }
        // Try: parent's next sibling
        else if (label.parentElement?.nextElementSibling?.querySelector('input')) {
          input = label.parentElement.nextElementSibling.querySelector('input');
        }
        // Try: closest container with input
        else {
          const container = label.closest('div, .input-group, .setting-item');
          if (container) {
            input = container.querySelector('input[type="number"], input[type="text"]');
          }
        }
        
        if (input) {
          const numValue = Number(value);
          if (!isNaN(numValue) && numValue > 0) {
            input.value = numValue;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            updated++;
            console.log(`✅ Updated ${key} → ${numValue}`);
          }
        }
      }
    }
  });

  // METHOD 2: Find by placeholder/aria-label
  if (updated === 0) {
    const allInputs = document.querySelectorAll('input[type="number"], input[type="text"]');
    const keywordMap = {
      'ce.*2nd': data.ceSecondHighest,
      'pe.*2nd': data.peSecondHighest,
      'ce.*volume': data.ceHighestVolume,
      'pe.*volume': data.peHighestVolume,
      'buy.*entry': data.targets.buy.entry || 0,
      'buy.*sl': data.targets.buy.sl || 0,
      'buy.*target.*1': data.targets.buy.target1 || 0,
      'buy.*target.*2': data.targets.buy.target2 || 0,
      'sell.*entry': data.targets.sell.entry || 0,
      'sell.*sl': data.targets.sell.sl || 0,
      'sell.*target.*1': data.targets.sell.target1 || 0,
      'sell.*target.*2': data.targets.sell.target2 || 0
    };

    allInputs.forEach(input => {
      const placeholder = (input.placeholder || '').toLowerCase();
      const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
      const combined = placeholder + ' ' + ariaLabel;
      
      for (const [pattern, value] of Object.entries(keywordMap)) {
        if (new RegExp(pattern, 'i').test(combined) && value !== null && value !== 0) {
          const numValue = Number(value);
          if (!isNaN(numValue) && numValue > 0) {
            input.value = numValue;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            updated++;
            console.log(`✅ Updated ${pattern} → ${numValue}`);
          }
        }
      }
    });
  }

  console.log(`📊 Updated ${updated} input(s)`);
  
  // Update status in popup
  chrome.storage.local.set({ lastUpdateStatus: updated > 0 ? 'success' : 'no_inputs_found' });
}

// Auto-update on page load
window.addEventListener('load', () => {
  console.log('🔄 TradingView loaded, checking for data...');
  setTimeout(() => {
    chrome.storage.local.get('oiData', (result) => {
      if (result.oiData) {
        console.log('📊 Found stored data, updating...');
        updatePineInputs(result.oiData);
      }
    });
  }, 5000);
});

// Also update when Pine Editor is opened
const observer = new MutationObserver(() => {
  const editor = document.querySelector('[class*="editor-container"], .pane-legend, .tv-properties-pane');
  if (editor) {
    chrome.storage.local.get('oiData', (result) => {
      if (result.oiData) {
        updatePineInputs(result.oiData);
      }
    });
  }
});

observer.observe(document.body, { childList: true, subtree: true });
