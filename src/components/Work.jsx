import SectionHead from './SectionHead.jsx';
import { featuredProjects, moreProjects, profile } from '../data/profile.js';

const Arrow = () => <span aria-hidden="true" className="arrow">↗</span>;

function ProjectCard({ p, i }) {
  return (
    <article className={`card card--${p.accent}`} data-fade itemScope itemType="https://schema.org/CreativeWork">
      {p.imageVariant === 'widget' ? (
        // Chat-widget screenshot shown as a floating panel, anchored to its latest answer + input
        <div className="card__art card__art--shot">
          <span className="card__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <div className="widget">
            <img src={p.image} alt={p.imageAlt} width="570" height="557" loading="lazy" decoding="async" itemProp="image" />
          </div>
        </div>
      ) : p.image ? (
        // Real screenshot framed as a mini browser window
        <div className="card__art card__art--shot">
          <span className="card__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <div className="shot">
            <div className="shot__bar" aria-hidden="true">
              <i /><i /><i />
              <span>{(p.live || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
            </div>
            <img
              src={`${p.image}-720.webp`}
              srcSet={`${p.image}-720.webp 720w, ${p.image}-1400.webp 1400w`}
              sizes="(max-width: 1024px) 92vw, 640px"
              alt={p.imageAlt}
              width="1400"
              height="762"
              loading="lazy"
              decoding="async"
              itemProp="image"
            />
          </div>
        </div>
      ) : (
        <div className="card__art" aria-hidden="true">
          <span className="card__num">{String(i + 1).padStart(2, '0')}</span>
          <span className="card__mono serif">{p.title.charAt(0)}</span>
        </div>
      )}
      <div className="card__body">
        <p className="card__kind"><span>{p.kind}</span><span>{p.year}</span></p>
        <h3 className="card__title" itemProp="name">{p.title}</h3>
        <p className="card__blurb" itemProp="description">{p.blurb}</p>
        <ul className="card__hl">
          {p.highlights.map((h) => <li key={h}>{h}</li>)}
        </ul>
        <ul className="tags" aria-label="Technologies">
          {p.stack.map((t) => <li key={t}>{t}</li>)}
        </ul>
        <div className="card__links">
          {p.live && <a href={p.live} target="_blank" rel="noopener" itemProp="url">Live site <Arrow /></a>}
          {p.repo && <a href={p.repo} target="_blank" rel="noopener">Source <Arrow /></a>}
          {!p.live && !p.repo && <span className="card__private">Production · private code</span>}
        </div>
      </div>
    </article>
  );
}

export default function Work() {
  return (
    <section id="work" className="section work" aria-labelledby="work-title">
      <div className="work__art" aria-hidden="true">
        <img src="/images/glass-ring-900.webp" alt="" width="900" height="1600" loading="lazy" decoding="async" data-parallax="0.3" />
      </div>
      <div className="shell">
        <SectionHead index="03" label="Selected work" id="work-title" title="Things I’ve built that are out in the world." />

        <div className="cards">
          {featuredProjects.map((p, i) => <ProjectCard key={p.slug} p={p} i={i} />)}
        </div>

        <div className="archive">
          <h3 className="archive__title" data-fade>More from the workshop</h3>
          <ul className="archive__list">
            {moreProjects.map((p) => (
              <li key={p.title} data-fade>
                <a href={p.repo} target="_blank" rel="noopener">
                  <span className="archive__name">{p.title}</span>
                  <span className="archive__desc">{p.desc}</span>
                  <span className="archive__stack">{p.stack}</span>
                  <Arrow />
                </a>
              </li>
            ))}
          </ul>
          <a className="btn btn--ghost archive__all" href={profile.links.github} target="_blank" rel="noopener" data-magnetic>
            All repositories on GitHub <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
