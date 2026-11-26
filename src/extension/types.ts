export type FilterMode = 'hide' | 'dim';

export interface ExtensionConfig {
  enabled: boolean;
  mode: FilterMode;
  hideHomeAndFeed: boolean;
  hideSubscriptions: boolean;
  hideSearchAndSidebar: boolean;
  hideShortsAndPosts: boolean;
  hideJoinButtonsAndShelves: boolean;
  multiLanguage: boolean;
  showBadgeCount: boolean;
  allowlistedChannels: string[];
}

export const DEFAULT_EXTENSION_CONFIG: ExtensionConfig = {
  enabled: true,
  mode: 'hide',
  hideHomeAndFeed: true,
  hideSubscriptions: true,
  hideSearchAndSidebar: true,
  hideShortsAndPosts: true,
  hideJoinButtonsAndShelves: true,
  multiLanguage: true,
  showBadgeCount: true,
  allowlistedChannels: [],
};

export interface ExtensionFile {
  path: string;
  language: 'json' | 'javascript' | 'css' | 'html' | 'text';
  description: string;
  content: string;
}

export type YouTubeSurface = 'home' | 'subscriptions' | 'channel' | 'search';

export interface SimulatedVideo {
  id: string;
  title: string;
  channelName: string;
  channelHandle: string;
  views: string;
  publishedAt: string;
  duration: string;
  thumbnail: string;
  isMembersOnly: boolean;
  memberBadgeLabel?: string;
  matchedSelector?: string;
  kind: 'video' | 'short' | 'post';
  surfaces: YouTubeSurface[];
  excerpt?: string;
}
