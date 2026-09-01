import { Color } from 'three';

/**
 * The 3D world never leaves the RAVA blue system. NO black — the darkest
 * value is a deep RAVA navy. Every material, light and wash is picked here.
 */
export const RAVA = {
  white: '#ffffff',
  pale: '#e8f4fb',
  mist: '#cfe6f5',
  light: '#8cc9eb', // PANTONE 297 U
  sky: '#5c9fd0',
  blue: '#3b5070', // PANTONE 295 U — primary
  deep: '#29405f',
  navy: '#1d3149',
  abyss: '#162740', // darkest — still unmistakably blue
} as const;

export const col = (hex: string) => new Color(hex);

/** Per-section environment tints — a visible shift, all inside the blue progression. */
export const ENVIRONMENTS = {
  neutral: { fog: '#1d3149', key: RAVA.pale, rim: RAVA.light, ground: RAVA.deep, top: '#2f4a6b' },
  cold: { fog: '#183a55', key: RAVA.mist, rim: RAVA.light, ground: '#1f4467', top: '#2c5680' },
  pharma: { fog: '#20415d', key: RAVA.white, rim: RAVA.sky, ground: '#274d6d', top: '#35618a' },
  construction: { fog: '#243449', key: '#e6eef6', rim: RAVA.sky, ground: '#2c4360', top: '#3a5578' },
  emergency: { fog: '#152c44', key: RAVA.light, rim: RAVA.mist, ground: '#1c3a58', top: '#294f76' },
  logistics: { fog: '#1a3a58', key: RAVA.pale, rim: RAVA.light, ground: '#204866', top: '#305d84' },
} as const;

export type EnvironmentKey = keyof typeof ENVIRONMENTS;
