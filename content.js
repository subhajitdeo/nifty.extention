console.clear();

console.log("================================");
console.log("STEP 2 - FIND TV WIDGET");
console.log("================================");

console.log("TradingView =", TradingView);

console.log("Searching window...");

for (const key of Object.getOwnPropertyNames(window)) {

    try {

        const value = window[key];

        if (!value) continue;

        // look for activeChart()
        if (typeof value.activeChart === "function") {

            console.log("FOUND activeChart ->", key, value);

        }

        // look for widget
        if (
            typeof value === "object" &&
            value !== null &&
            value._id &&
            value._ready !== undefined
        ) {

            console.log("Possible Widget ->", key, value);

        }

    } catch (e) {}

}

console.log("================================");
console.log("DONE");
console.log("================================");
