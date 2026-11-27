# ClearFeed

A Manifest V3 browser extension for Chrome, Brave, Edge, and Arc that hides or dims YouTube Members-only videos, early-access ("Members first") uploads, Shorts, Community posts, and "Join" shelves.

YouTube mixes paywalled uploads into regular feeds with no native way to filter them out. ClearFeed strips them from the DOM locally as you browse.

## What It Does

- **Hide or Dim:** Either remove matched items completely (`display: none`) or blur and dim them with hover-to-peek.
- **Per-section toggles:** Turn filtering on or off independently for:
  - Home & Channel pages
  - Subscriptions feed
  - Search results & Watch sidebar
  - Shorts & Community posts
  - "Join" buttons and membership shelves
- **Channel allowlist:** Exempt creators whose memberships you actually pay for using their handle (e.g. `@ChannelHandle`).
- **Multi-layer DOM matching:** Catches legacy Polymer badges, 2025–2026 `yt-badge-shape` / `ytBadgeShapeMembership` lockups, and exact leaf-node text. Handles non-breaking spaces and holds up when YouTube rotates CSS class names.
- **14 languages:** Matches localized "Members only" and "Members first" badge text.
- **Local only:** No network requests, telemetry, or external dependencies. Permissions are limited to `storage` and `*://*.youtube.com/*`.

## Install

No build step is required to run the extension from source.

1. Download the latest release `.zip` from the **Releases** page and extract it (or clone this repo).
2. Open `chrome://extensions` in your Chromium browser.
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** and select the folder containing `manifest.json`.
5. Refresh any open `youtube.com` tabs.

## Build from Source

```bash
npm install
npm run lint
npm run build
```

Outputs in `dist/`:

- `clearfeed-youtube-members-hider-v<version>.zip` — Chrome Web Store-ready package with `manifest.json` at the root.
- `clearfeed-youtube-members-hider.zip` — unversioned copy of the same archive.
- `unpacked/` — clean directory of the packaged extension files.

## CI & Releases

Pushes, pull requests, and manual runs trigger `.github/workflows/build.yml`, which runs `npm run lint` (validating `manifest.json`, icons, referenced files, and JS syntax), runs `npm run build`, and uploads the `.zip` as the `clearfeed-youtube-members-hider-zip` workflow artifact.

To publish a GitHub Release with the `.zip` attached automatically:

```bash
git tag v1.1.0
git push origin v1.1.0
```
