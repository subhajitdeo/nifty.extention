// =============================================
// CONTENT SCRIPT - INJECTS DATA INTO PINE SCRIPT
// =============================================

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateLevels') {
    updatePineScriptInputs(request.data);
  }
});

// Function to update Pine Script inputs
function updatePineScriptInputs(data) {
  // Find the Pine Script editor panel
  const editor = document.querySelector('[class*="editor-container"]');
  if (!editor) {
    console.log('Pine Editor not found. Make sure it is open.');
    return;
  }
  
  // Find the input fields (this is the tricky part - TradingView's DOM changes often)
  // Method 1: Try to find by label text
  const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
  
  const mapping = {
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
  
  // Loop through inputs and update matching ones
  inputs.forEach(input => {
    const label = input.closest('div')?.previousElementSibling?.innerText;
    if (label && mapping[label.trim()] !== undefined) {
      const value = mapping[label.trim()];
      if (value !== null && value !== 0) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
  
  console.log('✅ OI Levels updated!', data);
}

// Alternative Method: Using Pine Script's API (if available)
// Some TradingView implementations expose a window.pine object
// This is experimental and may not work
function tryPineAPI(data) {
  if (window.pine && window.pine.setInput) {
    // This is hypothetical - actual API may differ
    const mapping = {
      'ceSecondHighest': data.ceSecondHighest,
      'peSecondHighest': data.peSecondHighest,
      // ... etc
    };
    Object.entries(mapping).forEach(([key, value]) => {
      if (value !== null && value !== 0) {
        // window.pine.setInput(key, value);
      }
    });
  }
}

// Auto-update when page loads
window.addEventListener('load', () => {
  chrome.storage.local.get('oiData', (result) => {
    if (result.oiData) {
      setTimeout(() => updatePineScriptInputs(result.oiData), 3000);
    }
  });
});
