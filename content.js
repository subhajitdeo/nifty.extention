console.log("📦 content.js loaded");

// Inject inject.js into page
const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");

script.onload = function() {
    console.log("✅ inject.js injected");
    script.remove();
    
    // Tell inject.js to fetch data (using background as proxy)
    setTimeout(function() {
        window.postMessage({ type: "FETCH_AND_DRAW" }, "*");
    }, 1000);
};

script.onerror = function(e) {
    console.error("❌ Failed to inject:", e);
};

(document.head || document.documentElement).appendChild(script);

// =============================================
// LISTEN FOR POPUP MESSAGES
// =============================================

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    if (request.action === 'refreshLines') {
        window.postMessage({ type: "FETCH_AND_DRAW" }, "*");
        sendResponse({ success: true });
        return true;
    }
    
    if (request.action === 'clearLines') {
        window.postMessage({ type: "CLEAR_LINES" }, "*");
        sendResponse({ success: true });
        return true;
    }
    
    if (request.action === 'drawLine') {
        window.postMessage({
            type: "DRAW_LINE",
            price: request.price || 24200,
            label: request.label || "TEST"
        }, "*");
        sendResponse({ success: true });
        return true;
    }
});

// =============================================
// PROXY: Forward fetch requests to background
// =============================================

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'proxyFetch') {
        // Forward to background
        chrome.runtime.sendMessage({ action: 'fetchData' }, function(response) {
            sendResponse(response);
        });
        return true;
    }
});
