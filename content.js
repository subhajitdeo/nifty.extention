// =============================================
// CONTENT SCRIPT - NATIVE TRADINGVIEW API
// =============================================

// =============================================
// CONFIGURATION
// =============================================

const CONFIG = {
  MAX_RETRIES: 60,
  RETRY_INTERVAL_MS: 1000,
  LINE_COLORS: {
    ceSecondHighest: '#FFD700',   // Yellow
    peSecondHighest: '#FF8C00',   // Orange
    ceHighestVolume: '#2196F3',   // Blue
    peHighestVolume: '#9C27B0',   // Purple
    buyEntry: '#4CAF50',          // Green
    buySL: '#4CAF50',             // Green (dotted)
    buyTarget1: '#4CAF50',        // Green (dashed)
    buyTarget2: '#4CAF50',        // Green (dashed)
    sellEntry: '#F44336',         // Red
    sellSL: '#F44336',            // Red (dotted)
    sellTarget1: '#F44336',       // Red (dashed)
    sellTarget2: '#F44336'        // Red (dashed)
  },
  LINE_STYLES: {
    solid: 0,
    dotted: 1,
    dashed: 2
  },
  LINE_WIDTHS: {
    solid: 2,
    dotted: 2,
    dashed: 1
  }
};

// =============================================
// STATE
// =============================================

let chartWidget = null;
let isReady = false;
let pendingData = null;

// Shape IDs for each level
const shapes = {
  ceSecondHighest: null,
  peSecondHighest: null,
  ceHighestVolume: null,
  peHighestVolume: null,
  buyEntry: null,
  buySL: null,
  buyTarget1: null,
  buyTarget2: null,
  sellEntry: null,
  sellSL: null,
  sellTarget1: null,
  sellTarget2: null
};

// Last known values
const lastValues = {
  ceSecondHighest: null,
  peSecondHighest: null,
  ceHighestVolume: null,
  peHighestVolume: null,
  buyEntry: null,
  buySL: null,
  buyTarget1: null,
  buyTarget2: null,
  sellEntry: null,
  sellSL: null,
  sellTarget1: null,
  sellTarget2: null
};

// =============================================
// WAIT FOR CHART WIDGET
// =============================================

function waitForChart(retries = 0): Promise<any> {
  return new Promise((resolve, reject) => {
    if (retries > CONFIG.MAX_RETRIES) {
      reject(new Error('Chart widget not found after max retries'));
      return;
    }

    try {
      // Check if tvWidget exists globally
      if (typeof tvWidget !== 'undefined' && tvWidget.activeChart) {
        const chart = tvWidget.activeChart();
        if (chart) {
          chartWidget = chart;
          isReady = true;
          console.log('✅ Chart widget ready');
          resolve(chart);
          return;
        }
      }

      // Check for alternative global names
      if (typeof TradingView !== 'undefined' && TradingView.widget) {
        // Some implementations use TradingView.widget
        // Try to get the active chart
        const widget = TradingView.widget;
        if (widget && widget.activeChart) {
          chartWidget = widget.activeChart();
          isReady = true;
          console.log('✅ Chart widget ready (via TradingView)');
          resolve(chartWidget);
          return;
        }
      }

      console.log(`⏳ Waiting for chart... (attempt ${retries + 1}/${CONFIG.MAX_RETRIES})`);
      setTimeout(() => {
        waitForChart(retries + 1).then(resolve).catch(reject);
      }, CONFIG.RETRY_INTERVAL_MS);

    } catch (error) {
      console.warn('⚠️ Error checking for chart:', error);
      setTimeout(() => {
        waitForChart(retries + 1).then(resolve).catch(reject);
      }, CONFIG.RETRY_INTERVAL_MS);
    }
  });
}

// =============================================
// DRAW A HORIZONTAL LINE
// =============================================

async function drawHorizontalLine(price: number, color: string, style: string, label: string): Promise<string | null> {
  if (!chartWidget) {
    console.warn('⚠️ No chart widget available');
    return null;
  }

  if (price === null || price === undefined || price === 0) {
    return null;
  }

  try {
    const id = await chartWidget.createShape(
      {
        time: Math.floor(Date.now() / 1000),
        price: price
      },
      {
        shape: 'horizontal_line',
        text: label || '',
        color: color,
        lineStyle: style,
        linewidth: style === 'solid' ? 2 : style === 'dashed' ? 1 : 2,
        visible: true,
        zorder: 10
      }
    );

    console.log(`✅ Drew line: ${label} at ${price} (ID: ${id})`);
    return id;

  } catch (error) {
    console.error(`❌ Failed to draw line ${label}:`, error);
    return null;
  }
}

// =============================================
// REMOVE A LINE
// =============================================

async function removeLine(shapeId: string) {
  if (!shapeId) return;
  if (!chartWidget) return;

  try {
    await chartWidget.removeEntity(shapeId);
    console.log(`🗑️ Removed line: ${shapeId}`);
  } catch (error) {
    console.warn(`⚠️ Failed to remove line ${shapeId}:`, error);
  }
}

// =============================================
// GET LINE STYLE
// =============================================

function getLineStyle(key: string): string {
  if (key === 'buySL' || key === 'sellSL') {
    return 'dotted';
  }
  if (key === 'buyTarget1' || key === 'buyTarget2' || 
      key === 'sellTarget1' || key === 'sellTarget2' ||
      key === 'ceSecondHighest' || key === 'peSecondHighest') {
    return 'dashed';
  }
  return 'solid';
}

// =============================================
// GET LABEL
// =============================================

function getLabel(key: string, value: number): string {
  const labels: Record<string, string> = {
    ceSecondHighest: `CE 2nd: ${value}`,
    peSecondHighest: `PE 2nd: ${value}`,
    ceHighestVolume: `CE Vol: ${value}`,
    peHighestVolume: `PE Vol: ${value}`,
    buyEntry: `Buy Entry: ${value}`,
    buySL: `Buy SL: ${value}`,
    buyTarget1: `Buy T1: ${value}`,
    buyTarget2: `Buy T2: ${value}`,
    sellEntry: `Sell Entry: ${value}`,
    sellSL: `Sell SL: ${value}`,
    sellTarget1: `Sell T1: ${value}`,
    sellTarget2: `Sell T2: ${value}`
  };
  return labels[key] || `${key}: ${value}`;
}

// =============================================
// UPDATE A SINGLE LEVEL
// =============================================

async function updateLevel(key: string, newValue: number) {
  if (newValue === null || newValue === undefined || newValue === 0) {
    // Remove existing line if value is null
    if (shapes[key]) {
      await removeLine(shapes[key]);
      shapes[key] = null;
    }
    lastValues[key] = null;
    return;
  }

  // If value changed or shape doesn't exist
  if (lastValues[key] !== newValue || !shapes[key]) {
    // Remove old shape
    if (shapes[key]) {
      await removeLine(shapes[key]);
    }

    // Draw new line
    const color = CONFIG.LINE_COLORS[key];
    const style = getLineStyle(key);
    const label = getLabel(key, newValue);

    const id = await drawHorizontalLine(newValue, color, style, label);
    shapes[key] = id;
    lastValues[key] = newValue;
  }
}

// =============================================
// SYNC ALL LEVELS
// =============================================

async function syncLevels(data: any) {
  if (!chartWidget) {
    console.warn('⚠️ No chart widget, cannot sync levels');
    return;
  }

  console.log('🔄 Syncing levels...');

  try {
    // OI Levels
    await updateLevel('ceSecondHighest', data.ceSecondHighest);
    await updateLevel('peSecondHighest', data.peSecondHighest);
    await updateLevel('ceHighestVolume', data.ceHighestVolume);
    await updateLevel('peHighestVolume', data.peHighestVolume);

    // Buy Levels
    await updateLevel('buyEntry', data.targets?.buy?.entry);
    await updateLevel('buySL', data.targets?.buy?.sl);
    await updateLevel('buyTarget1', data.targets?.buy?.target1);
    await updateLevel('buyTarget2', data.targets?.buy?.target2);

    // Sell Levels
    await updateLevel('sellEntry', data.targets?.sell?.entry);
    await updateLevel('sellSL', data.targets?.sell?.sl);
    await updateLevel('sellTarget1', data.targets?.sell?.target1);
    await updateLevel('sellTarget2', data.targets?.sell?.target2);

    console.log('✅ All levels synced');

  } catch (error) {
    console.error('❌ Error syncing levels:', error);
  }
}

// =============================================
// REMOVE ALL SHAPES
// =============================================

async function removeAllShapes() {
  for (const [key, id] of Object.entries(shapes)) {
    if (id) {
      await removeLine(id);
      shapes[key] = null;
      lastValues[key] = null;
    }
  }
  console.log('🗑️ All shapes removed');
}

// =============================================
// RESTORE AFTER RELOAD
// =============================================

async function restoreAfterReload() {
  console.log('🔄 Restoring after reload...');
  
  // Reset all state
  await removeAllShapes();
  
  // Get stored data
  chrome.storage.local.get('oiData', async (result) => {
    if (result.oiData) {
      console.log('📊 Restoring from stored data');
      await syncLevels(result.oiData);
    } else {
      console.log('⏳ No stored data, waiting for update');
    }
  });
}

// =============================================
// LISTEN FOR MESSAGES FROM BACKGROUND
// =============================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateLevels') {
    if (isReady && chartWidget) {
      // Async operation - respond later
      syncLevels(request.data).then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        console.error('Error updating levels:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true; // Keep channel open for async response
    } else {
      // Store data for when chart becomes ready
      pendingData = request.data;
      console.log('⏳ Chart not ready, data stored for later');
      sendResponse({ success: false, message: 'Chart not ready' });
      return true;
    }
  }

  if (request.action === 'removeAllLines') {
    removeAllShapes().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// =============================================
// HANDLE PAGE NAVIGATION / SYMBOL CHANGE
// =============================================

// Detect when chart changes symbol or timeframe
const symbolObserver = new MutationObserver(() => {
  // Check if chart widget is still valid
  if (typeof tvWidget !== 'undefined' && tvWidget.activeChart) {
    const chart = tvWidget.activeChart();
    if (chart && chart !== chartWidget) {
      console.log('🔄 Chart instance changed, re-syncing...');
      chartWidget = chart;
      restoreAfterReload();
    }
  }
});

// =============================================
// INITIALIZATION
// =============================================

async function init() {
  console.log('🚀 Nifty OI Levels Extension starting...');

  try {
    // Wait for chart
    await waitForChart();
    
    // Restore from storage
    await restoreAfterReload();

    // Start observing for chart changes
    symbolObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      console.log('📄 Page unloading...');
    });

    console.log('✅ Extension initialized successfully');

  } catch (error) {
    console.error('❌ Failed to initialize:', error);
    // Retry after 10 seconds
    setTimeout(init, 10000);
  }
}

// =============================================
// START
// =============================================

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Also handle cases where chart loads after DOM
window.addEventListener('load', () => {
  // If chart wasn't ready during init, try again
  if (!isReady) {
    console.log('🔄 Retrying initialization after load...');
    init();
  }
});
