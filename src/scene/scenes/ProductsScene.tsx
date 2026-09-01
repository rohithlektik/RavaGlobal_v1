import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Group, SRGBColorSpace, MathUtils } from 'three';
import { useSteel, SteelBox, type Steel } from '../parts';
import { RAVA } from '../palette';
import { sceneState, sectionProgress } from '@/store/scene';
import { clamp, lerp } from '@/animations/easing';

const GAP = 16;
const IDS = ['refrigerated', 'blast-freezer', 'dry', 'gensets', 'chassis', 'parts'] as const;

function Reefer({ steel, frost = false }: { steel: Steel; frost?: boolean }) {
  const logo = useTexture('/brand/rava-logo.png');
  logo.colorSpace = SRGBColorSpace;
  return (
    <group>
      <SteelBox args={[7, 2.5, 2.42]} steel={steel} color={frost ? '#dfeaf1' : RAVA.white} />
      {/* refrigeration unit on -X end */}
      <mesh position={[-3.7, 1.25, 0]}>
        <boxGeometry args={[0.5, 2.3, 2.3]} />
        <meshStandardMaterial color="#c9ced4" metalness={0.5} roughness={0.46} />
      </mesh>
      {[-0.55, 0.55].map((z, i) => (
        <mesh key={i} position={[-3.98, 1.5, z]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.14, 24]} />
          <meshStandardMaterial color="#4a525b" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}
      {/* corner castings */}
      {[-3.5, 3.5].flatMap((x) =>
        [0.16, 2.44].flatMap((y) =>
          [1.2, -1.2].map((z, i) => (
            <mesh key={`${x}-${y}-${i}`} position={[x, y, z]}>
              <boxGeometry args={[0.32, 0.28, 0.28]} />
              <meshStandardMaterial color="#3b4653" metalness={0.7} roughness={0.5} />
            </mesh>
          )),
        ),
      )}
      {/* RAVA logo */}
      <mesh position={[0, 1.4, 1.24]}>
        <planeGeometry args={[1.5, 1.98]} />
        <meshStandardMaterial map={logo} transparent roughness={0.7} />
      </mesh>
      {frost && (
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[7.05, 2.55, 2.5]} />
          <meshStandardMaterial color={RAVA.mist} transparent opacity={0.14} roughness={1} />
        </mesh>
      )}
    </group>
  );
}

function DryBox({ steel }: { steel: Steel }) {
  return (
    <group>
      <SteelBox args={[7, 2.5, 2.42]} steel={steel} color="#e7ebee" />
      {/* door seam */}
      <mesh position={[3.51, 1.25, 0]}>
        <boxGeometry args={[0.02, 2.4, 0.04]} />
        <meshStandardMaterial color="#3b4653" metalness={0.6} roughness={0.5} />
      </mesh>
      {[-3.5, 3.5].flatMap((x) =>
        [0.16, 2.44].flatMap((y) =>
          [1.2, -1.2].map((z, i) => (
            <mesh key={`${x}-${y}-${i}`} position={[x, y, z]}>
              <boxGeometry args={[0.32, 0.28, 0.28]} />
              <meshStandardMaterial color="#3b4653" metalness={0.7} roughness={0.5} />
            </mesh>
          )),
        ),
      )}
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
      {/* boxes */}
      {[
        [-0.8, -0.35, 0],
        [0.2, -0.35, 0.2],
        [0.9, -0.4, -0.3],
        [-0.6, 0.9, 0.1],
        [0.5, 0.86, -0.2],
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
    models.current.forEach((g, i) => {
      if (!g) return;
      g.rotation.y += dt * 0.14;
      const d = Math.abs(i - activeF);
      const s = lerp(0.68, 1, clamp(1 - d));
      g.scale.setScalar(lerp(g.scale.x, s, 0.1));
      g.position.y = lerp(g.position.y, MathUtils.degToRad(d < 0.5 ? 0 : 6) * 2, 0.1);
    });
  });

  return (
    <group ref={rail} position={[0, -0.3, 0]}>
      {IDS.map((id, i) => (
        <group key={id} ref={(el) => (models.current[i] = el)} position={[i * GAP, 0, 0]}>
          {id === 'refrigerated' && <Reefer steel={steel} />}
          {id === 'blast-freezer' && <Reefer steel={steel} frost />}
          {id === 'dry' && <DryBox steel={steel} />}
          {id === 'gensets' && <Genset />}
          {id === 'chassis' && <Chassis />}
          {id === 'parts' && <PartsRack />}
        </group>
      ))}
    </group>
  );
}
