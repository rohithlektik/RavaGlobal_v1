import { Color } from 'three';

/**
 * Non-reactive channel for the scroll-driven background. SceneDirector writes
 * `phase` every frame from the hero cinematic progress; the Backdrop shader and
 * the fog / clear-colour read it and ease toward it. No React re-renders in the
 * hot path.
 *
 *   phase 0.00  ->  near-black navy  (camera inside the sealed container)
 *   phase 0.35  ->  deep navy        (interior lights coming up)
 *   phase 0.62  ->  blue atmosphere  (doors open, camera exits)
 *   phase 0.85  ->  mid navy         (exterior product view)
 *   phase 1.00  ->  dark navy        (settled / hand-off to the statement)
 */
export const bgState = {
  /** 0..1 position along the gradient ramp (see STOPS below) */
  phase: 0,
  /** exterior studio-light factor: 0 while inside the sealed container, 1 outside */
  ext: 0,
  /** tone-mapping exposure — lifted while inside so the dark cold store reads
   *  against the near-black backdrop, back to 1 outside */
  exposure: 1.9,
  /** 0..1 — the cinematic navy backdrop lifts to a soft light-blue product
   *  stage as the hero compresses into the square (see stageState.tone) */
  light: 0,
};

// the square product stage lightens to this soft cool blue behind the container
const LIGHT_TOP = new Color('#d6e2ef');
const LIGHT_BOT = new Color('#bccddf');

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __bg?: typeof bgState }).__bg = bgState;
}

interface Stop {
  at: number;
  top: Color;
  bot: Color;
}

// every colour is defined here (never only inside a branch) so the ramp is
// continuous end to end — no hard jumps, no repaint seams.
const STOPS: Stop[] = [
  { at: 0.0, top: new Color('#0a1322'), bot: new Color('#05080f') },
  { at: 0.34, top: new Color('#152740'), bot: new Color('#0b1524') },
  { at: 0.62, top: new Color('#33547d'), bot: new Color('#172b43') },
  { at: 0.84, top: new Color('#20395a'), bot: new Color('#111f33') },
  { at: 1.0, top: new Color('#16283f'), bot: new Color('#0e1c2e') },
];

/** Write the interpolated top / bottom gradient colours for `phase` into the
 *  two provided Color instances (no allocation in the frame loop). */
export function bgColors(phase: number, outTop: Color, outBot: Color): void {
  const p = phase < 0 ? 0 : phase > 1 ? 1 : phase;
  let i = 0;
  while (i < STOPS.length - 2 && p > STOPS[i + 1].at) i++;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  const t = (p - a.at) / (b.at - a.at);
  outTop.copy(a.top).lerp(b.top, t);
  outBot.copy(a.bot).lerp(b.bot, t);
  // lift toward the light product stage as the square forms
  const l = bgState.light < 0 ? 0 : bgState.light > 1 ? 1 : bgState.light;
  if (l > 0) {
    outTop.lerp(LIGHT_TOP, l);
    outBot.lerp(LIGHT_BOT, l);
  }
}
