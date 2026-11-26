import React, { useMemo, useState } from 'react';
import { Check, Copy, Download, FileCode2, FileJson, FileText } from 'lucide-react';
import { generateExtensionFiles } from '../extension/generator';
import { ExtensionConfig, ExtensionFile } from '../extension/types';

interface SourceExplorerProps {
  config: ExtensionConfig;
  iconDataUrls: Record<16 | 48 | 128, string>;
  onDownloadZip: () => void;
}

function getFileIcon(language: ExtensionFile['language']) {
  if (language === 'json') return FileJson;
  if (language === 'text') return FileText;
  return FileCode2;
}

function formatByteSize(text: string): string {
  const bytes = new TextEncoder().encode(text).length;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function SourceExplorer({ config, iconDataUrls, onDownloadZip }: SourceExplorerProps) {
  const files = useMemo(() => generateExtensionFiles(config), [config]);
  const [selectedPath, setSelectedPath] = useState<string>(files[0].path);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const activeFile = files.find((f) => f.path === selectedPath) || files[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopiedPath(activeFile.path);
      window.setTimeout(() => setCopiedPath(null), 1800);
    } catch {
      // Clipboard API unavailable in restricted iframe
    }
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.path;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const lines = activeFile.content.split('\n');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Extension Source Files
          </h1>
          <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
            Every file below is generated directly from your current simulator settings and bundled into the downloadable Manifest V3 package.
          </p>
        </div>
        <button
          type="button"
          onClick={onDownloadZip}
          className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          Download complete .zip
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {/* Left file tree */}
        <aside className="border-b lg:border-b-0 lg:border-r border-zinc-200 bg-zinc-50/60 flex flex-col justify-between">
          <div className="p-3">
            <div className="px-2.5 py-1.5 text-xs font-semibold text-zinc-500">
              clearfeed-extension/
            </div>
            <nav aria-label="Extension files" className="mt-1 flex flex-col gap-0.5">
              {files.map((file) => {
                const Icon = getFileIcon(file.language);
                const isSelected = file.path === activeFile.path;
                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setSelectedPath(file.path)}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-left text-[13px] transition-colors ${
                      isSelected
                        ? 'bg-white text-zinc-950 font-medium shadow-xs border border-zinc-200'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 text-zinc-400" aria-hidden="true" />
                      <span className="font-mono text-xs truncate">{file.path}</span>
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-zinc-400 shrink-0">
                      {formatByteSize(file.content)}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Generated PNG icon previews */}
          <div className="p-4 border-t border-zinc-200">
            <div className="text-xs font-semibold text-zinc-600 mb-2.5">
              Generated PNG Icons
            </div>
            <div className="flex items-end gap-4">
              {([16, 48, 128] as const).map((size) => (
                <div key={size} className="flex flex-col items-center gap-1.5">
                  <div className="p-1.5 bg-white border border-zinc-200 rounded-md flex items-center justify-center">
                    <img
                      src={iconDataUrls[size]}
                      alt={`icon${size}.png`}
                      width={size === 128 ? 36 : size === 48 ? 28 : 16}
                      height={size === 128 ? 36 : size === 48 ? 28 : 16}
                      className="block rounded-xs"
                    />
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-zinc-500">
                    {size}px
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right code viewer */}
        <div className="flex flex-col min-w-0">
          <div className="px-5 py-3.5 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 bg-white">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-mono font-semibold text-zinc-950">
                <span>{activeFile.path}</span>
                <span aria-hidden="true" className="text-zinc-300">/</span>
                <span className="text-xs font-sans font-normal text-zinc-500 tabular-nums">
                  {lines.length} lines · {formatByteSize(activeFile.content)}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{activeFile.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                {copiedPath === activeFile.path ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    Copy file
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadSingle}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                Save
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[620px] overflow-y-auto bg-[#121316] text-zinc-100">
            <table className="w-full border-collapse font-mono text-[12.5px] leading-relaxed">
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.03]">
                    <td className="w-12 px-3 py-0.5 text-right select-none text-zinc-500 tabular-nums align-top border-r border-white/5">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-0.5 whitespace-pre text-zinc-200">
                      {line || ' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
