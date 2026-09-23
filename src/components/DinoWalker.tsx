import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SPEED = 70;
const STRIDE = 26;
const BOB = 3;
const SCALE = 0.7;
const SPRITE_W = 44;
const FRAMES = 3;
const DINO_W = Math.ceil(SPRITE_W * SCALE);

export default function DinoWalker() {
  const navigate = useNavigate();
  const btnRef = useRef<HTMLButtonElement>(null);
  const spriteRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    const sprite = spriteRef.current;
    if (!btn || !sprite) return undefined;
    const track = btn.parentElement;
    if (!track) return undefined;
    if (
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      sprite.style.transform = `scale(${SCALE}, ${SCALE})`;
      return undefined;
    }

    let maxX = Math.max(0, track.clientWidth - DINO_W);
    const observer = new ResizeObserver(() => {
      maxX = Math.max(0, track.clientWidth - DINO_W);
    });
    observer.observe(track);

    let raf = 0;
    let last = performance.now();
    let x = 0;
    let dir = 1;
    let phase = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      x += dir * SPEED * dt;
      if (x >= maxX) {
        x = maxX;
        dir = -1;
      } else if (x <= 0) {
        x = 0;
        dir = 1;
      }
      phase += ((SPEED * dt) / STRIDE) * Math.PI * 2;
      const cycle = (phase / (Math.PI * 2)) % 1;
      const frameIdx = Math.floor(cycle * FRAMES) % FRAMES;
      const bobY = -Math.abs(Math.sin(phase)) * BOB;
      const lean = dir * (4 + Math.sin(phase * 2) * 1.5);
      btn.style.transform = `translate3d(${x.toFixed(1)}px, ${bobY.toFixed(2)}px, 0)`;
      sprite.style.backgroundPositionX = `${-frameIdx * SPRITE_W}px`;
      sprite.style.transform = `rotate(${lean.toFixed(2)}deg) scale(${(dir * SCALE).toFixed(2)}, ${SCALE})`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <button
      ref={btnRef}
      type="button"
      className="dino-walker"
      onClick={() => navigate('/wall')}
      aria-label="Catch the dino and visit the message wall"
      title="Catch me — message wall"
    >
      <span ref={spriteRef} className="dino-sprite" aria-hidden="true" />
      <span className="dino-hint" aria-hidden="true">
        catch me →
      </span>
    </button>
  );
}
