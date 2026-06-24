// =============================================
// POPUP SCRIPT
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  
  document.getElementById('refreshBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'forceUpdate' }, () => {
      loadData();
    });
  });
});

function loadData() {
  chrome.runtime.sendMessage({ action: 'getData' }, (response) => {
    if (response && response.oiData) {
      updateUI(response.oiData);
      updateStatus('live', '✅ Live', response.lastUpdated);
    } else {
      updateStatus('loading', '⏳ Waiting for data...', '-');
    }
  });
}

function updateUI(data) {
  const hasTrade = data.targets.buy.entry !== null && data.targets.sell.entry !== null;
  
  // OI Levels
  document.getElementById('ceSecond').textContent = data.ceSecondHighest || '-';
  document.getElementById('peSecond').textContent = data.peSecondHighest || '-';
  document.getElementById('ceVol').textContent = data.ceHighestVolume || '-';
  document.getElementById('peVol').textContent = data.peHighestVolume || '-';
  
  // Buy Levels
  document.getElementById('buyEntry').textContent = data.targets.buy.entry || '-';
  document.getElementById('buySL').textContent = data.targets.buy.sl || '-';
  document.getElementById('buyT1').textContent = data.targets.buy.target1 || '-';
  document.getElementById('buyT2').textContent = data.targets.buy.target2 || '-';
  
  // Sell Levels
  document.getElementById('sellEntry').textContent = data.targets.sell.entry || '-';
  document.getElementById('sellSL').textContent = data.targets.sell.sl || '-';
  document.getElementById('sellT1').textContent = data.targets.sell.target1 || '-';
  document.getElementById('sellT2').textContent = data.targets.sell.target2 || '-';
  
  // Color code values
  colorizeValue('buyEntry', data.targets.buy.entry, 'green');
  colorizeValue('buySL', data.targets.buy.sl, 'red');
  colorizeValue('buyT1', data.targets.buy.target1, 'green');
  colorizeValue('buyT2', data.targets.buy.target2, 'green');
  colorizeValue('sellEntry', data.targets.sell.entry, 'red');
  colorizeValue('sellSL', data.targets.sell.sl, 'red');
  colorizeValue('sellT1', data.targets.sell.target1, 'red');
  colorizeValue('sellT2', data.targets.sell.target2, 'red');
}

function colorizeValue(elementId, value, color) {
  const el = document.getElementById(elementId);
  if (el) {
    if (value !== null && value !== 0) {
      el.className = `value ${color}`;
    } else {
      el.className = 'value gray';
    }
  }
}

function updateStatus(status, text, time) {
  const dot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const statusTime = document.getElementById('statusTime');
  
  dot.className = `status-dot ${status}`;
  statusText.textContent = text;
  
  if (time && time !== '-') {
    const date = new Date(time);
    statusTime.textContent = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } else {
    statusTime.textContent = '-';
  }
}
