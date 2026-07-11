import { useCallback, useEffect, type CSSProperties } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import { TECH_STACK_ROWS, type TechItem, type TechStackRow } from '../data/skills';

const REPEAT_COUNT = 3;
type MarqueeStyle = CSSProperties & { '--marquee-duration': string };

function repeatedItems(items: TechItem[]) {
  return Array.from({ length: REPEAT_COUNT }, () => items).flat();
}

function TechStrip({ row, index }: { row: TechStackRow; index: number }) {
  const repeated = repeatedItems(row.items);
  const isRight = row.direction === 'right';
  const controls = useAnimationControls();

  const startMarquee = useCallback(() => {
    controls.start({
      x: isRight ? ['-33.333%', '0%'] : ['0%', '-33.333%'],
      transition: {
        duration: row.duration,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop',
      },
    });
  }, [controls, isRight, row.duration]);

  useEffect(() => {
    startMarquee();

    return () => {
      controls.stop();
    };
  }, [controls, startMarquee]);

  return (
    <div className={`tech-row reveal reveal-d${index + 2}`}>
      <div className={`tech-row-label ${isRight ? 'is-right' : ''}`}>
        {!isRight && <span>{row.label}</span>}
        <div className="tech-row-rule" />
        {isRight && <span>{row.label}</span>}
      </div>

      <div
        className={`tech-marquee is-${row.direction}`}
        onMouseEnter={() => controls.stop()}
        onMouseLeave={startMarquee}
      >
        <span className="sr-only">
          {row.label}: {row.items.map((item) => item.name).join(', ')}
        </span>
        <motion.div
          className="tech-marquee-track"
          initial={{ x: isRight ? '-33.333%' : '0%' }}
          animate={controls}
          style={{ '--marquee-duration': `${row.duration}s` } as MarqueeStyle}
          aria-hidden="true"
        >
          {repeated.map((item, itemIndex) => (
            <div className="tech-item" key={`${item.name}-${itemIndex}`}>
              <item.Icon className="tech-item-icon" />
              <span className="tech-item-name">{item.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="tools-section">
      <p className="sec-label reveal">Tools &amp; Technologies</p>

      <div className="tools-intro reveal reveal-d1">
        <h2 className="tools-headline">Stack I use to build</h2>
        <p className="tools-copy">
          Frontend interfaces, API systems, AI integrations, and product
          tooling that help ideas move from rough sketches into shipped work.
        </p>
      </div>

      <div className="tech-stack-rows">
        {TECH_STACK_ROWS.map((row, index) => (
          <TechStrip key={row.label} row={row} index={index} />
        ))}
      </div>

      <span className="sec-num">.03</span>
    </section>
  );
}
