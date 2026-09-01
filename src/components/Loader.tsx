import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { useScene } from '@/store/scene';
import { Logo } from './Logo';

/**
 * Short, purposeful loading sequence: RAVA mark + a thin RAVA-blue progress
 * indicator. Resolves on real asset progress (or a 2.2s ceiling) then hands off.
 */
export function Loader() {
  const { progress, active } = useProgress();
  const setLoaded = useScene((s) => s.setLoaded);
  const [done, setDone] = useState(false);
  const shown = useRef(Math.max(progress, 6));

  // ease the number upward so it never stalls or snaps
  const [display, setDisplay] = useState(6);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      shown.current += (Math.max(progress, shown.current) - shown.current) * 0.12 + 0.4;
      const v = Math.min(100, shown.current);
      setDisplay(v);
      if (v >= 99.5 && !active) {
        setTimeout(() => {
          setDone(true);
          setLoaded(true);
        }, 240);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const ceiling = setTimeout(() => {
      setDone(true);
      setLoaded(true);
    }, 2600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(ceiling);
    };
  }, [progress, active, setLoaded]);

  return (
    <div className={`loader${done ? ' is-done' : ''}`} role="status" aria-live="polite">
      <div className="loader__inner">
        <Logo height={72} />
        <div className="loader__bar">
          <div className="loader__fill" style={{ width: `${display}%` }} />
        </div>
        <span className="loader__pct">
          {done ? 'Enter' : `Loading — ${Math.round(display)}%`}
        </span>
      </div>
    </div>
  );
}
