// =============================================
// BACKGROUND SERVICE WORKER
// =============================================

// Fetch data from Supabase
async function fetchOIData() {
  try {
    const response = await fetch('https://kdneyzemvqzhwzztflvq.supabase.co/functions/v1/process-data');
    const json = await response.json();
    
    if (json.success) {
      // Store in chrome storage
      chrome.storage.local.set({ oiData: json.data, lastUpdated: new Date().toISOString() });
      
      // Send to all TradingView tabs
      chrome.tabs.query({ url: 'https://www.tradingview.com/*' }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateLevels',
            data: json.data
          }).catch(() => {
            // Tab might not be ready, ignore
          });
        });
      });
      
      console.log('✅ OI Data updated:', new Date().toLocaleTimeString());
    }
  } catch (error) {
    console.error('Error fetching OI data:', error);
  }
}

// Fetch immediately and then every minute
fetchOIData();
setInterval(fetchOIData, 60000);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    chrome.storage.local.get(['oiData', 'lastUpdated'], (result) => {
      sendResponse(result);
    });
    return true;
  }
  
  if (request.action === 'forceUpdate') {
    fetchOIData();
    sendResponse({ success: true });
    return true;
  }
});
