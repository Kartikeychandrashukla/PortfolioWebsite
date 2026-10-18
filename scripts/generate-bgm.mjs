// Synthesises an original, royalty-free ambient loop for the site's background music.
// Dreamy pads + soft plucked arpeggio + sub bass, through a simple stereo reverb.
// Output: WAV (encode to AAC with: afconvert -f m4af -d aac -b 128000 in.wav out.m4a)
import { writeFile } from 'node:fs/promises';

const SR = 44100;
const BPM = 72;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const BARS_PER_CHORD = 2;

// Am9 – Fmaj7 – Cmaj7 – G6sus  (MIDI notes)
const chords = [
  { root: 45, pad: [57, 60, 64, 67, 71], arp: [69, 72, 76, 79, 83, 79, 76, 72] },
  { root: 41, pad: [53, 57, 60, 64, 67], arp: [65, 69, 72, 76, 79, 76, 72, 69] },
  { root: 48, pad: [55, 60, 64, 67, 71], arp: [67, 72, 76, 79, 83, 79, 76, 72] },
  { root: 43, pad: [55, 59, 62, 64, 69], arp: [67, 71, 74, 76, 81, 76, 74, 71] },
];
const LOOP = chords.length * BARS_PER_CHORD * BAR; // seconds in one loop (~26.7s)
const LOOPS = 3; // final file = 3 loops with variation, ~80s
const RENDER = LOOP * (LOOPS + 1); // +1 warm-up loop so reverb tail wraps seamlessly
const N = Math.floor(RENDER * SR);

const L = new Float32Array(N);
const R = new Float32Array(N);
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

// deterministic pseudo-random so the file is reproducible
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function addPad(note, t0, dur, gain, pan) {
  const f = hz(note);
  const a = 2.2, rel = 2.8;
  const s0 = Math.floor(t0 * SR), s1 = Math.min(N, Math.floor((t0 + dur + rel) * SR));
  const det = [0.996, 1, 1.004];
  let lp = 0;
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR;
    const env = Math.min(1, t / a) * (t > dur ? Math.max(0, 1 - (t - dur) / rel) : 1);
    let v = 0;
    for (const d of det) {
      const ph = 2 * Math.PI * f * d * t;
      v += Math.sin(ph) + 0.25 * Math.sin(2 * ph + 0.3) + 0.08 * Math.sin(3 * ph);
    }
    // gentle one-pole low-pass with slow "breathing" cutoff
    const k = 0.08 + 0.05 * Math.sin(2 * Math.PI * 0.05 * (i / SR));
    lp += k * (v - lp);
    const out = lp * env * gain;
    L[i] += out * (1 - pan);
    R[i] += out * (1 + pan);
  }
}

function addPluck(note, t0, gain, pan) {
  const f = hz(note);
  const s0 = Math.floor(t0 * SR), s1 = Math.min(N, s0 + Math.floor(2.4 * SR));
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR;
    const env = Math.min(1, t / 0.004) * Math.exp(-t * 2.6);
    const ph = 2 * Math.PI * f * t;
    const v = (Math.sin(ph) + 0.35 * Math.sin(2 * ph) * Math.exp(-t * 6) + 0.12 * Math.sin(4 * ph) * Math.exp(-t * 12)) * env * gain;
    L[i] += v * (1 - pan);
    R[i] += v * (1 + pan);
  }
}

function addBass(note, t0, dur, gain) {
  const f = hz(note);
  const s0 = Math.floor(t0 * SR), s1 = Math.min(N, Math.floor((t0 + dur + 1) * SR));
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR;
    const env = Math.min(1, t / 0.6) * (t > dur ? Math.max(0, 1 - (t - dur)) : 1);
    const v = Math.sin(2 * Math.PI * f * t) * env * gain;
    L[i] += v; R[i] += v;
  }
}

for (let loop = 0; loop <= LOOPS; loop++) {
  chords.forEach((c, ci) => {
    const t0 = loop * LOOP + ci * BARS_PER_CHORD * BAR;
    const len = BARS_PER_CHORD * BAR;
    c.pad.forEach((n, k) => addPad(n, t0, len, 0.032, (k / (c.pad.length - 1) - 0.5) * 0.6));
    addBass(c.root - 12, t0, len, 0.16);
    // arpeggio enters after the first loop; later loops add sparse high sparkles
    if (loop >= 1) {
      const steps = BARS_PER_CHORD * 8; // 8th notes
      for (let s = 0; s < steps; s++) {
        if (loop === 1 && s % 2) continue; // sparser first time through
        if (rand() < 0.18) continue; // humanised gaps
        const n = c.arp[s % c.arp.length];
        addPluck(n, t0 + s * (BEAT / 2) + (rand() - 0.5) * 0.012, 0.05 + rand() * 0.02, Math.sin(s * 0.9) * 0.5);
      }
    }
    if (loop >= 2 && rand() < 0.9) addPluck(c.arp[4] + 12, t0 + BAR * 1.5, 0.03, 0.4);
  });
}

// Schroeder-style stereo reverb: parallel combs → series allpasses
function reverb(input, combs, aps, wet) {
  const out = new Float32Array(input.length);
  for (const [d, fb] of combs) {
    const buf = new Float32Array(d); let idx = 0, lp = 0;
    for (let i = 0; i < input.length; i++) {
      const y = buf[idx];
      lp = y * 0.6 + lp * 0.4; // damping
      buf[idx] = input[i] + lp * fb;
      out[i] += y;
      idx = (idx + 1) % d;
    }
  }
  for (const d of aps) {
    const buf = new Float32Array(d); let idx = 0;
    for (let i = 0; i < out.length; i++) {
      const b = buf[idx];
      const y = -out[i] + b;
      buf[idx] = out[i] + b * 0.5;
      out[i] = y;
      idx = (idx + 1) % d;
    }
  }
  for (let i = 0; i < input.length; i++) out[i] = input[i] * (1 - wet) + (out[i] / combs.length) * wet * 2.2;
  return out;
}
const RL = reverb(L, [[1557, 0.86], [1617, 0.86], [1491, 0.86], [1422, 0.86]], [225, 556, 441], 0.45);
const RR = reverb(R, [[1580, 0.86], [1640, 0.86], [1514, 0.86], [1445, 0.86]], [248, 579, 464], 0.45);

// drop the warm-up loop → loop point now contains the reverb tail = seamless repeat
const start = Math.floor(LOOP * SR);
const len = N - start;
let peak = 0;
for (let i = start; i < N; i++) peak = Math.max(peak, Math.abs(RL[i]), Math.abs(RR[i]));
const norm = 0.7 / peak;

const buf = Buffer.alloc(44 + len * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + len * 4, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(len * 4, 40);
for (let i = 0; i < len; i++) {
  const s = start + i;
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, RL[s] * norm)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, RR[s] * norm)) * 32767), 46 + i * 4);
}
const out = process.argv[2] || 'bgm.wav';
await writeFile(out, buf);
console.log(`wrote ${out} — ${(len / SR).toFixed(1)}s`);
