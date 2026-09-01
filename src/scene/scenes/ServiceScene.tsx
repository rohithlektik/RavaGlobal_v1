import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, CatmullRomCurve3, Vector3, TubeGeometry } from 'three';
import { useMemo } from 'react';
import { RAVA } from '../palette';
import { sceneState, sectionProgress } from '@/store/scene';
import { clamp, easing, lerp } from '@/animations/easing';

const UNIT = '#c9ced4';
const DARK = '#4a525b';

/** Parts of the reefer machinery, each with an explode direction + distance. */
interface Part {
  key: string;
  offset: [number, number, number];
  render: () => React.ReactNode;
}

export function ServiceScene() {
  const root = useRef<Group>(null);
  const parts = useRef<(Group | null)[]>([]);
  const fanA = useRef<Group>(null);
  const fanB = useRef<Group>(null);

  const line1 = useMemo(
    () =>
      new TubeGeometry(
        new CatmullRomCurve3([
          new Vector3(-0.4, -0.3, -0.3),
          new Vector3(-0.1, 0.2, 0.1),
          new Vector3(0.2, 0.6, 0.35),
        ]),
        20,
        0.03,
        8,
      ),
    [],
  );

  const PARTS: Part[] = [
    {
      key: 'backplate',
      offset: [-1.6, 0, 0],
      render: () => (
        <mesh>
          <boxGeometry args={[0.12, 2.3, 2.3]} />
          <meshStandardMaterial color={UNIT} metalness={0.5} roughness={0.5} />
        </mesh>
      ),
    },
    {
      key: 'condenser',
      offset: [0, 1.7, 0],
      render: () => (
        <group>
          <mesh>
            <boxGeometry args={[0.5, 0.6, 2]} />
            <meshStandardMaterial color="#8f9aa8" metalness={0.6} roughness={0.4} />
          </mesh>
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh key={i} position={[0, 0, -0.9 + i * 0.16]}>
              <boxGeometry args={[0.52, 0.62, 0.02]} />
              <meshStandardMaterial color="#7f878f" metalness={0.6} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ),
    },
    {
      key: 'fans',
      offset: [1.9, 0, 0],
      render: () => (
        <group>
          {[-0.55, 0.55].map((z, i) => (
            <group key={i} position={[0, 0.3, z]}>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[0.34, 0.34, 0.12, 26, 1, true]} />
                <meshStandardMaterial color={DARK} metalness={0.5} roughness={0.6} />
              </mesh>
              <group ref={i === 0 ? fanA : fanB}>
                {Array.from({ length: 5 }).map((_, b) => (
                  <mesh key={b} rotation={[0, Math.PI / 2, (b * Math.PI * 2) / 5]}>
                    <boxGeometry args={[0.02, 0.28, 0.12]} />
                    <meshStandardMaterial color="#9aa3ac" metalness={0.7} roughness={0.4} />
                  </mesh>
                ))}
              </group>
            </group>
          ))}
        </group>
      ),
    },
    {
      key: 'compressor',
      offset: [0.3, -1.7, -0.5],
      render: () => (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 0.9, 20]} />
          <meshStandardMaterial color="#5b636c" metalness={0.6} roughness={0.5} />
        </mesh>
      ),
    },
    {
      key: 'controller',
      offset: [1.4, -0.6, 1.4],
      render: () => (
        <group>
          <mesh>
            <boxGeometry args={[0.5, 0.4, 0.08]} />
            <meshStandardMaterial color={RAVA.pale} metalness={0.2} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.06, 0.05]}>
            <planeGeometry args={[0.34, 0.12]} />
            <meshStandardMaterial color={RAVA.abyss} emissive={RAVA.light} emissiveIntensity={1.1} toneMapped={false} />
          </mesh>
        </group>
      ),
    },
    {
      key: 'evaporator',
      offset: [0, -0.2, 2],
      render: () => (
        <mesh>
          <boxGeometry args={[0.5, 0.5, 1.9]} />
          <meshStandardMaterial color={UNIT} metalness={0.5} roughness={0.5} />
        </mesh>
      ),
    },
  ];

  useFrame((_, dt) => {
    dt = Math.min(dt, 1 / 30);
    if (root.current) root.current.visible = sceneState().active === 'service';
    if (root.current && !root.current.visible) return;
    const raw = sectionProgress('service');
    // 0..0.5 explode out, 0.5..1 drift back together
    const e = raw < 0.5 ? easing.outQuint(raw * 2) : easing.inOutSine(1 - (raw - 0.5) * 2);
    const explode = clamp(e);
    parts.current.forEach((g, i) => {
      if (!g) return;
      const o = PARTS[i].offset;
      g.position.set(o[0] * explode, o[1] * explode, o[2] * explode);
      g.rotation.y = lerp(g.rotation.y, explode * 0.25, 0.1);
    });
    if (root.current) root.current.rotation.y += dt * 0.12;
    const spin = dt * 10;
    if (fanA.current) fanA.current.rotation.x += spin;
    if (fanB.current) fanB.current.rotation.x += spin;
  });

  return (
    <group ref={root} position={[2.6, 0.1, 0]}>
      {PARTS.map((p, i) => (
        <group key={p.key} ref={(el) => (parts.current[i] = el)}>
          {p.render()}
        </group>
      ))}
      <mesh geometry={line1}>
        <meshStandardMaterial color="#8a5a34" metalness={0.85} roughness={0.35} />
      </mesh>
    </group>
  );
}
