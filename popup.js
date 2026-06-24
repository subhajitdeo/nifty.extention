document.getElementById('drawBtn').addEventListener('click', function() {
    chrome.tabs.query({ url: 'https://charting.nseindia.com/*' }, function(tabs) {
        if (tabs.length === 0) {
            document.getElementById('status').textContent = '❌ Open NSE chart';
            return;
        }
        
        document.getElementById('status').textContent = '📤 Sending...';
        
        chrome.tabs.sendMessage(tabs[0].id, { action: 'drawLine' }, function(response) {
            if (response && response.success) {
                document.getElementById('status').textContent = '✅ Sent! Check chart.';
            } else {
                document.getElementById('status').textContent = '⚠️ Failed';
            }
        });
    });
});
