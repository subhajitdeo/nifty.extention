// =============================================
// BACKGROUND SERVICE WORKER
// =============================================

const API_URL = 'https://kdneyzemvqzhwzztflvq.supabase.co/functions/v1/process-data';
const FETCH_INTERVAL_MS = 5000; // 5 seconds

let currentData = null;
let lastData = null;
let isFirstFetch = true;

// =============================================
// FETCH DATA FROM SUPABASE
// =============================================

async function fetchOIData() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const json = await response.json();

    if (!json.success) {
      throw new Error(json.error || 'API returned success=false');
    }

    currentData = json.data;
    currentData._timestamp = Date.now();

    // Store for popup
    chrome.storage.local.set({ 
      oiData: currentData,
      lastUpdated: new Date().toISOString()
    });

    // Send to all active NSE chart tabs
    sendToAllTabs(currentData);

    // Log changes
    if (isFirstFetch) {
      console.log('📊 Initial data loaded:', currentData);
      isFirstFetch = false;
    } else {
      logChanges(lastData, currentData);
    }

    lastData = JSON.parse(JSON.stringify(currentData));

  } catch (error) {
    console.error('❌ Error fetching OI data:', error);
  }
}

// =============================================
// SEND DATA TO ALL NSE CHART TABS
// =============================================

function sendToAllTabs(data) {
  chrome.tabs.query({ url: 'https://charting.nseindia.com/*' }, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        action: 'updateLevels',
        data: data
      }).catch(() => {
        // Tab might not be ready, ignore
      });
    });
  });
}

// =============================================
// LOG CHANGES (Debug)
// =============================================

function logChanges(oldData, newData) {
  if (!oldData) return;

  const changes = [];
  const keys = [
    'ceSecondHighest', 'peSecondHighest',
    'ceHighestVolume', 'peHighestVolume'
  ];
  const targetKeys = [
    'entry', 'sl', 'target1', 'target2'
  ];

  // Check OI levels
  keys.forEach(key => {
    if (oldData[key] !== newData[key]) {
      changes.push(`${key}: ${oldData[key]} → ${newData[key]}`);
    }
  });

  // Check buy targets
  targetKeys.forEach(key => {
    const oldVal = oldData.targets?.buy?.[key];
    const newVal = newData.targets?.buy?.[key];
    if (oldVal !== newVal) {
      changes.push(`buy.${key}: ${oldVal} → ${newVal}`);
    }
  });

  // Check sell targets
  targetKeys.forEach(key => {
    const oldVal = oldData.targets?.sell?.[key];
    const newVal = newData.targets?.sell?.[key];
    if (oldVal !== newVal) {
      changes.push(`sell.${key}: ${oldVal} → ${newVal}`);
    }
  });

  if (changes.length > 0) {
    console.log('🔄 Changes detected:', changes.join(', '));
  }
}

// =============================================
// START FETCHING
// =============================================

// Fetch immediately
fetchOIData();

// Then every 5 seconds
setInterval(fetchOIData, FETCH_INTERVAL_MS);

// =============================================
// LISTEN FOR POPUP MESSAGES
// =============================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    chrome.storage.local.get(['oiData', 'lastUpdated'], (result) => {
      sendResponse(result);
    });
    return true;
  }

  if (request.action === 'forceUpdate') {
    fetchOIData();
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'getStatus') {
    const hasData = currentData !== null;
    const hasTrade = currentData?.targets?.buy?.entry !== null && 
                     currentData?.targets?.sell?.entry !== null;
    sendResponse({
      hasData,
      hasTrade,
      timestamp: currentData?._timestamp || null
    });
    return true;
  }
});
