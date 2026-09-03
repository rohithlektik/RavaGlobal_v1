let cached: boolean | null = null;

/**
 * Cheap one-off check for a usable WebGL context. Cached after the first call.
 * Used to decide whether the 3D coverage globe can render or a static SVG
 * fallback should be shown instead.
 */
export function hasWebGL(): boolean {
  if (cached !== null) return cached;
  if (typeof window === 'undefined') return (cached = false);
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    cached = !!gl;
  } catch {
    cached = false;
  }
  return cached;
}
