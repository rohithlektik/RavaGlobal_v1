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
    bgState.ts            non-reactive channel for the scroll-driven background phase
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

- **Original CGTrader textures are kept faithfully** — `scripts/process-container.mjs`
  only downsizes and packs the model's own diffuse/normal/metal-rough/AO maps
  (no re-tint), then embeds them in `public/models/container.glb`.
- **Doors** `Door_Left` / `Door_Right` are hinge-corrected at load and swing
  outward on `driver.doorOpen`.
- **Fans** — a spinning condenser fan is overlaid on the modelled machinery
  grille on the −Z end, driven by `driver.power`.
- **RAVA logo** is a painted-panel decal over the model's "YOUR LOGO" placeholder
  on the long side, faded in by `driver.logoReveal` (see `GlbContainer.tsx`).
- `driver.interior` drives the refrigerated ceiling lamps + the door-end wash;
  `driver.ice` the frost particles; `driver.doorOpen` the hinge swing;
  `driver.logoReveal` the decal.

Fallback to the fully procedural container: `.env.local` →
`VITE_CONTAINER_GLB=procedural`.

Re-process a new model with `scripts/process-container.mjs` (expects an
FBX2glTF-converted `.glb` at `/private/tmp/reefer/reefer_raw.glb`).

## Hero cinematic (inside → out → 360°)

The hero and the "Powering smarter storage" statement are driven by **one
continuous scrub** — `Hero.tsx` writes `sectionProgress('intro')` from hero-top
all the way to `#statement`-bottom, and `SceneDirector` reads it. `INTRO_KEYS`
plus `spinFor()` play one camera move:

| progress | beat |
|---|---|
| 0.00 | inside the sealed container, near-black cold navy, looking down its length at the doors |
| 0.14 | ice / frost drifts, camera eases back to take the space in |
| 0.30 | refrigerated ceiling lamps flicker up |
| 0.44 | full clean bright cold-store interior (exposure peak) |
| 0.56 | doors crack open ahead, daylight floods the length |
| 0.67 | camera moves forward through the open doors |
| 0.78 | outside — swing around, the real RAVA container reads |
| 0.86 | close exterior product view, whole unit in frame |
| 0.80–1.00 | slow eased 0 → −360° inspection turn (`spinFor`), wound to `-2π` so the post-hero sections never rubber-band |

`bgState` carries three non-reactive channels the render loop eases toward:
`phase` (the gradient ramp in `bgState.ts`), `ext` (exterior studio-light factor,
0 inside → 1 out — `Studio` scales its rig by it) and `exposure` (tone-mapping
ride). The `Loader` gates on real asset progress and Lenis is held at the top
until `loaded`, so the cinematic never starts against an empty scene.

## Brand lock
Colours never leave the RAVA blue system (`src/scene/palette.ts` /
`src/styles/tokens.css`). The logo is used verbatim from the supplied file — the
white 1-colour treatment on dark UI is the guidelines-sanctioned usage.

## Accessibility / performance
`prefers-reduced-motion` disables Lenis + camera choreography and shows a static
composed frame. `useDeviceTier` scales DPR, shadows and geometry; low-tier and
reduced-motion drop postprocessing entirely.
