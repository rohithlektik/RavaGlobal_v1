import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  PointLight,
  Points,
  SRGBColorSpace,
} from 'three';
import { RAVA } from './palette';
import type { ContainerDriver } from './containerDriver';
import { clamp, damp } from '@/animations/easing';

const URL = '/models/container.glb';
useGLTF.preload(URL);

// real 20 ft reefer: ~6.4 m along Z, 2.44 wide, 2.6 tall, doors +Z, machinery -Z,
// standing on y 0..2.6. Rotate Z->X so doors sit at +X for the camera rig.
const S = 1;
const LIFT = 1.3;

interface Props {
  driver: MutableRefObject<ContainerDriver>;
  detail?: 'high' | 'mid' | 'low';
}

export function GlbContainer({ driver, detail = 'high' }: Props) {
  const gltf = useGLTF(URL);

  const logo = useTexture('/brand/rava-logo.png');
  logo.colorSpace = SRGBColorSpace;
  logo.anisotropy = 8;

  const doorL = useRef<Object3D | null>(null);
  const doorR = useRef<Object3D | null>(null);
  const fanA = useRef<Group>(null);
  const fanB = useRef<Group>(null);
  const decalMat = useRef<MeshStandardMaterial>(null);
  const interiorLight = useRef<PointLight>(null);
  const skinMats = useRef<MeshStandardMaterial[]>([]);
  const vapor = useRef<Points>(null);

  // one-time: keep the model's textured materials, drop the y-lift,
  // hinge-correct the doors.
  const scene = useMemo(() => {
    const root = gltf.scene.clone(true);
    skinMats.current = [];

    root.children.forEach((o) => (o.position.y -= LIFT));

    const inDoor = (o: Object3D) => {
      let p: Object3D | null = o;
      while (p) {
        if (p.name === 'Door_Left' || p.name === 'Door_Right') return true;
        p = p.parent;
      }
      return false;
    };

    root.traverse((o) => {
      o.castShadow = false;
      o.receiveShadow = false;
      if (!(o as Mesh).isMesh) return;
      const m = o as Mesh;
      const list = Array.isArray(m.material) ? m.material : [m.material];
      const swapped = list.map((mm) => {
        let mat = mm as MeshStandardMaterial;
        // door panels are thin one-sided -> you can see through them. clone +
        // double-side just the door materials so the leaves read solid.
        if (inDoor(o)) mat = mat.clone() as MeshStandardMaterial;
        if (inDoor(o)) mat.side = DoubleSide;
        mat.envMapIntensity = 0.6;
        if (!skinMats.current.includes(mat)) skinMats.current.push(mat);
        return mat;
      });
      m.material = Array.isArray(m.material) ? swapped : swapped[0];
    });

    // the doors load as GROUPS named Door_Left / Door_Right (multi-primitive).
    // move the hinge edge to the group origin by translating every child
    // geometry, then push the group back -> group.rotation.y == hinge swing.
    const rehinge = (name: string, outerLocalX: number) => {
      const g = root.getObjectByName(name);
      if (!g) return null;
      g.traverse((o) => {
        const mesh = o as Mesh;
        if (mesh.isMesh) {
          mesh.geometry = mesh.geometry.clone();
          mesh.geometry.translate(-outerLocalX, 0, 0);
        }
      });
      g.position.x += outerLocalX;
      return g;
    };
    doorR.current = rehinge('Door_Right', 0.59);
    doorL.current = rehinge('Door_Left', -0.61);

    return root;
  }, [gltf.scene]);

  const vaporGeo = useMemo(() => {
    const n = detail === 'low' ? 80 : 200;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = -1.0 + Math.random() * 2.0;
      pos[i * 3 + 1] = -0.9 + Math.random() * 1.9;
      pos[i * 3 + 2] = -2.6 + Math.random() * 5.6;
      seed[i] = Math.random();
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('seed', new BufferAttribute(seed, 1));
    return g;
  }, [detail]);

  useFrame((state, dt) => {
    dt = Math.min(dt, 1 / 30);
    const d = driver.current;
    const k = Math.min(dt, 1 / 45);
    const t = state.clock.elapsedTime;

    // ~100°, swinging OUTWARD (away from the container interior)
    const a = clamp(d.doorOpen) * 1.72;
    if (doorL.current) doorL.current.rotation.y = damp(doorL.current.rotation.y, -a, 5, k);
    if (doorR.current) doorR.current.rotation.y = damp(doorR.current.rotation.y, a, 5, k);

    const spin = (2 + clamp(d.power) * 26) * dt;
    if (fanA.current) fanA.current.rotation.z += spin;
    if (fanB.current) fanB.current.rotation.z += spin;

    if (decalMat.current) {
      decalMat.current.opacity = damp(decalMat.current.opacity, clamp(d.logoReveal), 5, k);
    }
    if (interiorLight.current) {
      interiorLight.current.intensity = damp(
        interiorLight.current.intensity,
        clamp(d.interior) * 6,
        4,
        k,
      );
    }

    const xr = clamp(d.xray);
    const want = xr > 0.02;
    for (const m of skinMats.current) {
      m.opacity = damp(m.opacity, want ? 1 - xr * 0.92 : 1, 5, k);
      if (m.transparent !== want) {
        m.transparent = want;
        m.depthWrite = !want;
        m.needsUpdate = true;
      }
    }

    if (vapor.current) {
      const mat = vapor.current.material as { opacity: number };
      mat.opacity = damp(mat.opacity, clamp(d.interior) * 0.5 * clamp(d.power), 3, k);
      const p = vaporGeo.attributes.position as BufferAttribute;
      const s = vaporGeo.attributes.seed as BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        let z = p.getZ(i) + (0.4 + s.getX(i) * 0.5) * dt;
        if (z > 3.6) z = -2.6;
        p.setZ(i, z);
        let y = p.getY(i) - 0.14 * dt + Math.sin(t + s.getX(i) * 20) * 0.0018;
        if (y < -1.1) y = 1;
        p.setY(i, y);
      }
      p.needsUpdate = true;
    }
  });

  return (
    <group name="rava-container">
      <group scale={S} rotation={[0, Math.PI / 2, 0]}>
        <primitive object={scene} />

        {/* interior light — comes up when the camera is inside */}
        <pointLight
          ref={interiorLight}
          position={[0, 0.5, 0]}
          intensity={0}
          distance={9}
          decay={1.6}
          color={RAVA.mist}
        />
        {/* fill for the machinery end so the back never crushes to black */}
        <pointLight position={[0, 0.9, -3.7]} intensity={4.2} distance={7} decay={1.6} color={RAVA.pale} />
        <pointLight position={[0, 0.3, -2.7]} intensity={1.6} distance={4} decay={2} color={RAVA.mist} />

        {/* RAVA logo — small, true proportion, on the side (upper, near the door end) */}
        <mesh position={[-1.26, 0.45, 0.9]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.12, 1.55]} />
          <meshStandardMaterial
            ref={decalMat}
            map={logo}
            transparent
            opacity={0}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-4}
            roughness={0.7}
          />
        </mesh>

        {/* spinning condenser fans, proud of the machinery-end face (-Z) */}
        {[-0.48, 0.48].map((x, i) => (
          <group key={i} ref={i === 0 ? fanA : fanB} position={[x, 0.55, -3.27]}>
            {Array.from({ length: 6 }).map((_, b) => (
              <mesh key={b} rotation={[0, 0, (b * Math.PI * 2) / 6]} position={[0, 0.22, 0]}>
                <boxGeometry args={[0.03, 0.42, 0.12]} />
                <meshStandardMaterial color="#aab2bb" metalness={0.55} roughness={0.4} />
              </mesh>
            ))}
            <mesh>
              <cylinderGeometry args={[0.08, 0.1, 0.08, 14]} />
              <meshStandardMaterial color="#6b7480" metalness={0.6} roughness={0.5} />
            </mesh>
          </group>
        ))}

        {/* cold air rolling from the doorway */}
        <points ref={vapor} geometry={vaporGeo} frustumCulled={false}>
          <pointsMaterial
            size={detail === 'low' ? 0.08 : 0.06}
            color={RAVA.mist}
            transparent
            opacity={0}
            depthWrite={false}
            sizeAttenuation
          />
        </points>
      </group>
    </group>
  );
}
