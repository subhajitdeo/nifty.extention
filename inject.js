// =============================================
// FETCH DATA VIA BACKGROUND PROXY
// =============================================

async function fetchData() {
    try {
        console.log("📤 Requesting data via background proxy...");
        
        // Send message to content script, which forwards to background
        const response = await new Promise(function(resolve) {
            chrome.runtime.sendMessage({ action: 'proxyFetch' }, function(response) {
                resolve(response);
            });
        });
        
        if (response && response.success) {
            console.log("📊 Data fetched:", response.data);
            syncLevels(response.data);
        } else {
            console.error("❌ API error:", response?.error || 'Unknown error');
        }
    } catch (e) {
        console.error("❌ Fetch error:", e);
    }
}
