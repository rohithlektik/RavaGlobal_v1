import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Group, SRGBColorSpace } from 'three';
import { useSteel, SteelBox } from '../parts';
import { RAVA } from '../palette';
import { sceneState, sectionProgress } from '@/store/scene';
import { clamp, lerp } from '@/animations/easing';

const N = 5; // cold-chain, pharma, construction, emergency, logistics

/** Racking + pallets. */
function ColdSet() {
  return (
    <group>
      {[-4.5, 4.5].map((x, s) => (
        <group key={s} position={[x, 0, 0]}>
          {[0, 1.3, 2.6].map((y, i) => (
            <mesh key={i} position={[0, y + 0.1, 0]}>
              <boxGeometry args={[0.16, 0.16, 8]} />
              <meshStandardMaterial color="#3b4653" metalness={0.6} roughness={0.5} />
            </mesh>
          ))}
          {[-2.6, 0, 2.6].map((z, i) => (
            <mesh key={i} position={[0, 1.4, z]}>
              <boxGeometry args={[1.4, 0.9, 1.1]} />
              <meshStandardMaterial color={RAVA.pale} roughness={0.85} metalness={0.05} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Clean-room panels + soft floor grid. */
function PharmaSet() {
  return (
    <group>
      {[-5, 5].map((x, i) => (
        <mesh key={i} position={[x, 1.6, 0]}>
          <boxGeometry args={[0.1, 3.2, 9]} />
          <meshStandardMaterial color={RAVA.white} roughness={0.4} metalness={0.1} emissive={RAVA.pale} emissiveIntensity={0.12} />
        </mesh>
      ))}
      <mesh position={[0, 3.3, 0]}>
        <boxGeometry args={[10, 0.1, 9]} />
        <meshStandardMaterial color={RAVA.pale} roughness={0.5} emissive={RAVA.light} emissiveIntensity={0.08} />
      </mesh>
    </group>
  );
}

/** Scaffold poles + a material stack + cone. */
function ConstructionSet() {
  return (
    <group>
      {[-4, 4].flatMap((x) =>
        [-3, 3].map((z, i) => (
          <mesh key={`${x}-${i}`} position={[x, 1.6, z]}>
            <cylinderGeometry args={[0.06, 0.06, 3.4, 8]} />
            <meshStandardMaterial color="#8f9aa8" metalness={0.6} roughness={0.5} />
          </mesh>
        )),
      )}
      {[0, 1, 2].map((y, i) => (
        <mesh key={i} position={[3.5, 0.3 + y * 0.4, 3]}>
          <boxGeometry args={[1.8, 0.35, 1.2]} />
          <meshStandardMaterial color="#5b636c" roughness={0.8} metalness={0.1} />
        </mesh>
      ))}
      <mesh position={[-3.5, 0.3, -3]}>
        <coneGeometry args={[0.4, 0.8, 16]} />
        <meshStandardMaterial color={RAVA.light} roughness={0.7} />
      </mesh>
    </group>
  );
}

/** Rapid-deploy: stacked blocks + more containers + a tent frame. */
function EmergencySet() {
  return (
    <group>
      {[-6, 6].map((x, s) => (
        <group key={s} position={[x, 0, -1]}>
          {[0, 1].map((y, i) => (
            <mesh key={i} position={[0, 1.3 + y * 2.7, 0]}>
              <boxGeometry args={[7, 2.6, 2.4]} />
              <meshStandardMaterial color={i ? '#dfe7ee' : RAVA.white} roughness={0.6} metalness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      <group position={[0, 0, 4]}>
        {[-2, 2].map((x, i) => (
          <mesh key={i} position={[x, 1, 0]} rotation={[0, 0, x > 0 ? -0.5 : 0.5]}>
            <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
            <meshStandardMaterial color="#8f9aa8" metalness={0.5} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 2.3, 0]}>
          <boxGeometry args={[4.4, 0.06, 2]} />
          <meshStandardMaterial color={RAVA.mist} transparent opacity={0.5} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/** Transport: road lines + distant container stacks + a truck cab block. */
function LogisticsSet() {
  return (
    <group>
      {[-10, -6, 6, 10].map((x, i) => (
        <group key={i} position={[x, 0, -6]}>
          {[0, 1, 2].map((y, j) => (
            <mesh key={j} position={[0, 1.3 + y * 2.7, 0]}>
              <boxGeometry args={[6.8, 2.6, 2.4]} />
              <meshStandardMaterial color={j % 2 ? '#d5dee6' : RAVA.white} roughness={0.6} metalness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 0.02, -8 + i * 2.2]}>
          <boxGeometry args={[0.3, 0.02, 1.1]} />
          <meshStandardMaterial color={RAVA.light} emissive={RAVA.light} emissiveIntensity={0.3} />
        </mesh>
      ))}
      <mesh position={[6, 1, 3]}>
        <boxGeometry args={[2.4, 2.4, 2.6]} />
        <meshStandardMaterial color={RAVA.deep} metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

const SETS = [ColdSet, PharmaSet, ConstructionSet, EmergencySet, LogisticsSet];

export function IndustriesScene() {
  const steel = useSteel();
  const logo = useTexture('/brand/rava-logo.png');
  logo.colorSpace = SRGBColorSpace;
  const root = useRef<Group>(null);
  const sets = useRef<(Group | null)[]>([]);

  useFrame(() => {
    if (root.current) root.current.visible = sceneState().active === 'industries';
    if (root.current && !root.current.visible) return;
    const p = sectionProgress('industries');
    const f = p * (N - 1);
    if (root.current) root.current.rotation.y = lerp(root.current.rotation.y, -0.4 - p * 0.5, 0.05);
    sets.current.forEach((g, i) => {
      if (!g) return;
      const vis = clamp(1 - Math.abs(i - f) * 1.4);
      g.scale.setScalar(lerp(g.scale.x || 0.001, lerp(0.6, 1, vis), 0.12));
      g.visible = vis > 0.02;
      g.traverse((o) => {
        const m = (o as unknown as { material?: { opacity: number; transparent: boolean } }).material;
        if (m) {
          m.transparent = true;
          m.opacity = vis;
        }
      });
    });
  });

  return (
    <group ref={root} position={[3.5, -1, 0]}>
      {/* the constant anchor: one white RAVA container, dead centre */}
      <SteelBox args={[7.5, 2.6, 2.45]} steel={steel} position={[0, 1.3, 0]} />
      <mesh position={[0, 1.45, 1.25]}>
        <planeGeometry args={[1.6, 2.1]} />
        <meshStandardMaterial map={logo} transparent roughness={0.7} />
      </mesh>
      {[-3.75, 3.75].flatMap((x) =>
        [0.16, 2.5].flatMap((y) =>
          [1.22, -1.22].map((z, i) => (
            <mesh key={`${x}-${y}-${i}`} position={[x, y, z]}>
              <boxGeometry args={[0.34, 0.3, 0.3]} />
              <meshStandardMaterial color="#3b4653" metalness={0.7} roughness={0.5} />
            </mesh>
          )),
        ),
      )}

      {SETS.map((Set, i) => (
        <group key={i} ref={(el) => (sets.current[i] = el)}>
          <Set />
        </group>
      ))}
    </group>
  );
}
