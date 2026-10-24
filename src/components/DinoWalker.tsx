import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SPEED = 145;
const STRIDE = 30;
const SCALE = 0.7;
const SPRITE_W = 44;
const TURN_DURATION = 0.4;
const JUMP_RADIUS = 52;
const JUMP_HEIGHT = 56;
const CACTI = [
  { position: 26, viewBox: '0 0 20 24', path: 'M8 4h4v2h2v18H6V6h2zM0 12h4v6h2v4H2v-2H0zM16 8h4v10h-2v2h-4v-4h2z' },
  { position: 52, viewBox: '0 0 18 36', path: 'M8 0h4v2h2v34H6V2h2zM0 8h4v12h2v4H2v-2H0zM16 14h2v14h-4v-4h2z' },
  { position: 78, viewBox: '0 0 34 26', path: 'M6 0h4v2h2v24H4V2h2zM0 10h2v6h2v4H0zM14 6h4v12h-6v-4h2zM24 8h4v2h2v16h-8V10h2zM18 16h4v6h-4zM32 12h2v10h-4v-4h2z' },
];

export default function DinoWalker() {
  const navigate = useNavigate();
  const btnRef = useRef<HTMLButtonElement>(null);
  const spriteRef = useRef<HTMLSpanElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const obstaclesRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    const sprite = spriteRef.current;
    const shadow = shadowRef.current;
    const track = btn?.parentElement;
    if (!btn || !sprite || !shadow || !track) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let maxX = Math.max(0, track.clientWidth - SPRITE_W);
    let x = Math.min(32, maxX);
    let direction = 1;
    let speed = 0;
    let phase = 0;
    let elapsed = 0;
    let turn = -1;
    let hop = 1;
    let hovered = false;
    let focused = false;
    let pressed = false;
    let pointer: { x: number; y: number } | null = null;
    let jumpOffset = 0;
    let visible = false;
    let raf = 0;
    let last = 0;
    let obstacles: number[] = [];

    const render = (dt: number) => {
      const reduced = motionPreference.matches;
      const pointerDistance = pointer ? Math.min(
        Math.hypot(pointer.x - x - SPRITE_W / 2, pointer.y + 24),
        Math.hypot(pointer.x - x - SPRITE_W / 2, pointer.y + 24 + jumpOffset),
      ) : Infinity;
      const paused = hovered || focused || pressed || pointerDistance < 42;
      elapsed += dt;
      let facing = direction;
      let bounce = 0;
      let squash = 0;

      if (!reduced) {
        if (paused) {
          speed = 0;
          hop = Math.min(1, hop + dt / 0.55);
          bounce = Math.sin(hop * Math.PI) * 12;
          squash = Math.sin(hop * Math.PI * 2) * 0.06;
        } else if (turn >= 0) {
          turn = Math.min(1, turn + dt / TURN_DURATION);
          const progress = turn * turn * (3 - 2 * turn);
          facing = direction * Math.cos(progress * Math.PI);
          squash = Math.sin(turn * Math.PI) * 0.05;
          if (turn === 1) { direction *= -1; facing = direction; turn = -1; }
        } else {
          const distance = direction > 0 ? maxX - x : x;
          const approachSpeed = Math.min(1, Math.max(0.3, (pointerDistance - 42) / 90));
          const targetSpeed = SPEED * Math.min(1, Math.max(0.16, distance / 58)) * approachSpeed;
          speed += (targetSpeed - speed) * (1 - Math.exp(-dt * 7));
          x = Math.max(0, Math.min(maxX, x + direction * speed * dt));
          phase += (speed * dt / STRIDE) * Math.PI * 2;
          bounce = Math.abs(Math.sin(phase)) * 1.6 * (speed / SPEED);
          squash = Math.sin(phase * 2) * 0.025 * (speed / SPEED);
          if (maxX > 0 && (direction > 0 ? maxX - x : x) < 0.5) {
            x = direction > 0 ? maxX : 0;
            speed = 0;
            turn = 0;
          }
        }
      }

      // Tie the jump to distance, so it clears the same obstacle in either
      // direction and stays safely airborne when the visitor catches it.
      const center = x + SPRITE_W / 2;
      const obstacleJump = reduced ? 0 : obstacles.reduce((height, obstacle) => {
        const distance = Math.abs(center - obstacle);
        if (distance >= JUMP_RADIUS) return height;
        return Math.max(height, JUMP_HEIGHT * (1 - (distance / JUMP_RADIUS) ** 2));
      }, 0);
      if (obstacleJump > 0) {
        bounce = obstacleJump;
        squash = -0.035 * Math.sin((obstacleJump / JUMP_HEIGHT) * Math.PI);
      }
      jumpOffset = bounce;
      const walking = !reduced && !paused && turn < 0 && speed > 5 && obstacleJump === 0;
      const frameIndex = walking ? 1 + (Math.floor(phase / Math.PI) % 2) : 0;
      const breathing = !reduced && !walking ? Math.sin(elapsed * 2.4) * 0.012 : 0;
      const lean = walking ? direction * 2 * (speed / SPEED) : 0;
      btn.style.transform = `translate3d(${x}px, 0, 0)`;
      btn.style.setProperty('--hint-offset', `${Math.max(60 - x, Math.min(0, maxX - x - 60))}px`);
      sprite.style.backgroundPositionX = `${-frameIndex * SPRITE_W}px`;
      sprite.style.transform = `translateY(${-bounce}px) rotate(${lean}deg) scale(${facing * SCALE * (1 + squash)}, ${SCALE * (1 - squash + breathing)})`;
      shadow.style.transform = `translateX(-50%) scaleX(${Math.max(0.3, 1 - bounce / 75)})`;
      shadow.style.opacity = `${Math.max(0.06, 0.24 - bounce / 250)}`;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      render(dt);
      raf = requestAnimationFrame(tick);
    };
    const syncAnimation = () => {
      cancelAnimationFrame(raf);
      render(0);
      const running = visible && !document.hidden && !motionPreference.matches;
      if (skyRef.current) skyRef.current.dataset.running = String(running);
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    const greet = () => { if (!hovered && !focused) hop = 0; };
    const enter = () => { greet(); hovered = true; };
    const leave = () => { hovered = false; };
    const focus = () => { greet(); focused = true; };
    const blur = () => { focused = false; };
    const approach = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !visible) return;
      const rect = track.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const clearPointer = () => { pointer = null; };
    const press = (event: PointerEvent) => {
      pressed = true;
      btn.setPointerCapture(event.pointerId);
    };
    const release = () => { pressed = false; };
    const resizeObserver = new ResizeObserver(() => {
      maxX = Math.max(0, track.clientWidth - SPRITE_W);
      x = Math.min(x, maxX);
      const trackLeft = track.getBoundingClientRect().left;
      obstacles = Array.from(obstaclesRef.current?.querySelectorAll('.dino-cactus') ?? []).map((cactus) => {
        const rect = cactus.getBoundingClientRect();
        return rect.left + rect.width / 2 - trackLeft;
      });
      render(0);
    });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimation();
    }, { rootMargin: '60px' });
    resizeObserver.observe(track);
    visibilityObserver.observe(btn);
    btn.addEventListener('pointerenter', enter);
    btn.addEventListener('pointerleave', leave);
    btn.addEventListener('focus', focus);
    btn.addEventListener('blur', blur);
    btn.addEventListener('pointerdown', press);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('lostpointercapture', release);
    window.addEventListener('pointermove', approach, { passive: true });
    window.addEventListener('scroll', clearPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', clearPointer);
    document.addEventListener('visibilitychange', syncAnimation);
    motionPreference.addEventListener('change', syncAnimation);
    render(0);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      btn.removeEventListener('pointerenter', enter);
      btn.removeEventListener('pointerleave', leave);
      btn.removeEventListener('focus', focus);
      btn.removeEventListener('blur', blur);
      btn.removeEventListener('pointerdown', press);
      btn.removeEventListener('pointerup', release);
      btn.removeEventListener('pointercancel', release);
      btn.removeEventListener('lostpointercapture', release);
      window.removeEventListener('pointermove', approach);
      window.removeEventListener('scroll', clearPointer);
      document.documentElement.removeEventListener('pointerleave', clearPointer);
      document.removeEventListener('visibilitychange', syncAnimation);
      motionPreference.removeEventListener('change', syncAnimation);
    };
  }, []);

  return (
    <>
    <div ref={skyRef} className="dino-sky" aria-hidden="true" data-running="false">
      <span className="dino-meteor" />
      <span className="dino-meteor" />
      <span className="dino-meteor" />
      <span className="dino-meteor" />
    </div>
    <div ref={obstaclesRef} className="dino-obstacles" aria-hidden="true">
      {CACTI.map((cactus, index) => (
        <svg
          key={cactus.position}
          className={`dino-cactus dino-cactus-${index + 1}`}
          style={{ left: `${cactus.position}%` }}
          viewBox={cactus.viewBox}
          fill="currentColor"
          shapeRendering="crispEdges"
          focusable="false"
        >
          <path d={cactus.path} />
        </svg>
      ))}
    </div>
    <button
      ref={btnRef}
      type="button"
      className="dino-walker"
      onClick={() => navigate('/wall')}
      aria-label="Catch the dino and visit the message wall"
      title="Catch me — message wall"
    >
      <span ref={shadowRef} className="dino-shadow" aria-hidden="true" />
      <span ref={spriteRef} className="dino-sprite" aria-hidden="true" />
      <span className="dino-hint" aria-hidden="true">catch me →</span>
    </button>
    </>
  );
}
