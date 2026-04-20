import { PROJECTS } from '../data/projects';

export default function Projects() {
  return (
    <section id="projects">
      <div className="proj-intro reveal">
        <div>
          <p className="sec-label">Selected Work</p>
          <h2
            style={{
              fontFamily: 'Bebas Neue',
              fontSize: 'clamp(44px,6vw,76px)',
              color: '#fff',
              letterSpacing: '2px',
              lineHeight: 1,
            }}
          >
            Projects
          </h2>
        </div>
        <div className="proj-count">0{PROJECTS.length}</div>
      </div>
      {PROJECTS.map((p, i) => (
        <a
          key={p.name}
          href={p.link}
          target={p.link.startsWith('http') ? '_blank' : undefined}
          rel={p.link.startsWith('http') ? 'noopener noreferrer' : undefined}
          className={`project-card reveal reveal-d${i + 1}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div className="proj-left">
            <div className="proj-meta">
              <span className="proj-index">/ {p.index}</span>
              <span className="proj-year">{p.year}</span>
            </div>
            <h3 className="proj-name">{p.name}</h3>
            <p className="proj-desc">{p.desc}</p>
            <div className="proj-stack">
              {p.stack.map((t) => (
                <span key={t} className="proj-chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="proj-right">
            <div className="proj-preview">
              <img
                src={p.image}
                alt={`${p.name} preview`}
                className="proj-preview-img"
                style={{
                  filter: p.imageFilter ?? 'none',
                  objectPosition: p.imagePosition ?? 'top left',
                }}
              />
            </div>
            <div className="proj-arrow-btn">
              <span>View Project</span>
              <span className="proj-arrow-glyph">↗</span>
            </div>
          </div>
        </a>
      ))}
      <span className="sec-num">.04</span>
    </section>
  );
}
