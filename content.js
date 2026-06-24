// =============================================
// CONTENT SCRIPT - PURE DIAGNOSTIC
// NO DRAWING, ONLY LOGGING
// =============================================

console.log("========================================");
console.log("🔬 CONTENT SCRIPT DIAGNOSTIC STARTED");
console.log("========================================");

// =============================================
// 1. BASIC CONTEXT INFORMATION
// =============================================

console.log("📍 document.location.href:", document.location.href);
console.log("📍 document.readyState:", document.readyState);

// =============================================
// 2. CHROME EXTENSION CONTEXT
// =============================================

console.log("🔧 chrome.runtime.id:", chrome.runtime.id);

// Try to determine execution world
try {
    // If this throws, we're not in MAIN world
    const test = window.__TEST__;
    console.log("🔧 Execution world: MAIN (window.__TEST__ accessible)");
} catch (e) {
    console.log("🔧 Execution world: ISOLATED (window.__TEST__ not accessible)");
}

// Check if we're in page context
console.log("🔧 Is this running in page context?", window === window.top ? "Yes (top)" : "No (iframe)");

// =============================================
// 3. TVWIDGET DETECTION (EVERY SECOND)
// =============================================

let attempt = 0;
const maxAttempts = 30;

function checkTvWidget() {
    attempt++;
    
    console.log(`\n--- Attempt #${attempt} ---`);
    console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);
    
    // Check all possible ways tvWidget might exist
    console.log("📊 typeof tvWidget:", typeof tvWidget);
    console.log("📊 window.tvWidget:", window.tvWidget);
    console.log("📊 typeof window.tvWidget:", typeof window.tvWidget);
    
    // Check if it's in the window object's keys
    if (window) {
        const keys = Object.keys(window);
        const tvKeys = keys.filter(k => k.toLowerCase().includes('tv') || k.toLowerCase().includes('chart'));
        console.log("📊 Window keys containing 'tv' or 'chart':", tvKeys.slice(0, 10));
        
        // Check for any object with activeChart method
        let foundChart = false;
        for (const key of keys) {
            try {
                const obj = window[key];
                if (obj && typeof obj === 'object' && typeof obj.activeChart === 'function') {
                    console.log(`📊 Found activeChart on window.${key}`);
                    foundChart = true;
                }
            } catch (e) {
                // ignore
            }
        }
        
        if (!foundChart) {
            console.log("📊 No object with activeChart found on window");
        }
    }
    
    // Check if tvWidget exists and has activeChart
    let tvWidgetExists = false;
    let hasActiveChart = false;
    let chartExists = false;
    let hasWhenChartReady = false;
    
    try {
        if (typeof tvWidget !== 'undefined') {
            tvWidgetExists = true;
            console.log("📊 tvWidget exists");
            
            if (typeof tvWidget.activeChart === 'function') {
                hasActiveChart = true;
                console.log("📊 tvWidget.activeChart is a function");
                
                const chart = tvWidget.activeChart();
                if (chart) {
                    chartExists = true;
                    console.log("📊 activeChart() returned:", chart);
                    console.log("📊 Chart constructor:", chart.constructor.name);
                    
                    if (typeof chart.whenChartReady === 'function') {
                        hasWhenChartReady = true;
                        console.log("📊 chart.whenChartReady exists");
                    } else {
                        console.log("📊 chart.whenChartReady does NOT exist");
                    }
                } else {
                    console.log("📊 activeChart() returned null/undefined");
                }
            } else {
                console.log("📊 tvWidget.activeChart is NOT a function");
            }
        } else {
            console.log("📊 tvWidget is undefined");
        }
    } catch (e) {
        console.error("📊 Error checking tvWidget:", e);
    }
    
    // Check TradingView global
    console.log("📊 typeof TradingView:", typeof TradingView);
    if (typeof TradingView !== 'undefined') {
        console.log("📊 TradingView:", TradingView);
        console.log("📊 TradingView.widget:", TradingView.widget);
    }
    
    // =============================================
    // 4. IF TVWIDGET FOUND, TEST CHART READY
    // =============================================
    
    if (tvWidgetExists && hasActiveChart) {
        console.log("\n🟢 tvWidget is available! Testing chart ready...");
        
        try {
            const chart = tvWidget.activeChart();
            
            if (chart && typeof chart.whenChartReady === 'function') {
                console.log("⏳ Calling whenChartReady...");
                chart.whenChartReady(function() {
                    console.log("✅ Chart Ready! (whenChartReady callback fired)");
                    
                    // Now try to create a shape
                    console.log("🎯 Attempting to create shape...");
                    
                    try {
                        const id = chart.createShape(
                            {
                                time: Math.floor(Date.now() / 1000),
                                price: 24200
                            },
                            {
                                shape: "horizontal_line",
                                text: "TEST"
                            }
                        );
                        
                        console.log("✅ Shape created! ID:", id);
                        console.log("📊 All shapes:", chart.getAllShapes());
                        
                    } catch (e) {
                        console.error("❌ Failed to create shape:", e);
                    }
                });
            } else {
                console.log("⚠️ chart.whenChartReady is not available, trying direct create...");
                
                // Try direct creation as fallback
                try {
                    const id = chart.createShape(
                        {
                            time: Math.floor(Date.now() / 1000),
                            price: 24200
                        },
                        {
                            shape: "horizontal_line",
                            text: "TEST"
                        }
                    );
                    
                    console.log("✅ Direct shape creation succeeded! ID:", id);
                    
                } catch (e) {
                    console.error("❌ Direct shape creation failed:", e);
                }
            }
            
        } catch (e) {
            console.error("❌ Error in chart test:", e);
        }
    }
    
    // =============================================
    // 5. CONTINUE OR STOP
    // =============================================
    
    if (attempt < maxAttempts) {
        setTimeout(checkTvWidget, 1000);
    } else {
        console.log("\n========================================");
        console.log("🔬 DIAGNOSTIC COMPLETE - MAX ATTEMPTS REACHED");
        console.log("========================================");
        console.log("Summary:");
        console.log(`- tvWidget exists: ${tvWidgetExists}`);
        console.log(`- hasActiveChart: ${hasActiveChart}`);
        console.log(`- chartExists: ${chartExists}`);
        console.log(`- hasWhenChartReady: ${hasWhenChartReady}`);
        console.log(`- Execution world: ${window === window.top ? 'Main' : 'Isolated'}`);
        console.log("========================================");
    }
}

// =============================================
// 6. START DIAGNOSTIC
// =============================================

console.log("\n⏳ Starting diagnostic checks...\n");
setTimeout(checkTvWidget, 1000);
