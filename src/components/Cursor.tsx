import { useEffect, useRef } from 'react';
import { useScene } from '@/store/scene';

/**
 * Sophisticated custom cursor: a small dot with a trailing ring.
 * Ring expands on interactive elements; a directional arrow shows on CTAs.
 * Fine-pointer devices only; disabled under reduced motion.
 */
export function Cursor() {
  const reducedMotion = useScene((s) => s.reducedMotion);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.body.classList.add('has-custom-cursor');
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const rpos = { ...pos };
    let raf = 0;
    let hovering = false;

    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const el = (e.target as HTMLElement)?.closest?.(
        'a,button,[data-cursor],input,label,summary',
      ) as HTMLElement | null;
      hovering = !!el;
      const cta = el?.dataset.cursor === 'cta';
      ring.current?.classList.toggle('is-hover', hovering);
      ring.current?.classList.toggle('is-cta', !!cta);
    };
    const down = () => ring.current?.classList.add('is-down');
    const up = () => ring.current?.classList.remove('is-down');
    const leave = () => {
      dot.current?.style.setProperty('opacity', '0');
      ring.current?.style.setProperty('opacity', '0');
    };
    const enter = () => {
      dot.current?.style.setProperty('opacity', '1');
      ring.current?.style.setProperty('opacity', '1');
    };

    const tick = () => {
      rpos.x += (pos.x - rpos.x) * 0.18;
      rpos.y += (pos.y - rpos.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px,${pos.y}px,0) translate(-50%,-50%)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rpos.x}px,${rpos.y}px,0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('mouseleave', leave);
    document.addEventListener('mouseenter', enter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('mouseleave', leave);
      document.removeEventListener('mouseenter', enter);
      document.body.classList.remove('has-custom-cursor');
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    </>
  );
}
