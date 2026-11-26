import React, { useState } from 'react';
import { Eye, EyeOff, Film, Plus, ShieldCheck, Star } from 'lucide-react';
import { ExtensionConfig, SimulatedVideo, YouTubeSurface } from '../extension/types';
import { normalizeChannel } from '../extension/ruleEngine';

interface YouTubeFeedSimProps {
  config: ExtensionConfig;
  surface: YouTubeSurface;
  onSurfaceChange: (surface: YouTubeSurface) => void;
  videos: SimulatedVideo[];
  onSimulateScroll: () => void;
  onAllowlistChannel: (handle: string) => void;
  filteredCount: number;
  iconDataUrl: string;
}

const SURFACE_META: Record<YouTubeSurface, { label: string; url: string }> = {
  home: { label: 'Home Feed', url: 'youtube.com' },
  subscriptions: { label: 'Subscriptions', url: 'youtube.com/feed/subscriptions' },
  channel: { label: 'Channel Page', url: 'youtube.com/@KeystoneWorkshop/videos' },
  search: { label: 'Search Results', url: 'youtube.com/results?search_query=custom+build' },
};

export function evaluateItemVisibility(
  item: SimulatedVideo,
  surface: YouTubeSurface,
  config: ExtensionConfig
): 'visible' | 'hidden' | 'dimmed' | 'allowlisted' {
  if (!item.isMembersOnly || !config.enabled) return 'visible';

  // Check multi-language setting for non-English badge labels
  if (
    !config.multiLanguage &&
    item.memberBadgeLabel &&
    !item.memberBadgeLabel.toLowerCase().includes('member')
  ) {
    return 'visible';
  }

  // Check surface toggle
  const isShortOrPost = item.kind === 'short' || item.kind === 'post';
  let surfaceActive = true;
  if (isShortOrPost) {
    surfaceActive = config.hideShortsAndPosts;
  } else if (surface === 'subscriptions') {
    surfaceActive = config.hideSubscriptions;
  } else if (surface === 'search') {
    surfaceActive = config.hideSearchAndSidebar;
  } else {
    surfaceActive = config.hideHomeAndFeed;
  }

  if (!surfaceActive) return 'visible';

  // Check channel allowlist
  const normalizedHandle = normalizeChannel(item.channelHandle);
  const normalizedName = normalizeChannel(item.channelName);
  const isExempt = config.allowlistedChannels.some((entry) => {
    const clean = normalizeChannel(entry);
    return clean === normalizedHandle || clean === normalizedName;
  });

  if (isExempt) return 'allowlisted';

  return config.mode === 'hide' ? 'hidden' : 'dimmed';
}

interface ThumbnailProps {
  src: string;
  alt: string;
  duration: string;
  isShort?: boolean;
}

function VideoThumbnail({ src, alt, duration, isShort }: ThumbnailProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-900">
      {!failed ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-400 px-4 text-center">
          <Film className="w-6 h-6" aria-hidden="true" />
          <span className="text-xs line-clamp-1">{alt}</span>
        </div>
      )}
      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[11px] font-mono tabular-nums">
        {isShort ? `Short · ${duration}` : duration}
      </span>
    </div>
  );
}

export function YouTubeFeedSim({
  config,
  surface,
  onSurfaceChange,
  videos,
  onSimulateScroll,
  onAllowlistChannel,
  filteredCount,
  iconDataUrl,
}: YouTubeFeedSimProps) {
  const [inspectMatches, setInspectMatches] = useState(false);

  const surfaceItems = videos.filter((v) => v.surfaces.includes(surface));
  const evaluated = surfaceItems.map((item) => ({
    item,
    state: evaluateItemVisibility(item, surface, config),
  }));

  const displayedItems = evaluated.filter(
    ({ state }) => state !== 'hidden' || inspectMatches
  );

  const hiddenByFilterCount = evaluated.filter(({ state }) => state === 'hidden').length;
  const showJoinElements = !(config.enabled && config.hideJoinButtonsAndShelves);
  const showToolbarBadge = config.enabled && config.showBadgeCount && filteredCount > 0;

  return (
    <section
      aria-label="Simulated YouTube browser viewport"
      className="bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col min-w-0"
    >
      {/* Simulated Chrome browser bar */}
      <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
          </div>
          <div className="flex-1 min-w-0 max-w-md px-3 py-1 bg-white border border-zinc-200 rounded-md text-xs font-mono text-zinc-600 truncate">
            https://www.{SURFACE_META[surface].url}
          </div>
        </div>

        {/* Simulated Chrome extension toolbar icon + live badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="relative inline-flex items-center justify-center w-8 h-8 rounded-md bg-white border border-zinc-200"
            title="ClearFeed toolbar icon preview"
          >
            {iconDataUrl ? (
              <img
                src={iconDataUrl}
                alt="ClearFeed extension icon"
                className="w-5 h-5 rounded-xs"
              />
            ) : (
              <span className="w-5 h-5 rounded-xs bg-red-600" />
            )}
            {showToolbarBadge && (
              <span
                aria-label={`${filteredCount} items filtered`}
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded bg-red-600 text-white text-[10px] font-mono font-semibold tabular-nums flex items-center justify-center"
              >
                {filteredCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Surface switcher & simulator controls */}
      <div className="px-5 py-3 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex items-center gap-1 p-1 bg-zinc-100 rounded-lg overflow-x-auto max-w-full"
          role="tablist"
          aria-label="YouTube surface"
        >
          {(Object.keys(SURFACE_META) as YouTubeSurface[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={surface === key}
              onClick={() => onSurfaceChange(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                surface === key
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {SURFACE_META[key].label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setInspectMatches((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
              inspectMatches
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:text-zinc-950'
            }`}
          >
            {inspectMatches ? (
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {inspectMatches ? 'Showing hidden items' : `Inspect hidden (${hiddenByFilterCount})`}
          </button>

          <button
            type="button"
            onClick={onSimulateScroll}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            Simulate scroll
          </button>
        </div>
      </div>

      {/* Simulated YouTube content body */}
      <div className="p-5 flex-1 flex flex-col gap-5 bg-[#FCFCFD]">
        {/* Channel header mockup when browsing Channel Page */}
        {surface === 'channel' && (
          <div className="pb-5 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-full bg-zinc-900 text-white font-display font-semibold text-lg flex items-center justify-center shrink-0">
                KW
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-zinc-950 truncate">
                  Keystone Workshop
                </h3>
                <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                  <span className="font-mono">@KeystoneWorkshop</span>
                  <span aria-hidden="true">·</span>
                  <span>412K subscribers</span>
                  <span aria-hidden="true">·</span>
                  <span>184 videos</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-zinc-900 text-white select-none">
                Subscribed
              </span>
              {showJoinElements ? (
                <span className="px-4 py-1.5 text-xs font-medium rounded-full border border-zinc-300 bg-white text-zinc-900 select-none">
                  Join
                </span>
              ) : (
                inspectMatches && (
                  <span className="px-3 py-1.5 text-[11px] font-mono text-red-700 border border-dashed border-red-300 rounded-md bg-red-50/50">
                    #sponsor-button hidden
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* Channel membership recognition shelf when on Channel Page */}
        {surface === 'channel' && (showJoinElements || inspectMatches) && (
          <div
            className={`p-4 rounded-lg border transition-opacity duration-150 ${
              showJoinElements
                ? 'bg-white border-zinc-200'
                : 'bg-red-50/40 border-dashed border-red-300 opacity-75'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-zinc-900">
                  Our channel members
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Thank you to our supporters for funding independent hardware benchmarks and CAD files.
                </p>
              </div>
              {!showJoinElements && (
                <span className="text-[11px] font-mono text-red-700">
                  Hidden by ytd-recognition-shelf-renderer
                </span>
              )}
            </div>
          </div>
        )}

        {/* Feed grid or search list */}
        {displayedItems.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-zinc-300 rounded-lg bg-white">
            <p className="text-sm font-medium text-zinc-900">All items on this view were filtered out</p>
            <p className="text-xs text-zinc-500 mt-1">
              Toggle &ldquo;Inspect hidden&rdquo; or add a channel to your allowlist to reveal them.
            </p>
          </div>
        ) : (
          <div
            className={
              surface === 'search'
                ? 'flex flex-col gap-4'
                : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
            }
          >
            {displayedItems.map(({ item, state }) => {
              const isHiddenPreview = state === 'hidden';
              const isDimmed = state === 'dimmed';
              const isAllowlisted = state === 'allowlisted';

              return (
                <article
                  key={item.id}
                  className={`group flex ${
                    surface === 'search' ? 'flex-col sm:flex-row gap-4' : 'flex-col gap-2.5'
                  } rounded-lg transition-all duration-200 ${
                    isHiddenPreview
                      ? 'p-3 border border-dashed border-red-300 bg-red-50/40'
                      : isDimmed
                        ? 'opacity-30 grayscale hover:opacity-95 hover:grayscale-0'
                        : ''
                  }`}
                >
                  <div className={surface === 'search' ? 'sm:w-64 shrink-0' : 'w-full'}>
                    <VideoThumbnail
                      src={item.thumbnail}
                      alt={item.title}
                      duration={item.duration}
                      isShort={item.kind === 'short'}
                    />
                  </div>

                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <h4 className="text-[14px] font-semibold leading-snug text-zinc-950 line-clamp-2">
                      {item.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-zinc-600">
                      <span className="font-medium text-zinc-700">{item.channelName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{item.views}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.publishedAt}</span>
                    </div>

                    {item.excerpt && (
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">{item.excerpt}</p>
                    )}

                    {/* Authentic YouTube Members-only metadata line */}
                    {item.isMembersOnly && (
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                          <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" aria-hidden="true" />
                          {item.memberBadgeLabel || 'Members only'}
                        </span>

                        {isAllowlisted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-700">
                            <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" aria-hidden="true" />
                            Allowlisted
                          </span>
                        ) : (
                          (isDimmed || isHiddenPreview) && (
                            <button
                              type="button"
                              onClick={() => onAllowlistChannel(item.channelHandle)}
                              className="text-[11px] font-medium text-zinc-600 hover:text-zinc-950 underline decoration-zinc-300 underline-offset-2"
                            >
                              Allow {item.channelHandle}
                            </button>
                          )
                        )}
                      </div>
                    )}

                    {/* Developer rule match readout when inspecting hidden items */}
                    {inspectMatches && item.isMembersOnly && (
                      <div className="mt-1.5 pt-1.5 border-t border-red-200/80 flex items-center justify-between gap-2 text-[11px] font-mono">
                        <span className="text-red-700 truncate">
                          {item.matchedSelector || '.badge-style-type-members-only'}
                        </span>
                        <span className="text-zinc-500 shrink-0">
                          {isHiddenPreview
                            ? 'display: none'
                            : isDimmed
                              ? 'opacity: 0.24'
                              : isAllowlisted
                                ? 'bypassed'
                                : 'visible'}
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
