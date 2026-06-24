document.addEventListener('DOMContentLoaded', function() {
    var status = document.getElementById('status');
    var fetchBtn = document.getElementById('fetchBtn');
    var copyBtn = document.getElementById('copyBtn');
    var dataDisplay = document.getElementById('dataDisplay');
    var currentData = null;
    
    fetchBtn.addEventListener('click', function() {
        status.textContent = 'Fetching data...';
        status.className = 'status loading';
        copyBtn.disabled = true;
        dataDisplay.className = 'data-display';
        
        chrome.runtime.sendMessage({ action: 'fetchData' }, function(response) {
            if (response && response.success) {
                currentData = response.data;
                status.textContent = 'Data fetched successfully!';
                status.className = 'status success';
                copyBtn.disabled = false;
                
                dataDisplay.textContent = JSON.stringify(currentData, null, 2);
                dataDisplay.className = 'data-display show';
            } else {
                var errorMsg = response?.error || 'Unknown error';
                status.textContent = 'Failed to fetch: ' + errorMsg;
                status.className = 'status error';
                currentData = null;
                
                dataDisplay.textContent = 'Error: ' + errorMsg;
                dataDisplay.className = 'data-display show';
            }
        });
    });
    
    copyBtn.addEventListener('click', function() {
        if (!currentData) {
            status.textContent = 'No data. Click Fetch Data first.';
            status.className = 'status error';
            return;
        }
        
        var code = generatePineScript(currentData);
        
        navigator.clipboard.writeText(code).then(function() {
            status.textContent = 'PineScript code copied!';
            status.className = 'status success';
        }).catch(function() {
            var textarea = document.createElement('textarea');
            textarea.value = code;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
            status.textContent = 'PineScript code copied!';
            status.className = 'status success';
        });
    });
});

function generatePineScript(data) {
    var targets = data.targets;
    
    var buyEntry = targets?.buy?.entry || 0;
    var buySL = targets?.buy?.sl || 0;
    var buyT1 = targets?.buy?.target1 || 0;
    var buyT2 = targets?.buy?.target2 || 0;
    var buyT3 = targets?.buy?.target3 || 0;
    
    var sellEntry = targets?.sell?.entry || 0;
    var sellSL = targets?.sell?.sl || 0;
    var sellT1 = targets?.sell?.target1 || 0;
    var sellT2 = targets?.sell?.target2 || 0;
    var sellT3 = targets?.sell?.target3 || 0;
    
    return '//@version=6\n' +
           'indicator("Nifty OI Levels", overlay=true)\n\n' +
           '// =============================================\n' +
           '// LIVE DATA FROM SUPABASE\n' +
           '// =============================================\n\n' +
           '// BUY LEVELS\n' +
           'buyEntry = input.float(' + buyEntry + ', "Buy Entry")\n' +
           'buySL = input.float(' + buySL + ', "Buy SL")\n' +
           'buyTarget1 = input.float(' + buyT1 + ', "Buy Target 1")\n' +
           'buyTarget2 = input.float(' + buyT2 + ', "Buy Target 2")\n' +
           'buyTarget3 = input.float(' + buyT3 + ', "Buy Target 3")\n\n' +
           '// SELL LEVELS\n' +
           'sellEntry = input.float(' + sellEntry + ', "Sell Entry")\n' +
           'sellSL = input.float(' + sellSL + ', "Sell SL")\n' +
           'sellTarget1 = input.float(' + sellT1 + ', "Sell Target 1")\n' +
           'sellTarget2 = input.float(' + sellT2 + ', "Sell Target 2")\n' +
           'sellTarget3 = input.float(' + sellT3 + ', "Sell Target 3")\n\n' +
           '// =============================================\n' +
           '// PLOT LINES\n' +
           '// =============================================\n\n' +
           '// Buy Levels\n' +
           'plot(buyEntry, title="Buy Entry", color=color.green, linewidth=2, style=plot.style_stepline)\n' +
           'plot(buySL, title="Buy SL", color=color.green, linewidth=2, style=plot.style_circles)\n' +
           'plot(buyTarget1, title="Buy Target 1", color=color.green, linewidth=2, style=plot.style_stepline)\n' +
           'plot(buyTarget2, title="Buy Target 2", color=color.green, linewidth=2, style=plot.style_stepline)\n' +
           'plot(buyTarget3, title="Buy Target 3", color=color.green, linewidth=2, style=plot.style_stepline)\n\n' +
           '// Sell Levels\n' +
           'plot(sellEntry, title="Sell Entry", color=color.red, linewidth=2, style=plot.style_stepline)\n' +
           'plot(sellSL, title="Sell SL", color=color.red, linewidth=2, style=plot.style_circles)\n' +
           'plot(sellTarget1, title="Sell Target 1", color=color.red, linewidth=2, style=plot.style_stepline)\n' +
           'plot(sellTarget2, title="Sell Target 2", color=color.red, linewidth=2, style=plot.style_stepline)\n' +
           'plot(sellTarget3, title="Sell Target 3", color=color.red, linewidth=2, style=plot.style_stepline)\n\n' +
           '// =============================================\n' +
           '// LABELS (NO BOX)\n' +
           '// =============================================\n\n' +
           'if barstate.islast\n' +
           '    // Buy Labels\n' +
           '    label.new(bar_index, buyEntry, text="BUY", color=color.green, style=label.style_none, textcolor=color.green, size=size.large)\n' +
           '    label.new(bar_index, buySL, text="SL", color=color.green, style=label.style_none, textcolor=color.green, size=size.normal)\n' +
           '    label.new(bar_index, buyTarget1, text="T1", color=color.green, style=label.style_none, textcolor=color.green, size=size.normal)\n' +
           '    label.new(bar_index, buyTarget2, text="T2", color=color.green, style=label.style_none, textcolor=color.green, size=size.normal)\n' +
           '    label.new(bar_index, buyTarget3, text="T3", color=color.green, style=label.style_none, textcolor=color.green, size=size.normal)\n' +
           '    \n' +
           '    // Sell Labels\n' +
           '    label.new(bar_index, sellEntry, text="SELL", color=color.red, style=label.style_none, textcolor=color.red, size=size.large)\n' +
           '    label.new(bar_index, sellSL, text="SL", color=color.red, style=label.style_none, textcolor=color.red, size=size.normal)\n' +
           '    label.new(bar_index, sellTarget1, text="T1", color=color.red, style=label.style_none, textcolor=color.red, size=size.normal)\n' +
           '    label.new(bar_index, sellTarget2, text="T2", color=color.red, style=label.style_none, textcolor=color.red, size=size.normal)\n' +
           '    label.new(bar_index, sellTarget3, text="T3", color=color.red, style=label.style_none, textcolor=color.red, size=size.normal)\n';
}
