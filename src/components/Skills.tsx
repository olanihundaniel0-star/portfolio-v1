import { useState, useEffect, useRef } from 'react';
import { SKILLS } from '../data/skills';

export default function Skills() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="skills" ref={ref}>
      <p className="sec-label reveal">Skills &amp; Tools</p>
      <div className="skills-grid">
        {SKILLS.map((s, i) => (
          <div
            key={s.name}
            className={`skill-card reveal reveal-d${(i % 4) + 1}`}
            data-index={`0${i + 1}`}
          >
            <span className="skill-card-name">{s.name}</span>
            <span className="skill-card-type">{s.type}</span>
            <div className="skill-bar">
              <div
                className="skill-fill"
                style={{ width: visible ? `${s.level}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
      <span className="sec-num">.03</span>
    </section>
  );
}
