import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { ACESFilmicToneMapping, BackSide, Color, ShaderMaterial } from 'three';
import { useScene, type SectionId } from '@/store/scene';
import { RAVA, ENVIRONMENTS, type EnvironmentKey } from './palette';
import { bgState, bgColors } from './bgState';
import { Studio } from './lighting/Studio';
import { FrameSync } from './FrameSync';
import { SceneDirector } from './rig/SceneDirector';
import { ProductsScene } from './scenes/ProductsScene';
import { RavaCoverageGlobe } from './scenes/RavaCoverageGlobe';
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
  coverage: 'logistics',
};

/**
 * Scroll-reactive RAVA gradient sky. A vertical two-stop gradient whose colours
 * ride the `bgState.phase` ramp (near-black navy -> deep navy -> blue atmosphere
 * -> dark navy) defined once in bgState.ts. Every colour is keyed end to end and
 * eased per frame -> continuous, no seams, no flashes.
 */
function Backdrop({ env }: { env: EnvironmentKey }) {
  const mat = useRef<ShaderMaterial>(null);
  const envFog = useMemo(() => new Color(ENVIRONMENTS[env].fog), [env]);
  const uniforms = useMemo(
    () => ({
      uTop: { value: new Color('#0a1322') },
      uBottom: { value: new Color('#05080f') },
    }),
    [],
  );

  useFrame((_, dt) => {
    dt = Math.min(dt, 1 / 30);
    const a = 1 - Math.exp(-2.5 * dt);
    if (mat.current) {
      const top = mat.current.uniforms.uTop.value as Color;
      const bot = mat.current.uniforms.uBottom.value as Color;
      bgColors(bgState.phase, _tmpTop, _tmpBot);
      // only tint toward the active section's env colour once fully outside,
      // and not at all once the stage has lifted to the light product tone
      const envMix = bgState.ext * (1 - bgState.light);
      _tmpTop.lerp(envFog, 0.18 * envMix);
      _tmpBot.lerp(envFog, 0.3 * envMix);
      top.lerp(_tmpTop, a);
      bot.lerp(_tmpBot, a);
    }
  });

  return (
    <mesh scale={220} renderOrder={-1}>
      <sphereGeometry args={[1, 48, 48]} />
      <shaderMaterial
        ref={mat}
        side={BackSide}
        depthWrite={false}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={`varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`
          uniform vec3 uTop; uniform vec3 uBottom; varying vec3 vP;
          void main(){
            float h = clamp(vP.y * 0.5 + 0.5, 0.0, 1.0);
            h = pow(h, 1.15);
            gl_FragColor = vec4(mix(uBottom, uTop, h), 1.0);
          }`}
      />
    </mesh>
  );
}
const _tmpTop = new Color();
const _tmpBot = new Color();
const _cc = new Color();

/** Keeps the fog + clear colour locked to the backdrop's lower colour so the
 *  horizon never shows a seam through the whole cinematic. */
function EnvTint({ env }: { env: EnvironmentKey }) {
  const target = useMemo(() => new Color(ENVIRONMENTS[env].fog), [env]);
  useFrame(({ scene, gl }, dt) => {
    dt = Math.min(dt, 1 / 30);
    const a = 1 - Math.exp(-2 * dt);
    bgColors(bgState.phase, _tmpTop, _tmpBot);
    _tmpBot.lerp(target, 0.25 * bgState.ext * (1 - bgState.light));
    if (scene.fog && 'color' in scene.fog) (scene.fog.color as Color).lerp(_tmpBot, a);
    gl.getClearColor(_cc);
    gl.setClearColor(_cc.lerp(_tmpBot, a));
    // exposure ride — geometry only (backdrop shader is toneMapped:false)
    gl.toneMappingExposure += (bgState.exposure - gl.toneMappingExposure) * (1 - Math.exp(-3 * dt));
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
        camera={{ fov: 58, near: 0.3, far: 300, position: [1.9, -0.42, 0.22] }}
        onCreated={({ gl }) => {
          gl.setClearColor('#05080f');
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.42;
        }}
      >
        <fog attach="fog" args={['#0b1524', 22, 140]} />
        <FrameSync />
        <EnvTint env={env} />
        <Backdrop env={env} />
        <Ground />

        <SceneDirector driver={driver} detail={detail} />
        <Studio env={env} />

        <Suspense fallback={null}>
          {near(active, 'solutions', 'products') && <ProductsScene />}
          {near(active, 'rent-buy', 'coverage', 'final') && <RavaCoverageGlobe />}
        </Suspense>

        {!reducedMotion && <Preload all />}
      </Canvas>
    </div>
  );
}
