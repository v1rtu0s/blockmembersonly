import React, { useMemo, useState } from 'react';
import { Check, Download } from 'lucide-react';
import { ExtensionPopupSim } from './components/ExtensionPopupSim';
import { InstallGuide } from './components/InstallGuide';
import { SelectorInspector } from './components/SelectorInspector';
import { SourceExplorer } from './components/SourceExplorer';
import { evaluateItemVisibility, YouTubeFeedSim } from './components/YouTubeFeedSim';
import { INITIAL_FEED_VIDEOS, SCROLL_BATCH_TEMPLATES } from './data/mockFeed';
import {
  DEFAULT_EXTENSION_CONFIG,
  ExtensionConfig,
  SimulatedVideo,
  YouTubeSurface,
} from './extension/types';
import { normalizeChannel } from './extension/ruleEngine';
import { downloadExtensionZip, generateIconDataUrls } from './extension/zipBuilder';

type ActiveTab = 'simulator' | 'source' | 'selectors' | 'install';

const NAV_ITEMS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'simulator', label: 'Simulator' },
  { id: 'source', label: 'Source Files' },
  { id: 'selectors', label: 'Selectors' },
  { id: 'install', label: 'Install Guide' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [config, setConfig] = useState<ExtensionConfig>(DEFAULT_EXTENSION_CONFIG);
  const [surface, setSurface] = useState<YouTubeSurface>('home');
  const [videos, setVideos] = useState<SimulatedVideo[]>(INITIAL_FEED_VIDEOS);
  const [scrollCount, setScrollCount] = useState(0);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);
  const [isPackaging, setIsPackaging] = useState(false);

  const iconDataUrls = useMemo(() => generateIconDataUrls(), []);

  const surfaceVideos = useMemo(
    () => videos.filter((v) => v.surfaces.includes(surface)),
    [videos, surface]
  );

  const { filteredCount, visibleCount } = useMemo(() => {
    let filtered = 0;
    let visible = 0;
    for (const item of surfaceVideos) {
      const state = evaluateItemVisibility(item, surface, config);
      if (state === 'hidden' || state === 'dimmed') {
        filtered += 1;
      }
      if (state !== 'hidden') {
        visible += 1;
      }
    }
    return { filteredCount: filtered, visibleCount: visible };
  }, [surfaceVideos, surface, config]);

  const suggestedChannels = useMemo(() => {
    const handles = new Set<string>();
    for (const video of videos) {
      if (video.isMembersOnly) {
        handles.add(video.channelHandle);
      }
    }
    return Array.from(handles);
  }, [videos]);

  const handleAllowlistChannel = (handle: string) => {
    const formatted = handle.startsWith('@') ? handle : `@${handle}`;
    const norm = normalizeChannel(formatted);
    if (config.allowlistedChannels.some((c) => normalizeChannel(c) === norm)) {
      return;
    }
    setConfig((prev) => ({
      ...prev,
      allowlistedChannels: [...prev.allowlistedChannels, formatted],
    }));
  };

  const handleSimulateScroll = () => {
    const nextBatchIndex = scrollCount + 1;
    setScrollCount(nextBatchIndex);
    const appended: SimulatedVideo[] = SCROLL_BATCH_TEMPLATES.map((tpl, idx) => ({
      ...tpl,
      id: `scroll-${nextBatchIndex}-${idx}`,
    }));
    setVideos((prev) => [...prev, ...appended]);
  };

  const handleDownloadZip = async () => {
    if (isPackaging) return;
    setIsPackaging(true);
    try {
      const { fileCount, zipSizeBytes } = await downloadExtensionZip(config);
      const kb = (zipSizeBytes / 1024).toFixed(1);
      setDownloadFeedback(`Downloaded clearfeed-youtube-members-hider.zip (${fileCount} files · ${kb} KB)`);
      window.setTimeout(() => setDownloadFeedback(null), 4500);
    } catch {
      setDownloadFeedback('Unable to generate ZIP archive in this browser context.');
      window.setTimeout(() => setDownloadFeedback(null), 4500);
    } finally {
      setIsPackaging(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-zinc-900">
      {/* Top Bar Contract: strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-zinc-200">
        <div className="max-w-[1440px] mx-auto px-6 h-15 flex items-center justify-between gap-8">
          {/* Zone 1: Single wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className="font-display text-lg font-bold tracking-tight text-zinc-950 whitespace-nowrap shrink-0"
          >
            ClearFeed
          </button>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-6 overflow-x-auto text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    isActive
                      ? 'text-zinc-950 border-red-600'
                      : 'text-zinc-500 border-transparent hover:text-zinc-950'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary CTA */}
          <div className="shrink-0">
            <button
              type="button"
              disabled={isPackaging}
              onClick={handleDownloadZip}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              {downloadFeedback ? (
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {isPackaging ? 'Packaging...' : 'Download .zip'}
            </button>
          </div>
        </div>
      </header>

      {/* Main workspace viewport */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-8">
        {downloadFeedback && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 px-4 py-3 bg-white border border-zinc-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-800"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>{downloadFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('install')}
              className="font-medium text-red-600 hover:text-red-700 underline underline-offset-2 whitespace-nowrap"
            >
              View 4-step Chrome install guide
            </button>
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="flex flex-col gap-6">
            {/* Compact hero lead-in */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 [text-wrap:balance]">
                  Hide Members-Only Content on YouTube
                </h1>
                <p className="text-sm text-zinc-600 mt-1.5 leading-relaxed">
                  Configure your Manifest V3 Chrome extension below, test every rule against a live YouTube feed, and download a ready-to-load extension package with zero external dependencies.
                </p>
              </div>
              <div className="text-xs text-zinc-500 flex items-center gap-2 shrink-0">
                <span>Manifest V3</span>
                <span aria-hidden="true">·</span>
                <span>14 languages</span>
                <span aria-hidden="true">·</span>
                <span>Zero tracking</span>
              </div>
            </div>

            {/* Two-column workspace: Extension Popup + Simulated YouTube Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-[356px_minmax(0,1fr)] gap-6 items-start">
              <ExtensionPopupSim
                config={config}
                onChange={setConfig}
                filteredCount={filteredCount}
                visibleCount={visibleCount}
                suggestedChannels={suggestedChannels}
              />

              <YouTubeFeedSim
                config={config}
                surface={surface}
                onSurfaceChange={setSurface}
                videos={videos}
                onSimulateScroll={handleSimulateScroll}
                onAllowlistChannel={handleAllowlistChannel}
                filteredCount={filteredCount}
                iconDataUrl={iconDataUrls[48]}
              />
            </div>
          </div>
        )}

        {activeTab === 'source' && (
          <SourceExplorer
            config={config}
            iconDataUrls={iconDataUrls}
            onDownloadZip={handleDownloadZip}
          />
        )}

        {activeTab === 'selectors' && <SelectorInspector config={config} />}

        {activeTab === 'install' && <InstallGuide onDownloadZip={handleDownloadZip} />}
      </main>

      {/* Quiet footer */}
      <footer className="border-t border-zinc-200 bg-white mt-auto">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
          <span>ClearFeed — Local Manifest V3 YouTube Members-Only Filter</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('source')}
              className="hover:text-zinc-900 transition-colors"
            >
              Inspect Source
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('install')}
              className="hover:text-zinc-900 transition-colors"
            >
              Load Unpacked Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
