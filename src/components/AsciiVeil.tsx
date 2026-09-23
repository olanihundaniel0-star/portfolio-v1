import { useEffect, useRef } from 'react';

const DEFAULT_CHARS = '@%#*+=-:. ';
const DPR_CAP = 2;
const LINE_HEIGHT = 0.88;

interface AsciiVeilProps {
  text?: string;
  fontFamily?: string;
  cellSize?: number;
  speed?: number;
  hovered?: boolean;
  className?: string;
}

export default function AsciiVeil({
  text = 'BUILD',
  fontFamily = '"Bebas Neue", sans-serif',
  cellSize = 6,
  speed = 1,
  hovered = false,
  className = ''
}: AsciiVeilProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoveredRef = useRef(hovered);
  const progressRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    let width = 1;
    let height = 1;
    let cols = 0;
    let rows = 0;
    let grid: Float32Array | null = null;
    let raf = 0;
    let last = performance.now();
    const mask = document.createElement('canvas');
    const maskContext = mask.getContext('2d');
    if (!maskContext) return undefined;
    const probe = document.createElement('canvas').getContext('2d');
    if (!probe) return undefined;

    const buildGrid = () => {
      const rect = wrapper.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const cellCss = Math.max(2, Math.round(cellSize));
      const cw = Math.max(1, Math.round(width * dpr));
      const ch = Math.max(1, Math.round(height * dpr));
      canvas.width = cw;
      canvas.height = ch;
      cols = Math.max(1, Math.ceil(width / cellCss));
      rows = Math.max(1, Math.ceil(height / cellCss));

      const fontSize = height / LINE_HEIGHT;
      const fontPx = fontSize * dpr;
      probe.font = `400 ${fontPx}px ${fontFamily}`;
      const m = probe.measureText(text);
      const ascent = m.fontBoundingBoxAscent || m.actualBoundingBoxAscent || fontPx;
      const descent = m.fontBoundingBoxDescent || m.actualBoundingBoxDescent || 0;
      const halfLeading = (LINE_HEIGHT * fontPx - (ascent + descent)) / 2;
      const baselineFromTop = ascent + halfLeading;

      mask.width = cw;
      mask.height = ch;
      maskContext.clearRect(0, 0, cw, ch);
      maskContext.fillStyle = '#000';
      maskContext.fillRect(0, 0, cw, ch);
      maskContext.textAlign = 'left';
      maskContext.textBaseline = 'alphabetic';
      maskContext.font = `400 ${fontPx}px ${fontFamily}`;
      try {
        maskContext.letterSpacing = `${4 * dpr}px`;
      } catch {
        /* older browsers */
      }
      maskContext.fillStyle = '#fff';
      maskContext.fillText(text, 0, baselineFromTop);

      const data = maskContext.getImageData(0, 0, cw, ch).data;
      const sample = (x: number, y: number) => {
        const px = Math.min(cw - 1, Math.max(0, Math.round(x)));
        const py = Math.min(ch - 1, Math.max(0, Math.round(y)));
        return data[(py * cw + px) * 4] / 255;
      };
      grid = new Float32Array(cols * rows);
      const step = (cellCss * dpr) / 3;
      for (let ry = 0; ry < rows; ry++) {
        for (let rx = 0; rx < cols; rx++) {
          const cx = (rx + 0.5) * cellCss * dpr;
          const cy = (ry + 0.5) * cellCss * dpr;
          let min = 1;
          for (let oy = -1; oy <= 1; oy++) {
            for (let ox = -1; ox <= 1; ox++) {
              const v = sample(cx + ox * step, cy + oy * step);
              if (v < min) min = v;
            }
          }
          grid[ry * cols + rx] = min;
        }
      }
    };

    const draw = () => {
      const cell = Math.max(2, Math.round(cellSize)) * dpr;
      const progress = progressRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (progress <= 0.01 || !grid || grid.length !== cols * rows) return;
      const t = timeRef.current;
      const charPx = cell * 0.8;
      ctx.font = `${charPx}px "JetBrains Mono", "Fira Code", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let ry = 0; ry < rows; ry++) {
        for (let rx = 0; rx < cols; rx++) {
          const alpha = grid[ry * cols + rx];
          if (alpha <= 0.5) continue;
          const inside = Math.min(1, (alpha - 0.5) * 2);
          const life =
            0.5 + 0.5 * Math.sin(t * 1.9 + rx * 0.31 + ry * 0.17) + 0.25 * Math.sin(t * 3.3 - rx * 0.24 + ry * 0.21);
          const vibrance = 0.35 + 0.65 * Math.abs(life);
          const shifted = rx + ry + Math.floor(t * 2.2);
          const index =
            Math.floor(Math.abs(Math.sin(shifted * 0.37 + vibrance * 1.4)) * DEFAULT_CHARS.length) %
            DEFAULT_CHARS.length;
          const alphaOut = Math.min(1, progress * inside * vibrance * 1.1);
          ctx.fillStyle = `rgba(238,238,238,${alphaOut.toFixed(3)})`;
          ctx.fillText(DEFAULT_CHARS[index], (rx + 0.5) * cell, (ry + 0.5) * cell);
        }
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      timeRef.current += dt * speed;
      const target = hoveredRef.current ? 1 : 0;
      progressRef.current += (target - progressRef.current) * (1 - Math.exp(-dt / 0.16));
      draw();
      raf = requestAnimationFrame(frame);
    };

    const observer = new ResizeObserver(() => {
      buildGrid();
    });
    observer.observe(wrapper);

    document.fonts?.ready.then(buildGrid);

    buildGrid();
    last = performance.now();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [text, fontFamily, cellSize, speed]);

  return (
    <div ref={wrapperRef} className={`ascii-veil ${className}`.trim()}>
      <canvas ref={canvasRef} />
    </div>
  );
}