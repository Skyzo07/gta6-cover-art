// Renders the poster: a multi-panel GTA-style collage with a hero photo panel,
// smaller photo and drawn-scene panels, a sunset or neon colour grade, and a
// bold caption band. All geometry is fractions of the canvas, so the same
// layout works at every post size. A fixed seed keeps every render identical.

import { drawScene, makeRand, INK } from './scenes.js';

export const SIZES = {
  square: { w: 1080, h: 1080, label: 'Square 1080×1080' },
  portrait: { w: 1080, h: 1350, label: 'Portrait 1080×1350' },
  wide: { w: 1920, h: 1080, label: 'Wide 1920×1080' },
};

export const GRADES = {
  sunset: { top: 'rgba(255, 46, 136, 0.20)', bottom: 'rgba(255, 122, 24, 0.34)', band: '#101736', bandEdge: '#ff2e88', caption: '#ffffff' },
  neon: { top: 'rgba(123, 47, 247, 0.30)', bottom: 'rgba(0, 229, 192, 0.16)', band: '#0b1035', bandEdge: '#00e5c0', caption: '#ffffff' },
  pastel: { top: 'rgba(255, 143, 179, 0.16)', bottom: 'rgba(255, 209, 102, 0.22)', band: '#241a4a', bandEdge: '#ffd166', caption: '#fff7e8' },
};

// Panels are fractions of the canvas. `slot` is a photo slot; `scene` is a
// drawn scene. The caption band overlaps the foot of every layout.
export const LAYOUTS = {
  'hero-left': [
    { id: 'hero', slot: 'hero', x: 0, y: 0, w: 0.62, h: 1 },
    { id: 'top', scene: 'skyline', x: 0.62, y: 0, w: 0.38, h: 0.36 },
    { id: 'mid', slot: 'mid', scene: 'boat', x: 0.62, y: 0.36, w: 0.38, h: 0.32 },
    { id: 'low', scene: 'palms', x: 0.62, y: 0.68, w: 0.38, h: 0.32 },
  ],
  'hero-centre': [
    { id: 'left-top', slot: 'mid', scene: 'car', x: 0, y: 0, w: 0.26, h: 0.5 },
    { id: 'left-low', scene: 'gator', x: 0, y: 0.5, w: 0.26, h: 0.5 },
    { id: 'hero', slot: 'hero', x: 0.26, y: 0, w: 0.48, h: 1 },
    { id: 'right-top', slot: 'side', scene: 'heli', x: 0.74, y: 0, w: 0.26, h: 0.5 },
    { id: 'right-low', scene: 'neon', x: 0.74, y: 0.5, w: 0.26, h: 0.5 },
  ],
  trio: [
    { id: 'hero', slot: 'hero', x: 0, y: 0, w: 1, h: 0.62 },
    { id: 'low-left', slot: 'mid', scene: 'boat', x: 0, y: 0.62, w: 0.5, h: 0.38 },
    { id: 'low-right', scene: 'car', x: 0.5, y: 0.62, w: 0.5, h: 0.38 },
  ],
};

const GUTTER = 0.012;
const SEED = 20261119;

/** Cover-fits a photo into a rectangle, honouring the user's zoom and pan. */
export function drawPhoto(ctx, photo, x, y, w, h) {
  if (!photo || !photo.img) return false;
  const img = photo.img;
  const base = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const scale = base * (photo.zoom || 1);
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  const ox = (photo.ox || 0) * w;
  const oy = (photo.oy || 0) * h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, x + (w - pw) / 2 + ox, y + (h - ph) / 2 + oy, pw, ph);
  ctx.restore();
  return true;
}

function panelRect(panel, w, h) {
  const g = Math.max(4, Math.round(w * GUTTER));
  return {
    x: Math.round(panel.x * w) + (panel.x > 0 ? g / 2 : 0),
    y: Math.round(panel.y * h) + (panel.y > 0 ? g / 2 : 0),
    w: Math.round(panel.w * w) - g,
    h: Math.round(panel.h * h) - g,
  };
}

/** The panel rectangles in canvas pixels, for hit-testing and selection. */
export function layoutPanels(layout, w, h) {
  return LAYOUTS[layout].map((p) => ({ ...p, ...panelRect(p, w, h) }));
}

function drawHalftone(ctx, w, h, rand) {
  ctx.fillStyle = 'rgba(16, 23, 54, 0.35)';
  for (let i = 0; i < 90; i++) {
    const x = rand() * w;
    const y = h * 0.86 + rand() * h * 0.12;
    const r = 1 + rand() * 3.2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function fitCaption(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `900 ${size}px "Poster Black", "Noto Sans Condensed", sans-serif`;
  while (size > 24 && ctx.measureText(text).width > maxWidth) {
    size = Math.floor(size * 0.94);
    ctx.font = `900 ${size}px "Poster Black", "Noto Sans Condensed", sans-serif`;
  }
  return size;
}

function drawCaptionBand(ctx, w, h, caption, subtitle, grade) {
  const bandH = h * 0.15;
  const bandY = h * 0.815;
  const rand = makeRand(SEED + 7);
  ctx.save();
  ctx.translate(w / 2, bandY + bandH / 2);
  ctx.rotate(-0.022);
  ctx.fillStyle = grade.band;
  ctx.fillRect(-w * 0.56, -bandH / 2, w * 1.12, bandH);
  ctx.fillStyle = grade.bandEdge;
  ctx.fillRect(-w * 0.56, -bandH / 2, w * 1.12, Math.max(3, h * 0.006));
  ctx.fillRect(-w * 0.56, bandH / 2 - Math.max(3, h * 0.006), w * 1.12, Math.max(3, h * 0.006));
  ctx.restore();

  const text = (caption || 'SUNSET HEIST').trim().toUpperCase();
  const size = fitCaption(ctx, text, w * 0.92, h * 0.085);
  ctx.save();
  ctx.translate(w / 2, bandY + bandH * 0.58);
  ctx.rotate(-0.022);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${size}px "Poster Black", "Noto Sans Condensed", sans-serif`;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(4, size * 0.09);
  ctx.shadowColor = '#ff2e88';
  ctx.shadowOffsetX = size * 0.07;
  ctx.shadowOffsetY = size * 0.07;
  ctx.shadowBlur = 0;
  ctx.strokeText(text, 0, 0);
  ctx.shadowColor = 'transparent';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = grade.caption;
  ctx.fillText(text, 0, 0);
  ctx.restore();

  const sub = (subtitle || '').trim().toUpperCase();
  if (sub) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    try { ctx.letterSpacing = `${Math.max(2, w * 0.004)}px`; } catch { /* older canvas */ }
    ctx.font = `700 ${Math.round(h * 0.016)}px "Poster Bold", sans-serif`;
    ctx.fillStyle = '#ffd166';
    ctx.fillText(sub, w / 2, bandY - h * 0.012);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
    ctx.restore();
  }
  drawHalftone(ctx, w, h, rand);
}

/**
 * Draws the whole poster.
 * state: { layout, grade, size, caption, subtitle, photos, fillAll, scenes }
 * photos: { hero: {img, zoom, ox, oy} | null, mid, side }. scenes: { panelId: sceneName }.
 */
export function drawPoster(canvas, state) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#101736';
  ctx.fillRect(0, 0, w, h);

  const panels = layoutPanels(state.layout, w, h);
  const sceneSeed = makeRand(SEED);
  for (const panel of panels) {
    const r = { x: panel.x, y: panel.y, w: panel.w, h: panel.h };
    ctx.fillStyle = '#241a4a';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    let filled = false;
    if (panel.slot) {
      let photo = state.photos[panel.slot];
      if (!photo && state.fillAll && panel.slot !== 'hero') photo = state.photos.hero;
      filled = drawPhoto(ctx, photo, r.x, r.y, r.w, r.h);
    }
    if (!filled) {
      const scene = (state.scenes && state.scenes[panel.id]) || panel.scene || 'skyline';
      drawScene(ctx, scene, r.x, r.y, r.w, r.h, SEED + Math.floor(sceneSeed() * 100000));
    }
    // Bold panel border, GTA-style.
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(3, Math.round(w * 0.004));
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    // A touch of top light on each panel.
    const shine = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h * 0.25);
    shine.addColorStop(0, 'rgba(255,255,255,0.10)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.fillRect(r.x, r.y, r.w, r.h * 0.25);
  }

  // Colour grade over the whole poster.
  const tint = ctx.createLinearGradient(0, 0, 0, h);
  tint.addColorStop(0, grade.top);
  tint.addColorStop(1, grade.bottom);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, w, h);

  // Vignette.
  const vig = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(16, 23, 54, 0)');
  vig.addColorStop(1, 'rgba(16, 23, 54, 0.32)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  drawCaptionBand(ctx, w, h, state.caption, state.subtitle, grade);
}

/** Resizes the canvas to a post size and redraws. */
export function renderPoster(canvas, state) {
  const size = SIZES[state.size] || SIZES.portrait;
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  drawPoster(canvas, state);
}
