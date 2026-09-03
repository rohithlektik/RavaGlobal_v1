import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, useGLTF } from '@react-three/drei';
import {
  BackSide,
  Color,
  Group,
  type Mesh,
  type MeshStandardMaterial,
  SRGBColorSpace,
  MathUtils,
} from 'three';
import { useSteel, SteelBox, type Steel } from '../parts';
import { RAVA } from '../palette';
import { sceneState, sectionProgress, useScene } from '@/store/scene';
import { clamp, lerp } from '@/animations/easing';

const GAP = 16;
const IDS = ['refrigerated', 'blast-freezer', 'dry', 'gensets', 'chassis', 'parts'] as const;

const MODEL_URL = '/models/container.glb';
useGLTF.preload(MODEL_URL);

/** The real purchased reefer (same asset as the hero), tinted per variant. */
function GlbReefer({ frost = false }: { frost?: boolean }) {
  const gltf = useGLTF(MODEL_URL);
  const logo = useTexture('/brand/rava-decal.png');
  logo.colorSpace = SRGBColorSpace;
  logo.anisotropy = 8;

  const model = useMemo(() => {
    const root = gltf.scene.clone(true);
    const tint = new Color(frost ? '#d3e2f0' : '#ffffff');
    root.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      m.castShadow = false;
      m.receiveShadow = false;
      const src = Array.isArray(m.material) ? m.material : [m.material];
      const swapped = src.map((mm) => {
        const mat = (mm as MeshStandardMaterial).clone();
        mat.color = tint.clone();
        mat.envMapIntensity = 0.6;
        return mat;
      });
      m.material = Array.isArray(m.material) ? swapped : swapped[0];
    });
    return root;
  }, [gltf.scene, frost]);

  return (
    <group rotation={[0, Math.PI / 2, 0]} scale={1.08} position={[0, -0.02, 0]}>
      <primitive object={model} />
      {/* RAVA mark on the long side */}
      <mesh position={[-1.24, 0.05, 0]} rotation={[0, -Math.PI / 2, 0]} renderOrder={3}>
        <planeGeometry args={[0.62, 0.82]} />
        <meshStandardMaterial
          map={logo}
          transparent
          opacity={0.9}
          depthWrite={false}
          roughness={0.72}
          metalness={0.04}
          polygonOffset
          polygonOffsetFactor={-6}
          polygonOffsetUnits={-6}
        />
      </mesh>
      {frost && (
        <mesh renderOrder={-1}>
          <boxGeometry args={[2.62, 2.82, 6.98]} />
          {/* back faces only + no depth write — a still inner frost haze that
              can't sort-flicker against the container as the model rotates */}
          <meshBasicMaterial
            color={RAVA.mist}
            transparent
            opacity={0.1}
            side={BackSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

/** Corner castings sit on the 8 corners of a box centred on the group origin. */
function CornerCastings({ x = 3.34, y = 1.11, z = 1.07 }: { x?: number; y?: number; z?: number }) {
  return (
    <>
      {[-x, x].flatMap((cx) =>
        [-y, y].flatMap((cy) =>
          [z, -z].map((cz, i) => (
            <mesh key={`${cx}-${cy}-${i}`} position={[cx, cy, cz]}>
              <boxGeometry args={[0.32, 0.28, 0.28]} />
              <meshStandardMaterial color="#3b4653" metalness={0.7} roughness={0.5} />
            </mesh>
          )),
        ),
      )}
    </>
  );
}

function Reefer({ steel, frost = false }: { steel: Steel; frost?: boolean }) {
  const logo = useTexture('/brand/rava-logo.png');
  logo.colorSpace = SRGBColorSpace;
  return (
    <group>
      {/* body is centred on the origin: y in [-1.25, 1.25] */}
      <SteelBox args={[7, 2.5, 2.42]} steel={steel} color={frost ? '#dfeaf1' : RAVA.white} />
      {/* refrigeration unit on -X end */}
      <mesh position={[-3.75, 0, 0]}>
        <boxGeometry args={[0.5, 2.3, 2.3]} />
        <meshStandardMaterial color="#c9ced4" metalness={0.5} roughness={0.46} />
      </mesh>
      {[-0.55, 0.55].map((z, i) => (
        <mesh key={i} position={[-4.02, 0.35, z]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.14, 24]} />
          <meshStandardMaterial color="#4a525b" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}
      <CornerCastings />
      {/* RAVA logo, centred on the long side */}
      <mesh position={[0, 0, 1.23]}>
        <planeGeometry args={[1.5, 1.98]} />
        <meshStandardMaterial map={logo} transparent roughness={0.7} />
      </mesh>
      {frost && (
        <mesh renderOrder={-1}>
          <boxGeometry args={[7.12, 2.6, 2.56]} />
          <meshBasicMaterial
            color={RAVA.mist}
            transparent
            opacity={0.12}
            side={BackSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

function DryBox({ steel }: { steel: Steel }) {
  return (
    <group>
      <SteelBox args={[7, 2.5, 2.42]} steel={steel} color="#e7ebee" />
      {/* door seam on the +X end */}
      <mesh position={[3.51, 0, 0]}>
        <boxGeometry args={[0.02, 2.4, 0.04]} />
        <meshStandardMaterial color="#3b4653" metalness={0.6} roughness={0.5} />
      </mesh>
      <CornerCastings />
    </group>
  );
}

function Genset() {
  return (
    <group position={[0, 0.9, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 1.7, 1.7]} />
        <meshStandardMaterial color="#aeb6bf" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* radiator fan */}
      <mesh position={[1.62, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.12, 28]} />
        <meshStandardMaterial color="#3c444d" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* exhaust stack */}
      <mesh position={[-1.2, 1.35, 0.5]}>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 14]} />
        <meshStandardMaterial color="#5b636c" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* control panel */}
      <mesh position={[0, 0.1, 0.9]}>
        <boxGeometry args={[0.9, 0.7, 0.08]} />
        <meshStandardMaterial color={RAVA.pale} metalness={0.2} roughness={0.5} />
      </mesh>
      {/* skids */}
      {[-1.3, 1.3].map((x, i) => (
        <mesh key={i} position={[x, -0.95, 0]}>
          <boxGeometry args={[0.3, 0.25, 1.9]} />
          <meshStandardMaterial color="#3b4653" metalness={0.6} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Chassis() {
  return (
    <group position={[0, 0.55, 0]}>
      {/* main rails */}
      {[-0.7, 0.7].map((z, i) => (
        <mesh key={i} position={[0, 0.3, z]}>
          <boxGeometry args={[8, 0.18, 0.16]} />
          <meshStandardMaterial color="#3b4653" metalness={0.7} roughness={0.5} />
        </mesh>
      ))}
      {/* cross members */}
      {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
        <mesh key={i} position={[x, 0.3, 0]}>
          <boxGeometry args={[0.14, 0.14, 1.5]} />
          <meshStandardMaterial color="#3b4653" metalness={0.7} roughness={0.5} />
        </mesh>
      ))}
      {/* kingpin plate */}
      <mesh position={[3, 0.42, 0]}>
        <boxGeometry args={[1.4, 0.06, 1.4]} />
        <meshStandardMaterial color="#4a525b" metalness={0.7} roughness={0.5} />
      </mesh>
      {/* wheels */}
      {[-3.2, -2.6, 2.2, 2.8].flatMap((x) =>
        [-0.95, 0.95].map((z, i) => (
          <mesh key={`${x}-${i}`} position={[x, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.3, 20]} />
            <meshStandardMaterial color="#14181d" roughness={0.9} metalness={0.1} />
          </mesh>
        )),
      )}
    </group>
  );
}

function PartsRack() {
  return (
    <group position={[0, 0.9, 0]}>
      {/* frame */}
      {[-1.4, 1.4].flatMap((x) =>
        [-0.9, 0.9].map((z, i) => (
          <mesh key={`${x}-${i}`} position={[x, 0, z]}>
            <boxGeometry args={[0.1, 2.2, 0.1]} />
            <meshStandardMaterial color="#3b4653" metalness={0.7} roughness={0.5} />
          </mesh>
        )),
      )}
      {[-0.7, 0.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[2.9, 0.06, 1.9]} />
          <meshStandardMaterial color="#8f9aa8" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {/* boxes — resting on the two shelves (y -0.7 and y 0.5) */}
      {[
        [-0.8, -0.42, 0],
        [0.2, -0.42, 0.2],
        [0.9, -0.42, -0.3],
        [-0.6, 0.78, 0.1],
        [0.5, 0.78, -0.2],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <boxGeometry args={[0.6, 0.5, 0.6]} />
          <meshStandardMaterial color={i % 2 ? RAVA.pale : RAVA.light} roughness={0.8} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

export function ProductsScene() {
  const rail = useRef<Group>(null);
  const steel = useSteel();
  const models = useRef<(Group | null)[]>([]);
  const tier = useScene((s) => s.tier);
  const useGlb = tier !== 'low';

  useFrame((_, dt) => {
    dt = Math.min(dt, 1 / 30);
    if (rail.current) rail.current.visible = sceneState().active === 'products';
    if (rail.current && !rail.current.visible) return;
    const p = sectionProgress('products');
    const activeF = p * (IDS.length - 1);
    if (rail.current) {
      // +5 keeps the active product in the right-hand "stage" zone, copy on the left
      rail.current.position.x = lerp(
        rail.current.position.x,
        5 - activeF * GAP,
        1 - Math.exp(-6 * Math.min(dt, 0.05)),
      );
    }
    const k = 1 - Math.exp(-9 * Math.min(dt, 0.05));
    models.current.forEach((g, i) => {
      if (!g) return;
      const d = Math.abs(i - activeF);
      // only render the active model + its immediate neighbours — models
      // sliding through the frame edges were shimmering as they passed
      const on = d < 1.85;
      g.visible = on;
      if (!on) return;
      g.rotation.y += dt * 0.14;
      const s = lerp(0.68, 1, clamp(1 - d));
      g.scale.setScalar(lerp(g.scale.x, s, k));
      g.position.y = lerp(g.position.y, MathUtils.degToRad(d < 0.5 ? 0 : 6) * 2, k);
    });
  });

  return (
    <group ref={rail} position={[0, -0.3, 0]}>
      {IDS.map((id, i) => (
        <group key={id} ref={(el) => (models.current[i] = el)} position={[i * GAP, 0, 0]}>
          {id === 'refrigerated' &&
            (useGlb ? <GlbReefer /> : <Reefer steel={steel} />)}
          {id === 'blast-freezer' &&
            (useGlb ? <GlbReefer frost /> : <Reefer steel={steel} frost />)}
          {id === 'dry' && <DryBox steel={steel} />}
          {id === 'gensets' && <Genset />}
          {id === 'chassis' && <Chassis />}
          {id === 'parts' && <PartsRack />}
        </group>
      ))}
    </group>
  );
}
