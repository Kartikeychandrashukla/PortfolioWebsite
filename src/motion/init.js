// All client-side motion lives here and is loaded after hydration.
// Components only declare intent with data-attributes, so the prerendered HTML stays
// fully readable for crawlers / no-JS and nothing animation-related runs on the server.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function initMotion() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cleanups = [];

  // ── Smooth scroll (Lenis driven by GSAP's ticker so ScrollTrigger stays in sync)
  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    cleanups.push(() => { gsap.ticker.remove(raf); lenis.destroy(); });
  }

  // In-page anchor links → smooth scroll
  const onClick = (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: 0 });
    else target.scrollIntoView();
    history.replaceState(null, '', a.getAttribute('href'));
  };
  document.addEventListener('click', onClick);
  cleanups.push(() => document.removeEventListener('click', onClick));

  // Scroll progress bar
  const bar = document.querySelector('[data-progress]');
  if (bar) {
    gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  }

  if (reduced) {
    document.documentElement.classList.add('motion-ready');
    return () => cleanups.forEach((f) => f());
  }

  const ctx = gsap.context(() => {
    // ── Hero intro
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 });
    tl.from('[data-hero-line] .wi', { yPercent: 115, duration: 1.4, stagger: 0.06 })
      .from('[data-hero-fade]', { autoAlpha: 0, y: 24, duration: 1.1, stagger: 0.08 }, '-=1.0')
      .from('[data-hero-orb]', { autoAlpha: 0, scale: 0.85, duration: 2.2 }, 0);

    // ── Word-by-word headline reveals
    gsap.utils.toArray('[data-split]').forEach((el) => {
      gsap.from(el.querySelectorAll('.wi'), {
        yPercent: 115,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.035,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    // ── Manifesto: words light up as you scroll
    gsap.utils.toArray('[data-scrub]').forEach((el) => {
      gsap.fromTo(
        el.querySelectorAll('.wi'),
        { opacity: 0.12 },
        { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } },
      );
    });

    // ── Generic fade-up (batched for performance)
    gsap.set('[data-fade]', { autoAlpha: 0, y: 36 });
    ScrollTrigger.batch('[data-fade]', {
      start: 'top 90%',
      once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }),
    });

    // ── Image clip reveals
    gsap.utils.toArray('[data-clip]').forEach((el) => {
      gsap.fromTo(
        el,
        { clipPath: 'inset(18% 18% 18% 18% round 28px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 35%', scrub: 0.8 } },
      );
    });

    // ── Parallax
    gsap.utils.toArray('[data-parallax]').forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      gsap.fromTo(el, { yPercent: -speed * 50 }, {
        yPercent: speed * 50,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // ── Stat counters
    gsap.utils.toArray('[data-count]').forEach((el) => {
      const raw = el.dataset.count;
      const num = parseFloat(raw);
      const suffix = raw.replace(/[0-9.]/g, '');
      const obj = { v: num > 1000 ? num - 6 : 0 };
      gsap.to(obj, {
        v: num,
        duration: 1.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
      });
    });

    // ── Experience timeline line draw
    const line = document.querySelector('[data-line]');
    if (line) {
      gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: line.parentElement, start: 'top 70%', end: 'bottom 60%', scrub: true } });
    }

    // ── Hero orb reacts to scroll
    const hero = document.querySelector('#top');
    if (hero) {
      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => window.dispatchEvent(new CustomEvent('hero-progress', { detail: self.progress })),
      });
      gsap.to('[data-hero-content]', { yPercent: -18, autoAlpha: 0.2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }
  });

  document.documentElement.classList.add('motion-ready');
  // fonts shift layout slightly — recalc trigger positions once they're in
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  cleanups.push(() => ctx.revert());
  return () => cleanups.forEach((f) => f());
}

// Magnetic hover for elements with [data-magnetic] (pointer devices only)
export function initMagnetic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  const els = gsap.utils.toArray('[data-magnetic]');
  const offs = els.map((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
    };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  });
  return () => offs.forEach((f) => f());
}
