import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PROJECTS } from '../data/projects';

export default function Projects() {
  const [preview, setPreview] = useState<{ image: string; right: number } | null>(null);
  const reduceMotion = useReducedMotion();

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
          onMouseLeave={() => setPreview(null)}
          onFocus={(event) => {
            if (p.fullPreviewOnHover && window.matchMedia('(min-width: 961px)').matches) {
              const rect = event.currentTarget.getBoundingClientRect();
              setPreview({ image: p.image, right: Math.max(24, window.innerWidth - rect.right + 36) });
            }
          }}
          onBlur={() => setPreview(null)}
          onKeyDown={(event) => { if (event.key === 'Escape') setPreview(null); }}
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
            <div
              className={`proj-preview${p.fullPreviewOnHover ? ' proj-preview-cropped' : ''}`}
              onMouseEnter={(event) => {
                if (p.fullPreviewOnHover) {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setPreview({ image: p.image, right: Math.max(24, window.innerWidth - rect.right) });
                }
              }}
              onMouseLeave={() => setPreview(null)}
            >
              <img
                src={p.image}
                alt={`${p.name} preview`}
                className="proj-preview-img"
                loading="lazy"
                decoding="async"
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
      {createPortal(
        <AnimatePresence>
          {preview && (
            <div key={preview.image} className="proj-full-preview" style={{ right: preview.right }} aria-hidden="true">
              <motion.div
                className="proj-full-preview-frame"
                initial={reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 24, scale: 0.94, rotate: -1.5, clipPath: 'inset(32% 0% 32% 0% round 12px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0, clipPath: 'inset(0% 0% 0% 0% round 12px)' }}
                exit={reduceMotion
                  ? { opacity: 0, transition: { duration: 0.15 } }
                  : { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.28, ease: 'easeIn' } }}
                transition={{ duration: reduceMotion ? 0.15 : 0.95, ease: [0.16, 1, 0.3, 1], opacity: { duration: reduceMotion ? 0.15 : 0.35 } }}
              >
                <div className="proj-full-preview-caption"><span>See</span><span>App preview</span></div>
                <img src={preview.image} alt="" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
      <span className="sec-num">.04</span>
    </section>
  );
}
