import SectionHead from './SectionHead.jsx';
import { experience } from '../data/profile.js';

export default function Experience() {
  return (
    <section id="experience" className="section exp" aria-labelledby="exp-title">
      <div className="exp__art" aria-hidden="true">
        <img src="/images/pills-900.webp" alt="" width="900" height="1600" loading="lazy" decoding="async" data-parallax="0.35" />
      </div>

      <div className="shell">
        <SectionHead index="02" label="Experience" id="exp-title" title="Where I’ve shipped." />

        <ol className="timeline">
          <span className="timeline__line" data-line aria-hidden="true" />
          {experience.map((job) => (
            <li className="job" key={job.role + job.start} data-fade>
              <div className="job__side">
                <time className="job__period" dateTime={job.start}>{job.period}</time>
                <span className="job__mode">{job.mode}</span>
              </div>
              <article className="job__main">
                <h3 className="job__role">
                  {job.role} <span className="job__at">@ {job.company}</span>
                </h3>
                <ul className="job__points">
                  {job.points.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
                <ul className="tags" aria-label="Technologies">
                  {job.stack.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
