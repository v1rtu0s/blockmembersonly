import React, { useState } from 'react';
import { Check, Copy, Download, FolderOpen, Globe, ShieldCheck } from 'lucide-react';

interface InstallGuideProps {
  onDownloadZip: () => void;
}

const INSTALL_STEPS = [
  {
    number: '01',
    title: 'Download the extension package',
    detail:
      'Click "Download .zip" in the header or below. The archive includes manifest.json at the root, content scripts, popup UI, and the crossed-out green dollar PNG icons.',
  },
  {
    number: '02',
    title: 'Unzip to a permanent folder',
    detail:
      'Extract clearfeed-youtube-members-hider.zip into a dedicated folder you will not delete (for example, ~/Extensions/clearfeed). Chrome reads unpacked extensions directly from disk.',
  },
  {
    number: '03',
    title: 'Enable Developer Mode in Chrome',
    detail:
      'Open chrome://extensions in a new tab (also works in Brave, Arc, Vivaldi, and Microsoft Edge) and turn on the "Developer mode" switch in the top-right corner.',
  },
  {
    number: '04',
    title: 'Load the unpacked folder',
    detail:
      'Click "Load unpacked", select the extracted folder containing manifest.json, and refresh any open youtube.com tab.',
  },
];

const PUBLISH_STEPS = [
  {
    number: '01',
    title: 'Register a Chrome Web Store developer account',
    detail:
      'Sign in to the Chrome Web Store Developer Dashboard (chrome.google.com/webstore/devconsole) and pay the one-time $5 USD Google developer registration fee.',
  },
  {
    number: '02',
    title: 'Upload the downloaded .zip directly',
    detail:
      'Click "New Item" and upload clearfeed-youtube-members-hider.zip as-is. Because manifest.json is packaged at the root of the archive with 16px, 48px, and 128px icons, it passes initial manifest validation immediately.',
  },
  {
    number: '03',
    title: 'Complete Store Listing & Privacy Practices',
    detail:
      'Add a short description, at least one 1280×800 screenshot, and your 128×128 icon. Under Privacy Practices, state the single purpose ("Hides Members-only videos on YouTube"), justify "storage" and "youtube.com" host access, and certify that no user data is collected or sold.',
  },
  {
    number: '04',
    title: 'Submit for review',
    detail:
      'Click "Submit for Review". Manifest V3 extensions with minimal permissions and zero remote code typically clear Google review within 1–3 business days.',
  },
];

const PERMISSION_ROWS = [
  {
    permission: 'storage',
    scope: 'chrome.storage.sync',
    why: 'Persists your Hide/Dim mode, surface toggles, and channel allowlist across browser sessions.',
  },
  {
    permission: '*://*.youtube.com/*',
    scope: 'Desktop & Mobile YouTube',
    why: 'Injects content.css and content.js across www.youtube.com, m.youtube.com, and youtube.com to hide Members-only cards locally.',
  },
];

export function InstallGuide({ onDownloadZip }: InstallGuideProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyExtensionsUrl = async () => {
    try {
      await navigator.clipboard.writeText('chrome://extensions');
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 1800);
    } catch {
      // Clipboard fallback ignored in restricted contexts
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Install Locally or Publish to the Chrome Web Store
          </h1>
          <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
            ClearFeed packages <span className="font-mono text-zinc-900">manifest.json</span> at the archive root so the same <span className="font-mono text-zinc-900">.zip</span> works for local testing and direct Chrome Web Store upload.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyExtensionsUrl}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            {copiedUrl ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                Copied chrome://extensions
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                Copy chrome://extensions
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onDownloadZip}
            className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Download .zip
          </button>
        </div>
      </div>

      {/* Section 1: Load Unpacked */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-zinc-700" aria-hidden="true" />
          <h2 className="text-base font-semibold text-zinc-950">
            Local Testing (Load Unpacked)
          </h2>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {INSTALL_STEPS.map((step) => (
            <li
              key={step.number}
              className="p-5 bg-white border border-zinc-200 rounded-xl flex flex-col gap-2"
            >
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-xs font-semibold text-red-600 tabular-nums">
                  {step.number}.
                </span>
                <h3 className="text-base font-semibold text-zinc-950">{step.title}</h3>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Section 2: Publish to Chrome Web Store */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-zinc-700" aria-hidden="true" />
          <h2 className="text-base font-semibold text-zinc-950">
            Publish to the Chrome Web Store
          </h2>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PUBLISH_STEPS.map((step) => (
            <li
              key={step.number}
              className="p-5 bg-white border border-zinc-200 rounded-xl flex flex-col gap-2"
            >
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-xs font-semibold text-emerald-700 tabular-nums">
                  {step.number}.
                </span>
                <h3 className="text-base font-semibold text-zinc-950">{step.title}</h3>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Section 3: Permissions & privacy transparency */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-zinc-700" aria-hidden="true" />
          <h2 className="text-base font-semibold text-zinc-950">
            Permissions &amp; Store Review Justifications
          </h2>
        </div>
        <p className="text-sm text-zinc-600 max-w-3xl">
          You can paste these explanations directly into the Chrome Web Store Privacy Practices tab during submission.
        </p>

        <div className="bg-white border border-zinc-200 rounded-xl overflow-x-auto mt-1">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-600">
                <th className="py-3 px-4 w-56">Manifest Permission</th>
                <th className="py-3 px-4 w-44">Scope</th>
                <th className="py-3 px-4">Store review justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {PERMISSION_ROWS.map((row) => (
                <tr key={row.permission}>
                  <td className="py-3 px-4 font-mono text-xs text-zinc-950 whitespace-nowrap">
                    {row.permission}
                  </td>
                  <td className="py-3 px-4 text-xs text-zinc-600 whitespace-nowrap">
                    {row.scope}
                  </td>
                  <td className="py-3 px-4 text-xs text-zinc-600">{row.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
