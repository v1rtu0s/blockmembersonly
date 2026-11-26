import { ExtensionConfig } from './types';

export interface SelectorRule {
  id: string;
  category: 'Container' | 'Badge' | 'Shelf / CTA';
  selector: string;
  surface: string;
  purpose: string;
}

export interface LanguagePattern {
  code: string;
  language: string;
  phrases: string[];
}

export const CONTAINER_SELECTORS: SelectorRule[] = [
  {
    id: 'rich-item',
    category: 'Container',
    selector: 'ytd-rich-item-renderer',
    surface: 'Home & Channel Grid',
    purpose: 'Primary desktop grid tile for Home feed, Subscriptions grid, and Channel Videos tab.',
  },
  {
    id: 'lockup-model',
    category: 'Container',
    selector: 'yt-lockup-view-model, .yt-lockup-view-model--wrapper',
    surface: '2025–2026 Home, Subs & Watch Sidebar',
    purpose: 'Modern YouTube lockup renderer replacing legacy rich and compact video cards.',
  },
  {
    id: 'video-renderer',
    category: 'Container',
    selector: 'ytd-video-renderer',
    surface: 'Search & List Feed',
    purpose: 'Horizontal video rows in Search results and list-mode Subscriptions.',
  },
  {
    id: 'grid-video',
    category: 'Container',
    selector: 'ytd-grid-video-renderer, ytd-rich-grid-media',
    surface: 'Channel Shelves & Grids',
    purpose: 'Channel shelf tiles and nested rich grid media renderers.',
  },
  {
    id: 'compact-video',
    category: 'Container',
    selector: 'ytd-compact-video-renderer',
    surface: 'Watch Sidebar (Legacy)',
    purpose: 'Up-next recommendation cards beside the active video player.',
  },
  {
    id: 'playlist-video',
    category: 'Container',
    selector: 'ytd-playlist-video-renderer, ytd-playlist-panel-video-renderer',
    surface: 'Playlists & Queue Panel',
    purpose: 'Individual video rows inside playlists and watch-page playlist queues.',
  },
  {
    id: 'shorts-lockup',
    category: 'Container',
    selector: 'ytd-reel-item-renderer, ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2',
    surface: 'Shorts Shelf & Tab',
    purpose: 'Vertical Shorts tiles rendered on Home, Channel, and Shorts feeds.',
  },
  {
    id: 'community-post',
    category: 'Container',
    selector: 'ytd-backstage-post-thread-renderer, ytd-shared-post-renderer',
    surface: 'Community & Home Posts',
    purpose: 'Members-only community updates, polls, and photo posts.',
  },
  {
    id: 'mobile-video',
    category: 'Container',
    selector: 'ytm-video-with-context-renderer, ytm-rich-item-renderer, ytm-compact-video-renderer',
    surface: 'Mobile Web (m.youtube.com)',
    purpose: 'Mobile YouTube feed, sidebar, and search result containers.',
  },
];

export const BADGE_SELECTORS: SelectorRule[] = [
  {
    id: 'members-badge-class',
    category: 'Badge',
    selector: '.badge-style-type-members-only, .badge-style-type-membership',
    surface: 'Desktop Legacy Feeds',
    purpose: 'YouTube native CSS classes applied to legacy Members-only badge renderers.',
  },
  {
    id: 'wiz-membership-badge',
    category: 'Badge',
    selector: '.ytBadgeShapeMembership, .yt-badge-shape--membership, .yt-badge-shape--members-only, .badge-shape-wiz--membership',
    surface: '2025–2026 Lockup DOM',
    purpose: 'Modern camelCase and kebab-case membership badge classes used in yt-lockup-view-model.',
  },
  {
    id: 'badge-shape-elements',
    category: 'Badge',
    selector: 'yt-badge-shape, badge-shape, .yt-badge-shape__text, .ytBadgeShapeText, ytd-badge-supported-renderer, yt-badge-view-model',
    surface: 'All Surfaces',
    purpose: 'Inspects normalized badge text (handling NBSP/linebreaks) and aria-label against localized phrases.',
  },
  {
    id: 'thumbnail-overlay-badge',
    category: 'Badge',
    selector: 'yt-thumbnail-badge-view-model, thumbnail-overlay-badge-view-model, ytd-thumbnail-overlay-badge-renderer',
    surface: 'Thumbnail Overlays',
    purpose: 'Detects Members-only or Members-first badges rendered directly on video thumbnails.',
  },
  {
    id: 'post-sponsors-only',
    category: 'Badge',
    selector: '#sponsors-only-badge, ytd-sponsors-only-badge-renderer',
    surface: 'Community Tab',
    purpose: 'Dedicated badge element rendered on members-only Community posts.',
  },
  {
    id: 'leaf-text-fallback',
    category: 'Badge',
    selector: 'Leaf text exact-match fallback (span, div, p, yt-formatted-string)',
    surface: 'Class-Rename Resilient',
    purpose: 'Matches exact badge labels outside video titles even if YouTube obfuscates or renames CSS classes.',
  },
];

export const SHELF_SELECTORS: SelectorRule[] = [
  {
    id: 'recognition-shelf',
    category: 'Shelf / CTA',
    selector: 'ytd-recognition-shelf-renderer',
    surface: 'Channel Home',
    purpose: 'Channel members showcase carousel ("Our members").',
  },
  {
    id: 'membership-shelf',
    category: 'Shelf / CTA',
    selector: 'ytd-rich-shelf-renderer, ytd-shelf-renderer (titled "Members-only videos")',
    surface: 'Home & Channel Shelves',
    purpose: 'Entire horizontal shelves dedicated to Members-only videos.',
  },
  {
    id: 'membership-offer',
    category: 'Shelf / CTA',
    selector: 'ytd-sponsorships-offer-renderer, ytd-membership-offer-renderer',
    surface: 'Channel & Watch Page',
    purpose: 'Promotional membership tier cards and perk shelves.',
  },
  {
    id: 'sponsor-button',
    category: 'Shelf / CTA',
    selector: '#sponsor-button, ytd-button-renderer[button-renderer-style="STYLE_SUGGESTIVE"]',
    surface: 'Channel Header & Watch Bar',
    purpose: 'The "Join" button next to Subscribe on creator pages.',
  },
];

export const LANGUAGE_PATTERNS: LanguagePattern[] = [
  {
    code: 'en',
    language: 'English',
    phrases: [
      'members only',
      'members first',
      'members-only',
      'members-only videos',
      'channel members only',
      'only for members',
    ],
  },
  {
    code: 'de',
    language: 'German',
    phrases: ['nur für mitglieder', 'zuerst für mitglieder', 'nur für kanalmitglieder', 'videos nur für mitglieder'],
  },
  {
    code: 'es',
    language: 'Spanish',
    phrases: ['solo para miembros', 'primero para miembros', 'exclusivo para miembros'],
  },
  {
    code: 'fr',
    language: 'French',
    phrases: ['réservé aux membres', 'en avant-première pour les membres', 'accès anticipé pour les membres', 'membres uniquement'],
  },
  {
    code: 'pt',
    language: 'Portuguese',
    phrases: ['somente para membros', 'para membros', 'acesso antecipado para membros'],
  },
  {
    code: 'it',
    language: 'Italian',
    phrases: ['solo per gli abbonati', 'in anteprima per gli abbonati'],
  },
  {
    code: 'nl',
    language: 'Dutch',
    phrases: ['alleen voor leden', 'eerst voor leden'],
  },
  {
    code: 'pl',
    language: 'Polish',
    phrases: ['tylko dla wspierających', 'najpierw dla wspierających'],
  },
  {
    code: 'ja',
    language: 'Japanese',
    phrases: ['メンバー限定', 'メンバー先行'],
  },
  {
    code: 'ko',
    language: 'Korean',
    phrases: ['회원 전용', '회원 우선'],
  },
  {
    code: 'zh',
    language: 'Chinese',
    phrases: ['会员专享', '會員專屬', '会员抢先看', '會員搶先看'],
  },
  {
    code: 'ru',
    language: 'Russian',
    phrases: ['только для спонсоров', 'сначала для спонсоров'],
  },
  {
    code: 'tr',
    language: 'Turkish',
    phrases: ['üyelere özel'],
  },
  {
    code: 'id',
    language: 'Indonesian',
    phrases: ['khusus pelanggan', 'khusus anggota'],
  },
];

export interface DomTestResult {
  isMatch: boolean;
  action: 'hidden' | 'dimmed' | 'allowlisted' | 'untouched';
  matchedRule: string | null;
  matchedText: string | null;
  detectedChannel: string | null;
  containerTag: string | null;
}

export function normalizeChannel(value: string): string {
  return value.trim().toLowerCase().replace(/^@+/, '');
}

export function normalizeText(value: string | null | undefined): string {
  return String(value || '')
    .replace(/[\s\u00A0\u200B-\u200D\uFEFF]+/g, ' ')
    .trim()
    .toLowerCase();
}

export function evaluateHtmlSnippet(html: string, config: ExtensionConfig): DomTestResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const root = doc.body.firstElementChild;

  if (!root) {
    return {
      isMatch: false,
      action: 'untouched',
      matchedRule: null,
      matchedText: null,
      detectedChannel: null,
      containerTag: null,
    };
  }

  const containerTag = root.tagName.toLowerCase();

  // Extract channel handle or name
  let detectedChannel: string | null = null;
  const channelLink = root.querySelector<HTMLAnchorElement>('a[href*="/@"], ytd-channel-name a, #channel-name a');
  if (channelLink) {
    const href = channelLink.getAttribute('href') || '';
    const handleMatch = href.match(/\/(@[^/?#]+)/);
    detectedChannel = handleMatch ? handleMatch[1] : (channelLink.textContent || '').trim() || null;
  } else {
    const channelTextEl = root.querySelector(
      'ytd-channel-name, #channel-name, .yt-content-metadata-view-model__metadata-text, .yt-content-metadata-view-model-wiz__metadata-text'
    );
    if (channelTextEl?.textContent) {
      detectedChannel = channelTextEl.textContent.trim();
    }
  }

  // Check allowlist
  const normalizedAllowlist = new Set(config.allowlistedChannels.map(normalizeChannel).filter(Boolean));
  const isAllowlisted =
    detectedChannel !== null && normalizedAllowlist.has(normalizeChannel(detectedChannel));

  let matchedRule: string | null = null;
  let matchedText: string | null = null;

  // Layer 1: Direct unambiguous membership selectors
  const directSelectors = [
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
    '[class*="Badge"][class*="Member"]',
  ];

  for (const sel of directSelectors) {
    const el = root.matches(sel) ? root : root.querySelector(sel);
    if (el) {
      matchedRule = sel;
      matchedText = normalizeText(el.textContent || el.getAttribute('aria-label')) || sel;
      break;
    }
  }

  // Check membership shelf / CTA selectors
  if (!matchedRule && config.hideJoinButtonsAndShelves) {
    const shelfSelectors = [
      'ytd-recognition-shelf-renderer',
      'ytd-sponsorships-offer-renderer',
      'ytd-membership-offer-renderer',
      '#sponsor-button',
    ];
    for (const sel of shelfSelectors) {
      if (root.matches(sel) || root.querySelector(sel)) {
        matchedRule = sel;
        matchedText = 'Channel membership shelf or Join CTA';
        break;
      }
    }
  }

  const activePhrases = config.multiLanguage
    ? LANGUAGE_PATTERNS.flatMap((lang) => lang.phrases)
    : LANGUAGE_PATTERNS[0].phrases;

  // Layer 2: Broad badge element text & aria-label scan
  if (!matchedRule) {
    const badgeNodes = root.querySelectorAll(
      [
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
        '#sponsors-only-badge',
      ].join(', ')
    );

    for (const node of Array.from(badgeNodes)) {
      const combined = normalizeText(`${node.textContent || ''} ${node.getAttribute('aria-label') || ''} ${node.getAttribute('title') || ''}`);
      if (!combined) continue;
      const foundPhrase = activePhrases.find((phrase) => combined.includes(phrase));
      if (foundPhrase) {
        matchedRule = `badge-text("${foundPhrase}")`;
        matchedText = (node.textContent || node.getAttribute('aria-label') || foundPhrase).trim();
        break;
      }
    }
  }

  // Layer 3: Universal leaf-node exact badge text fallback (skips titles/descriptions)
  if (!matchedRule) {
    const leafNodes = root.querySelectorAll('span, div, p, yt-formatted-string');
    for (const node of Array.from(leafNodes)) {
      if (node.closest('#video-title, #video-title-link, h3, #description-text, .metadata-snippet-text')) {
        continue;
      }
      const aria = normalizeText(node.getAttribute('aria-label'));
      if (aria) {
        const ariaHit = activePhrases.find((phrase) => aria === phrase || aria.includes(phrase));
        if (ariaHit) {
          matchedRule = `aria-match("${ariaHit}")`;
          matchedText = node.getAttribute('aria-label') || ariaHit;
          break;
        }
      }
      if (node.children.length > 0) continue;
      const clean = normalizeText(node.textContent);
      if (clean.length < 4 || clean.length > 48) continue;
      const exactHit = activePhrases.find((phrase) => clean === phrase);
      if (exactHit) {
        matchedRule = `leaf-exact("${exactHit}")`;
        matchedText = (node.textContent || exactHit).trim();
        break;
      }
    }
  }

  if (!matchedRule) {
    return {
      isMatch: false,
      action: 'untouched',
      matchedRule: null,
      matchedText: null,
      detectedChannel,
      containerTag,
    };
  }

  if (!config.enabled) {
    return {
      isMatch: true,
      action: 'untouched',
      matchedRule,
      matchedText,
      detectedChannel,
      containerTag,
    };
  }

  if (isAllowlisted) {
    return {
      isMatch: true,
      action: 'allowlisted',
      matchedRule,
      matchedText,
      detectedChannel,
      containerTag,
    };
  }

  return {
    isMatch: true,
    action: config.mode === 'hide' ? 'hidden' : 'dimmed',
    matchedRule,
    matchedText,
    detectedChannel,
    containerTag,
  };
}
