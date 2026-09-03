import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { useScene } from '@/store/scene';
import { Logo } from './Logo';

/**
 * Short, purposeful loading sequence: RAVA mark + a thin RAVA-blue progress
 * indicator. Completion is gated on the REAL asset progress (the container .glb
 * + its textures, tracked by drei's loading manager) so the intro never starts
 * against an empty scene. A long ceiling is only a stall guard. The on-screen
 * number is eased purely for looks and never gates completion.
 */
export function Loader() {
  const { progress, active } = useProgress();
  const setLoaded = useScene((s) => s.setLoaded);
  const [done, setDone] = useState(false);

  // real readiness — assets fully parsed and nothing left in flight
  const ready = progress >= 99.5 && !active;

  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => {
      setDone(true);
      setLoaded(true);
    }, 220);
    return () => clearTimeout(id);
  }, [ready, setLoaded]);

  // stall guard — if the loading manager never settles (a 404 texture, say),
  // release anyway well after a genuine slow load would have finished.
  useEffect(() => {
    const id = setTimeout(() => {
      setDone(true);
      setLoaded(true);
    }, 14000);
    return () => clearTimeout(id);
  }, [setLoaded]);

  // eased on-screen number — cosmetic only
  const shown = useRef(6);
  const [display, setDisplay] = useState(6);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const target = done ? 100 : Math.max(progress, shown.current);
      shown.current += (target - shown.current) * 0.14 + 0.5;
      setDisplay(Math.min(100, shown.current));
      if (shown.current < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, done]);

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
