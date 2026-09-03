/**
 * Non-reactive channel for the "square product stage" the hero compresses into.
 * <StageFrame> (DOM) writes `form` every scroll frame — 0 = full-bleed hero,
 * 1 = the square stage is fully formed. <SceneDirector> reads it to reframe the
 * still-live WebGL container into the stage without a cut. No React re-renders
 * in the hot path.
 */
export const stageState = {
  /** 0 = full-bleed hero, 1 = the square is fully formed (bar scale + camera reframe) */
  form: 0,
  /** 0 = navy cinematic, 1 = light product stage. Rises with `form` but does NOT
   *  fall on release, so the light tone hands cleanly to the light next section. */
  tone: 0,
};

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __stage?: typeof stageState }).__stage = stageState;
}
