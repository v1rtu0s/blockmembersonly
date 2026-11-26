import { SimulatedVideo } from '../extension/types';

export const INITIAL_FEED_VIDEOS: SimulatedVideo[] = [
  {
    id: 'vid-1',
    title: 'Machining a 65% Aluminum Keyboard Case From a Solid Billet',
    channelName: 'Keystone Workshop',
    channelHandle: '@KeystoneWorkshop',
    views: '284K views',
    publishedAt: '5 hours ago',
    duration: '18:42',
    thumbnail: '/src/assets/images/thumb_mech_keyboard_1795698187595.jpg',
    isMembersOnly: false,
    kind: 'video',
    surfaces: ['home', 'subscriptions', 'channel', 'search'],
  },
  {
    id: 'vid-2',
    title: 'Uncut Acoustic Switch Blind Test + Full CAD Blueprint Walkthrough',
    channelName: 'Keystone Workshop',
    channelHandle: '@KeystoneWorkshop',
    views: '4.1K views',
    publishedAt: '1 day ago',
    duration: '34:15',
    thumbnail: '/src/assets/images/thumb_mech_keyboard_1795698187595.jpg',
    isMembersOnly: true,
    memberBadgeLabel: 'Members only',
    matchedSelector: '.badge-style-type-members-only',
    kind: 'video',
    surfaces: ['home', 'subscriptions', 'channel', 'search'],
  },
  {
    id: 'vid-3',
    title: 'Dialing In Light-Roast Ethiopian Espresso Without Channeling',
    channelName: 'BrewCraft Lab',
    channelHandle: '@BrewCraftLab',
    views: '192K views',
    publishedAt: '14 hours ago',
    duration: '14:08',
    thumbnail: '/src/assets/images/thumb_espresso_lab_1795698192414.jpg',
    isMembersOnly: false,
    kind: 'video',
    surfaces: ['home', 'subscriptions', 'search'],
  },
  {
    id: 'vid-4',
    title: 'Monthly Roaster Cupping Stream & Extraction Spreadsheet Q&A',
    channelName: 'BrewCraft Lab',
    channelHandle: '@BrewCraftLab',
    views: '2.8K views',
    publishedAt: '2 days ago',
    duration: '52:19',
    thumbnail: '/src/assets/images/thumb_espresso_lab_1795698192414.jpg',
    isMembersOnly: true,
    memberBadgeLabel: 'Members first',
    matchedSelector: 'badge-shape.yt-badge-shape--commerce',
    kind: 'video',
    surfaces: ['home', 'subscriptions', 'search'],
  },
  {
    id: 'vid-5',
    title: 'Building a Generative Ambient Patch With Only Three Eurorack Modules',
    channelName: 'Patchbay Notes',
    channelHandle: '@PatchbayNotes',
    views: '88K views',
    publishedAt: '2 days ago',
    duration: '21:30',
    thumbnail: '/src/assets/images/thumb_synth_modular_1795698305433.jpg',
    isMembersOnly: false,
    kind: 'video',
    surfaces: ['home', 'subscriptions', 'search'],
  },
  {
    id: 'vid-6',
    title: 'Raw Studio Stems & Unedited Tape Loop Session (Backstage Archive)',
    channelName: 'Patchbay Notes',
    channelHandle: '@PatchbayNotes',
    views: '1.9K views',
    publishedAt: '3 days ago',
    duration: '41:04',
    thumbnail: '/src/assets/images/thumb_synth_modular_1795698305433.jpg',
    isMembersOnly: true,
    memberBadgeLabel: 'Members only',
    matchedSelector: '.badge-style-type-members-only',
    kind: 'video',
    surfaces: ['home', 'subscriptions'],
  },
  {
    id: 'vid-7',
    title: 'Shooting Rain-Slicked Tokyo Alleys at Dusk on 800T 35mm Film',
    channelName: 'Frame & Grain',
    channelHandle: '@FrameAndGrain',
    views: '415K views',
    publishedAt: '4 days ago',
    duration: '16:27',
    thumbnail: '/src/assets/images/thumb_tokyo_alley_1795698307002.jpg',
    isMembersOnly: false,
    kind: 'video',
    surfaces: ['home', 'subscriptions', 'search'],
  },
  {
    id: 'vid-8',
    title: 'Passive Copper Heatpipe Workstation: Zero-RPM Acoustic Benchmark',
    channelName: 'Keystone Workshop',
    channelHandle: '@KeystoneWorkshop',
    views: '327K views',
    publishedAt: '6 days ago',
    duration: '24:11',
    thumbnail: '/src/assets/images/thumb_pc_watercool_1795698306688.jpg',
    isMembersOnly: false,
    kind: 'video',
    surfaces: ['home', 'channel', 'search'],
  },
  {
    id: 'vid-9',
    title: 'Nur für Mitglieder: Werkbank-Tour & CNC-Fräsdateien zum Download',
    channelName: 'Keystone Workshop',
    channelHandle: '@KeystoneWorkshop',
    views: '1.4K views',
    publishedAt: '1 week ago',
    duration: '28:50',
    thumbnail: '/src/assets/images/thumb_pc_watercool_1795698306688.jpg',
    isMembersOnly: true,
    memberBadgeLabel: 'Nur für Mitglieder',
    matchedSelector: 'text-match("nur für mitglieder")',
    kind: 'video',
    surfaces: ['home', 'channel', 'search'],
  },
  {
    id: 'vid-10',
    title: 'Throwing Tall Stoneware Vessels: Clay Compression & Kiln Glaze Notes',
    channelName: 'Kiln & Wheel',
    channelHandle: '@KilnAndWheel',
    views: '154K views',
    publishedAt: '5 days ago',
    duration: '19:03',
    thumbnail: '/src/assets/images/thumb_ceramic_wheel_1795698308201.jpg',
    isMembersOnly: false,
    kind: 'video',
    surfaces: ['home', 'subscriptions'],
  },
  {
    id: 'post-1',
    title: 'Behind-the-scenes glaze recipe spreadsheet + next month poll',
    channelName: 'Kiln & Wheel',
    channelHandle: '@KilnAndWheel',
    views: '312 votes',
    publishedAt: '9 hours ago',
    duration: 'Post',
    thumbnail: '/src/assets/images/thumb_ceramic_wheel_1795698308201.jpg',
    isMembersOnly: true,
    memberBadgeLabel: 'Members only',
    matchedSelector: '#sponsors-only-badge',
    kind: 'post',
    surfaces: ['home', 'subscriptions'],
    excerpt:
      'Vote on which ash glaze reduction test we fire in Saturday’s members-only kiln opening livestream.',
  },
];

export const SCROLL_BATCH_TEMPLATES: Omit<SimulatedVideo, 'id'>[] = [
  {
    title: 'Early Access: Custom Brass Weight Anodizing Failure & Recovery',
    channelName: 'Keystone Workshop',
    channelHandle: '@KeystoneWorkshop',
    views: '980 views',
    publishedAt: 'Just loaded',
    duration: '15:40',
    thumbnail: '/src/assets/images/thumb_mech_keyboard_1795698187595.jpg',
    isMembersOnly: true,
    memberBadgeLabel: 'Members first',
    matchedSelector: 'badge-shape.yt-badge-shape--commerce',
    kind: 'video',
    surfaces: ['home', 'subscriptions', 'channel', 'search'],
  },
  {
    title: 'Why Film Halation Happens Under Neon Streetlights',
    channelName: 'Frame & Grain',
    channelHandle: '@FrameAndGrain',
    views: '118K views',
    publishedAt: 'Just loaded',
    duration: '11:22',
    thumbnail: '/src/assets/images/thumb_tokyo_alley_1795698307002.jpg',
    isMembersOnly: false,
    kind: 'video',
    surfaces: ['home', 'subscriptions', 'channel', 'search'],
  },
  {
    title: 'Quick Glaze Dipping Trick (Members-Only Short)',
    channelName: 'Kiln & Wheel',
    channelHandle: '@KilnAndWheel',
    views: '640 views',
    publishedAt: 'Just loaded',
    duration: '0:49',
    thumbnail: '/src/assets/images/thumb_ceramic_wheel_1795698308201.jpg',
    isMembersOnly: true,
    memberBadgeLabel: 'Members only',
    matchedSelector: '.badge-style-type-members-only',
    kind: 'short',
    surfaces: ['home', 'subscriptions', 'channel', 'search'],
  },
];

export interface HtmlTestPreset {
  id: string;
  label: string;
  html: string;
}

export const HTML_TEST_PRESETS: HtmlTestPreset[] = [
  {
    id: 'desktop-members',
    label: 'Desktop Members-Only Card',
    html: `<ytd-rich-item-renderer>
  <div id="meta">
    <a id="video-title" href="/watch?v=abc123">Uncut CAD Walkthrough</a>
    <ytd-channel-name>
      <a href="/@KeystoneWorkshop">Keystone Workshop</a>
    </ytd-channel-name>
    <ytd-badge-supported-renderer aria-label="Members only">
      <div class="badge badge-style-type-members-only">Members only</div>
    </ytd-badge-supported-renderer>
  </div>
</ytd-rich-item-renderer>`,
  },
  {
    id: 'wiz-lockup-2026',
    label: '2026 yt-badge-shape Lockup',
    html: `<yt-lockup-view-model>
  <div class="yt-lockup-view-model--wrapper">
    <a href="/@BrewCraftLab">BrewCraft Lab</a>
    <yt-badge-shape class="yt-badge-shape--membership ytBadgeShapeMembership">
      <div class="yt-badge-shape__text ytBadgeShapeText">Members\u00A0only</div>
    </yt-badge-shape>
  </div>
</yt-lockup-view-model>`,
  },
  {
    id: 'community-post',
    label: 'Members Community Post',
    html: `<ytd-backstage-post-thread-renderer>
  <a href="/@KilnAndWheel">Kiln &amp; Wheel</a>
  <div id="sponsors-only-badge">Members only</div>
  <p>Kiln opening livestream link for supporters.</p>
</ytd-backstage-post-thread-renderer>`,
  },
  {
    id: 'public-video',
    label: 'Standard Public Video',
    html: `<ytd-rich-item-renderer>
  <div id="meta">
    <a id="video-title" href="/watch?v=xyz789">Dialing In Light-Roast Espresso</a>
    <ytd-channel-name>
      <a href="/@BrewCraftLab">BrewCraft Lab</a>
    </ytd-channel-name>
    <ytd-badge-supported-renderer>
      <div class="badge">4K</div>
    </ytd-badge-supported-renderer>
  </div>
</ytd-rich-item-renderer>`,
  },
];
