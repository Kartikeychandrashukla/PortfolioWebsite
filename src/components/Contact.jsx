import Split from './Split.jsx';
import { profile } from '../data/profile.js';

export default function Contact() {
  const year = 2026;
  return (
    <footer id="contact" className="contact" aria-labelledby="contact-title">
      <div className="contact__art" aria-hidden="true">
        <img src="/images/bulb-900.webp" alt="" width="900" height="1600" loading="lazy" decoding="async" data-parallax="0.2" />
      </div>
      <div className="shell contact__inner">
        <p className="eyebrow" data-fade><span className="eyebrow__dash" /> 07 — Contact</p>
        <Split as="h2" id="contact-title" className="contact__title" text="Got an idea? Let’s build it." data-split />
        <p className="contact__sub" data-fade>
          Open to full-stack &amp; AI engineering roles and freelance builds. I usually reply within a day.
        </p>
        <a className="contact__mail" href={`mailto:${profile.email}`} data-fade>
          {profile.email} <span aria-hidden="true">↗</span>
        </a>

        <ul className="contact__links" data-fade>
          <li><a href={profile.links.linkedin} target="_blank" rel="me noopener" data-magnetic>LinkedIn</a></li>
          <li><a href={profile.links.github} target="_blank" rel="me noopener" data-magnetic>GitHub</a></li>
          <li><a href={profile.links.leetcode} target="_blank" rel="me noopener" data-magnetic>LeetCode</a></li>
        </ul>

        <div className="contact__foot">
          <span>© {year} {profile.name}</span>
          <span>{profile.location}</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
