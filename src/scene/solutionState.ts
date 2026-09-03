/**
 * Non-reactive channel for the "Find your RAVA solution" wizard. SolutionFinder
 * writes `reveal` — 0 while the user is still answering (the container is only a
 * faint outline behind the copy) and eases to 1 on the final "Recommended"
 * screen, when the real container is lit and revealed. SceneDirector reads it.
 */
export const solutionState = { reveal: 0 };
