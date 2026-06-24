document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('testBtn').addEventListener('click', function() {
        chrome.tabs.query({ url: 'https://charting.nseindia.com/*' }, function(tabs) {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'testDraw' });
                document.getElementById('status').textContent = '✅ Test sent!';
            } else {
                document.getElementById('status').textContent = '❌ No NSE chart tab found';
            }
        });
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'statusUpdate') {
        document.getElementById('status').textContent = request.message;
    }
});
