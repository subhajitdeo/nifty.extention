// =============================================
// BACKGROUND SERVICE WORKER
// =============================================

console.log("✅ Background service worker started");

// =============================================
// LISTEN FOR MESSAGES
// =============================================

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    // Ping test
    if (request.action === 'ping') {
        sendResponse({ success: true, message: 'pong' });
        return true;
    }
    
    // Get status for popup
    if (request.action === 'getStatus') {
        // Check if any NSE chart tab is open
        chrome.tabs.query({ url: 'https://charting.nseindia.com/*' }, function(tabs) {
            const isOpen = tabs.length > 0;
            sendResponse({ 
                success: true, 
                isChartOpen: isOpen,
                tabCount: tabs.length,
                message: isOpen ? '✅ NSE chart detected' : '❌ Open NSE chart first'
            });
        });
        return true; // Keep channel open for async response
    }
    
    // Forward message to content script
    if (request.action === 'forwardToContent') {
        chrome.tabs.query({ url: 'https://charting.nseindia.com/*' }, function(tabs) {
            if (tabs.length === 0) {
                sendResponse({ success: false, message: 'No NSE chart tab found' });
                return;
            }
            
            chrome.tabs.sendMessage(tabs[0].id, request.payload, function(response) {
                sendResponse({ success: true, response: response });
            });
        });
        return true; // Keep channel open for async response
    }
});
