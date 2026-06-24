console.log('Background service worker started');

async function fetchSupabaseData() {
    try {
        const url = 'https://kdneyzemvqzhwzztflvq.supabase.co/functions/v1/process-data';
        const response = await fetch(url);
        
        if (!response.ok) {
            return { success: false, error: 'HTTP ' + response.status };
        }
        
        const json = await response.json();
        return json;
        
    } catch (e) {
        return { success: false, error: e.message || 'Network error' };
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'fetchData') {
        fetchSupabaseData().then(function(result) {
            sendResponse(result);
        });
        return true;
    }
});
