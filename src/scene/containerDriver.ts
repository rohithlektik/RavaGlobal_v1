/**
 * Shared mutable driver for the RAVA container. The scene director (SceneCanvas)
 * writes to this every frame; <RavaContainer> reads it every frame. No React
 * re-renders in the hot path.
 */
export interface ContainerDriver {
  /** doors: 0 = sealed, 1 = fully open */
  doorOpen: number;
  /** exterior walls dissolve for the cutaway / interior push: 0 solid, 1 gone */
  xray: number;
  /** running machinery: fans + airflow + controller glow */
  power: number;
  /** logo decal resolve: 0 hidden, 1 crisp */
  logoReveal: number;
  /** interior lift used in the hero -> world handoff */
  interior: number;
}

export const createContainerDriver = (): ContainerDriver => ({
  doorOpen: 0,
  xray: 0,
  power: 0,
  logoReveal: 0,
  interior: 0,
});
