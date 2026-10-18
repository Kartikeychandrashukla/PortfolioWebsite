import SectionHead from './SectionHead.jsx';
import { profile, stats, education } from '../data/profile.js';

export default function About() {
  return (
    <section id="about" className="section shell" aria-labelledby="about-title">
      <SectionHead index="01" label="About" id="about-title" title="Engineer by training, product builder by habit." />

      <div className="about">
        <figure className="about__photo" data-clip>
          <img
            src={profile.portrait}
            alt={`Portrait of ${profile.name}, Full Stack Developer`}
            width="640"
            height="640"
            loading="lazy"
            decoding="async"
            data-parallax="0.12"
          />
          <figcaption>
            <span>{profile.name}</span>
            <span>{profile.pronouns} · {profile.location.split(',')[0]}</span>
          </figcaption>
        </figure>

        <div className="about__body">
          <p className="about__lead" data-fade>
            Hi, I’m Kartikey — a <strong>Full Stack Developer</strong> who likes the whole problem:
            the pixels, the API, the database <em className="serif">and</em> the model.
          </p>
          {profile.about.map((p, i) => (
            <p key={i} className="about__p" data-fade>{p}</p>
          ))}

          <div className="about__edu" data-fade>
            <span className="mono-label">Education</span>
            <p><strong>{education.school}</strong><br />{education.degree} · {education.period}</p>
          </div>
        </div>
      </div>

      <ul className="stats">
        {stats.map((s) => (
          <li key={s.label} data-fade>
            <span className="stats__value" data-count={s.value}>{s.value}</span>
            <span className="stats__label">{s.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
