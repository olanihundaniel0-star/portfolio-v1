import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react';

export interface SignaturePadHandle {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string | null;
}

const W = 640;
const H = 240;

const SignaturePad = forwardRef<SignaturePadHandle>(
  function SignaturePad(_, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingRef = useRef(false);
    const emptyRef = useRef(true);
    const lastRef = useRef({ x: 0, y: 0 });

    useImperativeHandle(
      ref,
      () => ({
        clear() {
          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.getContext('2d')?.clearRect(0, 0, W, H);
          emptyRef.current = true;
        },
        isEmpty() {
          return emptyRef.current;
        },
        toDataURL() {
          const canvas = canvasRef.current;
          if (!canvas || emptyRef.current) return null;
          const small = document.createElement('canvas');
          small.width = 320;
          small.height = 120;
          small.getContext('2d')?.drawImage(canvas, 0, 0, 320, 120);
          return small.toDataURL('image/png');
        }
      }),
      []
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return undefined;
      const ctx = canvas.getContext('2d');
      if (!ctx) return undefined;
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const pos = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: ((e.clientX - rect.left) / rect.width) * W,
          y: ((e.clientY - rect.top) / rect.height) * H
        };
      };

      const onDown = (e: PointerEvent) => {
        e.preventDefault();
        canvas.setPointerCapture(e.pointerId);
        const p = pos(e);
        lastRef.current = p;
        drawingRef.current = true;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + 0.1, p.y + 0.1);
        ctx.stroke();
        emptyRef.current = false;
      };

      const onMove = (e: PointerEvent) => {
        if (!drawingRef.current) return;
        e.preventDefault();
        const p = pos(e);
        ctx.beginPath();
        ctx.moveTo(lastRef.current.x, lastRef.current.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        lastRef.current = p;
      };

      const onUp = () => {
        drawingRef.current = false;
      };

      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);

      return () => {
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointercancel', onUp);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="sig-canvas"
        width={W}
        height={H}
        aria-label="Draw your signature or doodle"
      />
    );
  }
);

export default SignaturePad;
