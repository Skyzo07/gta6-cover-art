// Original vector scenes for the poster's small panels: a Vice City-style skyline,
// palm trees, a speedboat, a helicopter, a supercar, a neon grid and a swamp
// alligator. Every scene is drawn from code with flat shapes and bold outlines —
// no images, no copied artwork. A seeded generator keeps every draw identical.

/** Deterministic generator: the same seed always gives the same sequence. */
export function makeRand(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SCENES = ['skyline', 'palms', 'boat', 'heli', 'car', 'neon', 'gator'];
export const INK = '#141b4d';

function sky(ctx, x, y, w, h, stops) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function sunDisc(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function outline(ctx, width) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/** A palm tree silhouette: curved trunk and seven fronds. */
export function drawPalm(ctx, x, y, h, lean, color) {
  const w = h * 0.28;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  // Trunk: a leaning tapered curve.
  ctx.beginPath();
  ctx.moveTo(-w * 0.12, 0);
  ctx.quadraticCurveTo(-w * 0.05 + lean, -h * 0.55, lean, -h);
  ctx.lineTo(lean + w * 0.14, -h);
  ctx.quadraticCurveTo(w * 0.1 + lean, -h * 0.5, w * 0.14, 0);
  ctx.closePath();
  ctx.fill();
  // Fronds: arcs fanning out from the crown.
  const cx = lean, cy = -h;
  ctx.lineWidth = Math.max(2, h * 0.035);
  ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.08 + (i / 6) * 0.84);
    const len = h * (0.42 + (i % 2) * 0.08);
    const ex = cx + Math.cos(a) * len;
    const ey = cy - Math.sin(a) * len * 0.55;
    const mx = cx + Math.cos(a) * len * 0.55;
    const my = cy - Math.sin(a) * len * 0.28 - h * 0.1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(mx, my, ex, ey + h * 0.16);
    ctx.stroke();
  }
  // Coconuts.
  ctx.beginPath();
  ctx.arc(cx - w * 0.08, cy + h * 0.02, h * 0.03, 0, Math.PI * 2);
  ctx.arc(cx + w * 0.1, cy + h * 0.03, h * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function windows(ctx, x, y, w, h, rand, color) {
  ctx.fillStyle = color;
  const cols = Math.max(2, Math.floor(w / 14));
  const rows = Math.max(3, Math.floor(h / 16));
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (rand() < 0.42) {
        ctx.fillRect(x + 4 + (c * (w - 8)) / cols, y + 5 + (r * (h - 10)) / rows, 4, 6);
      }
    }
  }
}

function drawSkyline(ctx, x, y, w, h, rand) {
  sky(ctx, x, y, w, h, [[0, '#3b1d5e'], [0.55, '#c2437f'], [1, '#ff7a18']]);
  sunDisc(ctx, x + w * 0.68, y + h * 0.24, w * 0.11, '#ffd166');
  // Far towers, then near towers.
  ctx.fillStyle = '#5b2a6e';
  let bx = x;
  while (bx < x + w) {
    const bw = w * (0.1 + rand() * 0.12);
    const bh = h * (0.25 + rand() * 0.25);
    ctx.fillRect(bx, y + h - bh, bw, bh);
    bx += bw + 2;
  }
  ctx.fillStyle = '#241a4a';
  bx = x;
  while (bx < x + w) {
    const bw = w * (0.12 + rand() * 0.14);
    const bh = h * (0.35 + rand() * 0.35);
    ctx.fillStyle = '#241a4a';
    ctx.fillRect(bx, y + h - bh, bw, bh);
    windows(ctx, bx, y + h - bh, bw, bh, rand, '#ffd166');
    bx += bw + 3;
  }
}

function drawPalms(ctx, x, y, w, h, rand) {
  sky(ctx, x, y, w, h, [[0, '#ff8fb3'], [0.6, '#ffb347'], [1, '#7b2ff7']]);
  sunDisc(ctx, x + w * 0.5, y + h * 0.62, w * 0.2, '#fff3c4');
  ctx.fillStyle = '#2a1245';
  ctx.fillRect(x, y + h * 0.82, w, h * 0.18);
  drawPalm(ctx, x + w * 0.24, y + h * 0.86, h * 0.62, w * 0.05, '#1c0f33');
  drawPalm(ctx, x + w * 0.72, y + h * 0.86, h * 0.78, -w * 0.06, '#1c0f33');
  // Birds.
  ctx.strokeStyle = '#1c0f33';
  ctx.lineWidth = Math.max(2, w * 0.008);
  for (let i = 0; i < 3; i++) {
    const bx = x + w * (0.2 + i * 0.22);
    const by = y + h * (0.2 + (i % 2) * 0.08);
    ctx.beginPath();
    ctx.moveTo(bx - 8, by);
    ctx.quadraticCurveTo(bx - 3, by - 6, bx, by);
    ctx.quadraticCurveTo(bx + 3, by - 6, bx + 8, by);
    ctx.stroke();
  }
  void rand;
}

function drawBoat(ctx, x, y, w, h, rand) {
  sky(ctx, x, y, w, h, [[0, '#7b2ff7'], [0.5, '#ff5da2'], [1, '#ffd166']]);
  // Sea.
  const sea = ctx.createLinearGradient(x, y + h * 0.45, x, y + h);
  sea.addColorStop(0, '#1b6f8f');
  sea.addColorStop(1, '#0b3552');
  ctx.fillStyle = sea;
  ctx.fillRect(x, y + h * 0.45, w, h * 0.55);
  // Wake.
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = Math.max(2, h * 0.012);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + w * 0.12, y + h * (0.56 + i * 0.09));
    ctx.lineTo(x + w * (0.5 + i * 0.12), y + h * (0.6 + i * 0.09));
    ctx.stroke();
  }
  // Hull: a low wedge with a windshield and an outboard.
  const hy = y + h * 0.48;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.1, hy);
  ctx.lineTo(x + w * 0.88, hy - h * 0.06);
  ctx.lineTo(x + w * 0.8, hy + h * 0.1);
  ctx.lineTo(x + w * 0.2, hy + h * 0.1);
  ctx.closePath();
  ctx.fill();
  outline(ctx, Math.max(2, w * 0.006));
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(x + w * 0.14, hy + h * 0.02, w * 0.6, h * 0.035);
  ctx.fillStyle = '#141b4d';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.42, hy - h * 0.01);
  ctx.lineTo(x + w * 0.62, hy - h * 0.05);
  ctx.lineTo(x + w * 0.62, hy - h * 0.01);
  ctx.closePath();
  ctx.fill();
  // Spray dots.
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    ctx.arc(x + w * (0.86 + rand() * 0.1), y + h * (0.4 + rand() * 0.14), 1 + rand() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHeli(ctx, x, y, w, h, rand) {
  sky(ctx, x, y, w, h, [[0, '#141b4d'], [0.55, '#4b2a86'], [1, '#ff5da2']]);
  // City lights below.
  ctx.fillStyle = '#ffd166';
  for (let i = 0; i < 26; i++) {
    ctx.globalAlpha = 0.35 + rand() * 0.6;
    ctx.fillRect(x + rand() * w, y + h * (0.86 + rand() * 0.1), 3, 3);
  }
  ctx.globalAlpha = 1;
  // Searchlight beam.
  ctx.fillStyle = 'rgba(255, 241, 166, 0.28)';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y + h * 0.42);
  ctx.lineTo(x + w * 0.2, y + h * 0.95);
  ctx.lineTo(x + w * 0.62, y + h * 0.95);
  ctx.closePath();
  ctx.fill();
  // Rotor.
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(3, h * 0.02);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.18, y + h * 0.3);
  ctx.lineTo(x + w * 0.82, y + h * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y + h * 0.3);
  ctx.lineTo(x + w * 0.5, y + h * 0.38);
  ctx.stroke();
  // Body: rounded cabin + tail boom.
  ctx.fillStyle = '#e8e4f2';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.5, y + h * 0.46, w * 0.2, h * 0.11, 0, 0, Math.PI * 2);
  ctx.fill();
  outline(ctx, Math.max(2, w * 0.006));
  ctx.fillStyle = '#e8e4f2';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.66, y + h * 0.44);
  ctx.lineTo(x + w * 0.92, y + h * 0.36);
  ctx.lineTo(x + w * 0.92, y + h * 0.42);
  ctx.lineTo(x + w * 0.66, y + h * 0.5);
  ctx.closePath();
  ctx.fill();
  outline(ctx, Math.max(2, w * 0.006));
  // Tail fin + window + skids.
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(x + w * 0.88, y + h * 0.3, w * 0.03, h * 0.12);
  ctx.fillStyle = '#7fd4ff';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.42, y + h * 0.45, w * 0.07, h * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(2, w * 0.006);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.34, y + h * 0.6);
  ctx.lineTo(x + w * 0.62, y + h * 0.6);
  ctx.moveTo(x + w * 0.38, y + h * 0.56);
  ctx.lineTo(x + w * 0.36, y + h * 0.6);
  ctx.moveTo(x + w * 0.58, y + h * 0.56);
  ctx.lineTo(x + w * 0.6, y + h * 0.6);
  ctx.stroke();
  void rand;
}

function drawCar(ctx, x, y, w, h, rand) {
  sky(ctx, x, y, w, h, [[0, '#ff7a18'], [0.55, '#ff5da2'], [1, '#7b2ff7']]);
  // Road.
  ctx.fillStyle = '#1c0f33';
  ctx.fillRect(x, y + h * 0.55, w, h * 0.45);
  ctx.fillStyle = '#ffd166';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(x + (i * w) / 5 + w * 0.04, y + h * 0.72, w * 0.1, h * 0.015);
  }
  // Speed lines.
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = Math.max(2, h * 0.01);
  for (let i = 0; i < 4; i++) {
    const ly = y + h * (0.24 + i * 0.09);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.04, ly);
    ctx.lineTo(x + w * (0.2 + rand() * 0.1), ly);
    ctx.stroke();
  }
  // Supercar side profile.
  const cy = y + h * 0.55;
  ctx.fillStyle = '#ffe600';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.08, cy - h * 0.06);
  ctx.lineTo(x + w * 0.2, cy - h * 0.07);
  ctx.quadraticCurveTo(x + w * 0.34, cy - h * 0.2, x + w * 0.52, cy - h * 0.2);
  ctx.quadraticCurveTo(x + w * 0.68, cy - h * 0.19, x + w * 0.78, cy - h * 0.1);
  ctx.lineTo(x + w * 0.92, cy - h * 0.06);
  ctx.lineTo(x + w * 0.9, cy);
  ctx.lineTo(x + w * 0.08, cy);
  ctx.closePath();
  ctx.fill();
  outline(ctx, Math.max(2, w * 0.007));
  // Windows + headlight beam.
  ctx.fillStyle = '#141b4d';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.36, cy - h * 0.17);
  ctx.lineTo(x + w * 0.5, cy - h * 0.17);
  ctx.lineTo(x + w * 0.5, cy - h * 0.09);
  ctx.lineTo(x + w * 0.3, cy - h * 0.09);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 241, 166, 0.55)';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.9, cy - h * 0.05);
  ctx.lineTo(x + w * 1.02, cy - h * 0.12);
  ctx.lineTo(x + w * 1.02, cy + h * 0.02);
  ctx.closePath();
  ctx.fill();
  // Wheels.
  for (const wx of [0.24, 0.74]) {
    ctx.fillStyle = '#141b4d';
    ctx.beginPath();
    ctx.arc(x + w * wx, cy, h * 0.075, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dfe3ff';
    ctx.beginPath();
    ctx.arc(x + w * wx, cy, h * 0.038, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawNeon(ctx, x, y, w, h, rand) {
  sky(ctx, x, y, w, h, [[0, '#0b1035'], [0.6, '#2a0f4d'], [1, '#ff2e88']]);
  // Slatted sun.
  const cx = x + w * 0.5, cy = y + h * 0.42, r = w * 0.24;
  const sun = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  sun.addColorStop(0, '#ffe600');
  sun.addColorStop(1, '#ff2e88');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a0f4d';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(cx - r, cy + r * (0.1 + i * 0.22), r * 2, r * 0.06);
  }
  // Grid floor.
  ctx.strokeStyle = 'rgba(0, 229, 192, 0.8)';
  ctx.lineWidth = Math.max(1, w * 0.004);
  const horizon = y + h * 0.62;
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    ctx.beginPath();
    ctx.moveTo(cx, horizon);
    ctx.lineTo(x + w * t, y + h);
    ctx.stroke();
  }
  for (let i = 0; i < 5; i++) {
    const yy = horizon + (h - horizon) * ((i + 1) / 5) ** 1.6;
    ctx.beginPath();
    ctx.moveTo(x, yy);
    ctx.lineTo(x + w, yy);
    ctx.stroke();
  }
  // Stars.
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 18; i++) {
    ctx.globalAlpha = 0.4 + rand() * 0.6;
    ctx.fillRect(x + rand() * w, y + rand() * h * 0.4, 2, 2);
  }
  ctx.globalAlpha = 1;
}

function drawGator(ctx, x, y, w, h, rand) {
  sky(ctx, x, y, w, h, [[0, '#ffb347'], [0.55, '#ff7a18'], [1, '#5b2a6e']]);
  // Swamp water.
  const water = ctx.createLinearGradient(x, y + h * 0.5, x, y + h);
  water.addColorStop(0, '#2a6f4f');
  water.addColorStop(1, '#0e3d2c');
  ctx.fillStyle = water;
  ctx.fillRect(x, y + h * 0.5, w, h * 0.5);
  // Reeds.
  ctx.strokeStyle = '#0e3d2c';
  ctx.lineWidth = Math.max(2, w * 0.008);
  for (let i = 0; i < 6; i++) {
    const rx = x + w * (0.06 + i * 0.15);
    ctx.beginPath();
    ctx.moveTo(rx, y + h * 0.58);
    ctx.quadraticCurveTo(rx + 6, y + h * 0.36, rx + (rand() - 0.5) * 20, y + h * (0.26 + rand() * 0.1));
    ctx.stroke();
  }
  // Alligator: long body, snout, ridged back, eye.
  const gy = y + h * 0.58;
  ctx.fillStyle = '#3f7d4e';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.5, gy, w * 0.4, h * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  outline(ctx, Math.max(2, w * 0.006));
  ctx.fillStyle = '#3f7d4e';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.84, gy - h * 0.04);
  ctx.lineTo(x + w * 0.97, gy + h * 0.02);
  ctx.lineTo(x + w * 0.84, gy + h * 0.09);
  ctx.closePath();
  ctx.fill();
  outline(ctx, Math.max(2, w * 0.006));
  // Back ridges.
  ctx.fillStyle = '#2a5c38';
  for (let i = 0; i < 7; i++) {
    const rx = x + w * (0.22 + i * 0.09);
    ctx.beginPath();
    ctx.moveTo(rx, gy - h * 0.11);
    ctx.lineTo(rx + w * 0.03, gy - h * 0.18);
    ctx.lineTo(rx + w * 0.06, gy - h * 0.11);
    ctx.closePath();
    ctx.fill();
  }
  // Eye + nostril + ripples.
  ctx.fillStyle = '#ffe600';
  ctx.beginPath();
  ctx.arc(x + w * 0.88, gy - h * 0.08, h * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(x + w * 0.88, gy - h * 0.08, h * 0.014, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = Math.max(1, h * 0.008);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, gy + h * (0.1 + i * 0.07), w * (0.3 + i * 0.08), h * 0.02, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/** Draws one named scene into the rectangle, clipped to it. */
export function drawScene(ctx, name, x, y, w, h, seed) {
  const rand = makeRand(seed);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (name === 'skyline') drawSkyline(ctx, x, y, w, h, rand);
  else if (name === 'palms') drawPalms(ctx, x, y, w, h, rand);
  else if (name === 'boat') drawBoat(ctx, x, y, w, h, rand);
  else if (name === 'heli') drawHeli(ctx, x, y, w, h, rand);
  else if (name === 'car') drawCar(ctx, x, y, w, h, rand);
  else if (name === 'neon') drawNeon(ctx, x, y, w, h, rand);
  else drawGator(ctx, x, y, w, h, rand);
  ctx.restore();
}
