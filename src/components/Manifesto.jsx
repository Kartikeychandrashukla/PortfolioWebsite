import Split from './Split.jsx';
import { manifesto } from '../data/profile.js';

export default function Manifesto() {
  return (
    <section className="manifesto shell" aria-label="Philosophy">
      <p className="eyebrow"><span className="eyebrow__dash" /> 00 — Philosophy</p>
      <Split as="p" text={manifesto} className="manifesto__text" data-scrub />
    </section>
  );
}
