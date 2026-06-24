console.log("Background service worker started");

async function fetchSupabaseData() {
    try {
        const response = await fetch('https://kdneyzemvqzhwzztflvq.supabase.co/functions/v1/process-data');
        const json = await response.json();
        return json;
    } catch (e) {
        console.error("Fetch error:", e);
        return null;
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'fetchData') {
        fetchSupabaseData().then(function(data) {
            if (data && data.success) {
                sendResponse({ success: true, data: data.data });
            } else {
                sendResponse({ success: false, error: 'Failed to fetch' });
            }
        });
        return true;
    }
});
