// =============================================
// BACKGROUND SERVICE WORKER - PROXY
// =============================================

console.log("✅ Background service worker started");

// =============================================
// FETCH DATA FROM SUPABASE (PROXY)
// =============================================

async function fetchSupabaseData() {
    try {
        const response = await fetch('https://kdneyzemvqzhwzztflvq.supabase.co/functions/v1/process-data');
        const json = await response.json();
        return json;
    } catch (e) {
        console.error("❌ Background fetch error:", e);
        return null;
    }
}

// =============================================
// LISTEN FOR MESSAGES
// =============================================

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    // Ping test
    if (request.action === 'ping') {
        sendResponse({ success: true, message: 'pong' });
        return true;
    }
    
    // PROXY: Fetch data from Supabase (bypasses CSP)
    if (request.action === 'fetchData') {
        fetchSupabaseData().then(function(data) {
            if (data && data.success) {
                sendResponse({ success: true, data: data.data });
            } else {
                sendResponse({ success: false, error: 'Failed to fetch' });
            }
        });
        return true; // Keep channel open for async response
    }
    
    // Get status for popup
    if (request.action === 'getStatus') {
        chrome.tabs.query({ url: 'https://charting.nseindia.com/*' }, function(tabs) {
            const isOpen = tabs.length > 0;
            sendResponse({ 
                success: true, 
                isChartOpen: isOpen,
                tabCount: tabs.length,
                message: isOpen ? 'NSE chart detected' : 'Open NSE chart first'
            });
        });
        return true;
    }
});
