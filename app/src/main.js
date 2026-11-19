// Wires the page: photo uploads, panel picking and dragging, layout / grade /
// size choices, caption editing, and the PNG export. A `?shot=` query sets up
// a fixed scene for a screenshot instead (see shots.js).

import { renderPoster, layoutPanels, SIZES } from './cover.js';
import { SCENES } from './scenes.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('poster');
const captionInput = document.getElementById('caption');
const subtitleInput = document.getElementById('subtitle');
const status = document.getElementById('status');
const zoomInput = document.getElementById('zoom');
const zoomValue = document.getElementById('zoom-value');
const selectedName = document.getElementById('selected-name');

const SLOT_NAMES = { hero: 'Hero panel', mid: 'Second panel', side: 'Third panel' };
const SAMPLES = { hero: 'samples/pier.jpg', mid: 'samples/boulevard.jpg', side: 'samples/boulevard.jpg' };

export const state = {
  layout: 'hero-left',
  grade: 'sunset',
  size: 'portrait',
  caption: 'SUNSET HEIST',
  subtitle: 'LEONIDA NIGHTS',
  photos: { hero: null, mid: null, side: null },
  fillAll: false,
  scenes: {},
  selected: 'hero',
};

function redraw() {
  renderPoster(canvas, state);
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

function setPhoto(slot, img) {
  state.photos[slot] = { img, zoom: 1, ox: 0, oy: 0 };
  status.textContent = `${SLOT_NAMES[slot]} photo loaded — drag it on the poster to position it.`;
  markSelectedSlot();
  redraw();
}

function markSelectedSlot() {
  document.querySelectorAll('.slot').forEach((el) => {
    el.classList.toggle('active', el.dataset.slot === state.selected);
  });
  selectedName.textContent = SLOT_NAMES[state.selected] || 'Hero panel';
  const photo = state.photos[state.selected];
  const zoom = photo ? Math.round(photo.zoom * 100) : 100;
  zoomInput.value = String(zoom);
  zoomValue.textContent = `${zoom}%`;
}

for (const slot of ['hero', 'mid', 'side']) {
  document.getElementById(`photo-${slot}`).addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setPhoto(slot, await loadImage(URL.createObjectURL(file)));
    } catch {
      status.textContent = 'That file could not be read as a photo.';
    }
  });
  document.querySelector(`.sample-btn[data-sample="${slot}"]`).addEventListener('click', async () => {
    try {
      setPhoto(slot, await loadImage(SAMPLES[slot]));
    } catch {
      status.textContent = 'The sample photo could not be loaded.';
    }
  });
}

document.getElementById('fill-all').addEventListener('change', (e) => {
  state.fillAll = e.target.checked;
  redraw();
});

zoomInput.addEventListener('input', () => {
  const photo = state.photos[state.selected];
  if (!photo) return;
  photo.zoom = Number(zoomInput.value) / 100;
  zoomValue.textContent = `${zoomInput.value}%`;
  redraw();
});

function wireSegment(id, key, onPick) {
  document.getElementById(id).addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    document.querySelectorAll(`#${id} button`).forEach((b) => b.classList.remove('on'));
    btn.classList.add('on');
    state[key] = btn.dataset[key];
    if (onPick) onPick();
    redraw();
  });
}
wireSegment('layout-seg', 'layout');
wireSegment('grade-seg', 'grade');
wireSegment('size-seg', 'size');

captionInput.addEventListener('input', () => { state.caption = captionInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });

// Canvas interaction: click picks a panel (a scene panel cycles its scene),
// drag pans the selected photo, wheel zooms it.
function panelAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const px = ((clientX - rect.left) / rect.width) * canvas.width;
  const py = ((clientY - rect.top) / rect.height) * canvas.height;
  return layoutPanels(state.layout, canvas.width, canvas.height)
    .find((p) => px >= p.x && px < p.x + p.w && py >= p.y && py < p.y + p.h);
}

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const panel = panelAt(e.clientX, e.clientY);
  if (!panel) return;
  if (panel.slot) {
    state.selected = panel.slot;
    markSelectedSlot();
  } else {
    const list = SCENES;
    const current = state.scenes[panel.id] || panel.scene || 'skyline';
    const next = list[(list.indexOf(current) + 1) % list.length];
    state.scenes[panel.id] = next;
    status.textContent = `Scene panel is now ${next}. Click it again to swap.`;
    redraw();
    return;
  }
  const photo = state.photos[state.selected];
  if (!photo) return;
  drag = { x: e.clientX, y: e.clientY, ox: photo.ox, oy: photo.oy };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const photo = state.photos[state.selected];
  if (!photo) return;
  const rect = canvas.getBoundingClientRect();
  photo.ox = drag.ox + ((e.clientX - drag.x) / rect.width);
  photo.oy = drag.oy + ((e.clientY - drag.y) / rect.height);
  photo.ox = Math.max(-1, Math.min(1, photo.ox));
  photo.oy = Math.max(-1, Math.min(1, photo.oy));
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (e) => {
  const photo = state.photos[state.selected];
  if (!photo) return;
  e.preventDefault();
  photo.zoom = Math.max(0.8, Math.min(3, photo.zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
  markSelectedSlot();
  redraw();
}, { passive: false });

/** Exports the current poster as a PNG download. Deterministic: the pixels
 *  depend only on the state, never on the clock, so repeated exports match. */
export function exportPng() {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) { status.textContent = 'Export failed — the browser could not make the PNG.'; resolve(null); return; }
      const size = SIZES[state.size];
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `leonida-nights-${size.w}x${size.h}.png`;
      a.click();
      status.textContent = `Saved leonida-nights-${size.w}x${size.h}.png`;
      resolve(blob);
    }, 'image/png');
  });
}
document.getElementById('export').addEventListener('click', exportPng);

// Screenshot scenes, or the live editor.
const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, state, loadImage, redraw, markSelectedSlot);
} else {
  // Draw once the poster fonts are ready so the caption uses them.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => redraw());
  }
  markSelectedSlot();
  redraw();
}
