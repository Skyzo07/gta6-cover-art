// Fixed scenes for screenshots: ?shot=editor shows the app with sample photos
// loaded; ?shot=cover shows the poster alone, edge to edge. Query knobs:
// photo / photo2 / photo3 (sample names), caption, subtitle, layout, size,
// grade. window.__shotReady is set once the poster is painted with its fonts.

const SAMPLE_PATH = { pier: 'samples/pier.jpg', boulevard: 'samples/boulevard.jpg' };

function sample(name, fallback) {
  return SAMPLE_PATH[name] || SAMPLE_PATH[fallback];
}

export async function runShot(shot, query, state, loadImage, redraw, markSelectedSlot) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  state.layout = query.get('layout') || 'hero-left';
  state.grade = query.get('grade') || 'sunset';
  state.size = query.get('size') || 'portrait';
  state.caption = query.get('caption') || 'Sunset Heist';
  state.subtitle = query.get('subtitle') || 'Leonida Nights';
  state.fillAll = false;

  const captionInput = document.getElementById('caption');
  const subtitleInput = document.getElementById('subtitle');
  if (captionInput) captionInput.value = state.caption;
  if (subtitleInput) subtitleInput.value = state.subtitle;
  for (const [seg, key] of [['layout-seg', 'layout'], ['grade-seg', 'grade'], ['size-seg', 'size']]) {
    document.querySelectorAll(`#${seg} button`).forEach((b) => {
      b.classList.toggle('on', b.dataset[key] === state[key]);
    });
  }

  try {
    state.photos.hero = { img: await loadImage(sample(query.get('photo'), 'pier')), zoom: 1, ox: 0, oy: 0 };
    state.photos.mid = { img: await loadImage(sample(query.get('photo2'), 'boulevard')), zoom: 1, ox: 0, oy: 0 };
    const third = query.get('photo3');
    if (third) state.photos.side = { img: await loadImage(sample(third, 'boulevard')), zoom: 1, ox: 0, oy: 0 };
  } catch {
    // A missing sample still leaves a poster: the drawn scenes fill the panels.
  }
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch { /* system font fallback */ }
  }
  if (markSelectedSlot) markSelectedSlot();
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
