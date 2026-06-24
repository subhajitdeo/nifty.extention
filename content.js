console.log("content.js loaded");

const s = document.createElement("script");
s.src = chrome.runtime.getURL("inject.js");

console.log("inject.js URL:", s.src);

(document.head || document.documentElement).appendChild(s);

s.onload = () => {
    console.log("✅ inject.js loaded and executed");
    s.remove();

    setTimeout(() => {
        console.log("📤 Posting message to inject.js...");
        window.postMessage({
            type: "DRAW_LINE",
            price: 24200,
            label: "TEST FROM EXTENSION"
        }, "*");
    }, 3000);
};

s.onerror = (e) => {
    console.error("❌ Failed to load inject.js:", e);
};
