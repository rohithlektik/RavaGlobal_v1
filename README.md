# RAVA Group — Immersive Website Experience

Cinematic, scroll-driven WebGL homepage. Vite + React + TypeScript + React Three
Fiber + GSAP/ScrollTrigger + Lenis + Tailwind v4.

```bash
npm install
npm run dev      # http://localhost:5273
npm run build
npm run preview
```

## Structure

```
src/
  scene/                 the one persistent <Canvas> and everything in it
    SceneCanvas.tsx       canvas setup, per-section env tint, mounts bespoke scenes
    RavaContainer.tsx     the hero reefer — procedural, or a real .glb (see below)
    steel.ts / parts.tsx  procedural corrugated-steel PBR maps + reusable steel box
    lighting/Studio.tsx   flicker-free studio lighting (baked env, static shadow)
    rig/SceneDirector.tsx cinematic camera keyframes + the shared container "driver"
    scenes/               ProductsScene, ServiceScene, IndustriesScene, CoverageGlobe
  sections/              the scrolling DOM: Hero + 8 sections + Footer
  components/            Navigation, FullscreenMenu, Loader, Cursor, MagneticButton…
  hooks/  store/  animations/  data/  styles/
```

## Dropping in real assets

### Fonts — done
Licensed **Helvetica Neue** is installed at `public/brand/fonts/` (converted to
`woff2`) and wired in `src/styles/tokens.css`. Replace those files with newer cuts
using the same names to update.

### The purchased container model — IN USE
`public/models/container.glb` is the TurboSquid 20 ft reefer (FBX + textures),
processed for web. It is the default container now (`src/scene/GlbContainer.tsx`):

- **Doors** `Door_Left` / `Door_Right` are hinge-corrected at load and driven by
  `driver.doorOpen` (scroll opens them).
- **Fans** — spinning condenser fans are overlaid on the modelled machinery
  grille, driven by `driver.power`.
- **RAVA logo** is a decal on the camera-facing long side (`driver.logoReveal`).
- **X-ray dissolve** (`driver.xray`) and **cold-air vapour** from the doorway
  (`driver.interior`) as the camera pushes inside.
- Third-party (Maersk) textures are stripped; the body wears a flat RAVA
  blue-grey PBR material. Real detail maps are downsized in `public/models/tex/`.

Fallback to the fully procedural container: `.env.local` →
`VITE_CONTAINER_GLB=procedural`.

Re-process a new model with `scripts/process-container.mjs` (expects an
FBX2glTF-converted `.glb` at `/private/tmp/reefer/reefer_raw.glb`).

**Known tuning gap:** the cinematic camera keyframes were authored for a 12 m
40 ft container; this model is a 6.4 m 20 ft. `SceneDirector` compresses the
along-length (X) framing by `XS = 0.56` to compensate — the opening close-up and
door-approach shots may still want a pass once viewed on a stable screen.

## Brand lock
Colours never leave the RAVA blue system (`src/scene/palette.ts` /
`src/styles/tokens.css`). The logo is used verbatim from the supplied file — the
white 1-colour treatment on dark UI is the guidelines-sanctioned usage.

## Accessibility / performance
`prefers-reduced-motion` disables Lenis + camera choreography and shows a static
composed frame. `useDeviceTier` scales DPR, shadows and geometry; low-tier and
reduced-motion drop postprocessing entirely.
