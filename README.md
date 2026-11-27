# ClearFeed — Hide YouTube Members-Only Content

A Manifest V3 Chrome extension that automatically hides or dims Members-only videos, early-access releases, Shorts, Community posts, and "Join" shelves on YouTube.

## Features

- **3-layer YouTube DOM detection**: Matches legacy Polymer badges, 2025–2026 `yt-badge-shape` / `ytBadgeShapeMembership` lockups, and exact leaf-node labels (resilient to CSS class renames and non-breaking spaces).
- **Hide or Dim & Blur**: Collapse Members-only items completely (`display: none`) or dim them with hover-to-peek.
- **Granular controls**: Independently toggle Home & Channel feeds, Subscriptions, Search & Watch sidebar, Shorts & Community posts, and "Join" buttons/shelves.
- **Channel Allowlist**: Exempt creators whose memberships you subscribe to (e.g. `@ChannelHandle`).
- **14 languages**: Detects localized Members-only and Members-first badges.
- **Zero tracking**: 100% local DOM filtering with minimal permissions (`storage` and `*://*.youtube.com/*`).

## Load Unpacked Locally

You can load this repository directly in Chrome without running a build step:

1. Open `chrome://extensions` in Chrome, Brave, Arc, or Edge.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select this repository's root folder (the one containing `manifest.json`).
4. Refresh any open `youtube.com` tab.

## Build the Extension `.zip`

```bash
npm install
npm run lint
npm run build
```

This generates:
- `dist/clearfeed-youtube-members-hider-v<version>.zip` — Chrome Web Store-ready archive with `manifest.json` at the root.
- `dist/clearfeed-youtube-members-hider.zip` — unversioned alias of the same archive.
- `dist/unpacked/` — clean copy of all packaged extension files.

## GitHub Actions CI & Releases

Every push, pull request, or manual run triggers `.github/workflows/build.yml`, which:
1. Validates `manifest.json`, referenced icons/files, and JavaScript syntax (`npm run lint`).
2. Builds the extension `.zip` (`npm run build`).
3. Uploads the `.zip` as a downloadable **Workflow Artifact** (`clearfeed-youtube-members-hider-zip`).

To cut a GitHub Release with the `.zip` attached automatically:

```bash
git tag v1.1.0
git push origin v1.1.0
```
