import { useEffect, useRef } from 'react';

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ mx: 0, my: 0, rx: 0, ry: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      pos.current.mx = e.clientX;
      pos.current.my = e.clientY;
    };
    document.addEventListener('mousemove', move);

    let raf: number;
    const tick = () => {
      const p = pos.current;
      p.rx += (p.mx - p.rx) * 0.13;
      p.ry += (p.my - p.ry) * 0.13;
      if (dotRef.current) {
        dotRef.current.style.left = p.mx + 'px';
        dotRef.current.style.top = p.my + 'px';
      }
      if (ringRef.current) {
        ringRef.current.style.left = p.rx + 'px';
        ringRef.current.style.top = p.ry + 'px';
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    const over = () => {
      dotRef.current?.classList.add('big');
      ringRef.current?.classList.add('big');
    };
    const out = () => {
      dotRef.current?.classList.remove('big');
      ringRef.current?.classList.remove('big');
    };

    const attachListeners = () => {
      document
        .querySelectorAll('a,button,.project-card,.skill-card,.nav-dot')
        .forEach((el) => {
          el.addEventListener('mouseenter', over);
          el.addEventListener('mouseleave', out);
        });
    };

    // Attach after a short delay to ensure DOM is ready
    const timer = setTimeout(attachListeners, 500);

    return () => {
      document.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <div className="cursor" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  );
}
