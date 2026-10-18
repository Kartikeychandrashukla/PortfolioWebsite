import SectionHead from './SectionHead.jsx';
import { skills } from '../data/profile.js';

export default function Stack() {
  const all = skills.flatMap((s) => s.items);
  const half = Math.ceil(all.length / 2);
  const rows = [all.slice(0, half), all.slice(half)];

  return (
    <section id="stack" className="section stack" aria-labelledby="stack-title">
      <div className="shell">
        <SectionHead index="04" label="Toolkit" id="stack-title" title="The stack I reach for." />
      </div>

      <div className="marquees" aria-hidden="true">
        {rows.map((row, r) => (
          <div className={`marquee ${r ? 'marquee--rev' : ''}`} key={r}>
            <div className="marquee__track">
              {[...row, ...row].map((t, i) => (
                <span key={i} className={i % 3 === 1 ? 'serif' : ''}>{t}<i>✦</i></span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="shell">
        <dl className="skills">
          {skills.map((s) => (
            <div key={s.group} className="skills__group" data-fade>
              <dt className="mono-label">{s.group}</dt>
              <dd>{s.items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
