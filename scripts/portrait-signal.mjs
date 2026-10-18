// Builds the "signal" map the hero particle portrait is sampled from.
// Cuts the subject out of the studio backdrop and tone-maps it into one grayscale image:
//   0 = background (no particle) · 20–255 = subject brightness (always visible, even the black suit).
// The backdrop is a smooth grey gradient that is lighter than the suit/hair and darker than skin/shirt,
// so we model it with a quadratic surface and keep pixels that clearly differ from it.
import sharp from 'sharp';
import { pathToFileURL } from 'node:url';

const W = 400, H = 500; // working resolution for the cut-out (4:5 crop of the photo)
const OW = 320, OH = 400; // output map (head-and-shoulders crop)
const smooth = (a, b, t) => { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k); };

export async function buildPortraitSignal(src, out) {
  // centre-crop the square photo to 4:5 around the subject
  const meta = await sharp(src).metadata();
  const cw = Math.round(meta.height * 0.8);
  const { data } = await sharp(src)
    .extract({ left: Math.round((meta.width - cw) / 2), top: 0, width: cw, height: meta.height })
    .resize(W, H)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const N = W * H;
  const L = new Float32Array(N);
  for (let i = 0; i < N; i++) L[i] = (0.299 * data[i * 3] + 0.587 * data[i * 3 + 1] + 0.114 * data[i * 3 + 2]) / 255;

  // 1 ─ fit backdrop B(x,y) = a + bx + cy + dx² + ey² + fxy on known-background pixels
  const rows = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const nx = x / W, ny = y / H;
    const isBg = ny < 0.06 || ((nx < 0.08 || nx > 0.92) && ny < 0.5);
    if (isBg) rows.push([1, nx, ny, nx * nx, ny * ny, nx * ny, L[y * W + x]]);
  }
  const A = Array.from({ length: 6 }, () => new Float64Array(7));
  for (const r of rows) for (let i = 0; i < 6; i++) { for (let j = 0; j < 6; j++) A[i][j] += r[i] * r[j]; A[i][6] += r[i] * r[6]; }
  for (let i = 0; i < 6; i++) { // Gaussian elimination
    let p = i; for (let k = i + 1; k < 6; k++) if (Math.abs(A[k][i]) > Math.abs(A[p][i])) p = k;
    [A[i], A[p]] = [A[p], A[i]];
    for (let k = 0; k < 6; k++) if (k !== i) { const f = A[k][i] / A[i][i]; for (let j = i; j < 7; j++) A[k][j] -= f * A[i][j]; }
  }
  const c = A.map((r, i) => r[6] / r[i]);
  const bg = (x, y) => { const nx = x / W, ny = y / H; return c[0] + c[1] * nx + c[2] * ny + c[3] * nx * nx + c[4] * ny * ny + c[5] * nx * ny; };

  // 2 ─ candidate subject = clearly darker or brighter than the backdrop
  let m = new Float32Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const l = L[y * W + x], d = l - bg(x, y);
    // The cast shadow on the wall (left of the head, above the shoulders) is as dark as the suit
    // but lighter than the hair/neck beside it — inside that zone only keep genuinely dark pixels.
    // Zone weight ramps smoothly so there's no hard cut line across the shoulder.
    const zone = (1 - smooth(0.41, 0.52, y / H)) * (1 - smooth(0.34, 0.42, x / W));
    const dark = d < -0.02 && l < 0.055 + (1 - zone) * 0.5;
    m[y * W + x] = dark || d > 0.07 ? 1 : 0;
  }
  // 3 ─ smooth the mask (box blur r=2, twice) to kill noise
  for (let pass = 0; pass < 2; pass++) {
    const t = new Float32Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx >= 0 && yy >= 0 && xx < W && yy < H) { s += m[yy * W + xx]; n++; }
      }
      t[y * W + x] = s / n > 0.5 ? 1 : 0;
    }
    m = t;
  }
  // 4 ─ flood-fill background from the image border; anything not reached is subject (fills holes)
  const bgReach = new Uint8Array(N);
  const stack = [];
  const push = (x, y) => { const i = y * W + x; if (!bgReach[i] && !m[i]) { bgReach[i] = 1; stack.push(i); } };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
  while (stack.length) {
    const i = stack.pop(), x = i % W, y = (i / W) | 0;
    if (x > 0) push(x - 1, y); if (x < W - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1); if (y < H - 1) push(x, y + 1);
  }
  // 5 ─ keep only the largest subject component (drops stray specks)
  const comp = new Int32Array(N).fill(-1);
  let best = -1, bestSize = 0, id = 0;
  for (let s = 0; s < N; s++) {
    if (bgReach[s] || comp[s] >= 0) continue;
    let size = 0; const st = [s]; comp[s] = id;
    while (st.length) {
      const i = st.pop(); size++;
      const x = i % W, y = (i / W) | 0;
      for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1]) {
        if (j >= 0 && !bgReach[j] && comp[j] < 0) { comp[j] = id; st.push(j); }
      }
    }
    if (size > bestSize) { bestSize = size; best = id; }
    id++;
  }

  // 6 ─ tone-map subject: lift shadows so dark hair/suit still read as faint dots
  const tone = Buffer.alloc(N);
  for (let i = 0; i < N; i++) {
    if (comp[i] !== best) continue;
    tone[i] = Math.round(20 + 235 * Math.pow(Math.min(1, L[i] * 1.15), 0.75));
  }
  // 7 ─ tighter head-and-shoulders crop (the waist would be faded out anyway) so the face reads larger
  const cx = Math.round(W * 0.11), cwid = Math.round(W * 0.78), chei = Math.round(cwid * 1.25);
  const { data: crop } = await sharp(tone, { raw: { width: W, height: H, channels: 1 } })
    .extract({ left: cx, top: 0, width: cwid, height: chei })
    .resize(OW, OH, { kernel: 'cubic' })
    .extractChannel(0) // sharp expands 1-channel raw input to RGB — keep a single plane
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 8 ─ elliptical falloff centred on the face → reads as a bust and hides ragged lower/side edges
  const out8 = Buffer.alloc(OW * OH);
  for (let i = 0; i < OW * OH; i++) {
    if (crop[i] < 8) continue; // background (and resize fringe)
    const x = (i % OW) / OW, y = ((i / OW) | 0) / OH;
    const fade = 1 - smooth(0.6, 1.0, Math.hypot((x - 0.47) / 0.46, (y - 0.34) / 0.68));
    if (fade < 0.06) continue;
    out8[i] = Math.max(1, Math.round(crop[i] * fade));
  }
  await sharp(out8, { raw: { width: OW, height: OH, channels: 1 } }).png({ compressionLevel: 9 }).toFile(out);
  return { width: OW, height: OH, subject: +(bestSize / N).toFixed(3) };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = await buildPortraitSignal(process.argv[2] || 'assets-src/portrait.jpg', process.argv[3] || 'public/images/portrait-signal.png');
  console.log('portrait signal', r);
}
