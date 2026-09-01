import { Suspense, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, Vector3, MathUtils } from 'three';
import type { ContainerDriver } from '../containerDriver';
import { RavaContainer, type ContainerDetail } from '../RavaContainer';
import { sceneState, sectionProgress, type SectionId } from '@/store/scene';
import { clamp, damp, lerp, range, easing } from '@/animations/easing';

interface Props {
  driver: MutableRefObject<ContainerDriver>;
  detail: ContainerDetail;
}

interface Shot {
  pos: [number, number, number];
  look: [number, number, number];
  spin: number;
  door: number;
  xray: number;
  power: number;
  logo: number;
  interior: number;
}

const REST: Shot = {
  pos: [-6.5, 2.6, 12.5],
  look: [0, 0.1, 0],
  spin: -0.5,
  door: 0.16,
  xray: 0,
  power: 0,
  logo: 1,
  interior: 0,
};

/** Hero timeline: start INSIDE the lit container -> dolly out as the doors
 *  open -> full reveal -> 360° orbit. Authored for the real 6.4 m 20 ft model
 *  (centred on origin, x ±3.2, doors at +X, machinery at -X). */
interface Key extends Shot {
  at: number;
  ease: (t: number) => number;
}

const HERO_KEYS: Key[] = [
  // A — inside, near the machinery end, looking down the length toward the doors.
  {
    at: 0,
    pos: [-2.4, 0.05, 0.05],
    look: [3.6, 0.15, 0],
    spin: 0,
    door: 0.12,
    xray: 0,
    power: 1,
    logo: 0,
    interior: 1,
    ease: easing.inOutQuart,
  },
  // A2 — drift toward the doorway; the doors start to open.
  {
    at: 0.24,
    pos: [1.0, 0.15, 0.05],
    look: [4.6, 0.35, 0],
    spin: 0,
    door: 0.55,
    xray: 0,
    power: 1,
    logo: 0.12,
    interior: 1,
    ease: easing.inOutSine,
  },
  // B — out through the open doors, pulling back and up.
  {
    at: 0.42,
    pos: [7.8, 1.7, 3.2],
    look: [0, 0.4, 0],
    spin: 0,
    door: 1,
    xray: 0,
    power: 1,
    logo: 0.5,
    interior: 0.35,
    ease: easing.outQuint,
  },
  // C — the whole container, three-quarter front. Hand-off to the orbit.
  {
    at: 0.52,
    pos: [11.4, 3.2, 10.4],
    look: [0, 0.4, 0],
    spin: 0,
    door: 1,
    xray: 0,
    power: 1,
    logo: 1,
    interior: 0,
    ease: easing.inOutQuart,
  },
];

const ORBIT_FROM = 0.52;
const ORBIT_A0 = Math.atan2(11.4, 10.4); // matches key C
const ORBIT_SWEEP = Math.PI * 2 * 0.92;

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mix3 = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

function heroShot(p: number): Shot {
  if (p <= ORBIT_FROM) {
    let i = 0;
    while (i < HERO_KEYS.length - 2 && p > HERO_KEYS[i + 1].at) i++;
    const a = HERO_KEYS[i];
    const b = HERO_KEYS[i + 1];
    const t = b.ease(range(p, a.at, b.at));
    return {
      pos: mix3(a.pos, b.pos, t),
      look: mix3(a.look, b.look, t),
      spin: 0,
      door: mix(a.door, b.door, t),
      xray: mix(a.xray, b.xray, t),
      power: mix(a.power, b.power, t),
      logo: mix(a.logo, b.logo, t),
      interior: mix(a.interior, b.interior, t),
    };
  }
  // 360° orbit around the fully revealed container
  const ot = easing.inOutSine(range(p, ORBIT_FROM, 1));
  const ang = ORBIT_A0 + ot * ORBIT_SWEEP;
  const rad = mix(16, 14.5, Math.sin(ot * Math.PI)); // draw in slightly mid-orbit
  const h = mix(3.2, 2.2, Math.sin(ot * Math.PI));
  return {
    pos: [Math.sin(ang) * rad, h, Math.cos(ang) * rad],
    look: [0, 0.4, 0],
    spin: 0,
    door: mix(1, 0.35, easing.inOutSine(range(p, 0.9, 1))),
    xray: 0,
    power: 1,
    logo: 1,
    interior: 0,
  };
}

function sectionShot(id: SectionId, prog: number): Shot {
  const t = clamp(prog);
  switch (id) {
    case 'world':
      return { ...REST, pos: [-9, 4.2, 17], spin: -0.6 - t * 0.3, door: 0.24, xray: 0.35, power: 1, interior: 0.4 };
    case 'solutions':
      return { ...REST, pos: [0, 1.9, 12.5], look: [0, 0.6, 0], spin: -0.4 + Math.sin(t * 6.28) * 0.25, door: 0.32, power: 1 };
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
      return { ...REST, pos: [0, 2, 14], look: [0, 0.4, 0], spin: -0.5, door: 1, power: 1 };
    case 'service':
      return {
        ...REST,
        pos: [-2 + Math.sin(t * Math.PI * 2) * 1.2, 1.4 + t * 0.6, 9],
        look: [2.6, 0.3, 0],
      };
    case 'coverage':
      return {
        ...REST,
        pos: [lerp(1.5, -0.5, t), 1.4, lerp(9.5, 12.5, t)],
        look: [4.6, 0.5, -0.8],
      };
    case 'final':
      return { ...REST, pos: [-4.5, 1.9, 11.5], look: [0, 0.5, 0], spin: -0.35, door: 0, power: 0.2, logo: 1 };
    default:
      return REST;
  }
}

const BESPOKE = new Set<SectionId>(['products', 'service', 'industries', 'coverage']);

export function SceneDirector({ driver, detail }: Props) {
  const container = useRef<Group>(null);
  const look = useRef(new Vector3(3.6, 0.15, 0));
  const tmpLook = useRef(new Vector3());
  const { camera } = useThree();

  useFrame((state, dt) => {
    // tab was backgrounded / GC hitch -> dt spikes -> damping would lurch. Skip.
    dt = Math.min(dt, 1 / 30);
    const s = sceneState();
    const k = Math.min(dt, 1 / 45);
    const hero = sectionProgress('hero');
    const inHero = s.active === 'hero' || hero < 0.999;
    const bespoke = !inHero && BESPOKE.has(s.active);

    if (container.current && container.current.visible === bespoke) {
      container.current.visible = !bespoke;
    }

    const shot = inHero ? heroShot(hero) : sectionShot(s.active, s.sections[s.active] ?? 0);

    if (s.reducedMotion) {
      camera.position.set(-6, 2.4, 13);
      tmpLook.current.set(0, 0.2, 0);
      camera.lookAt(tmpLook.current);
      if (container.current) container.current.rotation.y = -0.5;
      const d = driver.current;
      d.doorOpen = 0.15;
      d.logoReveal = 1;
      d.power = 0;
      d.xray = 0;
      d.interior = 0;
      return;
    }

    // subtle pointer parallax
    const px = state.pointer.x * 0.5;
    const py = state.pointer.y * 0.35;

    // tighter tracking in the hero so a fast scroll can't swing the camera
    // through the container on the orbit
    const lambda = inHero ? 6 : 2.4;
    camera.position.x = damp(camera.position.x, shot.pos[0] + px, lambda, k);
    camera.position.y = damp(camera.position.y, shot.pos[1] + py, lambda, k);
    camera.position.z = damp(camera.position.z, shot.pos[2], lambda, k);

    look.current.x = damp(look.current.x, shot.look[0], lambda, k);
    look.current.y = damp(look.current.y, shot.look[1], lambda, k);
    look.current.z = damp(look.current.z, shot.look[2], lambda, k);
    camera.lookAt(look.current);

    if (container.current) {
      const idle = inHero ? 0 : Math.sin(state.clock.elapsedTime * 0.12) * 0.04;
      container.current.rotation.y = damp(container.current.rotation.y, shot.spin + idle, 2.4, k);
      container.current.rotation.x = damp(container.current.rotation.x, MathUtils.degToRad(inHero ? 0 : 1.5), 2, k);
    }

    const d = driver.current;
    d.doorOpen = damp(d.doorOpen, shot.door, 3, k);
    d.xray = damp(d.xray, shot.xray, 3, k);
    d.power = damp(d.power, shot.power, 2.5, k);
    d.logoReveal = damp(d.logoReveal, shot.logo, 3, k);
    d.interior = damp(d.interior, shot.interior, 3, k);
  });

  return (
    <group ref={container}>
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
