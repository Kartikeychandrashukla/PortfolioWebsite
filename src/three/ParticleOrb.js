// Hero visual: a dotted, organically deforming sphere (inspired by the particle-blob reference).
// Plain three.js + custom shaders — one draw call, no post-processing, so it stays at 60fps.
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
uniform float uTime;
uniform float uScroll;
uniform vec2  uMouse;
uniform float uPixelRatio;
uniform float uSize;
varying float vMix;
varying float vDepth;
${NOISE}
void main(){
  vec3 p = position;
  float t = uTime * 0.18;
  // two octaves of noise → large folds + fine ripples, like the reference blob
  float n = snoise(p * 1.1 + vec3(t, t * 0.6, -t)) * 0.32
          + snoise(p * 2.6 - vec3(t * 1.4)) * 0.08;
  // mouse pushes a soft bulge toward the cursor
  float pull = smoothstep(1.4, 0.0, distance(normalize(p).xy, uMouse)) * 0.18;
  float amp = 1.0 + uScroll * 0.9;
  p += normalize(p) * (n * amp + pull);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (1.0 / -mv.z);

  // colour: cyan-blue on top → violet/pink at the base, shifted by the folds
  vMix = clamp(0.55 - position.y * 0.55 + n * 0.9, 0.0, 1.0);
  vDepth = smoothstep(-1.6, 1.4, p.z);
}`;

const fragmentShader = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
varying float vMix;
varying float vDepth;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.15, d);
  vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 0.6, vMix));
  col = mix(col, uColorC, smoothstep(0.6, 1.0, vMix));
  gl_FragColor = vec4(col, alpha * (0.25 + vDepth * 0.75));
}`;

function fibonacciSphere(count) {
  const pos = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pos[i * 3] = Math.cos(theta) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(theta) * r;
  }
  return pos;
}

export class ParticleOrb {
  constructor(canvas, { reducedMotion = false } = {}) {
    this.canvas = canvas;
    this.reducedMotion = reducedMotion;
    this.mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    this.scroll = 0;
    this.visible = true;
    this.raf = 0;
    this.start = performance.now();

    const small = window.innerWidth < 768;
    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(35, 1, 0.1, 50);
    this.camera.position.set(0, 0, 5.2);

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(fibonacciSphere(small ? 7000 : 14000), 3));

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uMouse: { value: [0, 0] },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uSize: { value: small ? 9 : 11 },
        uColorA: { value: new Color('#7cc8ff') },
        uColorB: { value: new Color('#4c6bff') },
        uColorC: { value: new Color('#c77dff') },
      },
    });

    this.points = new Points(geo, this.material);
    this.points.rotation.set(0.35, 0, 0.12);
    this.scene.add(this.points);

    this.onResize = this.onResize.bind(this);
    this.onPointer = this.onPointer.bind(this);
    this.tick = this.tick.bind(this);

    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointer, { passive: true });
    // Stop rendering entirely when the hero is off-screen.
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      if (this.visible && !this.raf) this.raf = requestAnimationFrame(this.tick);
    });
    this.io.observe(canvas);

    this.onResize();
    this.raf = requestAnimationFrame(this.tick);
  }

  onResize() {
    const { clientWidth: w, clientHeight: h } = this.canvas; // CSS size of the canvas itself
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // keep the orb a similar visual size on portrait screens
    this.camera.position.z = w / h < 1 ? 4.4 / Math.max(w / h, 0.55) : 5.2;
    this.camera.updateProjectionMatrix();
  }

  onPointer(e) {
    this.mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  }

  setScroll(progress) {
    this.scroll = progress;
  }

  tick(now) {
    this.raf = 0;
    if (!this.visible) return;
    const t = (now - this.start) / 1000;
    const m = this.mouse;
    m.x += (m.tx - m.x) * 0.05;
    m.y += (m.ty - m.y) * 0.05;

    const u = this.material.uniforms;
    u.uTime.value = this.reducedMotion ? 4 : t;
    u.uScroll.value += (this.scroll - u.uScroll.value) * 0.08;
    u.uMouse.value = [m.x * 0.9, m.y * 0.9];

    this.points.rotation.y = t * 0.06 + m.x * 0.25 + u.uScroll.value * 1.2;
    this.points.rotation.x = 0.35 - m.y * 0.15;
    this.points.scale.setScalar(1 + u.uScroll.value * 0.35);

    this.renderer.render(this.scene, this.camera);
    if (!this.reducedMotion) this.raf = requestAnimationFrame(this.tick);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.io.disconnect();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointer);
    this.points.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
