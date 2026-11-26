import JSZip from 'jszip';
import { generateExtensionFiles } from './generator';
import { ExtensionConfig } from './types';

function drawIconCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const r = Math.round(size * 0.22);

  // Deep charcoal rounded-square background for high contrast on light & dark Chrome toolbars
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();

  ctx.fillStyle = '#18181B';
  ctx.fill();

  // Crisp green dollar symbol ($) centered
  ctx.save();
  ctx.fillStyle = '#22C55E';
  ctx.font = `700 ${Math.round(size * 0.7)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', size * 0.5, size * 0.54);
  ctx.restore();

  // Diagonal cross-out slash with dark cutout halo so it slices cleanly across the green $
  const pad = size * 0.2;
  ctx.save();
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(size - pad, size - pad);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = Math.max(2.8, size * 0.17);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(size - pad, size - pad);
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = Math.max(1.8, size * 0.1);
  ctx.stroke();

  ctx.restore();
  return canvas;
}

export function generateIconDataUrls(): Record<16 | 48 | 128, string> {
  return {
    16: drawIconCanvas(16).toDataURL('image/png'),
    48: drawIconCanvas(48).toDataURL('image/png'),
    128: drawIconCanvas(128).toDataURL('image/png'),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to render PNG icon'));
    }, 'image/png');
  });
}

export async function downloadExtensionZip(config: ExtensionConfig): Promise<{ fileCount: number; zipSizeBytes: number }> {
  const zip = new JSZip();

  // Place manifest.json at archive root so the same .zip uploads directly to Chrome Web Store
  // and extracts cleanly into a folder for Load Unpacked testing.
  const files = generateExtensionFiles(config);
  for (const file of files) {
    zip.file(file.path, file.content);
  }

  const iconsFolder = zip.folder('icons');
  if (iconsFolder) {
    const sizes: Array<16 | 48 | 128> = [16, 48, 128];
    for (const size of sizes) {
      const blob = await canvasToBlob(drawIconCanvas(size));
      iconsFolder.file(`icon${size}.png`, blob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'clearfeed-youtube-members-hider.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);

  return {
    fileCount: files.length + 3,
    zipSizeBytes: zipBlob.size,
  };
}
