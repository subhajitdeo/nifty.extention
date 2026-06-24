const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");

(document.head || document.documentElement).appendChild(script);

script.onload = () => script.remove();

window.postMessage({
    type: "DRAW_LINE",
    price: 24200,
    label: "TEST"
});
