// =============================================
// CONTENT SCRIPT - MINIMAL TEST
// REPLICATES EXACTLY WHAT WORKED IN CONSOLE
// =============================================

console.log("🚀 CONTENT SCRIPT STARTED");
console.log("window.tvWidget =", window.tvWidget);
console.log("typeof tvWidget =", typeof tvWidget);

// =============================================
// EXACT COPY OF CONSOLE SUCCESS
// =============================================

async function drawHorizontalLine(price, label) {
    try {
        const chart = tvWidget.activeChart();
        const id = await chart.createShape(
            {
                time: Math.floor(Date.now() / 1000),
                price: price
            },
            {
                shape: "horizontal_line",
                text: label
            }
        );
        console.log("✅ SUCCESS", id);
        return id;
    } catch (e) {
        console.error("❌ DRAW ERROR", e);
        return null;
    }
}

// =============================================
// TEST - EXACTLY LIKE CONSOLE
// =============================================

async function testDraw() {
    console.log("🧪 Starting test...");
    
    try {
        const id = await drawHorizontalLine(24200, "TEST");
        console.log("🎯 Test result:", id);
        
        if (id) {
            console.log("✅ LINE DRAWN SUCCESSFULLY!");
        } else {
            console.log("❌ Line failed - check errors above");
        }
    } catch (error) {
        console.error("💥 Test crashed:", error);
    }
}

// =============================================
// RUN TEST WHEN READY
// =============================================

function waitForTvWidget() {
    console.log("⏳ Waiting for tvWidget...");
    
    let attempts = 0;
    const maxAttempts = 30;
    
    const check = setInterval(function() {
        attempts++;
        
        if (typeof tvWidget !== 'undefined' && tvWidget.activeChart) {
            clearInterval(check);
            console.log("✅ tvWidget found!");
            testDraw();
            return;
        }
        
        if (attempts >= maxAttempts) {
            clearInterval(check);
            console.log("❌ tvWidget not found after 30 attempts");
            console.log("window.tvWidget =", window.tvWidget);
            console.log("typeof tvWidget =", typeof tvWidget);
        }
    }, 1000);
}

// =============================================
// START
// =============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForTvWidget);
} else {
    waitForTvWidget();
}

// Also try immediately in case it's already loaded
setTimeout(function() {
    if (typeof tvWidget !== 'undefined') {
        console.log("🔄 tvWidget detected via timeout, running test...");
        testDraw();
    }
}, 3000);
