import { useEffect } from 'react';
import { useScene } from '@/store/scene';

/** Syncs prefers-reduced-motion into the scene store (and reacts to changes). */
export function useReducedMotionSync() {
  const setReducedMotion = useScene((s) => s.setReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [setReducedMotion]);
}
