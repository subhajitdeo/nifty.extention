console.clear();

console.log("===== HOOK TEST =====");

const originalDefine = Object.defineProperty;

Object.defineProperty = function(obj, prop, descriptor) {

    if (obj === window && prop === "tvWidget") {
        console.log("tvWidget is being defined!");
        console.log(descriptor);
        debugger;
    }

    return originalDefine.call(this, obj, prop, descriptor);
};

const interval = setInterval(() => {

    if ("tvWidget" in window) {
        console.log("window has tvWidget");
        console.log(window.tvWidget);
        clearInterval(interval);
    }

}, 500);

setTimeout(() => {
    clearInterval(interval);
    console.log("Finished waiting.");
}, 30000);
