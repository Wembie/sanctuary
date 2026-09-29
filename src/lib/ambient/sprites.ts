/**
 * Pre-rendered soft glows. Drawing an image is far cheaper than shadowBlur
 * or a fresh radial gradient per particle per frame.
 */
export function createGlowSprite(color: string, size = 64, core = 0.18): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const r = size / 2;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, withAlpha(color, 1));
  gradient.addColorStop(core, withAlpha(color, 0.55));
  gradient.addColorStop(0.45, withAlpha(color, 0.12));
  gradient.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

/** A wide, very soft blob for clouds and bokeh. */
export function createSoftSprite(color: string, size = 256): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const r = size / 2;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, withAlpha(color, 0.9));
  gradient.addColorStop(0.35, withAlpha(color, 0.55));
  gradient.addColorStop(0.7, withAlpha(color, 0.15));
  gradient.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
