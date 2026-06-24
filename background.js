// =============================================
// BACKGROUND - MINIMAL
// =============================================

console.log("✅ Background service worker started");

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'ping') {
        sendResponse({ success: true, message: 'pong' });
    }
});
