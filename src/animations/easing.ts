/** Shared easing + small interpolation helpers. Heavy, precise, intentional. */

export const easing = {
  outQuint: (t: number) => 1 - Math.pow(1 - t, 5),
  inOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  outExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
};

export const clamp = (v: number, min = 0, max = 1) =>
  v < min ? min : v > max ? max : v;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent damping toward a target. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

/** Remap x from [inMin,inMax] to [0,1], clamped. */
export const range = (x: number, inMin: number, inMax: number) =>
  clamp((x - inMin) / (inMax - inMin));

/** Remap + ease in one call. */
export const phase = (
  x: number,
  inMin: number,
  inMax: number,
  ease: (t: number) => number = easing.inOutSine,
) => ease(range(x, inMin, inMax));
