import { SECTIONS, SOCIAL_LINKS } from '../data/constants';

interface NavProps {
  active: number;
  onDotClick: (id: string) => void;
  scrolled: boolean;
}

export default function Nav({ active, onDotClick, scrolled }: NavProps) {
  return (
    <>
      <nav className={scrolled ? 'scrolled' : ''}>
        <a href="#hero" className="nav-logo">
          NI
          <br />
          FE
          <small>Portfolio</small>
        </a>
        <div className="nav-links">
          {['about', 'skills', 'projects', 'contact'].map((s) => (
            <a key={s} href={`#${s}`}>
              {s}
            </a>
          ))}
        </div>
      </nav>

      <div className="sidebar">
        <a href={SOCIAL_LINKS.github} target="_blank" rel="noreferrer">
          Github
        </a>
        <div className="sidebar-line" />
        <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer">
          Twitter
        </a>
        <div className="sidebar-line" />
        <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer">
          Linkedin
        </a>
      </div>

      <div className="nav-dots">
        {SECTIONS.map((s, i) => (
          <button
            key={s}
            className={`nav-dot${active === i ? ' active' : ''}`}
            onClick={() => onDotClick(s)}
          />
        ))}
      </div>
    </>
  );
}
