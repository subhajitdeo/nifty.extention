// =============================================
// POPUP SCRIPT
// =============================================

let currentData = null;

document.addEventListener('DOMContentLoaded', function() {
    const status = document.getElementById('status');
    const fetchBtn = document.getElementById('fetchBtn');
    const copyBtn = document.getElementById('copyBtn');
    const dataDisplay = document.getElementById('dataDisplay');
    
    // =============================================
    // FETCH DATA
    // =============================================
    fetchBtn.addEventListener('click', function() {
        status.textContent = '⏳ Fetching data...';
        status.className = 'status loading';
        copyBtn.disabled = true;
        dataDisplay.className = 'data-display';
        
        chrome.runtime.sendMessage({ action: 'fetchData' }, function(response) {
            if (response && response.success) {
                currentData = response.data;
                status.textContent = '✅ Data fetched successfully!';
                status.className = 'status success';
                copyBtn.disabled = false;
                
                // Show data preview
                dataDisplay.textContent = JSON.stringify(currentData, null, 2);
                dataDisplay.className = 'data-display show';
                
                console.log('📊 Data:', currentData);
            } else {
                status.textContent = '❌ Failed to fetch data: ' + (response?.error || 'Unknown error');
                status.className = 'status error';
                currentData = null;
            }
        });
    });
    
    // =============================================
    // COPY PINESCRIPT CODE
    // =============================================
    copyBtn.addEventListener('click', function() {
        if (!currentData) {
            status.textContent = '❌ No data! Click "Fetch Data" first.';
            status.className = 'status error';
            return;
        }
        
        const code = generatePineScript(currentData);
        
        navigator.clipboard.writeText(code).then(function() {
            status.textContent = '✅ PineScript code copied to clipboard!';
            status.className = 'status success';
        }).catch(function() {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = code;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
            status.textContent = '✅ PineScript code copied to clipboard!';
            status.className = 'status success';
        });
    });
});

// =============================================
// GENERATE PINESCRIPT CODE
// =============================================

function generatePineScript(data) {
    const targets = data.targets;
    const ceSecond = data.ceSecondHighest || 0;
    const peSecond = data.peSecondHighest || 0;
    const ceVol = data.ceHighestVolume || 0;
    const peVol = data.peHighestVolume || 0;
    
    // Get values or defaults
    const buyEntry = targets?.buy?.entry || 0;
    const buySL = targets?.buy?.sl || 0;
    const buyT1 = targets?.buy?.target1 || 0;
    const buyT2 = targets?.buy?.target2 || 0;
    const buyT3 = buyT2 + 50 || 0;
    
    const sellEntry = targets?.sell?.entry || 0;
    const sellSL = targets?.sell?.sl || 0;
    const sellT1 = targets?.sell?.target1 || 0;
    const sellT2 = targets?.sell?.target2 || 0;
    const sellT3 = sellT2 - 50 || 0;
    
    return `//@version=6
indicator("Nifty OI Levels", overlay=true)

// =============================================
// LIVE DATA FROM SUPABASE
// =============================================

// OI Levels (for reference)
// CE 2nd Highest: ${ceSecond}
// PE 2nd Highest: ${peSecond}
// CE Highest Volume: ${ceVol}
// PE Highest Volume: ${peVol}

// =============================================
// BUY LEVELS
// =============================================

buyEntry = input.float(${buyEntry}, "Buy Entry")
buySL = input.float(${buySL}, "Buy SL")
buyTarget1 = input.float(${buyT1}, "Buy Target 1")
buyTarget2 = input.float(${buyT2}, "Buy Target 2")
buyTarget3 = input.float(${buyT3}, "Buy Target 3")

// =============================================
// SELL LEVELS
// =============================================

sellEntry = input.float(${sellEntry}, "Sell Entry")
sellSL = input.float(${sellSL}, "Sell SL")
sellTarget1 = input.float(${sellT1}, "Sell Target 1")
sellTarget2 = input.float(${sellT2}, "Sell Target 2")
sellTarget3 = input.float(${sellT3}, "Sell Target 3")

// =============================================
// PLOT LINES
// =============================================

// Buy Levels
plot(buyEntry, title="Buy Entry", color=color.green, linewidth=2, style=plot.style_stepline)
plot(buySL, title="Buy SL", color=color.green, linewidth=2, style=plot.style_circles)
plot(buyTarget1, title="Buy Target 1", color=color.green, linewidth=2, style=plot.style_stepline)
plot(buyTarget2, title="Buy Target 2", color=color.green, linewidth=2, style=plot.style_stepline)
plot(buyTarget3, title="Buy Target 3", color=color.green, linewidth=2, style=plot.style_stepline)

// Sell Levels
plot(sellEntry, title="Sell Entry", color=color.red, linewidth=2, style=plot.style_stepline)
plot(sellSL, title="Sell SL", color=color.red, linewidth=2, style=plot.style_circles)
plot(sellTarget1, title="Sell Target 1", color=color.red, linewidth=2, style=plot.style_stepline)
plot(sellTarget2, title="Sell Target 2", color=color.red, linewidth=2, style=plot.style_stepline)
plot(sellTarget3, title="Sell Target 3", color=color.red, linewidth=2, style=plot.style_stepline)

// =============================================
// LABELS (NO BOX)
// =============================================

if barstate.islast
    // Buy Labels
    label.new(bar_index, buyEntry, text="BUY", color=color.green, style=label.style_none, textcolor=color.green, size=size.large)
    label.new(bar_index, buySL, text="SL", color=color.green, style=label.style_none, textcolor=color.green, size=size.normal)
    label.new(bar_index, buyTarget1, text="T1", color=color.green, style=label.style_none, textcolor=color.green, size=size.normal)
    label.new(bar_index, buyTarget2, text="T2", color=color.green, style=label.style_none, textcolor=color.green, size=size.normal)
    label.new(bar_index, buyTarget3, text="T3", color=color.green, style=label.style_none, textcolor=color.green, size=size.normal)
    
    // Sell Labels
    label.new(bar_index, sellEntry, text="SELL", color=color.red, style=label.style_none, textcolor=color.red, size=size.large)
    label.new(bar_index, sellSL, text="SL", color=color.red, style=label.style_none, textcolor=color.red, size=size.normal)
    label.new(bar_index, sellTarget1, text="T1", color=color.red, style=label.style_none, textcolor=color.red, size=size.normal)
    label.new(bar_index, sellTarget2, text="T2", color=color.red, style=label.style_none, textcolor=color.red, size=size.normal)
    label.new(bar_index, sellTarget3, text="T3", color=color.red, style=label.style_none, textcolor=color.red, size=size.normal)
`;
}
