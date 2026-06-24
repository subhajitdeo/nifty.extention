console.clear();

console.log("===== CONTENT SCRIPT =====");

console.log("location:", location.href);

console.log("window === globalThis", window === globalThis);

console.log("chrome.runtime.id =", chrome.runtime.id);

console.log("document.currentScript =", document.currentScript);

console.log("Execution test");

window.__EXTENSION_TEST__ = 12345;

console.log("window.__EXTENSION_TEST__ =", window.__EXTENSION_TEST__);
