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
