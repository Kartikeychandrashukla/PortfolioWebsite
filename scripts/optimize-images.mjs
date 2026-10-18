// Converts the raw artwork in /assets-src into web-ready WebP + the OG/social image.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { buildPortraitSignal } from './portrait-signal.mjs';

const SRC = 'assets-src';
const OUT = 'public/images';
await mkdir(OUT, { recursive: true });

const jobs = [
  ['portrait.jpg', 'portrait', [640]],
  ['glass-ring.png', 'glass-ring', [480, 900]],
  ['pills.png', 'pills', [480, 900]],
  ['bulb.png', 'bulb', [480, 900]],
  ['sphere.png', 'sphere', [800]],
  ['snekart.png', 'snekart', [720, 1400]],
  ['yummy-burger.png', 'yummy-burger', [720, 1400]],
  ['ai-help-widget.png', 'ai-help-widget', [570]],
];

for (const [file, name, widths] of jobs) {
  for (const w of widths) {
    await sharp(`${SRC}/${file}`).resize({ width: w }).webp({ quality: 78 }).toFile(`${OUT}/${name}-${w}.webp`);
  }
}

// 1200x630 Open Graph card: sphere artwork on the right, name on the left.
const sphere = await sharp(`${SRC}/sphere.png`).extract({ left: 120, top: 330, width: 960, height: 1000 }).resize({ height: 630 }).toBuffer();
const text = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <text x="72" y="120" font-family="Menlo, monospace" font-size="22" fill="#7aa8ff" letter-spacing="3">FULL STACK · AI ENGINEER</text>
  <text x="72" y="300" font-family="Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="92" fill="#f4f4f6">Kartikey</text>
  <text x="72" y="400" font-family="Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="92" fill="#f4f4f6">Chandra Shukla</text>
  <text x="72" y="540" font-family="Menlo, monospace" font-size="24" fill="#9a9aa8">React · .NET Core · Node · RAG / LLM apps</text>
</svg>`);
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#000000' } })
  .composite([{ input: sphere, left: 600, top: 0 }, { input: text, left: 0, top: 0 }])
  .jpeg({ quality: 82 })
  .toFile('public/og-image.jpg');

await sharp(`${SRC}/portrait.jpg`).resize(180, 180).png().toFile('public/apple-touch-icon.png');
// Cut-out brightness map the hero particle portrait is sampled from
await buildPortraitSignal(`${SRC}/portrait.jpg`, `${OUT}/portrait-signal.png`);
console.log('images done');
