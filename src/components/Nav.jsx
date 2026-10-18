import { profile } from '../data/profile.js';
import SoundToggle from './SoundToggle.jsx';

const items = [
  ['#about', 'About'],
  ['#experience', 'Experience'],
  ['#work', 'Work'],
  ['#contact', 'Contact'],
];

export default function Nav() {
  return (
    <header className="nav">
      <div className="nav__progress" data-progress aria-hidden="true" />
      <a href="#top" className="nav__logo" aria-label={`${profile.name} — home`}>
        <span className="nav__dot" aria-hidden="true" />
      </a>
      <nav aria-label="Primary">
        <ul className="nav__links">
          {items.map(([href, label]) => (
            <li key={href}><a href={href}>{label}</a></li>
          ))}
        </ul>
      </nav>
      <div className="nav__right">
        <SoundToggle />
        <a className="nav__cta" href={`mailto:${profile.email}`} data-magnetic>
          <span className="pulse" aria-hidden="true" /> Available
        </a>
      </div>
    </header>
  );
}
