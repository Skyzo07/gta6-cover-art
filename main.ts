// Leonida Nights — a GTA-style cover maker for make.fun's gta6-cover-art-01.
// The app is plain static files a desktop browser loads offline (app/index.html
// and its ES modules, no library and no network request). This program hands it
// in: it copies app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored make.fun
// library. Node 22, standard library only.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps (from the kit's RULES.txt): at most 4 screenshots,
// each at most 256 KiB, and the whole of /output under 1,000 entries and 64 MiB.
// Refuse to hand in an output that would fail the gate instead of writing it.
function checkScreenshots(dir) {
  if (!existsSync(dir)) return;
  const files = readdirSync(dir).filter((name) => !name.startsWith('.'));
  if (files.length > 4) {
    throw new Error(`screenshots/ holds ${files.length} images, the gate allows at most 4`);
  }
  for (const name of files) {
    const bytes = statSync(join(dir, name)).size;
    if (bytes > 262144) {
      throw new Error(`screenshots/${name} is ${bytes} bytes, the gate allows at most 262144`);
    }
  }
}

checkScreenshots(join(here, 'screenshots'));

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
