console.log("📦 content.js loaded");

// Inject inject.js into page
const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");

script.onload = () => {
    console.log("✅ inject.js injected");
    script.remove();
    
    // Tell inject.js to fetch data
    setTimeout(() => {
        window.postMessage({ type: "FETCH_AND_DRAW" }, "*");
    }, 1000);
};

script.onerror = (e) => {
    console.error("❌ Failed to inject:", e);
};

(document.head || document.documentElement).appendChild(script);

// =============================================
// ✅ NEW: Listen for popup messages
// =============================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
