import SectionHead from './SectionHead.jsx';
import { process } from '../data/profile.js';

export default function Process() {
  return (
    <section className="section shell" aria-labelledby="process-title">
      <SectionHead index="05" label="How I work" id="process-title" title="Three steps. No nonsense." />
      <ol className="process">
        {process.map((s) => (
          <li key={s.n} data-fade>
            <span className="process__n">{s.n}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
