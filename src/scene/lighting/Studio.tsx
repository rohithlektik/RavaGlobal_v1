import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { CanvasTexture, DirectionalLight } from 'three';
import { RAVA, ENVIRONMENTS, type EnvironmentKey } from '../palette';
import { sectionProgress } from '@/store/scene';
import { damp, easing } from '@/animations/easing';

interface Props {
  env?: EnvironmentKey;
}

/** A static soft-shadow blob — zero per-frame cost, no temporal shimmer. */
function useShadowTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d')!;
    const g = x.createRadialGradient(128, 128, 10, 128, 128, 128);
    g.addColorStop(0, 'rgba(9,17,28,0.6)');
    g.addColorStop(0.6, 'rgba(9,17,28,0.3)');
    g.addColorStop(1, 'rgba(9,17,28,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
    return new CanvasTexture(c);
  }, []);
}

/** Studio-quality lighting, entirely in the RAVA blue system. Flicker-free:
 *  baked env (frames=1), static blob shadow, no postprocessing. */
export function Studio({ env = 'neutral' }: Props) {
  const key = useRef<DirectionalLight>(null);
  const e = ENVIRONMENTS[env];
  const shadowTex = useShadowTexture();

  useFrame((_, dt) => {
    dt = Math.min(dt, 1 / 30);
    const hero = sectionProgress('hero');
    const k = Math.min(dt, 1 / 45);
    const sweep = easing.inOutSine(Math.min(1, hero / 0.6));
    if (key.current) {
      key.current.position.x = damp(key.current.position.x, -9 + sweep * 20, 2.2, k);
      key.current.intensity = damp(key.current.intensity, 3.0 + hero * 0.6, 3, k);
    }
  });

  return (
    <>
      <hemisphereLight args={[e.key, e.ground, 0.7]} />
      <ambientLight intensity={0.2} color={RAVA.mist} />
      <directionalLight position={[3, -2, 9]} intensity={0.35} color={RAVA.sky} />

      <directionalLight ref={key} position={[-9, 9, 7]} intensity={2.5} color={RAVA.pale} />
      <directionalLight position={[7, 4, -9]} intensity={1.6} color={e.rim} />

      <Environment frames={1} resolution={128} environmentIntensity={0.6}>
        <Lightformer
          form="rect"
          intensity={4}
          color={RAVA.pale}
          position={[0, 7, 5]}
          scale={[18, 8, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <Lightformer form="rect" intensity={2.2} color={RAVA.light} position={[-10, 3, -6]} scale={[10, 10, 1]} />
        <Lightformer form="circle" intensity={1.8} color={RAVA.sky} position={[10, 2, 7]} scale={[7, 7, 1]} />
        <Lightformer form="rect" intensity={1.3} color={RAVA.mist} position={[0, -5, 4]} scale={[14, 5, 1]} />
      </Environment>

      {/* static ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.31, 0.4]}>
        <planeGeometry args={[16, 9]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0.9} />
      </mesh>
    </>
  );
}
