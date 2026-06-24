// =========================================
// STEP 1 - tvWidget Investigation
// =========================================

console.clear();

console.log("====================================");
console.log("STEP 1 - TV WIDGET DEBUG");
console.log("====================================");

console.log("Location:", location.href);
console.log("Document Ready:", document.readyState);

console.log("window.tvWidget =", window.tvWidget);
console.log("typeof tvWidget =", typeof tvWidget);

console.log("window.TradingView =", window.TradingView);
console.log("typeof TradingView =", typeof TradingView);

console.log("chrome.runtime.id =", chrome.runtime.id);

let attempt = 0;

const timer = setInterval(() => {

    attempt++;

    console.log("");
    console.log("==========================");
    console.log("Attempt:", attempt);
    console.log("==========================");

    console.log("typeof tvWidget =", typeof tvWidget);

    if (typeof tvWidget !== "undefined") {

        console.log("✅ tvWidget FOUND");
        console.log(tvWidget);

        try {

            const chart = tvWidget.activeChart();

            console.log("activeChart() =", chart);

            if (chart) {

                console.log("✅ CHART FOUND");

                console.log("createShape =", typeof chart.createShape);

                console.log("removeEntity =", typeof chart.removeEntity);

                console.log("whenChartReady =", typeof chart.whenChartReady);

                console.log("getAllShapes =", typeof chart.getAllShapes);

                console.log("symbol =", chart.symbol());

                console.log("resolution =", chart.resolution());

                console.log("====================================");
                console.log("STEP 1 PASSED");
                console.log("====================================");

                clearInterval(timer);

            }

        } catch (e) {

            console.error("activeChart ERROR");

            console.error(e);

        }

    } else {

        console.log("❌ tvWidget NOT FOUND");

    }

    if (attempt >= 30) {

        console.log("====================================");
        console.log("FAILED AFTER 30 ATTEMPTS");
        console.log("====================================");

        clearInterval(timer);

    }

}, 1000);
