import { Suspense, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, PerspectiveCamera, PointLight, Vector3 } from 'three';
import type { ContainerDriver } from '../containerDriver';
import { RavaContainer, type ContainerDetail } from '../RavaContainer';
import { bgState } from '../bgState';
import { stageState } from '../stageState';
import { solutionState } from '../solutionState';
import { sceneState, sectionProgress, type SectionId } from '@/store/scene';
import { clamp, damp, lerp, range, easing } from '@/animations/easing';

interface Props {
  driver: MutableRefObject<ContainerDriver>;
  detail: ContainerDetail;
}

/** one full inspection turn, wound in so nothing snaps at the hand-off */
const TURN = Math.PI * 2;

const smoothstep = (t: number) => {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  return x * x * (3 - 2 * x);
};

interface Shot {
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
  spin: number;
  door: number;
  power: number;
  logo: number;
  interior: number;
  ice: number;
}

// the settled pose the post-hero sections drift from — already wound past a
// full turn so the 360deg inspection never rubber-bands back.
const REST: Shot = {
  pos: [2.6, 1.65, 8.4],
  look: [-0.2, 0.2, 0],
  fov: 35,
  spin: -TURN,
  door: 0.22,
  power: 1,
  logo: 1,
  interior: 0,
  ice: 0,
};

/**
 * HERO CINEMATIC — ONE continuous camera move, scrubbed by a single trigger
 * that spans the hero AND the "Powering smarter storage" statement
 * (Hero.tsx -> sectionProgress('intro')).
 *
 *   0.00  inside the sealed container, dark cold navy, looking down its length
 *   0.13  ice / frost drifts, camera eases back toward the doors
 *   0.30  refrigerated ceiling lamps flicker up
 *   0.45  interior is a clean bright white cold-store
 *   0.58  camera retreats through the doors as they swing open, light floods in
 *   0.68  camera slips outside, the real RAVA container starts to read
 *   0.78  settles into a close exterior product view — still large, still the hero
 *   0.78..1.00  slow 360deg product-inspection turn (see spinFor)
 *
 * `spin` here is 0 for every key; the turn is computed separately so it stays a
 * single constant-rate sweep that scrubs cleanly in both directions.
 */
interface Key extends Shot {
  at: number;
  ease: (t: number) => number;
}

const INTRO_KEYS: Key[] = [
  {
    at: 0.0, // just inside, low, facing the sealed doors — a seam of daylight
    pos: [1.9, -0.42, 0.22],
    look: [3.4, 0.05, -0.05],
    fov: 58,
    spin: 0,
    door: 0,
    power: 0.15,
    logo: 0,
    interior: 0,
    ice: 0,
    ease: easing.inOutSine,
  },
  {
    at: 0.14, // frost drifts; camera eases BACK, deeper in, taking the space in
    pos: [1.0, -0.28, 0.16],
    look: [3.4, 0.06, -0.03],
    fov: 56,
    spin: 0,
    door: 0,
    power: 0.4,
    logo: 0,
    interior: 0.06,
    ice: 0.6,
    ease: easing.inOutSine,
  },
  {
    at: 0.3, // refrigerated ceiling lamps flicker up
    pos: [0.3, -0.1, 0.08],
    look: [3.3, 0.08, 0.0],
    fov: 45,
    spin: 0,
    door: 0.04,
    power: 0.8,
    logo: 0.1,
    interior: 0.5,
    ice: 0.95,
    ease: easing.inOutSine,
  },
  {
    at: 0.44, // full clean bright cold-store interior, doors still shut ahead
    pos: [-0.2, 0.02, 0.05],
    look: [3.2, 0.1, 0.0],
    fov: 43,
    spin: 0,
    door: 0.06,
    power: 1,
    logo: 0.35,
    interior: 1.0,
    ice: 0.7,
    ease: easing.inOutQuart,
  },
  {
    at: 0.52, // doors swing open, camera eases out to the threshold
    pos: [1.1, 0.05, 0.05],
    look: [3.7, 0.16, 0.0],
    fov: 47,
    spin: 0,
    door: 0.5,
    power: 1,
    logo: 0.45,
    interior: 1.0,
    ice: 0.95,
    ease: easing.inOutQuart,
  },
  {
    at: 0.6, // camera slips OUTSIDE the front — doors wide, mist pouring out of
    // the doorway, the lit interior glowing. Container NOT turning yet.
    pos: [6.0, 0.4, 0.1],
    look: [2.3, 0.28, 0.0],
    fov: 47,
    spin: 0,
    door: 0.82,
    power: 1,
    logo: 0.5,
    interior: 1.0,
    ice: 1.0,
    ease: easing.inOutSine,
  },
  {
    at: 0.72, // hold on the front — eased back + up a touch, mist still rolling
    pos: [7.8, 1.15, 0.4],
    look: [1.7, 0.4, 0.0],
    fov: 43,
    spin: 0,
    door: 0.8,
    power: 1,
    logo: 0.66,
    interior: 0.95,
    ice: 0.9,
    ease: easing.inOutSine,
  },
  {
    at: 0.8, // camera arcs to the 3/4 inspection distance; the turn begins;
    // the mist thins as we leave the doorway
    pos: [6.0, 1.4, 4.3],
    look: [0.4, 0.28, 0.0],
    fov: 40,
    spin: 0,
    door: 0.5,
    power: 1,
    logo: 0.85,
    interior: 0.45,
    ice: 0.32,
    ease: easing.inOutSine,
  },
  {
    at: 0.9, // close 3/4 product view — whole unit reads, branded side coming round
    pos: [3.6, 1.6, 8.3],
    look: [-0.1, 0.22, 0.0],
    fov: 38,
    spin: 0,
    door: 0.3,
    power: 1,
    logo: 0.96,
    interior: 0.14,
    ice: 0.04,
    ease: easing.inOutSine,
  },
  {
    at: 1.0, // pushed in a little as the inspection turn lands on the logo side
    pos: [2.6, 1.65, 8.4],
    look: [-0.2, 0.2, 0.0],
    fov: 35,
    spin: 0,
    door: 0.22,
    power: 1,
    logo: 1,
    interior: 0,
    ice: 0,
    ease: easing.inOutSine,
  },
];

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mix3 = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

/** the slow inspection turn — one steady 0 -> -360deg that begins only AFTER the
 *  wide-open-doors / mist beat, and finishes as the square stage settles on the
 *  branded side. Smoothstep: gentle start/stop, near-constant speed in between. */
function spinFor(p: number): number {
  const t = range(p, 0.74, 1.0);
  return -TURN * (t * t * (3 - 2 * t));
}

function heroShot(p: number): Shot {
  let i = 0;
  while (i < INTRO_KEYS.length - 2 && p > INTRO_KEYS[i + 1].at) i++;
  const a = INTRO_KEYS[i];
  const b = INTRO_KEYS[i + 1];
  const t = b.ease(range(p, a.at, b.at));
  return {
    pos: mix3(a.pos, b.pos, t),
    look: mix3(a.look, b.look, t),
    fov: mix(a.fov, b.fov, t),
    spin: spinFor(p),
    door: mix(a.door, b.door, t),
    power: mix(a.power, b.power, t),
    logo: mix(a.logo, b.logo, t),
    interior: mix(a.interior, b.interior, t),
    ice: mix(a.ice, b.ice, t),
  };
}

function sectionShot(id: SectionId, prog: number): Shot {
  const t = clamp(prog);
  switch (id) {
    case 'world':
      return { ...REST, pos: [3.6, 1.9, 7.4], look: [0, 0.2, 0], spin: -TURN - t * 0.15 };
    case 'solutions': {
      // outline while answering (pushed back, barely lit), full close product
      // view once the wizard lands on "Recommended"
      const r = solutionState.reveal;
      return {
        ...REST,
        pos: mix3([6.2, 1.3, 13.5], [3.0, 1.4, 7.4], r),
        look: mix3([0.1, 0.45, 0], [0.25, 0.35, 0], r),
        spin: -TURN - 0.4 + Math.sin(t * Math.PI * 2) * (0.05 + r * 0.12),
        door: 0.05 + r * 0.22,
        logo: 0.15 + r * 0.85,
      };
    }
    case 'products':
      return {
        ...REST,
        pos: [-1 + Math.sin(t * Math.PI * 2) * 1.2, 1.7, 14],
        look: [5, 0.8, 0],
      };
    case 'industries':
      return {
        ...REST,
        pos: [lerp(-3, 5, t), 2.2 + Math.sin(t * 3) * 0.4, 15],
        look: [3.5, 0.5, 0],
      };
    case 'rent-buy':
      return { ...REST, pos: [0, 2, 14], look: [0, 0.4, 0], spin: -TURN - 0.5, door: 1 };
    case 'coverage':
      return {
        ...REST,
        pos: [lerp(0.4, -0.8, t), 1.9, lerp(7.2, 8.4, t)],
        look: [4.2, 1.5, -0.2],
      };
    case 'final':
      return {
        ...REST,
        pos: [-4.5, 1.9, 11.5],
        look: [0, 0.5, 0],
        spin: -TURN - 0.35,
        door: 0,
        power: 0.2,
      };
    default:
      return REST;
  }
}

const BESPOKE = new Set<SectionId>(['products', 'industries', 'coverage']);

export function SceneDirector({ driver, detail }: Props) {
  const container = useRef<Group>(null);
  const camLight = useRef<PointLight>(null);
  const look = useRef(new Vector3(3.4, 0.05, -0.05));
  const tmpLook = useRef(new Vector3());
  const viewOffsetOn = useRef(false);
  const camera = useThree((st) => st.camera) as PerspectiveCamera;

  useFrame((state, dt) => {
    // tab was backgrounded / GC hitch -> dt spikes -> clamp so nothing lurches.
    dt = Math.min(dt, 1 / 30);
    const s = sceneState();
    const k = Math.min(dt, 1 / 40);

    const intro = clamp(sectionProgress('intro'));
    const inIntro = intro < 0.999 || s.active === 'hero';
    const bespoke = !inIntro && BESPOKE.has(s.active);

    if (container.current && container.current.visible === bespoke) {
      container.current.visible = !bespoke;
    }

    const shot = inIntro ? heroShot(intro) : sectionShot(s.active, s.sections[s.active] ?? 0);

    // background + exterior-light phase: one value, continuous, scrub-reversible
    bgState.phase = inIntro ? intro : 0.42;
    // exterior lighting is suppressed while we are inside the container and
    // rises as the doors open / the camera slips outside for the front reveal.
    // In the solution finder it stays low (container = outline) until the
    // wizard reveals the recommendation.
    bgState.ext = inIntro
      ? clamp(range(intro, 0.46, 0.66))
      : s.active === 'solutions'
        ? 0.09 + solutionState.reveal * 0.91
        : 1;
    // exposure ride: a touch lifted in the dark, a gentle peak at the
    // "lights on / bright interior" beat, then settling to 1.0 by the exit.
    bgState.exposure = inIntro
      ? lerp(1.34, 1.62, easing.inOutSine(range(intro, 0.16, 0.42))) -
        0.62 * easing.inOutSine(range(intro, 0.5, 0.78))
      : 1.0;
    // the navy cinematic lifts to the light product stage as the square forms
    bgState.light = smoothstep(stageState.tone);

    if (s.reducedMotion) {
      camera.position.set(4.4, 1.6, 6.4);
      tmpLook.current.set(0, 0.15, 0);
      camera.lookAt(tmpLook.current);
      if (camera.fov !== 34) {
        camera.fov = 34;
        camera.updateProjectionMatrix();
      }
      if (container.current) container.current.rotation.y = -0.5;
      const d = driver.current;
      d.doorOpen = 0.05;
      d.logoReveal = 1;
      d.power = 1;
      d.interior = 0;
      d.ice = 0;
      bgState.phase = 0.85;
      bgState.ext = 1;
      bgState.exposure = 1.0;
      bgState.light = 0;
      stageState.form = 0;
      stageState.tone = 0;
      if (viewOffsetOn.current) {
        camera.clearViewOffset();
        viewOffsetOn.current = false;
      }
      return;
    }

    // restrained pointer parallax (kept tiny so it never fights the scroll)
    const px = state.pointer.x * 0.3;
    const py = state.pointer.y * 0.2;

    // --- zoom during the 360deg inspection turn -----------------------------
    // A gentle push-in is already baked into the exterior keys. On top of that,
    // when the machinery ("back") end swings toward the camera we push in harder
    // and narrow the lens so the fans, pipes and the temperature panel read.
    let shotPos = shot.pos;
    let shotLook = shot.look;
    let shotFov = shot.fov;
    const stageForm = stageState.form;

    // machinery-detail push-in — only during the FREE exterior inspection, i.e.
    // before the square stage starts forming (then it must stay steady).
    if (inIntro && intro > 0.62 && stageForm < 0.12 && container.current) {
      const rotY = container.current.rotation.y;
      // machinery end = container local -X; world direction under Y-rotation only
      const mdx = -Math.cos(rotY);
      const mdz = Math.sin(rotY);
      const cl = Math.hypot(camera.position.x, camera.position.z) || 1;
      const backFacing = clamp((mdx * camera.position.x + mdz * camera.position.z) / cl);
      const detailAmt = backFacing * clamp(range(intro, 0.55, 0.9)) * (1 - stageForm / 0.12);
      if (detailAmt > 0.001) {
        const b = detailAmt * 0.6;
        shotPos = mix3(shot.pos, [2.7, 0.4, 5.2], b);
        shotLook = mix3(shot.look, [0.25, -0.05, 0], b);
        shotFov = shot.fov - detailAmt * 10;
      }
    }

    // square product stage: ease the camera a little further out so the
    // container reads ~70% of the stage (still large, never a distant object).
    // Pure radial move -> the container stays centred in the frustum, just
    // slightly smaller.
    if (stageForm > 0.001) {
      const g = 1 + stageForm * 0.26;
      shotPos = [shotPos[0] * g, shotPos[1] * g, shotPos[2] * g];
    }

    // one damping rate everywhere -> smooth, fully reversible with scroll
    const lambda = 3.4;
    camera.position.x = damp(camera.position.x, shotPos[0] + px, lambda, k);
    camera.position.y = damp(camera.position.y, shotPos[1] + py, lambda, k);
    camera.position.z = damp(camera.position.z, shotPos[2], lambda, k);

    look.current.x = damp(look.current.x, shotLook[0], lambda, k);
    look.current.y = damp(look.current.y, shotLook[1], lambda, k);
    look.current.z = damp(look.current.z, shotLook[2], lambda, k);
    camera.lookAt(look.current);

    const nextFov = damp(camera.fov, shotFov, lambda, k);
    if (Math.abs(nextFov - camera.fov) > 1e-4) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }

    // pan the rendered image into the square on the right (no world-space move ->
    // perfect continuity). A mild zoom-out here + the radial pull-back above put
    // the container at a comfortable size inside the stage.
    if (stageForm > 0.001) {
      const W = state.size.width;
      const H = state.size.height;
      const zoom = 1 + stageForm * 0.16;
      const w = W * zoom;
      const h = H * zoom;
      const x = (W - w) / 2 - W * 0.115 * stageForm; // recentre, then pan right
      const y = (H - h) / 2 + H * 0.02 * stageForm; // nudge the container up a touch
      camera.setViewOffset(W, H, x, y, w, h);
      viewOffsetOn.current = true;
    } else if (viewOffsetOn.current) {
      camera.clearViewOffset();
      viewOffsetOn.current = false;
    }

    if (container.current) {
      const idle = inIntro ? 0 : Math.sin(state.clock.elapsedTime * 0.08) * 0.02;
      container.current.rotation.y = damp(container.current.rotation.y, shot.spin + idle, 3, k);
      container.current.rotation.x = damp(container.current.rotation.x, 0, 2.5, k);
    }

    const d = driver.current;
    d.doorOpen = damp(d.doorOpen, shot.door, 3, k);
    d.power = damp(d.power, shot.power, 2.5, k);
    d.logoReveal = damp(d.logoReveal, shot.logo, 3, k);
    d.interior = damp(d.interior, shot.interior, 3.2, k);
    d.ice = damp(d.ice, shot.ice, 2.6, k);

    // a soft cool "lantern" a little behind the camera so whatever it looks at
    // inside the sealed container always reads — fades out as we leave.
    if (camLight.current) {
      tmpLook.current.copy(look.current).sub(camera.position).normalize();
      camLight.current.position.set(
        camera.position.x - tmpLook.current.x * 1.1,
        camera.position.y - tmpLook.current.y * 1.1 + 0.55,
        camera.position.z - tmpLook.current.z * 1.1,
      );
      const want = (1 - bgState.ext) * 1.1;
      camLight.current.intensity = damp(camLight.current.intensity, want, 3, k);
    }
  });

  return (
    <group ref={container}>
      <pointLight ref={camLight} intensity={1.1} distance={5} decay={1.5} color={'#7ba6d6'} />
      <Suspense fallback={null}>
        <RavaContainer
          driver={driver}
          detail={detail}
          modelUrl={import.meta.env.VITE_CONTAINER_GLB || undefined}
        />
      </Suspense>
    </group>
  );
}
