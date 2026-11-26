import { LANGUAGE_PATTERNS } from './ruleEngine';
import { ExtensionConfig, ExtensionFile } from './types';

function formatDefaultConfig(config: ExtensionConfig): string {
  return JSON.stringify(
    {
      enabled: config.enabled,
      mode: config.mode,
      hideHomeAndFeed: config.hideHomeAndFeed,
      hideSubscriptions: config.hideSubscriptions,
      hideSearchAndSidebar: config.hideSearchAndSidebar,
      hideShortsAndPosts: config.hideShortsAndPosts,
      hideJoinButtonsAndShelves: config.hideJoinButtonsAndShelves,
      multiLanguage: config.multiLanguage,
      showBadgeCount: config.showBadgeCount,
      allowlistedChannels: config.allowlistedChannels,
    },
    null,
    2
  );
}

export function generateExtensionFiles(config: ExtensionConfig): ExtensionFile[] {
  const defaultConfigJson = formatDefaultConfig(config);
  const allPhrasesJson = JSON.stringify(
    LANGUAGE_PATTERNS.flatMap((lang) => lang.phrases),
    null,
    2
  );
  const englishPhrasesJson = JSON.stringify(LANGUAGE_PATTERNS[0].phrases, null, 2);

  const manifestJson = `{
  "manifest_version": 3,
  "name": "ClearFeed — Hide YouTube Members-Only Content",
  "version": "1.1.0",
  "description": "Automatically hides or dims Members-only videos, early-access releases, Shorts, Community posts, and Join shelves on YouTube.",
  "permissions": [
    "storage"
  ],
  "host_permissions": [
    "*://*.youtube.com/*"
  ],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_title": "ClearFeed — YouTube Members-Only Hider",
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": [
        "*://*.youtube.com/*"
      ],
      "css": [
        "content.css"
      ],
      "js": [
        "content.js"
      ],
      "run_at": "document_idle"
    }
  ]
}
`;

  const backgroundJs = `const DEFAULT_CONFIG = ${defaultConfigJson};

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
`;

  const contentCss = `/* ClearFeed — YouTube Members-Only Hider Styles */

.clearfeed-hidden {
  display: none !important;
}

.clearfeed-dimmed {
  opacity: 0.24 !important;
  filter: grayscale(0.85) !important;
  transition: opacity 180ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 180ms cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.clearfeed-dimmed:hover {
  opacity: 0.92 !important;
  filter: grayscale(0) !important;
}

/* Optional: hide channel "Join" buttons and membership promotion shelves */
html.clearfeed-hide-join #sponsor-button,
html.clearfeed-hide-join ytd-recognition-shelf-renderer,
html.clearfeed-hide-join ytd-sponsorships-offer-renderer,
html.clearfeed-hide-join ytd-membership-offer-renderer,
html.clearfeed-hide-join ytd-channel-about-metadata-renderer #sponsor-button {
  display: none !important;
}
`;

  const contentJs = `(() => {
  'use strict';

  const DEFAULT_CONFIG = ${defaultConfigJson};

  const ENGLISH_PHRASES = ${englishPhrasesJson};

  const ALL_LANGUAGE_PHRASES = ${allPhrasesJson};

  const VIDEO_CONTAINERS = [
    'ytd-rich-item-renderer',
    'ytd-video-renderer',
    'ytd-grid-video-renderer',
    'ytd-compact-video-renderer',
    'ytd-playlist-video-renderer',
    'ytd-playlist-panel-video-renderer',
    'ytd-playlist-renderer',
    'ytd-radio-renderer',
    'yt-lockup-view-model',
    '.yt-lockup-view-model--wrapper',
    'ytd-channel-video-player-renderer',
    'ytm-video-with-context-renderer',
    'ytm-rich-item-renderer',
    'ytm-compact-video-renderer'
  ].join(', ');

  const SHORTS_AND_POST_CONTAINERS = [
    'ytd-reel-item-renderer',
    'ytm-shorts-lockup-view-model',
    'ytm-shorts-lockup-view-model-v2',
    'ytd-backstage-post-thread-renderer',
    'ytd-shared-post-renderer'
  ].join(', ');

  const SHELF_CONTAINERS = [
    'ytd-rich-shelf-renderer',
    'ytd-shelf-renderer',
    'ytd-reel-shelf-renderer'
  ].join(', ');

  const HIDDEN_SHELF_SELECTOR = [
    'ytd-rich-shelf-renderer[data-clearfeed-state]',
    'ytd-shelf-renderer[data-clearfeed-state]',
    'ytd-reel-shelf-renderer[data-clearfeed-state]'
  ].join(', ');

  const DIRECT_BADGE_SELECTORS = [
    '.badge-style-type-members-only',
    '.badge-style-type-membership',
    '.yt-badge-shape--membership',
    '.yt-badge-shape--members-only',
    '.ytBadgeShapeMembership',
    '.badge-shape-wiz--membership',
    '#sponsors-only-badge',
    'ytd-sponsors-only-badge-renderer',
    '[class*="members-only" i]',
    '[class*="MembersOnly"]',
    '[class*="badge" i][class*="member" i]',
    '[class*="Badge"][class*="Member"]'
  ].join(', ');

  const BADGE_TEXT_CONTAINERS = [
    'ytd-badge-supported-renderer',
    'yt-badge-view-model',
    'yt-badge-shape',
    'badge-shape',
    'yt-thumbnail-badge-view-model',
    'thumbnail-overlay-badge-view-model',
    'yt-thumbnail-overlay-badge-view-model',
    'ytd-thumbnail-overlay-badge-renderer',
    '[class*="badge" i]',
    '[class*="Badge"]',
    '#sponsors-only-badge'
  ].join(', ');

  const TITLE_OR_DESC_SELECTOR =
    '#video-title, #video-title-link, h3, #description-text, .metadata-snippet-text, .yt-lockup-metadata-view-model__title, .yt-lockup-metadata-view-model-wiz__title';

  let config = { ...DEFAULT_CONFIG };
  let scanTimer = null;
  let lastReportedCount = -1;

  function normalizeText(value) {
    return String(value || '')
      .replace(/[\\s\\u00A0\\u200B-\\u200D\\uFEFF]+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function normalizeChannel(value) {
    return normalizeText(value).replace(/^@+/, '');
  }

  function getCurrentSurface() {
    const path = window.location.pathname || '/';
    if (path.startsWith('/feed/subscriptions')) return 'subscriptions';
    if (path.startsWith('/results') || path.startsWith('/watch')) return 'searchAndSidebar';
    if (path.startsWith('/shorts')) return 'shortsAndPosts';
    return 'homeAndFeed';
  }

  function shouldFilterSurface(surface, isShortOrPost) {
    if (isShortOrPost) return config.hideShortsAndPosts;
    if (surface === 'subscriptions') return config.hideSubscriptions;
    if (surface === 'searchAndSidebar') return config.hideSearchAndSidebar;
    return config.hideHomeAndFeed;
  }

  function extractChannelIdentifiers(card) {
    const identifiers = [];

    const links = card.querySelectorAll('a[href*="/@"], ytd-channel-name a, #channel-name a');
    for (const link of links) {
      const href = link.getAttribute('href') || '';
      const handleMatch = href.match(/\\/(@[^/?#]+)/);
      if (handleMatch) identifiers.push(normalizeChannel(handleMatch[1]));
      if (link.textContent) identifiers.push(normalizeChannel(link.textContent));
    }

    const nameNodes = card.querySelectorAll(
      'ytd-channel-name, #channel-name, .yt-content-metadata-view-model__metadata-text, .yt-content-metadata-view-model-wiz__metadata-text'
    );
    for (const node of nameNodes) {
      if (node.textContent) identifiers.push(normalizeChannel(node.textContent));
    }

    const pageHandle = window.location.pathname.match(/^\\/(@[^/?#]+)/);
    if (pageHandle) {
      identifiers.push(normalizeChannel(pageHandle[1]));
    }

    return identifiers.filter(Boolean);
  }

  function isChannelAllowlisted(card, allowlistSet) {
    if (allowlistSet.size === 0) return false;
    const identifiers = extractChannelIdentifiers(card);
    return identifiers.some((id) => allowlistSet.has(id));
  }

  function isMembersOnlyCard(card, phrases) {
    // Layer 1: Direct unambiguous membership classes/elements
    if (card.querySelector(DIRECT_BADGE_SELECTORS)) {
      return true;
    }

    // Layer 2: Broad badge element text, aria-label, and title scan
    const badgeElements = card.querySelectorAll(BADGE_TEXT_CONTAINERS);
    for (const badge of badgeElements) {
      const combined = normalizeText(
        (badge.textContent || '') +
          ' ' +
          (badge.getAttribute('aria-label') || '') +
          ' ' +
          (badge.getAttribute('title') || '')
      );
      if (!combined) continue;
      for (const phrase of phrases) {
        if (combined.includes(phrase)) {
          return true;
        }
      }
    }

    // Layer 3: Universal leaf-node exact badge match (resilient to CSS class renames)
    const nodes = card.querySelectorAll('span, div, p, yt-formatted-string, yt-icon');
    for (const node of nodes) {
      if (node.closest(TITLE_OR_DESC_SELECTOR)) {
        continue;
      }

      const aria = normalizeText(node.getAttribute('aria-label'));
      if (aria) {
        for (const phrase of phrases) {
          if (aria === phrase || aria.includes(phrase)) {
            return true;
          }
        }
      }

      if (node.querySelector('a, h1, h2, h3, h4, p')) continue;
      const clean = normalizeText(node.textContent);
      if (clean.length < 4 || clean.length > 48) continue;

      for (const phrase of phrases) {
        if (clean === phrase) {
          return true;
        }
      }
    }

    return false;
  }

  function isMembersOnlyShelf(shelf, phrases) {
    const titleNode = shelf.querySelector('#title, #title-text, h2, yt-formatted-string#title');
    if (!titleNode) return false;
    const titleText = normalizeText(titleNode.textContent);
    if (!titleText) return false;
    return phrases.some((phrase) => titleText.includes(phrase));
  }

  function clearElementState(el) {
    if (el.dataset.clearfeedState) {
      el.classList.remove('clearfeed-hidden', 'clearfeed-dimmed');
      delete el.dataset.clearfeedState;
    }
  }

  function applyCardState(el, mode) {
    if (mode === 'dim') {
      if (el.dataset.clearfeedState !== 'dimmed') {
        el.classList.remove('clearfeed-hidden');
        el.classList.add('clearfeed-dimmed');
        el.dataset.clearfeedState = 'dimmed';
      }
    } else {
      if (el.dataset.clearfeedState !== 'hidden') {
        el.classList.remove('clearfeed-dimmed');
        el.classList.add('clearfeed-hidden');
        el.dataset.clearfeedState = 'hidden';
      }
    }
  }

  function reportCount(count) {
    if (count === lastReportedCount) return;
    lastReportedCount = count;
    try {
      chrome.runtime.sendMessage({
        type: 'CLEARFEED_COUNT',
        count,
        enabled: config.enabled,
        showBadge: config.showBadgeCount
      });
    } catch {
      // Extension context may be invalidated during update
    }
  }

  function scanPage() {
    scanTimer = null;

    const rootEl = document.documentElement;
    if (config.enabled && config.hideJoinButtonsAndShelves) {
      rootEl.classList.add('clearfeed-hide-join');
    } else {
      rootEl.classList.remove('clearfeed-hide-join');
    }

    const allSelector = VIDEO_CONTAINERS + ', ' + SHORTS_AND_POST_CONTAINERS;
    const candidates = document.querySelectorAll(allSelector);
    const shelves = document.querySelectorAll(SHELF_CONTAINERS);

    if (!config.enabled) {
      for (const card of candidates) clearElementState(card);
      for (const shelf of shelves) clearElementState(shelf);
      reportCount(0);
      return 0;
    }

    const surface = getCurrentSurface();
    const phrases = config.multiLanguage ? ALL_LANGUAGE_PHRASES : ENGLISH_PHRASES;
    const allowlistSet = new Set(
      (config.allowlistedChannels || []).map(normalizeChannel).filter(Boolean)
    );

    let hiddenCount = 0;

    // 1. Check entire Members-only shelves first
    for (const shelf of shelves) {
      if (config.hideJoinButtonsAndShelves && isMembersOnlyShelf(shelf, phrases) && !isChannelAllowlisted(shelf, allowlistSet)) {
        applyCardState(shelf, config.mode);
        hiddenCount += 1;
      } else {
        clearElementState(shelf);
      }
    }

    // 2. Scan all video, lockup, Shorts, and Community post containers
    for (const card of candidates) {
      if (card.closest(HIDDEN_SHELF_SELECTOR)) {
        clearElementState(card);
        continue;
      }

      // Avoid double-counting nested lockups inside a rich item renderer
      if (card.parentElement && card.parentElement.closest(allSelector)) {
        clearElementState(card);
        continue;
      }

      const isShortOrPost = card.matches(SHORTS_AND_POST_CONTAINERS);
      if (!shouldFilterSurface(surface, isShortOrPost)) {
        clearElementState(card);
        continue;
      }

      if (isMembersOnlyCard(card, phrases) && !isChannelAllowlisted(card, allowlistSet)) {
        applyCardState(card, config.mode);
        hiddenCount += 1;
      } else {
        clearElementState(card);
      }
    }

    reportCount(hiddenCount);
    return hiddenCount;
  }

  function scheduleScan() {
    if (scanTimer !== null) return;
    scanTimer = window.setTimeout(scanPage, 120);
  }

  async function init() {
    try {
      const stored = await chrome.storage.sync.get(Object.keys(DEFAULT_CONFIG));
      config = { ...DEFAULT_CONFIG, ...stored };
    } catch {
      config = { ...DEFAULT_CONFIG };
    }

    scanPage();

    // Observe dynamic infinite scroll, lazy hydration, and Polymer recycled text updates
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList' && (m.addedNodes.length > 0 || m.removedNodes.length > 0)) {
          scheduleScan();
          return;
        }
        if (m.type === 'characterData') {
          scheduleScan();
          return;
        }
      }
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    // Lightweight periodic rescan for YouTube SPA recycled nodes
    window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        scanPage();
      }
    }, 1800);

    // YouTube SPA navigation hooks
    window.addEventListener('yt-navigate-finish', scheduleScan, true);
    window.addEventListener('yt-page-data-updated', scheduleScan, true);
    window.addEventListener('popstate', scheduleScan);

    // Live updates from popup without reloading YouTube
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'sync') return;
      for (const [key, change] of Object.entries(changes)) {
        config[key] = change.newValue;
      }
      lastReportedCount = -1;
      scanPage();
    });

    // Respond to popup status queries with a fresh scan
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message && (message.type === 'CLEARFEED_GET_STATUS' || message.type === 'CLEARFEED_RESCAN')) {
        const count = scanPage();
        sendResponse({ count, url: window.location.href });
      }
    });
  }

  init();
})();
`;

  const popupHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ClearFeed Settings</title>
    <link rel="stylesheet" href="popup.css" />
  </head>
  <body>
    <main class="popup">
      <header class="header">
        <div>
          <h1 class="title">ClearFeed</h1>
          <p class="subtitle">YouTube Members-Only Filter</p>
        </div>
        <label class="switch" aria-label="Enable ClearFeed">
          <input type="checkbox" id="enabled" />
          <span class="slider"></span>
        </label>
      </header>

      <section class="stats" aria-live="polite">
        <div class="stat">
          <span class="stat-label">Filtered on tab</span>
          <strong class="stat-value" id="tab-count">0</strong>
        </div>
        <div class="stat">
          <span class="stat-label">Filter status</span>
          <strong class="stat-value" id="status-text">Active</strong>
        </div>
        <button type="button" id="rescan-btn" class="rescan-btn">Rescan</button>
      </section>

      <section class="group">
        <span class="group-label">Filter behavior</span>
        <div class="segmented" role="radiogroup" aria-label="Filter behavior">
          <button type="button" class="seg-btn" data-mode="hide">Hide completely</button>
          <button type="button" class="seg-btn" data-mode="dim">Dim &amp; blur</button>
        </div>
      </section>

      <section class="group">
        <span class="group-label">Surfaces</span>
        <label class="check-row">
          <span>Home &amp; Channel feeds</span>
          <input type="checkbox" id="hideHomeAndFeed" />
        </label>
        <label class="check-row">
          <span>Subscriptions feed</span>
          <input type="checkbox" id="hideSubscriptions" />
        </label>
        <label class="check-row">
          <span>Search &amp; Watch sidebar</span>
          <input type="checkbox" id="hideSearchAndSidebar" />
        </label>
        <label class="check-row">
          <span>Shorts &amp; Community posts</span>
          <input type="checkbox" id="hideShortsAndPosts" />
        </label>
        <label class="check-row">
          <span>Hide "Join" buttons &amp; shelves</span>
          <input type="checkbox" id="hideJoinButtonsAndShelves" />
        </label>
        <label class="check-row">
          <span>Multi-language badge detection</span>
          <input type="checkbox" id="multiLanguage" />
        </label>
        <label class="check-row">
          <span>Show count badge on icon</span>
          <input type="checkbox" id="showBadgeCount" />
        </label>
      </section>

      <section class="group">
        <span class="group-label">Channel allowlist</span>
        <form id="allowlist-form" class="allowlist-form">
          <input
            type="text"
            id="channel-input"
            placeholder="@channelhandle"
            autocomplete="off"
          />
          <button type="submit">Add</button>
        </form>
        <ul id="allowlist-items" class="allowlist-items"></ul>
      </section>
    </main>
    <script src="popup.js"></script>
  </body>
</html>
`;

  const popupCss = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  width: 340px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #ffffff;
  color: #18181b;
  font-size: 13px;
  line-height: 1.4;
}

.popup {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e4e7;
}

.title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 12px;
  color: #71717a;
}

.switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  inset: 0;
  background: #d4d4d8;
  border-radius: 999px;
  cursor: pointer;
  transition: background 160ms ease;
}

.slider::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  top: 3px;
  background: #ffffff;
  border-radius: 50%;
  transition: transform 160ms cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
}

.switch input:checked + .slider {
  background: #dc2626;
}

.switch input:checked + .slider::before {
  transform: translateX(18px);
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 11px;
  color: #71717a;
}

.stat-value {
  font-size: 15px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.rescan-btn {
  padding: 5px 10px;
  border: 1px solid #d4d4d8;
  border-radius: 6px;
  background: #ffffff;
  color: #27272a;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
}

.rescan-btn:hover {
  border-color: #a1a1aa;
  color: #09090b;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-label {
  font-size: 12px;
  font-weight: 600;
  color: #52525b;
}

.segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 3px;
  background: #f4f4f5;
  border-radius: 8px;
}

.seg-btn {
  border: none;
  background: transparent;
  padding: 7px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #52525b;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}

.seg-btn.active {
  background: #ffffff;
  color: #18181b;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.check-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  cursor: pointer;
  color: #27272a;
}

.check-row input[type="checkbox"] {
  width: 15px;
  height: 15px;
  accent-color: #dc2626;
  cursor: pointer;
}

.allowlist-form {
  display: flex;
  gap: 6px;
}

.allowlist-form input {
  flex: 1;
  padding: 7px 10px;
  border: 1px solid #d4d4d8;
  border-radius: 6px;
  font-size: 12px;
  outline: none;
}

.allowlist-form input:focus {
  border-color: #dc2626;
}

.allowlist-form button {
  padding: 7px 12px;
  border: none;
  border-radius: 6px;
  background: #18181b;
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.allowlist-items {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 96px;
  overflow-y: auto;
}

.allowlist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 8px;
  background: #fafafa;
  border: 1px solid #e4e4e7;
  border-radius: 6px;
  font-size: 12px;
}

.allowlist-remove {
  border: none;
  background: transparent;
  color: #71717a;
  font-size: 12px;
  cursor: pointer;
}

.allowlist-remove:hover {
  color: #dc2626;
}
`;

  const popupJs = `const DEFAULT_CONFIG = ${defaultConfigJson};

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
`;

  const readmeTxt = `ClearFeed — YouTube Members-Only Hider (Chrome Extension MV3 v1.1.0)
====================================================================

Quick Install (Load Unpacked in Chrome, Brave, Arc, or Edge)
------------------------------------------------------------
1. Unzip this folder to a permanent location on your computer.
2. Open Chrome and navigate to: chrome://extensions
3. Turn on "Developer mode" (toggle in the top-right corner).
4. Click "Load unpacked" and select the unzipped "clearfeed-extension" folder.
5. Refresh any already-open YouTube tab — Members-only videos, early-access
   releases, Shorts, Community posts, and shelves will be filtered immediately.

What's Included
---------------
- 3-layer detection engine: legacy Polymer badges, 2025-2026 yt-badge-shape /
  ytBadgeShapeMembership classes, and a class-rename-resilient leaf-node matcher.
- Handles non-breaking spaces (NBSP), SPA route transitions, recycled Polymer
  nodes, and infinite scroll automatically.
- Instant toggle between Hide Completely and Dim & Blur (hover to peek).
- Supports 14 languages, per-channel allowlist, and zero external requests.
`;

  return [
    {
      path: 'manifest.json',
      language: 'json',
      description: 'Manifest V3 definition, minimal permissions, and wildcard youtube.com host rules.',
      content: manifestJson,
    },
    {
      path: 'content.js',
      language: 'javascript',
      description: '3-layer resilient YouTube DOM scanner with NBSP normalization, shelf filtering, and SPA observers.',
      content: contentJs,
    },
    {
      path: 'content.css',
      language: 'css',
      description: 'Zero-flicker hide, dim-on-hover, and Join-button suppression rules.',
      content: contentCss,
    },
    {
      path: 'background.js',
      language: 'javascript',
      description: 'MV3 service worker managing default storage sync and live toolbar badge counts.',
      content: backgroundJs,
    },
    {
      path: 'popup.html',
      language: 'html',
      description: 'Self-contained extension toolbar popup markup with live Rescan control.',
      content: popupHtml,
    },
    {
      path: 'popup.css',
      language: 'css',
      description: 'Native-feeling 340px extension popup stylesheet.',
      content: popupCss,
    },
    {
      path: 'popup.js',
      language: 'javascript',
      description: 'Syncs popup settings with chrome.storage.sync and triggers live tab rescans.',
      content: popupJs,
    },
    {
      path: 'README.txt',
      language: 'text',
      description: '4-step unpacked installation instructions for Chromium browsers.',
      content: readmeTxt,
    },
  ];
}
