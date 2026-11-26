import React, { useState } from 'react';
import { Plus, RotateCcw, X } from 'lucide-react';
import { DEFAULT_EXTENSION_CONFIG, ExtensionConfig } from '../extension/types';
import { normalizeChannel } from '../extension/ruleEngine';

interface ExtensionPopupSimProps {
  config: ExtensionConfig;
  onChange: (next: ExtensionConfig) => void;
  filteredCount: number;
  visibleCount: number;
  suggestedChannels: string[];
}

interface ToggleRowProps {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: (checked: boolean) => void;
}

function ToggleRow({ id, label, checked, disabled, onToggle }: ToggleRowProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center justify-between gap-3 py-1.5 text-[13px] select-none transition-colors ${
        disabled ? 'text-zinc-400 cursor-not-allowed' : 'text-zinc-800 hover:text-zinc-950 cursor-pointer'
      }`}
    >
      <span className="truncate">{label}</span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onToggle(e.target.checked)}
        className="h-4 w-4 rounded border-zinc-300 accent-red-600 shrink-0"
      />
    </label>
  );
}

export function ExtensionPopupSim({
  config,
  onChange,
  filteredCount,
  visibleCount,
  suggestedChannels,
}: ExtensionPopupSimProps) {
  const [channelInput, setChannelInput] = useState('');

  const updateField = <K extends keyof ExtensionConfig>(key: K, value: ExtensionConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const addChannel = (rawValue: string) => {
    const trimmed = rawValue.trim();
    if (!trimmed) return;
    const formatted = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
    const normalized = normalizeChannel(formatted);
    if (config.allowlistedChannels.some((c) => normalizeChannel(c) === normalized)) {
      setChannelInput('');
      return;
    }
    updateField('allowlistedChannels', [...config.allowlistedChannels, formatted]);
    setChannelInput('');
  };

  const removeChannel = (target: string) => {
    updateField(
      'allowlistedChannels',
      config.allowlistedChannels.filter((c) => c !== target)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addChannel(channelInput);
  };

  const unusedSuggestions = suggestedChannels.filter(
    (handle) => !config.allowlistedChannels.some((c) => normalizeChannel(c) === normalizeChannel(handle))
  );

  const statusLabel = !config.enabled
    ? 'Paused'
    : config.mode === 'hide'
      ? 'Hiding'
      : 'Dimming';

  return (
    <aside
      aria-label="Chrome extension popup simulator"
      className="bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col"
    >
      {/* Popup header */}
      <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold tracking-tight text-zinc-950 truncate">
            Extension Popup
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Changes sync to simulator &amp; exported .zip
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={config.enabled}
          aria-label="Toggle ClearFeed extension"
          onClick={() => updateField('enabled', !config.enabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 ${
            config.enabled ? 'bg-red-600' : 'bg-zinc-300'
          }`}
        >
          <span
            className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-xs transition-transform duration-150 ${
              config.enabled ? 'translate-x-5.5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Live tabular stats */}
      <div className="grid grid-cols-3 divide-x divide-zinc-200 border-b border-zinc-200 bg-zinc-50/70">
        <div className="px-4 py-3">
          <div className="text-[11px] text-zinc-500">Filtered</div>
          <div className="text-base font-semibold font-mono tabular-nums text-zinc-950 mt-0.5">
            {filteredCount}
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="text-[11px] text-zinc-500">Visible</div>
          <div className="text-base font-semibold font-mono tabular-nums text-zinc-950 mt-0.5">
            {visibleCount}
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="text-[11px] text-zinc-500">State</div>
          <div
            className={`text-[13px] font-semibold mt-1 ${
              config.enabled ? 'text-red-700' : 'text-zinc-500'
            }`}
          >
            {statusLabel}
          </div>
        </div>
      </div>

      {/* Body controls */}
      <div className="p-5 flex flex-col gap-5">
        {/* Filter behavior */}
        <div>
          <div className="text-xs font-semibold text-zinc-600 mb-2">Filter behavior</div>
          <div
            className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 rounded-lg"
            role="radiogroup"
            aria-label="Filter behavior"
          >
            <button
              type="button"
              disabled={!config.enabled}
              onClick={() => updateField('mode', 'hide')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                config.mode === 'hide'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              } disabled:opacity-50`}
            >
              Hide completely
            </button>
            <button
              type="button"
              disabled={!config.enabled}
              onClick={() => updateField('mode', 'dim')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                config.mode === 'dim'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              } disabled:opacity-50`}
            >
              Dim &amp; blur
            </button>
          </div>
        </div>

        {/* Surface checkboxes */}
        <div>
          <div className="text-xs font-semibold text-zinc-600 mb-1.5">Surfaces &amp; rules</div>
          <div className="divide-y divide-zinc-100">
            <ToggleRow
              id="sim-home"
              label="Home & Channel feeds"
              checked={config.hideHomeAndFeed}
              disabled={!config.enabled}
              onToggle={(val) => updateField('hideHomeAndFeed', val)}
            />
            <ToggleRow
              id="sim-subs"
              label="Subscriptions feed"
              checked={config.hideSubscriptions}
              disabled={!config.enabled}
              onToggle={(val) => updateField('hideSubscriptions', val)}
            />
            <ToggleRow
              id="sim-search"
              label="Search & Watch sidebar"
              checked={config.hideSearchAndSidebar}
              disabled={!config.enabled}
              onToggle={(val) => updateField('hideSearchAndSidebar', val)}
            />
            <ToggleRow
              id="sim-shorts"
              label="Shorts & Community posts"
              checked={config.hideShortsAndPosts}
              disabled={!config.enabled}
              onToggle={(val) => updateField('hideShortsAndPosts', val)}
            />
            <ToggleRow
              id="sim-join"
              label='Hide "Join" buttons & shelves'
              checked={config.hideJoinButtonsAndShelves}
              disabled={!config.enabled}
              onToggle={(val) => updateField('hideJoinButtonsAndShelves', val)}
            />
            <ToggleRow
              id="sim-i18n"
              label="Multi-language badge detection"
              checked={config.multiLanguage}
              disabled={!config.enabled}
              onToggle={(val) => updateField('multiLanguage', val)}
            />
            <ToggleRow
              id="sim-badge"
              label="Show count badge on toolbar icon"
              checked={config.showBadgeCount}
              disabled={!config.enabled}
              onToggle={(val) => updateField('showBadgeCount', val)}
            />
          </div>
        </div>

        {/* Channel allowlist */}
        <div className="pt-4 border-t border-zinc-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-600">Channel allowlist</span>
            <span className="text-[11px] font-mono tabular-nums text-zinc-500">
              {config.allowlistedChannels.length} exempt
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={channelInput}
              onChange={(e) => setChannelInput(e.target.value)}
              placeholder="@channelhandle"
              aria-label="Add channel handle to allowlist"
              className="flex-1 min-w-0 px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:border-red-600 focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              Add
            </button>
          </form>

          {unusedSuggestions.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500">
              <span>Quick add:</span>
              {unusedSuggestions.slice(0, 3).map((handle) => (
                <button
                  key={handle}
                  type="button"
                  onClick={() => addChannel(handle)}
                  className="font-mono text-zinc-700 hover:text-red-600 underline decoration-zinc-300 underline-offset-2 transition-colors"
                >
                  {handle}
                </button>
              ))}
            </div>
          )}

          {config.allowlistedChannels.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {config.allowlistedChannels.map((channel) => (
                <li
                  key={channel}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-xs"
                >
                  <span className="font-mono text-zinc-800 truncate">{channel}</span>
                  <button
                    type="button"
                    onClick={() => removeChannel(channel)}
                    aria-label={`Remove ${channel} from allowlist`}
                    className="text-zinc-400 hover:text-red-600 transition-colors p-0.5 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2.5 text-xs text-zinc-500">
              Add creators whose memberships you subscribe to so their videos stay visible.
            </p>
          )}
        </div>

        {/* Reset footer */}
        <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">Manifest V3 · Local storage</span>
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_EXTENSION_CONFIG })}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-950 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset defaults
          </button>
        </div>
      </div>
    </aside>
  );
}
