import SectionHead from './SectionHead.jsx';
import { credentials, faq } from '../data/profile.js';

export default function Credentials() {
  return (
    <section id="credentials" className="section shell" aria-labelledby="cred-title">
      <SectionHead index="06" label="Credentials" id="cred-title" title="Certified, practised, proven." />
      <ul className="creds">
        {credentials.map((c) => (
          <li key={c.title} data-fade>
            <h3>{c.url ? <a href={c.url} target="_blank" rel="noopener">{c.title} ↗</a> : c.title}</h3>
            <p>{c.issuer}{c.date ? ` · ${c.date}` : ''}</p>
          </li>
        ))}
      </ul>

      {/* Visible Q&A: answers in plain sentences are what search snippets & AI assistants quote. */}
      <div className="faq">
        <h2 className="faq__title" data-fade>Quick answers</h2>
        {faq.map((f) => (
          <details key={f.q} data-fade>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
