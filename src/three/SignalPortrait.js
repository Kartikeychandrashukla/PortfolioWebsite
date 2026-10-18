// Hero visual: the portrait rebuilt from tens of thousands of light points.
// Every point is one pixel of a pre-cut brightness map (scripts/portrait-signal.mjs) and also owns
// a home on a noise-deformed sphere. On load the sphere resolves into the face; scrolling dissolves
// the face back into the orb. The cursor pushes a soft ripple through the dots.
// One draw call, no post-processing, paused when off-screen.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';

const SIGNAL_SRC = '/images/portrait-signal.png';
const FOV = 35;
const PH = 2.9; // portrait plane height (world units)
const PW = PH * 0.8; // 4:5
const SPHERE_R = 1.05;

// Ashima/stegu 3D simplex noise
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const vertexShader = /* glsl */ `
attribute vec3 aTarget;   // home on the sphere
attribute float aLum;     // pixel brightness 0..1
attribute float aSeed;    // per-point random 0..1
uniform float uTime;
uniform float uMorph;     // 0 = portrait, 1 = orb
uniform vec2  uMouse;     // cursor on the portrait plane (world units)
uniform float uMouseOn;
uniform float uPixelRatio;
uniform vec3 uShadow, uLight, uOrbA, uOrbB, uOrbC;
varying vec3 vColor;
varying float vAlpha;
${NOISE}

mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

void main(){
  // staggered morph: each point leaves/arrives at a slightly different moment
  float m = smoothstep(0.0, 1.0, clamp(uMorph * 1.45 - aSeed * 0.45, 0.0, 1.0));

  // ── portrait state
  vec3 a = position;
  a.x += sin(uTime * 0.6 + aSeed * 40.0) * 0.003;                  // faint living shimmer
  vec2 toM = a.xy - uMouse;
  float d = length(toM);
  float push = exp(-d * d * 18.0) * 0.1 * uMouseOn;                // cursor ripple
  a.xy += normalize(toM + 1e-4) * push;
  a.z  += push * 1.4 + sin(d * 18.0 - uTime * 5.0) * exp(-d * 3.0) * 0.02 * uMouseOn;

  // ── orb state (same folds as the original particle orb)
  vec3 b = aTarget;
  if (m > 0.0) {
    float t = uTime * 0.18;
    float n = snoise(b * 1.1 + vec3(t, t * 0.6, -t)) * 0.3 + snoise(b * 2.6 - vec3(t * 1.4)) * 0.07;
    b += normalize(b) * n;
    b.xz = rot(uTime * 0.08 + uMorph * 1.6) * b.xz;
    b.yz = rot(0.35) * b.yz;
  }

  // mid-flight swirl so the transition feels fluid, not linear
  vec3 swirl = vec3(sin(aSeed * 31.0 + uTime), cos(aSeed * 17.0 - uTime * 0.7), sin(aSeed * 53.0)) * 0.45;
  vec3 pos = mix(a, b, m) + swirl * sin(m * 3.14159);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float portraitSize = (1.15 + aLum * 1.35) * uPixelRatio;
  float orbSize = 10.0 * uPixelRatio / -mv.z;
  gl_PointSize = mix(portraitSize, orbSize, m);

  // colour: shadows sink into indigo, highlights glow cool white; the orb uses its blue→violet ramp
  vec3 pc = mix(uShadow, uLight, smoothstep(0.12, 0.95, aLum));
  float mixY = clamp(0.55 - aTarget.y * 0.55, 0.0, 1.0);
  vec3 oc = mix(uOrbA, uOrbB, smoothstep(0.0, 0.6, mixY));
  oc = mix(oc, uOrbC, smoothstep(0.6, 1.0, mixY));
  vColor = mix(pc, oc, m) + vec3(0.25, 0.45, 1.0) * push * 2.0;

  float depth = smoothstep(-1.6, 1.4, pos.z);
  vAlpha = mix(0.4 + aLum * 0.7, 0.25 + depth * 0.75, m);
}`;

const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.18, d) * vAlpha;
  if (a < 0.02) discard;
  gl_FragColor = vec4(vColor, a);
}`;

function loadSignal(src, cols) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const rows = Math.round(cols * (img.height / img.width));
      const c = document.createElement('canvas');
      c.width = cols;
      c.height = rows;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, cols, rows);
      resolve({ data: ctx.getImageData(0, 0, cols, rows).data, cols, rows });
    };
    img.onerror = reject;
    img.src = src;
  });
}

function buildGeometry({ data, cols, rows }) {
  const pos = [], lum = [], seed = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = data[(r * cols + c) * 4] / 255; // grayscale map: 0 = background
      if (v < 0.03) continue;
      const l = v; // map already lifts shadows (≥20/255) so hair & suit stay visible
      pos.push((c / cols - 0.5) * PW, (0.5 - r / rows) * PH, l * 0.12);
      lum.push(l);
      seed.push(((c * 127 + r * 311) % 997) / 997);
    }
  }
  const n = lum.length;
  // Fibonacci sphere homes, handed out in shuffled order so points cross the screen when morphing
  const target = new Float32Array(n * 3);
  const order = Array.from({ length: n }, (_, i) => i);
  let s = 12345;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let k = 0; k < n; k++) {
    const y = 1 - (k / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * k;
    const i = order[k];
    target[i * 3] = Math.cos(th) * rad * SPHERE_R;
    target[i * 3 + 1] = y * SPHERE_R;
    target[i * 3 + 2] = Math.sin(th) * rad * SPHERE_R;
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('aTarget', new BufferAttribute(target, 3));
  g.setAttribute('aLum', new BufferAttribute(new Float32Array(lum), 1));
  g.setAttribute('aSeed', new BufferAttribute(new Float32Array(seed), 1));
  return g;
}

export class SignalPortrait {
  constructor(canvas, { reducedMotion = false, onReady } = {}) {
    this.canvas = canvas;
    this.reducedMotion = reducedMotion;
    this.mouse = { x: 0, y: 0, tx: 9, ty: 9, on: 0, ton: 0 };
    this.scroll = 0;
    this.intro = reducedMotion ? 0 : 1; // starts as the orb, resolves into the face
    this.visible = true;
    this.raf = 0;
    this.disposed = false;
    this.start = performance.now();

    const small = window.innerWidth < 768;
    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(FOV, 1, 0.1, 50);

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: this.intro },
        uMouse: { value: [9, 9] },
        uMouseOn: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uShadow: { value: new Color('#5560d0') },
        uLight: { value: new Color('#eef3ff') },
        uOrbA: { value: new Color('#7cc8ff') },
        uOrbB: { value: new Color('#4c6bff') },
        uOrbC: { value: new Color('#c77dff') },
      },
    });

    this.onResize = this.onResize.bind(this);
    this.onPointer = this.onPointer.bind(this);
    this.onLeave = () => { this.mouse.ton = 0; };
    this.tick = this.tick.bind(this);

    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointer, { passive: true });
    document.addEventListener('pointerleave', this.onLeave);
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      if (this.visible && !this.raf && this.points) this.raf = requestAnimationFrame(this.tick);
    });
    this.io.observe(canvas);
    this.onResize();

    loadSignal(SIGNAL_SRC, small ? 160 : 260).then((sig) => {
      if (this.disposed) return;
      this.points = new Points(buildGeometry(sig), this.material);
      this.scene.add(this.points);
      onReady?.();
      this.raf = requestAnimationFrame(this.tick);
    });
  }

  onResize() {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    const t = Math.tan(((FOV / 2) * Math.PI) / 180);
    this.camera.aspect = aspect;
    // fit the whole portrait (with a little margin) whatever the canvas shape
    this.camera.position.z = Math.max((PH * 0.53) / t, (PW * 0.56) / (t * aspect));
    this.camera.updateProjectionMatrix();
    this.halfH = t * this.camera.position.z;
    this.halfW = this.halfH * aspect;
    if (this.reducedMotion && this.points) this.renderer.render(this.scene, this.camera);
  }

  onPointer(e) {
    const r = this.canvas.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
    this.mouse.tx = nx * this.halfW;
    this.mouse.ty = ny * this.halfH;
    this.mouse.ton = Math.abs(nx) < 1.1 && Math.abs(ny) < 1.1 ? 1 : 0;
  }

  setScroll(progress) {
    this.scroll = progress;
  }

  tick(now) {
    this.raf = 0;
    if (!this.visible || this.disposed) return;
    const t = (now - this.start) / 1000;
    const m = this.mouse;
    m.x += (m.tx - m.x) * 0.12;
    m.y += (m.ty - m.y) * 0.12;
    m.on += (m.ton - m.on) * 0.06;

    // intro: hold the orb briefly, then resolve into the portrait over ~2.6s
    if (this.intro > 0) this.intro = Math.max(0, 1 - Math.pow(Math.max(0, t - 0.5) / 2.6, 1.6));

    const u = this.material.uniforms;
    u.uTime.value = this.reducedMotion ? 4 : t;
    const target = Math.max(this.intro, Math.min(1, this.scroll * 1.6));
    u.uMorph.value += (target - u.uMorph.value) * (this.intro > 0 ? 1 : 0.09);
    u.uMouse.value = [m.x, m.y];
    u.uMouseOn.value = m.on * (1 - u.uMorph.value);

    // tiny parallax tilt toward the cursor
    this.points.rotation.y += ((m.on ? m.x * 0.06 : 0) - this.points.rotation.y) * 0.05;
    this.points.rotation.x += ((m.on ? -m.y * 0.04 : 0) - this.points.rotation.x) * 0.05;

    this.renderer.render(this.scene, this.camera);
    if (!this.reducedMotion) this.raf = requestAnimationFrame(this.tick);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.io.disconnect();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointer);
    document.removeEventListener('pointerleave', this.onLeave);
    this.points?.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
