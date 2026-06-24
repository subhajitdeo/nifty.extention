console.log("🚀 inject.js loaded");

console.log("📊 window.tvWidget:", window.tvWidget);
console.log("📊 typeof tvWidget:", typeof tvWidget);

window.addEventListener("message", async (event) => {
    if (event.source !== window) return;
    if (event.data.type !== "DRAW_LINE") return;

    console.log("📨 Received message:", event.data);

    // Try multiple ways to get the chart
    let chart = null;
    let widget = null;

    // Method 1: tvWidget
    if (typeof tvWidget !== 'undefined') {
        widget = tvWidget;
        console.log("📊 Using tvWidget");
    }
    // Method 2: window.tvWidget
    else if (window.tvWidget) {
        widget = window.tvWidget;
        console.log("📊 Using window.tvWidget");
    }
    // Method 3: window.__tvWidget (from earlier injection)
    else if (window.__tvWidget) {
        widget = window.__tvWidget;
        console.log("📊 Using window.__tvWidget");
    }
    // Method 4: Search window for any object with activeChart
    else {
        console.log("🔍 Searching window for activeChart...");
        for (const key of Object.keys(window)) {
            try {
                const obj = window[key];
                if (obj && typeof obj === 'object' && typeof obj.activeChart === 'function') {
                    widget = obj;
                    console.log(`📊 Found widget on window.${key}`);
                    break;
                }
            } catch (e) {}
        }
    }

    if (!widget) {
        console.error("❌ No widget found!");
        console.log("📊 window keys with 'tv' or 'chart':", 
            Object.keys(window).filter(k => k.toLowerCase().includes('tv') || k.toLowerCase().includes('chart')));
        return;
    }

    try {
        // Try activeChart first
        if (typeof widget.activeChart === 'function') {
            chart = widget.activeChart();
            console.log("📊 Chart from activeChart():", chart);
        }
        // Try _innerAPI().activeChart()
        else if (widget._innerAPI && typeof widget._innerAPI === 'function') {
            const api = widget._innerAPI();
            if (api && typeof api.activeChart === 'function') {
                chart = api.activeChart();
                console.log("📊 Chart from _innerAPI().activeChart():", chart);
            }
        }

        if (!chart) {
            console.error("❌ No chart found!");
            return;
        }

        console.log("🎯 Attempting to draw line at", event.data.price);

        const id = await chart.createShape(
            {
                time: Math.floor(Date.now() / 1000),
                price: event.data.price
            },
            {
                shape: "horizontal_line",
                text: event.data.label || "TEST"
            }
        );

        console.log("✅ SUCCESS! Shape ID:", id);
        console.log("📊 All shapes:", chart.getAllShapes());

    } catch (e) {
        console.error("❌ DRAW ERROR:", e);
    }
});

console.log("✅ inject.js ready, waiting for messages...");
