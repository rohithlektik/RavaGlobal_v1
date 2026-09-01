import { useEffect } from 'react';
import { useScene, type DeviceTier } from '@/store/scene';

/**
 * Cheap capability probe -> 'high' | 'mid' | 'low'.
 * Drives DPR caps, scene object counts and the fallback ladder.
 */
function probeTier(): DeviceTier {
  if (typeof window === 'undefined') return 'high';

  const canvas = document.createElement('canvas');
  const gl =
    (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
    (canvas.getContext('webgl') as WebGLRenderingContext | null);
  if (!gl) return 'low';

  const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const dpr = window.devicePixelRatio || 1;
  const small = Math.min(window.innerWidth, window.innerHeight) < 560;

  if ((mobile && (cores <= 4 || mem <= 3)) || small) return 'low';
  if (mobile || cores <= 6 || mem <= 4 || dpr < 1.5) return 'mid';
  return 'high';
}

export function useDeviceTierSync() {
  const setTier = useScene((s) => s.setTier);
  useEffect(() => {
    setTier(probeTier());
  }, [setTier]);
}
