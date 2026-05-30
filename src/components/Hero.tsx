import { useEffect, useState } from 'react';
import { PROFILE } from '../data/profile';

const CURRENT_TAGS = [
  '200L - UNILAG',
  'Software Engineer',
  'Problem Solver',
  'CS Undergrad',
  'Open to Work',
];

export default function Hero() {
  const [fontsReady, setFontsReady] = useState(false);
  const hasPortrait = PROFILE.portraitSrc.trim().length > 0;

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  return (
    <section id="hero" className={fontsReady ? 'fonts-ready' : ''}>
      <div className="hero-bg-text">NIFE</div>

      <div className="hero-copy">
        <p className="hero-eyebrow">I am</p>
        <span className="hero-name">NIFE</span>
        <span className="hero-name-outline" data-text="BUILDS">
          BUILDS
          <span className="hero-build-snippet snippet-a" aria-hidden="true">
            {'<Hero />'}
          </span>
          <span className="hero-build-snippet snippet-b" aria-hidden="true">
            {'const solve = ship();'}
          </span>
          <span className="hero-build-snippet snippet-c" aria-hidden="true">
            {'ideas.map(build)'}
          </span>
          <span className="hero-build-snippet snippet-d" aria-hidden="true">
            {'{ craft: true }'}
          </span>
        </span>
        <p className="hero-sub">
          Olanihun Daniel Oluwanifemi &nbsp;&mdash;&nbsp; Software Engineer,
          Problem Solver &amp; CS Undergrad
        </p>
        <div className="hero-divider">
          <div className="hero-divider-line" />
          <span className="hero-divider-text">Currently</span>
          <div className="hero-divider-line" />
        </div>
        <div className="hero-tags">
          {CURRENT_TAGS.map((tag) => (
            <span key={tag} className="hero-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <figure
        className={`hero-portrait ${hasPortrait ? 'has-image' : 'is-placeholder'}`}
        aria-hidden={hasPortrait ? undefined : true}
      >
        <div className="hero-portrait-media">
          {hasPortrait ? (
            <img src={PROFILE.portraitSrc} alt={PROFILE.portraitAlt} />
          ) : (
            <div className="hero-portrait-placeholder" />
          )}
        </div>
        <span className="hero-float-glyph hero-float-tag" aria-hidden="true">
          {'</>'}
        </span>
        <span className="hero-float-glyph hero-float-braces" aria-hidden="true">
          {'{}'}
        </span>
      </figure>

      <div className="scroll-indicator">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
      <span className="sec-num">.01</span>
    </section>
  );
}
