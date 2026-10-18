import { useEffect, useRef } from 'react';
import { profile } from '../data/profile.js';

const Line = ({ children }) => (
  <span className="hero__line" data-hero-line>
    <span className="w"><span className="wi">{children}</span></span>
  </span>
);

export default function Hero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let orb;
    let cancelled = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // three.js is split into its own chunk and loaded after first paint.
    import('../three/ParticleOrb.js').then(({ ParticleOrb }) => {
      if (cancelled || !canvasRef.current) return;
      try { orb = new ParticleOrb(canvasRef.current, { reducedMotion }); } catch { /* no WebGL — static fallback stays */ }
    });
    const onProgress = (e) => orb?.setScroll(e.detail);
    window.addEventListener('hero-progress', onProgress);
    return () => { cancelled = true; window.removeEventListener('hero-progress', onProgress); orb?.dispose(); };
  }, []);

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero__orb" data-hero-orb aria-hidden="true">
        <div className="hero__glow" />
        <canvas ref={canvasRef} />
      </div>

      <div className="hero__content shell" data-hero-content>
        <p className="eyebrow" data-hero-fade>
          <span className="eyebrow__dash" /> {profile.role} · AI Engineer
        </p>

        <h1 id="hero-title" className="hero__title">
          <Line>Kartikey</Line>
          <Line>Chandra <em className="serif">Shukla</em></Line>
        </h1>

        <div className="hero__bottom">
          <p className="hero__lede" data-hero-fade>
            I build full-stack products that <em className="serif grad">think</em> — React interfaces,
            .NET &amp; Node APIs, and AI that answers from your own data.
          </p>
          <div className="hero__actions" data-hero-fade>
            <a className="btn btn--primary" href="#work" data-magnetic>See selected work <span aria-hidden="true">↘</span></a>
            <a className="btn btn--ghost" href={`mailto:${profile.email}`} data-magnetic>Get in touch</a>
          </div>
        </div>

        <dl className="hero__meta" data-hero-fade>
          <div><dt>Based in</dt><dd>{profile.location.split(',')[0]}, India</dd></div>
          <div><dt>Currently</dt><dd>Prologic First</dd></div>
          <div><dt>Status</dt><dd><span className="pulse" aria-hidden="true" /> Open to work</dd></div>
          <div className="hero__scroll" aria-hidden="true"><span>Scroll</span><i /></div>
        </dl>
      </div>
    </section>
  );
}
