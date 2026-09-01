import { create } from 'zustand';

export type DeviceTier = 'high' | 'mid' | 'low';
export type SectionId =
  | 'hero'
  | 'world'
  | 'solutions'
  | 'products'
  | 'industries'
  | 'rent-buy'
  | 'service'
  | 'coverage'
  | 'final';

interface SceneState {
  /** whole-document scroll progress 0..1 */
  scroll: number;
  /** per-section scrub progress 0..1, written by ScrollTrigger */
  sections: Record<string, number>;
  /** section currently occupying the viewport centre */
  active: SectionId;
  /** solution-finder step index, surfaced so the 3D can react */
  solutionStep: number;
  solutionChoice: string | null;

  loaded: boolean;
  menuOpen: boolean;
  tier: DeviceTier;
  reducedMotion: boolean;

  setScroll: (v: number) => void;
  setSection: (id: string, v: number) => void;
  setActive: (id: SectionId) => void;
  setSolution: (step: number, choice: string | null) => void;
  setLoaded: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setTier: (t: DeviceTier) => void;
  setReducedMotion: (v: boolean) => void;
}

export const useScene = create<SceneState>((set) => ({
  scroll: 0,
  sections: {},
  active: 'hero',
  solutionStep: 0,
  solutionChoice: null,

  loaded: false,
  menuOpen: false,
  tier: 'high',
  reducedMotion: false,

  setScroll: (v) => set({ scroll: v }),
  setSection: (id, v) =>
    set((s) => (s.sections[id] === v ? s : { sections: { ...s.sections, [id]: v } })),
  setActive: (id) => set((s) => (s.active === id ? s : { active: id })),
  setSolution: (step, choice) => set({ solutionStep: step, solutionChoice: choice }),
  setLoaded: (v) => set({ loaded: v }),
  setMenuOpen: (v) => set({ menuOpen: v }),
  setTier: (t) => set({ tier: t }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
}));

/** Non-reactive read for use inside useFrame. */
export const sceneState = () => useScene.getState();
export const sectionProgress = (id: string) => useScene.getState().sections[id] ?? 0;
