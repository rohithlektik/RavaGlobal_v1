import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { CanvasTexture, DirectionalLight, HemisphereLight, MeshBasicMaterial } from 'three';
import { RAVA, ENVIRONMENTS, type EnvironmentKey } from '../palette';
import { bgState } from '../bgState';
import { damp } from '@/animations/easing';

interface Props {
  env?: EnvironmentKey;
}

/** Static soft-shadow blob under the container — no per-frame cost, no shimmer. */
function useShadowTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d')!;
    const g = x.createRadialGradient(128, 128, 8, 128, 128, 128);
    g.addColorStop(0, 'rgba(6,12,20,0.62)');
    g.addColorStop(0.55, 'rgba(6,12,20,0.32)');
    g.addColorStop(1, 'rgba(6,12,20,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
    return new CanvasTexture(c);
  }, []);
}

/**
 * Directional studio lighting for the exterior product view — a clear key from
 * the upper front-left plus a cool back rim. The whole rig (plus the baked env
 * contribution) fades DOWN to almost nothing while the camera is sealed inside
 * the container (`bgState.ext`), so the interior can be a genuinely dark cold
 * store lit only by its own refrigerated lamps, then rises as the doors open.
 */
export function Studio({ env = 'neutral' }: Props) {
  const e = ENVIRONMENTS[env];
  const shadowTex = useShadowTexture();
  const { scene } = useThree();

  const key = useRef<DirectionalLight>(null);
  const rim = useRef<DirectionalLight>(null);
  const fill = useRef<DirectionalLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const blob = useRef<MeshBasicMaterial>(null);
  const primed = useRef(false);

  const KEY = 2.35;
  const RIM = 1.5;
  const FILL = 0.22;
  const HEMI = 0.42;

  useFrame((_, dt) => {
    dt = Math.min(dt, 1 / 30);
    const k = Math.min(dt, 1 / 40);
    const ext = bgState.ext;
    if (!primed.current) {
      primed.current = true;
      scene.environmentIntensity = 0.1;
    }
    // on the light product stage the container needs more shape (rim + a firmer
    // contact shadow, less flat fill) so the white steel doesn't wash out.
    const light = bgState.light;
    if (key.current) key.current.intensity = damp(key.current.intensity, KEY * ext * (1 - light * 0.25), 3, k);
    if (rim.current) rim.current.intensity = damp(rim.current.intensity, RIM * ext * (1 + light * 0.9), 3, k);
    if (fill.current) fill.current.intensity = damp(fill.current.intensity, FILL * ext * (1 - light * 0.6), 3, k);
    if (hemi.current)
      hemi.current.intensity = damp(hemi.current.intensity, HEMI * (0.15 + ext * 0.85) * (1 - light * 0.4), 3, k);
    if (blob.current) blob.current.opacity = damp(blob.current.opacity, 0.92 * ext * (1 + light * 0.45), 3, k);
    // baked env-map contribution: barely there inside, full outside, pared back
    // on the light stage so the shape reads
    scene.environmentIntensity = damp(scene.environmentIntensity, (0.08 + ext * 0.4) * (1 - light * 0.5), 3, k);
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={[e.key, e.ground, HEMI]} />
      <ambientLight intensity={0.08} color={RAVA.mist} />

      <directionalLight ref={key} position={[-8, 8, 6.5]} intensity={0} color={'#f2f5f8'} />
      <directionalLight ref={rim} position={[7.5, 3.5, -9]} intensity={0} color={e.rim} />
      <directionalLight ref={fill} position={[2, -3, 7]} intensity={0} color={RAVA.sky} />

      <Environment frames={1} resolution={128} environmentIntensity={0.4}>
        <Lightformer
          form="rect"
          intensity={3.2}
          color={RAVA.pale}
          position={[-2, 7, 5]}
          scale={[16, 8, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <Lightformer form="rect" intensity={1.8} color={RAVA.light} position={[-11, 3, -5]} scale={[9, 9, 1]} />
        <Lightformer form="circle" intensity={1.5} color={RAVA.sky} position={[10, 2, 7]} scale={[6, 6, 1]} />
      </Environment>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.31, 0.2]}>
        <planeGeometry args={[15, 8]} />
        <meshBasicMaterial ref={blob} map={shadowTex} transparent depthWrite={false} opacity={0} />
      </mesh>
    </>
  );
}
