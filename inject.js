console.log("🚀 Nifty OI Injector loaded");

// =============================================
// STATE - Track all drawn lines
// =============================================

const shapes = {
    ceSecondHighest: null,
    peSecondHighest: null,
    ceHighestVolume: null,
    peHighestVolume: null,
    buyEntry: null,
    buySL: null,
    buyTarget1: null,
    buyTarget2: null,
    sellEntry: null,
    sellSL: null,
    sellTarget1: null,
    sellTarget2: null
};

const lastValues = {
    ceSecondHighest: null,
    peSecondHighest: null,
    ceHighestVolume: null,
    peHighestVolume: null,
    buyEntry: null,
    buySL: null,
    buyTarget1: null,
    buyTarget2: null,
    sellEntry: null,
    sellSL: null,
    sellTarget1: null,
    sellTarget2: null
};

// =============================================
// COLORS
// =============================================

const COLORS = {
    ceSecondHighest: '#FFD700',
    peSecondHighest: '#FF8C00',
    ceHighestVolume: '#2196F3',
    peHighestVolume: '#9C27B0',
    buyEntry: '#4CAF50',
    buySL: '#4CAF50',
    buyTarget1: '#4CAF50',
    buyTarget2: '#4CAF50',
    sellEntry: '#F44336',
    sellSL: '#F44336',
    sellTarget1: '#F44336',
    sellTarget2: '#F44336'
};

const STYLES = {
    solid: 0,
    dotted: 1,
    dashed: 2
};

// =============================================
// GET CHART
// =============================================

function getChart() {
    try {
        if (typeof tvWidget !== 'undefined' && tvWidget.activeChart) {
            return tvWidget.activeChart();
        }
        if (window.tvWidget && window.tvWidget.activeChart) {
            return window.tvWidget.activeChart();
        }
        if (window.__tvWidget && window.__tvWidget.activeChart) {
            return window.__tvWidget.activeChart();
        }
        for (const key of Object.keys(window)) {
            try {
                const obj = window[key];
                if (obj && typeof obj === 'object' && typeof obj.activeChart === 'function') {
                    return obj.activeChart();
                }
            } catch (e) {}
        }
        return null;
    } catch (e) {
        console.error("❌ Error getting chart:", e);
        return null;
    }
}

// =============================================
// DRAW LINE
// =============================================

function drawLine(price, color, style, label) {
    if (!price || price === 0) return null;
    
    try {
        const chart = getChart();
        if (!chart) {
            console.error("❌ No chart available");
            return null;
        }
        
        const id = chart.createShape(
            {
                time: Math.floor(Date.now() / 1000),
                price: price
            },
            {
                shape: "horizontal_line",
                text: label || "",
                color: color,
                lineStyle: style || 0,
                linewidth: style === 1 ? 2 : style === 2 ? 1 : 2,
                visible: true,
                zorder: 10
            }
        );
        
        console.log(`✅ Drew: ${label} at ${price} (ID: ${id})`);
        return id;
        
    } catch (e) {
        console.error(`❌ Failed to draw ${label}:`, e);
        return null;
    }
}

// =============================================
// REMOVE LINE
// =============================================

function removeLine(id) {
    if (!id) return;
    try {
        const chart = getChart();
        if (chart) {
            chart.removeEntity(id);
            console.log(`🗑️ Removed line: ${id}`);
        }
    } catch (e) {
        console.warn(`⚠️ Failed to remove line:`, e);
    }
}

// =============================================
// UPDATE LEVEL
// =============================================

function updateLevel(key, newValue, label, color, style) {
    if (!newValue || newValue === 0) {
        if (shapes[key]) {
            removeLine(shapes[key]);
            shapes[key] = null;
        }
        lastValues[key] = null;
        return;
    }
    
    if (lastValues[key] !== newValue || !shapes[key]) {
        if (shapes[key]) {
            removeLine(shapes[key]);
        }
        const id = drawLine(newValue, color, style, `${label}: ${newValue}`);
        shapes[key] = id;
        lastValues[key] = newValue;
    }
}

// =============================================
// SYNC ALL LEVELS
// =============================================

function syncLevels(data) {
    console.log("🔄 Syncing levels...");
    
    updateLevel('ceSecondHighest', data.ceSecondHighest, 'CE 2nd', COLORS.ceSecondHighest, STYLES.dashed);
    updateLevel('peSecondHighest', data.peSecondHighest, 'PE 2nd', COLORS.peSecondHighest, STYLES.dashed);
    updateLevel('ceHighestVolume', data.ceHighestVolume, 'CE Vol', COLORS.ceHighestVolume, STYLES.solid);
    updateLevel('peHighestVolume', data.peHighestVolume, 'PE Vol', COLORS.peHighestVolume, STYLES.solid);
    
    updateLevel('buyEntry', data.targets?.buy?.entry, 'Buy Entry', COLORS.buyEntry, STYLES.solid);
    updateLevel('buySL', data.targets?.buy?.sl, 'Buy SL', COLORS.buySL, STYLES.dotted);
    updateLevel('buyTarget1', data.targets?.buy?.target1, 'Buy T1', COLORS.buyTarget1, STYLES.dashed);
    updateLevel('buyTarget2', data.targets?.buy?.target2, 'Buy T2', COLORS.buyTarget2, STYLES.dashed);
    
    updateLevel('sellEntry', data.targets?.sell?.entry, 'Sell Entry', COLORS.sellEntry, STYLES.solid);
    updateLevel('sellSL', data.targets?.sell?.sl, 'Sell SL', COLORS.sellSL, STYLES.dotted);
    updateLevel('sellTarget1', data.targets?.sell?.target1, 'Sell T1', COLORS.sellTarget1, STYLES.dashed);
    updateLevel('sellTarget2', data.targets?.sell?.target2, 'Sell T2', COLORS.sellTarget2, STYLES.dashed);
    
    console.log("✅ All levels synced");
}

// =============================================
// FETCH DATA FROM SUPABASE
// =============================================

async function fetchData() {
    try {
        const response = await fetch('https://kdneyzemvqzhwzztflvq.supabase.co/functions/v1/process-data');
        const json = await response.json();
        
        if (json.success) {
            console.log("📊 Data fetched:", json.data);
            syncLevels(json.data);
        } else {
            console.error("❌ API error:", json);
        }
    } catch (e) {
        console.error("❌ Fetch error:", e);
    }
}

// =============================================
// LISTEN FOR MESSAGES
// =============================================

window.addEventListener("message", async (event) => {
    if (event.source !== window) return;
    
    if (event.data.type === "DRAW_LINE") {
        console.log("📨 Drawing single line:", event.data);
        const chart = getChart();
        if (chart) {
            try {
                const id = chart.createShape(
                    { time: Math.floor(Date.now()/1000), price: event.data.price },
                    { shape: "horizontal_line", text: event.data.label || "TEST" }
                );
                console.log("✅ SUCCESS:", id);
            } catch (e) {
                console.error("❌ Draw error:", e);
            }
        }
        return;
    }
    
    if (event.data.type === "FETCH_AND_DRAW") {
        console.log("📨 Fetching and drawing...");
        await fetchData();
        return;
    }
    
    // ✅ NEW: Clear all lines
    if (event.data.type === "CLEAR_LINES") {
        console.log("🗑️ Clearing all lines...");
        const chart = getChart();
        if (chart) {
            const allShapes = chart.getAllShapes() || [];
            allShapes.forEach(s => {
                try { chart.removeEntity(s.id); } catch(e) {}
            });
            for (const key of Object.keys(shapes)) {
                shapes[key] = null;
                lastValues[key] = null;
            }
            console.log("✅ All lines cleared");
        }
        return;
    }
});

// =============================================
// AUTO-FETCH ON LOAD
// =============================================

console.log("⏳ Waiting 3 seconds before initial fetch...");
setTimeout(fetchData, 3000);

setInterval(fetchData, 10000);

console.log("✅ Nifty OI Injector ready!");
