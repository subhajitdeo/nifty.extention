// =============================================
// BACKGROUND SERVICE WORKER
// =============================================

// Fetch data from Supabase every minute
async function fetchOIData() {
  try {
    const response = await fetch('https://kdneyzemvqzhwzztflvq.supabase.co/functions/v1/process-data');
    const json = await response.json();
    
    if (json.success) {
      // Store latest data
      chrome.storage.local.set({ oiData: json.data });
      
      // Send to content script if TradingView tab is active
      chrome.tabs.query({ url: 'https://www.tradingview.com/*' }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateLevels',
            data: json.data
          });
        });
      });
    }
  } catch (error) {
    console.error('Error fetching OI data:', error);
  }
}

// Fetch immediately and then every minute
fetchOIData();
setInterval(fetchOIData, 60000);

// Listen for popup requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    chrome.storage.local.get('oiData', (result) => {
      sendResponse(result.oiData);
    });
    return true; // Keep channel open for async response
  }
});
