import { useEffect, useRef, useState } from 'react';

const SRC = '/audio/background.m4a'; // original ambient loop — regenerate with scripts/generate-bgm.mjs
const VOLUME = 0.35;
const KEY = 'sound-on';

// Fades the volume toward `to` over ~`ms`, then calls `done`.
function fade(audio, to, ms, done) {
  clearInterval(audio._fade);
  const steps = 24;
  const delta = (to - audio.volume) / steps;
  let i = 0;
  audio._fade = setInterval(() => {
    audio.volume = Math.min(1, Math.max(0, audio.volume + delta));
    if (++i >= steps) { clearInterval(audio._fade); audio.volume = to; done?.(); }
  }, ms / steps);
}

export default function SoundToggle() {
  const audioRef = useRef(null);
  const [on, setOn] = useState(false);

  const getAudio = () => {
    if (!audioRef.current) {
      const a = new Audio(SRC); // created on demand → nothing downloads until first play
      a.loop = true;
      a.volume = 0;
      audioRef.current = a;
    }
    return audioRef.current;
  };

  const play = () => {
    const a = getAudio();
    a.play().then(() => { fade(a, VOLUME, 1200); setOn(true); }).catch(() => setOn(false));
  };
  const pause = () => {
    const a = audioRef.current;
    setOn(false);
    if (a) fade(a, 0, 600, () => a.pause());
  };

  const toggle = () => {
    const next = !on;
    try { localStorage.setItem(KEY, next ? '1' : '0'); } catch { /* storage blocked */ }
    next ? play() : pause();
  };

  useEffect(() => {
    // Returning visitor who left sound on: browsers block autoplay, so resume on their first interaction.
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch { /* storage blocked */ }
    const resume = (e) => {
      if (e.target.closest?.('.sound')) return; // the toggle handles its own click
      play();
      off();
    };
    const off = () => ['pointerdown', 'keydown'].forEach((t) => window.removeEventListener(t, resume));
    if (saved === '1') ['pointerdown', 'keydown'].forEach((t) => window.addEventListener(t, resume, { once: true }));

    // Pause while the tab is hidden, resume when back.
    const onVis = () => {
      const a = audioRef.current;
      if (!a || a.paused === document.hidden) return;
      if (document.hidden) a.pause();
      else if (localStorage.getItem(KEY) === '1') a.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVis);
    return () => { off(); document.removeEventListener('visibilitychange', onVis); audioRef.current?.pause(); };
  }, []);

  return (
    <button
      type="button"
      className={`sound ${on ? 'is-on' : ''}`}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Mute background music' : 'Play background music'}
      data-magnetic
    >
      <span className="sound__bars" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="sound__label">{on ? 'Sound on' : 'Sound off'}</span>
    </button>
  );
}
