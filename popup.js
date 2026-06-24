// =============================================
// POPUP SCRIPT
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  
  document.getElementById('refreshBtn').addEventListener('click', () => {
    loadData(true);
  });
});

function loadData(force = false) {
  if (force) {
    // Force fetch from background
    chrome.runtime.sendMessage({ action: 'forceFetch' });
  }
  
  // Get data from storage
  chrome.storage.local.get('oiData', (result) => {
    const data = result.oiData;
    if (data) {
      updateUI(data);
    } else {
      document.getElementById('statusText').textContent = 'No data yet. Waiting for fetch...';
    }
  });
}

function updateUI(data) {
  // Update status
  const hasTrade = data.targets.buy.entry !== null && data.targets.sell.entry !== null;
  const dot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  
  if (hasTrade) {
    dot.className = 'status-dot live';
    statusText.textContent = '✅ LIVE - Trade Ready';
    statusText.style.color = '#00d4aa';
  } else {
    dot.className = 'status-dot closed';
    statusText.textContent = '⛔ NO TRADE - Wait for setup';
    statusText.style.color = '#ff4757';
  }
  
  // Update values
  document.getElementById('ceSecond').textContent = data.ceSecondHighest || '-';
  document.getElementById('peSecond').textContent = data.peSecondHighest || '-';
  document.getElementById('ceVol').textContent = data.ceHighestVolume || '-';
  document.getElementById('peVol').textContent = data.peHighestVolume || '-';
  
  document.getElementById('buyEntry').textContent = data.targets.buy.entry || '-';
  document.getElementById('buySL').textContent = data.targets.buy.sl || '-';
  document.getElementById('buyT1').textContent = data.targets.buy.target1 || '-';
  document.getElementById('buyT2').textContent = data.targets.buy.target2 || '-';
  
  document.getElementById('sellEntry').textContent = data.targets.sell.entry || '-';
  document.getElementById('sellSL').textContent = data.targets.sell.sl || '-';
  document.getElementById('sellT1').textContent = data.targets.sell.target1 || '-';
  document.getElementById('sellT2').textContent = data.targets.sell.target2 || '-';
}
