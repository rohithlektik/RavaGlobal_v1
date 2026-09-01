import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { GradientTexture, Preload } from '@react-three/drei';
import { ACESFilmicToneMapping, BackSide, Color } from 'three';
import { useScene, type SectionId } from '@/store/scene';
import { RAVA, ENVIRONMENTS, type EnvironmentKey } from './palette';
import { Studio } from './lighting/Studio';
import { FrameSync } from './FrameSync';
import { SceneDirector } from './rig/SceneDirector';
import { ProductsScene } from './scenes/ProductsScene';
import { ServiceScene } from './scenes/ServiceScene';
import { IndustriesScene } from './scenes/IndustriesScene';
import { CoverageGlobe } from './scenes/CoverageGlobe';
import { createContainerDriver } from './containerDriver';
import type { ContainerDetail } from './RavaContainer';

/** Mount a bespoke scene while its section (or a neighbour) is active. */
const near = (active: SectionId, ...ids: SectionId[]) => ids.includes(active);

const ENV_BY_CHOICE: Record<string, EnvironmentKey> = {
  Food: 'cold',
  Pharmaceuticals: 'pharma',
  Storage: 'neutral',
  Construction: 'construction',
  Emergency: 'emergency',
  Other: 'logistics',
};

const ENV_BY_SECTION: Partial<Record<string, EnvironmentKey>> = {
  industries: 'cold',
  service: 'construction',
  coverage: 'logistics',
};

/** Large RAVA-blue gradient backdrop — brand ground, never black. The
 *  per-section colour shift is carried by the fog + clear colour (EnvTint). */
function Backdrop() {
  return (
    <mesh scale={200} renderOrder={-1} rotation={[0, 0, 0]}>
      <sphereGeometry args={[1, 40, 40]} />
      <meshBasicMaterial side={BackSide} toneMapped={false} depthWrite={false}>
        <GradientTexture
          stops={[0, 0.35, 0.65, 1]}
          colors={['#3a577c', RAVA.blue, RAVA.deep, RAVA.navy]}
          size={512}
        />
      </meshBasicMaterial>
    </mesh>
  );
}

/** Eases fog + clear colour toward the active section's tint. */
function EnvTint({ env }: { env: EnvironmentKey }) {
  const target = useMemo(() => new Color(ENVIRONMENTS[env].fog), [env]);
  useFrame(({ scene, gl }, dt) => {
    dt = Math.min(dt, 1 / 30);
    const a = 1 - Math.exp(-2 * dt);
    if (scene.fog && 'color' in scene.fog) (scene.fog.color as Color).lerp(target, a);
    const cc = new Color();
    gl.getClearColor(cc);
    gl.setClearColor(cc.lerp(target, a));
  });
  return null;
}

/** Matte studio floor in deep RAVA navy. */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6, -1.34, 0]}>
      <planeGeometry args={[200, 140]} />
      <meshStandardMaterial color={RAVA.abyss} roughness={0.92} metalness={0.1} />
    </mesh>
  );
}

export function SceneCanvas() {
  const driver = useRef(createContainerDriver());
  const tier = useScene((s) => s.tier);
  const reducedMotion = useScene((s) => s.reducedMotion);
  const active = useScene((s) => s.active);
  const choice = useScene((s) => s.solutionChoice);

  const detail: ContainerDetail = tier === 'high' ? 'high' : tier === 'mid' ? 'mid' : 'low';

  // FIXED dpr — a changing pixel ratio forces a full canvas resize, which reads
  // as a flash/flicker. Pick once and never move it.
  const dpr = useMemo(() => {
    const d = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    if (tier === 'low') return 1;
    if (tier === 'mid') return Math.min(1.5, d);
    return Math.min(2, d);
  }, [tier]);

  const env: EnvironmentKey =
    active === 'solutions' && choice
      ? ENV_BY_CHOICE[choice] ?? 'neutral'
      : ENV_BY_SECTION[active] ?? 'neutral';

  return (
    <div className="scene-canvas" aria-hidden="true">
      <Canvas
        shadows={false}
        dpr={dpr}
        gl={{
          antialias: true, // hardware MSAA — no shimmery post-AA pass
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
        }}
        // near pushed well past 0 -> big depth-buffer precision win = no z-fight crawl
        camera={{ fov: 42, near: 0.25, far: 260, position: [-2.4, 0.05, 0.05] }}
        onCreated={({ gl }) => {
          gl.setClearColor(RAVA.navy);
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
        }}
      >
        <fog attach="fog" args={[RAVA.navy, 22, 120]} />
        <FrameSync />
        <EnvTint env={env} />
        <Backdrop />
        <Ground />

        <SceneDirector driver={driver} detail={detail} />
        <Studio env={env} />

        <Suspense fallback={null}>
          {near(active, 'solutions', 'products', 'industries') && <ProductsScene />}
          {near(active, 'products', 'industries', 'rent-buy') && <IndustriesScene />}
          {near(active, 'rent-buy', 'service', 'coverage') && <ServiceScene />}
          {near(active, 'service', 'coverage', 'final') && <CoverageGlobe />}
        </Suspense>

        {!reducedMotion && <Preload all />}
      </Canvas>
    </div>
  );
}
