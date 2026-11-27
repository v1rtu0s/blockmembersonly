const DEFAULT_CONFIG = {
  enabled: true,
  mode: 'hide',
  hideHomeAndFeed: true,
  hideSubscriptions: true,
  hideSearchAndSidebar: true,
  hideShortsAndPosts: true,
  hideJoinButtonsAndShelves: true,
  multiLanguage: true,
  showBadgeCount: true,
  allowlistedChannels: []
};

const BOOLEAN_KEYS = [
  'enabled',
  'hideHomeAndFeed',
  'hideSubscriptions',
  'hideSearchAndSidebar',
  'hideShortsAndPosts',
  'hideJoinButtonsAndShelves',
  'multiLanguage',
  'showBadgeCount'
];

let currentConfig = { ...DEFAULT_CONFIG };

function updateUI() {
  for (const key of BOOLEAN_KEYS) {
    const el = document.getElementById(key);
    if (el) el.checked = Boolean(currentConfig[key]);
  }

  document.getElementById('status-text').textContent = currentConfig.enabled
    ? currentConfig.mode === 'hide'
      ? 'Hiding'
      : 'Dimming'
    : 'Paused';

  document.querySelectorAll('.seg-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === currentConfig.mode);
  });

  const list = document.getElementById('allowlist-items');
  list.textContent = '';

  (currentConfig.allowlistedChannels || []).forEach((channel) => {
    const li = document.createElement('li');
    li.className = 'allowlist-item';

    const label = document.createElement('span');
    label.textContent = channel;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'allowlist-remove';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      const next = (currentConfig.allowlistedChannels || []).filter((c) => c !== channel);
      savePatch({ allowlistedChannels: next });
    });

    li.appendChild(label);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

async function queryActiveTabCount(type = 'CLEARFEED_GET_STATUS') {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || typeof tab.id !== 'number') return;
    const response = await chrome.tabs.sendMessage(tab.id, { type });
    if (response && typeof response.count === 'number') {
      document.getElementById('tab-count').textContent = String(response.count);
    }
  } catch {
    document.getElementById('tab-count').textContent = 'Reload tab';
  }
}

async function savePatch(patch) {
  currentConfig = { ...currentConfig, ...patch };
  updateUI();
  await chrome.storage.sync.set(patch);
  window.setTimeout(() => queryActiveTabCount('CLEARFEED_RESCAN'), 120);
}

async function initPopup() {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    updateUI();
    return;
  }

  const stored = await chrome.storage.sync.get(Object.keys(DEFAULT_CONFIG));
  currentConfig = { ...DEFAULT_CONFIG, ...stored };
  updateUI();
  queryActiveTabCount('CLEARFEED_RESCAN');

  for (const key of BOOLEAN_KEYS) {
    const el = document.getElementById(key);
    if (el) {
      el.addEventListener('change', (e) => {
        savePatch({ [key]: e.target.checked });
      });
    }
  }

  document.querySelectorAll('.seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      savePatch({ mode: btn.dataset.mode });
    });
  });

  const rescanBtn = document.getElementById('rescan-btn');
  if (rescanBtn) {
    rescanBtn.addEventListener('click', () => {
      queryActiveTabCount('CLEARFEED_RESCAN');
    });
  }

  document.getElementById('allowlist-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('channel-input');
    const raw = input.value.trim();
    if (!raw) return;
    const formatted = raw.startsWith('@') ? raw : '@' + raw;
    const existing = currentConfig.allowlistedChannels || [];
    if (!existing.some((c) => c.toLowerCase() === formatted.toLowerCase())) {
      savePatch({ allowlistedChannels: [...existing, formatted] });
    }
    input.value = '';
  });
}

initPopup();
