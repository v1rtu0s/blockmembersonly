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

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get(Object.keys(DEFAULT_CONFIG));
  const merged = { ...DEFAULT_CONFIG, ...existing };
  await chrome.storage.sync.set(merged);
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message || !sender.tab || typeof sender.tab.id !== 'number') {
    return;
  }

  if (message.type === 'CLEARFEED_COUNT') {
    const tabId = sender.tab.id;
    const count = Number(message.count) || 0;
    const showBadge = Boolean(message.showBadge);
    const enabled = Boolean(message.enabled);

    if (!enabled || !showBadge || count <= 0) {
      chrome.action.setBadgeText({ tabId, text: '' });
      return;
    }

    const label = count > 99 ? '99+' : String(count);
    chrome.action.setBadgeText({ tabId, text: label });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#DC2626' });
    if (chrome.action.setBadgeTextColor) {
      chrome.action.setBadgeTextColor({ tabId, color: '#FFFFFF' });
    }
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url && !tab.url.includes('youtube.com')) {
    chrome.action.setBadgeText({ tabId, text: '' });
  }
});
