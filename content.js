// =============================================
// CONTENT SCRIPT - WORKING VERSION
// =============================================

console.log("🚀 CONTENT SCRIPT STARTED");

// =============================================
// WAIT FOR TVWIDGET
// =============================================

function waitForTvWidget() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 30;
        
        const check = setInterval(() => {
            attempts++;
            
            // Try multiple ways to find tvWidget
            let widget = null;
            if (typeof tvWidget !== 'undefined') {
                widget = tvWidget;
            } else if (window.tvWidget) {
                widget = window.tvWidget;
            }
            
            if (widget && widget.activeChart) {
                clearInterval(check);
                console.log("✅ tvWidget found!");
                resolve(widget);
                return;
            }
            
            if (attempts >= maxAttempts) {
                clearInterval(check);
                console.log("❌ tvWidget not found after 30 attempts");
                resolve(null);
            }
        }, 1000);
    });
}

// =============================================
// WAIT FOR CHART READY
// =============================================

function waitForChartReady(chart) {
    return new Promise((resolve) => {
        if (typeof chart.whenChartReady === 'function') {
            console.log("⏳ Waiting for chart.whenChartReady...");
            chart.whenChartReady(() => {
                console.log("✅ Chart ready!");
                resolve();
            });
        } else {
            console.log("⏳ No whenChartReady, waiting 2 seconds...");
            setTimeout(resolve, 2000);
        }
    });
}

// =============================================
// DRAW HORIZONTAL LINE
// =============================================

async function drawHorizontalLine(price, label) {
    try {
        const widget = await waitForTvWidget();
        if (!widget) {
            console.error("❌ No tvWidget!");
            return null;
        }
        
        const chart = widget.activeChart();
        if (!chart) {
            console.error("❌ No active chart!");
            return null;
        }
        
        // ✅ CRITICAL: Wait for chart to be ready
        await waitForChartReady(chart);
        
        const id = chart.createShape(
            {
                time: Math.floor(Date.now() / 1000),
                price: price
            },
            {
                shape: "horizontal_line",
                text: label || "TEST"
            }
        );
        
        console.log("✅ Line drawn! ID:", id);
        return id;
        
    } catch (e) {
        console.error("❌ DRAW ERROR:", e);
        return null;
    }
}

// =============================================
// DRAW ALL LEVELS FROM DATA
// =============================================

async function drawAllLevels(data) {
    console.log("📊 Drawing all levels...");
    
    const levels = [
        { key: 'ceSecondHighest', price: data.ceSecondHighest, label: 'CE 2nd' },
        { key: 'peSecondHighest', price: data.peSecondHighest, label: 'PE 2nd' },
        { key: 'ceHighestVolume', price: data.ceHighestVolume, label: 'CE Vol' },
        { key: 'peHighestVolume', price: data.peHighestVolume, label: 'PE Vol' },
        { key: 'buyEntry', price: data.targets?.buy?.entry, label: 'Buy Entry' },
        { key: 'buySL', price: data.targets?.buy?.sl, label: 'Buy SL' },
        { key: 'buyTarget1', price: data.targets?.buy?.target1, label: 'Buy T1' },
        { key: 'buyTarget2', price: data.targets?.buy?.target2, label: 'Buy T2' },
        { key: 'sellEntry', price: data.targets?.sell?.entry, label: 'Sell Entry' },
        { key: 'sellSL', price: data.targets?.sell?.sl, label: 'Sell SL' },
        { key: 'sellTarget1', price: data.targets?.sell?.target1, label: 'Sell T1' },
        { key: 'sellTarget2', price: data.targets?.sell?.target2, label: 'Sell T2' }
    ];
    
    for (const level of levels) {
        if (level.price && level.price > 0) {
            console.log(`📊 Drawing ${level.label} at ${level.price}`);
            await drawHorizontalLine(level.price, level.label + ': ' + level.price);
        }
    }
}

// =============================================
// TEST - DRAW TEST LINE
// =============================================

async function testDraw() {
    console.log("🧪 Starting test draw...");
    const id = await drawHorizontalLine(24200, "TEST LINE");
    if (id) {
        console.log("✅ TEST LINE DRAWN SUCCESSFULLY!");
    } else {
        console.log("❌ Test line failed");
    }
}

// =============================================
// FETCH DATA FROM SUPABASE
// =============================================

async function fetchAndDrawLevels() {
    try {
        const response = await fetch('https://kdneyzemvqzhwzztflvq.supabase.co/functions/v1/process-data');
        const json = await response.json();
        
        if (json.success) {
            console.log("📊 Data fetched:", json.data);
            await drawAllLevels(json.data);
        } else {
            console.error("❌ API returned error:", json);
        }
    } catch (e) {
        console.error("❌ Failed to fetch data:", e);
    }
}

// =============================================
// LISTEN FOR MESSAGES
// =============================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'testDraw') {
        testDraw();
        sendResponse({ success: true });
        return true;
    }
    
    if (request.action === 'drawLevels') {
        fetchAndDrawLevels();
        sendResponse({ success: true });
        return true;
    }
});

// =============================================
// AUTO-RUN ON PAGE LOAD
// =============================================

// Wait for page to be fully loaded
if (document.readyState === 'complete') {
    setTimeout(testDraw, 2000);
} else {
    window.addEventListener('load', () => {
        setTimeout(testDraw, 2000);
    });
}

console.log("✅ Content script loaded. Test will run automatically.");
