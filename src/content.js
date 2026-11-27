(() => {
  'use strict';

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

  const ENGLISH_PHRASES = [
    'members only',
    'members first',
    'members-only',
    'members-only videos',
    'channel members only',
    'only for members'
  ];

  const ALL_LANGUAGE_PHRASES = [
    ...ENGLISH_PHRASES,
    'nur für mitglieder',
    'zuerst für mitglieder',
    'nur für kanalmitglieder',
    'videos nur für mitglieder',
    'solo para miembros',
    'primero para miembros',
    'exclusivo para miembros',
    'réservé aux membres',
    'en avant-première pour les membres',
    'accès anticipé pour les membres',
    'membres uniquement',
    'somente para membros',
    'para membros',
    'acesso antecipado para membros',
    'solo per gli abbonati',
    'in anteprima per gli abbonati',
    'alleen voor leden',
    'eerst voor leden',
    'tylko dla wspierających',
    'najpierw dla wspierających',
    'メンバー限定',
    'メンバー先行',
    '회원 전용',
    '회원 우선',
    '会员专享',
    '會員專屬',
    '会员抢先看',
    '會員搶先看',
    'только для спонсоров',
    'сначала для спонсоров',
    'üyelere özel',
    'khusus pelanggan',
    'khusus anggota'
  ];

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
      .replace(/[\s\u00A0\u200B-\u200D\uFEFF]+/g, ' ')
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
      const handleMatch = href.match(/\/(@[^/?#]+)/);
      if (handleMatch) identifiers.push(normalizeChannel(handleMatch[1]));
      if (link.textContent) identifiers.push(normalizeChannel(link.textContent));
    }

    const nameNodes = card.querySelectorAll(
      'ytd-channel-name, #channel-name, .yt-content-metadata-view-model__metadata-text, .yt-content-metadata-view-model-wiz__metadata-text'
    );
    for (const node of nameNodes) {
      if (node.textContent) identifiers.push(normalizeChannel(node.textContent));
    }

    const pageHandle = window.location.pathname.match(/^\/(@[^/?#]+)/);
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
      if (
        config.hideJoinButtonsAndShelves &&
        isMembersOnlyShelf(shelf, phrases) &&
        !isChannelAllowlisted(shelf, allowlistSet)
      ) {
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

    // Lightweight periodic rescan for recycled YouTube SPA nodes
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
