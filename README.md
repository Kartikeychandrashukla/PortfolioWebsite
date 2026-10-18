# Kartikey Chandra Shukla — Portfolio

React 18 + Vite · Three.js (particle orb) · GSAP ScrollTrigger · Lenis smooth scroll · prerendered for SEO / AI search.

```bash
npm install
npm run dev       # local dev at http://localhost:5173
npm run build     # production build → dist/ (prerendered HTML + robots, sitemap, llms.txt)
npm run preview   # serve dist/
npm run images    # re-generate /public/images + og-image.jpg from /assets-src
```

## Editing content
Everything — text, jobs, projects, skills, links, FAQ — lives in **`src/data/profile.js`**.
The same file generates the JSON-LD schema, `llms.txt`, and sitemap at build time.
Set `SITE_URL` there to your real domain before deploying.

## Structure
- `src/components/` — one component per section (pure markup, SSR-safe)
- `src/motion/init.js` — all GSAP/Lenis animation, wired via `data-*` attributes
- `src/three/ParticleOrb.js` — hero WebGL orb (lazy-loaded, pauses off-screen)
- `scripts/prerender.mjs` — renders the app to static HTML + SEO/AIEO files

## Deploy
Any static host. Vercel: framework "Vite", build `npm run build`, output `dist`.
