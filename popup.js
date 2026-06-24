// =============================================
// POPUP SCRIPT
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    const status = document.getElementById('status');
    const copyBox = document.getElementById('copyBox');
    
    // =============================================
    // 1. REFRESH LINES
    // =============================================
    document.getElementById('refreshBtn').addEventListener('click', function() {
        status.textContent = 'Refreshing...';
        sendToTab({ action: 'refreshLines' }, function(response) {
            status.textContent = response?.success ? 'Lines refreshed!' : 'Failed to refresh';
        });
    });
    
    // =============================================
    // 2. COPY CONSOLE CODE
    // =============================================
    document.getElementById('copyConsoleBtn').addEventListener('click', function() {
        const code = generateConsoleCode();
        copyToClipboard(code);
        copyBox.textContent = code;
        copyBox.className = 'copy-box show';
        status.textContent = 'Code copied! Paste in console.';
        
        setTimeout(function() {
            copyBox.className = 'copy-box';
        }, 10000);
    });
    
    // =============================================
    // 3. COPY FULL SCRIPT
    // =============================================
    document.getElementById('copyFullBtn').addEventListener('click', function() {
        const code = generateFullScript();
        copyToClipboard(code);
        copyBox.textContent = code.substring(0, 500) + '... (full copied)';
        copyBox.className = 'copy-box show';
        status.textContent = 'Full script copied! Paste in console.';
        
        setTimeout(function() {
            copyBox.className = 'copy-box';
        }, 10000);
    });
    
    // =============================================
    // 4. CLEAR ALL LINES
    // =============================================
    document.getElementById('clearBtn').addEventListener('click', function() {
        status.textContent = 'Clearing...';
        sendToTab({ action: 'clearLines' }, function(response) {
            status.textContent = response?.success ? 'All lines cleared!' : 'Failed to clear';
        });
    });
    
    // =============================================
    // HELPER: Send message to content script
    // =============================================
    function sendToTab(message, callback) {
        chrome.tabs.query({ url: 'https://charting.nseindia.com/*' }, function(tabs) {
            if (tabs.length === 0) {
                status.textContent = 'Open NSE chart first!';
                if (callback) callback({ success: false });
                return;
            }
            chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
                if (callback) callback(response || { success: false });
            });
        });
    }
    
    // =============================================
    // HELPER: Copy to clipboard
    // =============================================
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(function() {
            var textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
        });
    }
});

// =============================================
// GENERATE CONSOLE CODE
// =============================================

function generateConsoleCode() {
    return [
        '// =============================================',
        '// PASTE THIS IN CONSOLE TO DRAW OI LEVELS',
        '// =============================================',
        '',
        '(async function drawOILines() {',
        '    console.log("Fetching OI data...");',
        '    ',
        '    try {',
        '        var response = await fetch("https://kdneyzemvqzhwzztflvq.supabase.co/functions/v1/process-data");',
        '        var json = await response.json();',
        '        if (!json.success) { console.error("API error"); return; }',
        '        ',
        '        var data = json.data;',
        '        console.log("Data:", data);',
        '        ',
        '        var chart = tvWidget.activeChart();',
        '        if (!chart) { console.error("No chart"); return; }',
        '        ',
        '        // Remove old OI lines',
        '        var allShapes = chart.getAllShapes() || [];',
        '        var oldShapes = allShapes.filter(function(s) { return s.text && s.text.indexOf("OI:") !== -1; });',
        '        oldShapes.forEach(function(s) { chart.removeEntity(s.id); console.log("Removed:", s.text); });',
        '        ',
        '        var COLORS = {',
        '            ceSecondHighest: "#FFD700", peSecondHighest: "#FF8C00",',
        '            ceHighestVolume: "#2196F3", peHighestVolume: "#9C27B0",',
        '            buyEntry: "#4CAF50", buySL: "#4CAF50",',
        '            buyTarget1: "#4CAF50", buyTarget2: "#4CAF50",',
        '            sellEntry: "#F44336", sellSL: "#F44336",',
        '            sellTarget1: "#F44336", sellTarget2: "#F44336"',
        '        };',
        '        ',
        '        function draw(price, color, style, label) {',
        '            if (!price || price === 0) return;',
        '            var id = chart.createShape(',
        '                { time: Math.floor(Date.now()/1000), price: price },',
        '                { shape: "horizontal_line", text: "OI: " + label + " " + price,',
        '                  color: color, lineStyle: style, linewidth: style===1?2:style===2?1:2, visible: true, zorder: 10 }',
        '            );',
        '            console.log("Drew " + label + " at " + price + " (ID: " + id + ")");',
        '        }',
        '        ',
        '        draw(data.ceSecondHighest, COLORS.ceSecondHighest, 2, "CE 2nd");',
        '        draw(data.peSecondHighest, COLORS.peSecondHighest, 2, "PE 2nd");',
        '        draw(data.ceHighestVolume, COLORS.ceHighestVolume, 0, "CE Vol");',
        '        draw(data.peHighestVolume, COLORS.peHighestVolume, 0, "PE Vol");',
        '        draw(data.targets?.buy?.entry, COLORS.buyEntry, 0, "Buy Entry");',
        '        draw(data.targets?.buy?.sl, COLORS.buySL, 1, "Buy SL");',
        '        draw(data.targets?.buy?.target1, COLORS.buyTarget1, 2, "Buy T1");',
        '        draw(data.targets?.buy?.target2, COLORS.buyTarget2, 2, "Buy T2");',
        '        draw(data.targets?.sell?.entry, COLORS.sellEntry, 0, "Sell Entry");',
        '        draw(data.targets?.sell?.sl, COLORS.sellSL, 1, "Sell SL");',
        '        draw(data.targets?.sell?.target1, COLORS.sellTarget1, 2, "Sell T1");',
        '        draw(data.targets?.sell?.target2, COLORS.sellTarget2, 2, "Sell T2");',
        '        ',
        '        console.log("All lines drawn!");',
        '    } catch(e) { console.error("Error:", e); }',
        '})();'
    ].join('\n');
}

// =============================================
// GENERATE FULL SCRIPT
// =============================================

function generateFullScript() {
    return [
        '// =============================================',
        '// FULL NIFTY OI INJECTOR - PASTE IN CONSOLE',
        '// =============================================',
        '',
        '(function() {',
        '    console.log("Running full OI injector...");',
        '    var chart = tvWidget.activeChart();',
        '    if (!chart) { console.error("No chart"); return; }',
        '    ',
        '    var shapes = {};',
        '    var lastValues = {};',
        '    var COLORS = {',
        '        ceSecondHighest: "#FFD700", peSecondHighest: "#FF8C00",',
        '        ceHighestVolume: "#2196F3", peHighestVolume: "#9C27B0",',
        '        buyEntry: "#4CAF50", buySL: "#4CAF50",',
        '        buyTarget1: "#4CAF50", buyTarget2: "#4CAF50",',
        '        sellEntry: "#F44336", sellSL: "#F44336",',
        '        sellTarget1: "#F44336", sellTarget2: "#F44336"',
        '    };',
        '    var STYLES = { solid: 0, dotted: 1, dashed: 2 };',
        '    ',
        '    function drawLine(price, color, style, label) {',
        '        if (!price || price === 0) return null;',
        '        try {',
        '            var id = chart.createShape(',
        '                { time: Math.floor(Date.now()/1000), price: price },',
        '                { shape: "horizontal_line", text: label + ": " + price,',
        '                  color: color, lineStyle: style, linewidth: style===1?2:style===2?1:2, visible: true, zorder: 10 }',
        '            );',
        '            console.log("Drew " + label + " at " + price);',
        '            return id;',
        '        } catch(e) { console.error("Failed " + label + ":", e); return null; }',
        '    }',
        '    ',
        '    function removeLine(id) { if(id) try{ chart.removeEntity(id); }catch(e){} }',
        '    ',
        '    function updateLevel(key, value, label, color, style) {',
        '        if (!value || value === 0) {',
        '            if(shapes[key]) removeLine(shapes[key]);',
        '            shapes[key]=null; lastValues[key]=null; return;',
        '        }',
        '        if (lastValues[key] !== value || !shapes[key]) {',
        '            if(shapes[key]) removeLine(shapes[key]);',
        '            shapes[key] = drawLine(value, color, style, label);',
        '            lastValues[key] = value;',
        '        }',
        '    }',
        '    ',
        '    async function fetchAndDraw() {',
        '        try {',
        '            var response = await fetch("https://kdneyzemvqzhwzztflvq.supabase.co/functions/v1/process-data");',
        '            var json = await response.json();',
        '            if (!json.success) { console.error("API error"); return; }',
        '            var data = json.data;',
        '            console.log("Data:", data);',
        '            updateLevel("ceSecondHighest", data.ceSecondHighest, "CE 2nd", COLORS.ceSecondHighest, STYLES.dashed);',
        '            updateLevel("peSecondHighest", data.peSecondHighest, "PE 2nd", COLORS.peSecondHighest, STYLES.dashed);',
        '            updateLevel("ceHighestVolume", data.ceHighestVolume, "CE Vol", COLORS.ceHighestVolume, STYLES.solid);',
        '            updateLevel("peHighestVolume", data.peHighestVolume, "PE Vol", COLORS.peHighestVolume, STYLES.solid);',
        '            updateLevel("buyEntry", data.targets?.buy?.entry, "Buy Entry", COLORS.buyEntry, STYLES.solid);',
        '            updateLevel("buySL", data.targets?.buy?.sl, "Buy SL", COLORS.buySL, STYLES.dotted);',
        '            updateLevel("buyTarget1", data.targets?.buy?.target1, "Buy T1", COLORS.buyTarget1, STYLES.dashed);',
        '            updateLevel("buyTarget2", data.targets?.buy?.target2, "Buy T2", COLORS.buyTarget2, STYLES.dashed);',
        '            updateLevel("sellEntry", data.targets?.sell?.entry, "Sell Entry", COLORS.sellEntry, STYLES.solid);',
        '            updateLevel("sellSL", data.targets?.sell?.sl, "Sell SL", COLORS.sellSL, STYLES.dotted);',
        '            updateLevel("sellTarget1", data.targets?.sell?.target1, "Sell T1", COLORS.sellTarget1, STYLES.dashed);',
        '            updateLevel("sellTarget2", data.targets?.sell?.target2, "Sell T2", COLORS.sellTarget2, STYLES.dashed);',
        '            console.log("All levels updated!");',
        '        } catch(e) { console.error("Error:", e); }',
        '    }',
        '    ',
        '    fetchAndDraw();',
        '    setInterval(fetchAndDraw, 10000);',
        '    console.log("Auto-updating every 10 seconds");',
        '})();'
    ].join('\n');
}
