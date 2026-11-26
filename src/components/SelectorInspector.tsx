import React, { useMemo, useState } from 'react';
import { CheckCircle2, Search, ShieldAlert, ShieldCheck, Slash } from 'lucide-react';
import {
  BADGE_SELECTORS,
  CONTAINER_SELECTORS,
  evaluateHtmlSnippet,
  LANGUAGE_PATTERNS,
  SelectorRule,
  SHELF_SELECTORS,
} from '../extension/ruleEngine';
import { HTML_TEST_PRESETS } from '../data/mockFeed';
import { ExtensionConfig } from '../extension/types';

interface SelectorInspectorProps {
  config: ExtensionConfig;
}

type CategoryFilter = 'All' | 'Container' | 'Badge' | 'Shelf / CTA';

export function SelectorInspector({ config }: SelectorInspectorProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [htmlInput, setHtmlInput] = useState<string>(HTML_TEST_PRESETS[0].html);
  const [activePresetId, setActivePresetId] = useState<string>(HTML_TEST_PRESETS[0].id);

  const allRules: SelectorRule[] = useMemo(
    () => [...CONTAINER_SELECTORS, ...BADGE_SELECTORS, ...SHELF_SELECTORS],
    []
  );

  const filteredRules = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRules.filter((rule) => {
      if (category !== 'All' && rule.category !== category) return false;
      if (!q) return true;
      return (
        rule.selector.toLowerCase().includes(q) ||
        rule.surface.toLowerCase().includes(q) ||
        rule.purpose.toLowerCase().includes(q)
      );
    });
  }, [allRules, category, query]);

  const testResult = useMemo(
    () => evaluateHtmlSnippet(htmlInput, config),
    [htmlInput, config]
  );

  const handleSelectPreset = (id: string, html: string) => {
    setActivePresetId(id);
    setHtmlInput(html);
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          YouTube DOM Selectors &amp; Live Rule Tester
        </h1>
        <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
          YouTube renders video cards across legacy Polymer components and newer lockup view models. ClearFeed checks structural badge selectors, localized text labels across 14 languages, and a class-resilient leaf fallback.
        </p>
      </div>

      {/* Interactive Live DOM Rule Tester */}
      <section className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-950">Live DOM Rule Tester</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Paste any YouTube HTML card snippet to run the exact content.js detection logic against your active extension settings.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1 p-1 bg-zinc-100 rounded-lg">
            {HTML_TEST_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id, preset.html)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activePresetId === preset.id
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
          <div className="p-4 bg-[#121316]">
            <label htmlFor="dom-tester-input" className="sr-only">
              YouTube HTML snippet
            </label>
            <textarea
              id="dom-tester-input"
              value={htmlInput}
              onChange={(e) => {
                setActivePresetId('');
                setHtmlInput(e.target.value);
              }}
              spellCheck={false}
              rows={10}
              className="w-full bg-transparent text-zinc-100 font-mono text-xs leading-relaxed resize-y focus:outline-none"
            />
          </div>

          <div className="p-5 flex flex-col justify-between gap-5 bg-white">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                {testResult.action === 'hidden' || testResult.action === 'dimmed' ? (
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" aria-hidden="true" />
                ) : testResult.action === 'allowlisted' ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
                ) : testResult.isMatch ? (
                  <Slash className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-zinc-500 shrink-0" aria-hidden="true" />
                )}
                <div>
                  <div className="text-sm font-semibold text-zinc-950">
                    {testResult.action === 'hidden'
                      ? 'Matched — Element Hidden (display: none)'
                      : testResult.action === 'dimmed'
                        ? 'Matched — Element Dimmed (opacity: 0.24)'
                        : testResult.action === 'allowlisted'
                          ? 'Matched — Bypassed by Channel Allowlist'
                          : testResult.isMatch
                            ? 'Matched — Untouched (Extension Paused)'
                            : 'No Match — Standard Public Content'}
                  </div>
                  <div className="text-xs text-zinc-500">
                    Evaluated with {config.multiLanguage ? '14-language' : 'English-only'} matcher
                  </div>
                </div>
              </div>

              <dl className="divide-y divide-zinc-100 border-t border-b border-zinc-200 text-xs">
                <div className="py-2.5 flex items-center justify-between gap-4">
                  <dt className="text-zinc-500">Container tag</dt>
                  <dd className="font-mono text-zinc-900">
                    {testResult.containerTag || '—'}
                  </dd>
                </div>
                <div className="py-2.5 flex items-center justify-between gap-4">
                  <dt className="text-zinc-500">Detected channel</dt>
                  <dd className="font-mono text-zinc-900">
                    {testResult.detectedChannel || 'Not found'}
                  </dd>
                </div>
                <div className="py-2.5 flex items-center justify-between gap-4">
                  <dt className="text-zinc-500">Matched rule</dt>
                  <dd className="font-mono text-red-700 truncate max-w-[260px]">
                    {testResult.matchedRule || 'None'}
                  </dd>
                </div>
                <div className="py-2.5 flex items-center justify-between gap-4">
                  <dt className="text-zinc-500">Extracted signal</dt>
                  <dd className="text-zinc-800 truncate max-w-[260px]">
                    {testResult.matchedText || '—'}
                  </dd>
                </div>
              </dl>
            </div>

            <p className="text-xs text-zinc-500">
              Tip: Try adding <span className="font-mono text-zinc-700">@KeystoneWorkshop</span> to your allowlist in the Simulator tab to see how matched cards switch to &ldquo;Bypassed&rdquo;.
            </p>
          </div>
        </div>
      </section>

      {/* Selector registry table */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
            {(['All', 'Container', 'Badge', 'Shelf / CTA'] as CategoryFilter[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setCategory(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  category === tab
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter selectors or surfaces..."
              aria-label="Filter selectors"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:border-red-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-600">
                <th className="py-3 px-4 w-28">Category</th>
                <th className="py-3 px-4">DOM Selector</th>
                <th className="py-3 px-4 w-48">YouTube Surface</th>
                <th className="py-3 px-4">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-xs text-zinc-500">
                    No selectors match &ldquo;{query}&rdquo;.
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-xs font-medium text-zinc-600 whitespace-nowrap">
                      {rule.category}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-zinc-950">
                      {rule.selector}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-zinc-600 whitespace-nowrap">
                      {rule.surface}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-zinc-600">
                      {rule.purpose}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Multi-language badge phrase matrix */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-base font-semibold text-zinc-950">
            Supported Localized Badge Phrases ({LANGUAGE_PATTERNS.length} languages)
          </h2>
          <span className="text-xs text-zinc-500">
            {config.multiLanguage ? 'Multi-language matching enabled' : 'English-only mode active'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {LANGUAGE_PATTERNS.map((item) => (
            <div
              key={item.code}
              className={`p-3.5 bg-white border border-zinc-200 rounded-lg ${
                !config.multiLanguage && item.code !== 'en' ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-900">
                <span>{item.language}</span>
                <span className="font-mono text-zinc-400">{item.code}</span>
              </div>
              <div className="mt-1.5 text-xs font-mono text-zinc-600 leading-relaxed">
                {item.phrases.join(' · ')}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
