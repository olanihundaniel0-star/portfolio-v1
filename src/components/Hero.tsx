import { useEffect, useState } from 'react';

export default function Hero() {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  return (
    <section id="hero" className={fontsReady ? 'fonts-ready' : ''}>
      <div className="hero-bg-text">NIFE</div>
      <p className="hero-eyebrow">I am</p>
      <span className="hero-name">NIFE</span>
      <span className="hero-name-outline">BUILD</span>
      <p className="hero-sub">
        Olanihun Daniel Oluwanifemi &nbsp;—&nbsp; CS Undergrad &amp; AI Builder
      </p>
      <div className="hero-divider">
        <div className="hero-divider-line" />
        <span className="hero-divider-text">Currently</span>
        <div className="hero-divider-line" />
      </div>
      <div className="hero-tags">
        {[
          '200L · UNILAG',
          'AI Problem Solver',
          'Building with React & NestJS',
          'Open to Work',
        ].map((t) => (
          <span key={t} className="hero-tag">
            {t}
          </span>
        ))}
      </div>
      <div className="scroll-indicator">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
      <span className="sec-num">.01</span>
    </section>
  );
}
