import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Group,
  MeshStandardMaterial,
  Points,
  SRGBColorSpace,
  Vector2,
} from 'three';
import { RAVA } from './palette';
import { makeSteelTextures } from './steel';
import { GlbContainer } from './GlbContainer';
import type { ContainerDriver } from './containerDriver';
import { clamp, damp } from '@/animations/easing';

const L = 12;
const H = 2.6;
const W = 2.44;
const HW = W / 2;
const T = 0.09; // skin thickness

export type ContainerDetail = 'high' | 'mid' | 'low';

interface Props {
  driver: MutableRefObject<ContainerDriver>;
  detail?: ContainerDetail;
  /** optional real model — when provided the procedural build is skipped */
  modelUrl?: string;
}

const CAST = '#3b4653'; // corner castings / hardware — neutral steel
const UNIT = '#c9ced4'; // refrigeration unit housing
const NORMAL_SCALE = new Vector2(0.5, 0.5);

/**
 * Public entry. Renders the purchased reefer model (`public/models/container.glb`,
 * driven for doors / fans / x-ray / cold-air by `GlbContainer`). Set
 * `VITE_CONTAINER_GLB=procedural` to fall back to the fully procedural build.
 */
export function RavaContainer({ driver, detail = 'high', modelUrl }: Props) {
  if (modelUrl === 'procedural') return <ProceduralContainer driver={driver} detail={detail} />;
  return <GlbContainer driver={driver} detail={detail} />;
}

function ProceduralContainer({ driver, detail = 'high' }: Omit<Props, 'modelUrl'>) {
  const doorL = useRef<Group>(null);
  const doorR = useRef<Group>(null);
  const fanA = useRef<Group>(null);
  const fanB = useRef<Group>(null);
  const decalMat = useRef<MeshStandardMaterial>(null);
  const lcdMat = useRef<MeshStandardMaterial>(null);
  const skinMats = useRef<MeshStandardMaterial[]>([]);
  const interiorMat = useRef<MeshStandardMaterial>(null);
  const vapor = useRef<Points>(null);

  const ridges = detail === 'low' ? 5 : 6;
  const steel = useMemo(() => makeSteelTextures('#eef2f5', ridges), [ridges]);
  useEffect(() => () => steel.dispose(), [steel]);

  // per-face texture repeats (clone shares the bitmap, cheap)
  const sideTex = useMemo(() => {
    const m = steel.map.clone();
    const n = steel.normalMap.clone();
    const r = steel.roughnessMap.clone();
    [m, n, r].forEach((t) => t.repeat.set(L / 2.6, 1));
    m.colorSpace = SRGBColorSpace;
    return { m, n, r };
  }, [steel]);
  const doorTex = useMemo(() => {
    const m = steel.map.clone();
    const n = steel.normalMap.clone();
    const r = steel.roughnessMap.clone();
    [m, n, r].forEach((t) => t.repeat.set(HW / 1.4, 1));
    m.colorSpace = SRGBColorSpace;
    return { m, n, r };
  }, [steel]);

  const logo = useTexture('/brand/rava-logo.png');
  logo.colorSpace = SRGBColorSpace;
  logo.anisotropy = 8;

  const vaporGeo = useMemo(() => {
    const n = detail === 'low' ? 90 : 220;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = 0.8 + Math.random() * (L - 1.4);
      pos[i * 3 + 1] = 0.2 + Math.random() * (H - 0.5);
      pos[i * 3 + 2] = -HW + 0.25 + Math.random() * (W - 0.5);
      seed[i] = Math.random();
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('seed', new BufferAttribute(seed, 1));
    return g;
  }, [detail]);

  const registerSkin = (m: MeshStandardMaterial | null) => {
    if (m && !skinMats.current.includes(m)) skinMats.current.push(m);
  };

  useFrame((state, dt) => {
    dt = Math.min(dt, 1 / 30);
    const d = driver.current;
    const k = Math.min(dt, 1 / 45);
    const t = state.clock.elapsedTime;

    if (doorL.current && doorR.current) {
      const a = clamp(d.doorOpen) * 2.0; // ~115° — realistic swing, no wall clip
      doorL.current.rotation.y = damp(doorL.current.rotation.y, -a, 5, k);
      doorR.current.rotation.y = damp(doorR.current.rotation.y, a, 5, k);
    }

    const spin = 0.6 + d.power * 26;
    if (fanA.current) fanA.current.rotation.z += spin * k;
    if (fanB.current) fanB.current.rotation.z += spin * k;

    if (decalMat.current) {
      decalMat.current.opacity = damp(decalMat.current.opacity, clamp(d.logoReveal), 5, k);
    }
    if (lcdMat.current) {
      lcdMat.current.emissiveIntensity = damp(
        lcdMat.current.emissiveIntensity,
        0.2 + d.power * (1.1 + Math.sin(t * 4) * 0.12),
        4,
        k,
      );
    }
    if (interiorMat.current) {
      interiorMat.current.emissiveIntensity = damp(
        interiorMat.current.emissiveIntensity,
        0.04 + clamp(d.interior) * 0.16,
        4,
        k,
      );
    }

    // exterior skin dissolve. Opaque (no transparency sorting) until xray engages,
    // then one flag flip -> transparent. This kills the z-sort flicker.
    const xr = clamp(d.xray);
    const wantTransparent = xr > 0.02;
    const targetOpacity = 1 - xr * 0.92;
    for (const m of skinMats.current) {
      m.opacity = damp(m.opacity, wantTransparent ? targetOpacity : 1, 5, k);
      if (m.transparent !== wantTransparent) {
        m.transparent = wantTransparent;
        m.depthWrite = !wantTransparent;
        m.needsUpdate = true;
      }
    }

    // drifting cold air
    if (vapor.current) {
      const mat = vapor.current.material as { opacity: number };
      mat.opacity = damp(mat.opacity, clamp(d.interior) * 0.5 * clamp(d.power), 3, k);
      const p = vaporGeo.attributes.position as BufferAttribute;
      const s = vaporGeo.attributes.seed as BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        let x = p.getX(i) - (0.25 + s.getX(i) * 0.3) * k; // drift toward the doors' opposite? toward -x (return air)
        if (x < 0.6) x = L - 1;
        p.setX(i, x);
        p.setY(i, p.getY(i) + Math.sin(t * 0.6 + s.getX(i) * 30) * 0.0016);
      }
      p.needsUpdate = true;
    }
  });

  type Tex = { m: typeof steel.map; n: typeof steel.normalMap; r: typeof steel.roughnessMap };
  const skin = (tex: Tex) => (
    <meshStandardMaterial
      ref={(m) => registerSkin(m)}
      map={tex.m}
      normalMap={tex.n}
      roughnessMap={tex.r}
      color="#c4cfd8"
      metalness={0.12}
      roughness={0.82}
      envMapIntensity={0.55}
      normalScale={NORMAL_SCALE}
    />
  );

  return (
    <group name="rava-container">
      <group position={[-L / 2, -H / 2, 0]}>
        {/* ---------- exterior shell: ONE solid box (no coincident faces -> no z-fight) ---------- */}
        <mesh position={[L / 2, H / 2, 0]}>
          <boxGeometry args={[L, H, W]} />
          {skin(sideTex)}
        </mesh>
        {/* underframe — a hair narrower so it never coplanar-fights the shell */}
        <mesh position={[L / 2, -0.06, 0]}>
          <boxGeometry args={[L - 0.05, 0.16, W - 0.05]} />
          <meshStandardMaterial color={CAST} roughness={0.7} metalness={0.35} />
        </mesh>
        {/* forklift pockets */}
        {[-1.1, 1.1].map((z, i) => (
          <mesh key={i} position={[L * 0.42, T * 0.7, z]}>
            <boxGeometry args={[1.1, T * 1.1, 0.32]} />
            <meshStandardMaterial color={RAVA.navy} roughness={0.8} metalness={0.3} />
          </mesh>
        ))}

        {/* ---------- corner castings (embedded into the shell, not skimming it) ---------- */}
        {[0.02, L - 0.02].flatMap((x) =>
          [0.02, H - 0.02].flatMap((y) =>
            [HW - 0.12, -HW + 0.12].map((z, i) => (
              <mesh key={`${x}-${y}-${i}`} position={[x, y, z]}>
                <boxGeometry args={[0.42, 0.4, 0.42]} />
                <meshStandardMaterial color={CAST} roughness={0.55} metalness={0.5} />
              </mesh>
            )),
          ),
        )}

        {/* ---------- RAVA logo, centred on the +Z side panel, tracks the box ---------- */}
        <mesh position={[L / 2, H * 0.54, HW + 0.1]}>
          <planeGeometry args={[1.62, 2.14]} />
          <meshStandardMaterial
            ref={decalMat}
            map={logo}
            transparent
            opacity={0}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-4}
            roughness={0.7}
            metalness={0}
          />
        </mesh>

        {/* ---------- interior: inward-facing liner panels + floor + bulkhead ---------- */}
        <group>
          {/* two side liner walls + ceiling, single-sided facing inward, well inset */}
          <mesh position={[L / 2, H / 2, HW - 0.16]}>
            <planeGeometry args={[L - 0.5, H - 0.22]} />
            <meshStandardMaterial
              ref={interiorMat}
              color={RAVA.pale}
              emissive={RAVA.light}
              emissiveIntensity={0.04}
              roughness={0.66}
              metalness={0.18}
              side={BackSide}
            />
          </mesh>
          <mesh position={[L / 2, H / 2, -HW + 0.16]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[L - 0.5, H - 0.22]} />
            <meshStandardMaterial color={RAVA.pale} roughness={0.66} metalness={0.18} side={BackSide} />
          </mesh>
          <mesh position={[L / 2, H - 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[L - 0.5, W - 0.3]} />
            <meshStandardMaterial color={RAVA.mist} roughness={0.7} metalness={0.15} side={BackSide} />
          </mesh>
          {/* rear bulkhead (machinery end) */}
          <mesh position={[0.46, H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[W - 0.34, H - 0.24]} />
            <meshStandardMaterial color={RAVA.mist} roughness={0.7} metalness={0.2} side={BackSide} />
          </mesh>
          {/* T-bar aluminium floor (thick box so nothing hovers / z-fights) */}
          <mesh position={[L / 2, 0.16, 0]}>
            <boxGeometry args={[L - 0.4, 0.14, W - 0.32]} />
            <meshStandardMaterial
              color="#b9c0c9"
              metalness={0.7}
              roughness={0.4}
              roughnessMap={sideTex.r}
            />
          </mesh>
          {/* evaporator (cold air source) high on the bulkhead */}
          <mesh position={[0.7, H - 0.42, 0]}>
            <boxGeometry args={[0.5, 0.5, W - 0.5]} />
            <meshStandardMaterial color={UNIT} metalness={0.5} roughness={0.5} />
          </mesh>
          {/* drifting cold air */}
          <points ref={vapor} geometry={vaporGeo} frustumCulled={false}>
            <pointsMaterial
              size={detail === 'low' ? 0.06 : 0.045}
              color={RAVA.mist}
              transparent
              opacity={0}
              depthWrite={false}
              sizeAttenuation
            />
          </points>
        </group>

        {/* ---------- doors at +X end, hinged at the outer edges ---------- */}
        {([1, -1] as const).map((s) => (
          <group
            key={s}
            ref={s === 1 ? doorL : doorR}
            position={[L - T / 2, 0, s * (HW - 0.03)]}
          >
            {/* leaf: covers half the width, inboard edge near z=0 */}
            <mesh position={[T / 2, H / 2, -s * (HW - 0.06) * 0.5]}>
              <boxGeometry args={[T, H - 0.06, HW - 0.06]} />
              {skin(doorTex)}
            </mesh>
            {/* two vertical lock bars on the outward face */}
            {[0.32, 0.72].map((f, i) => (
              <group key={i} position={[T + 0.03, H / 2, -s * (HW - 0.06) * f]}>
                <mesh>
                  <cylinderGeometry args={[0.035, 0.035, H - 0.3, 10]} />
                  <meshStandardMaterial color={CAST} roughness={0.42} metalness={0.8} />
                </mesh>
                <mesh position={[0.05, -H * 0.12, 0]}>
                  <boxGeometry args={[0.14, 0.24, 0.06]} />
                  <meshStandardMaterial color={CAST} roughness={0.42} metalness={0.8} />
                </mesh>
              </group>
            ))}
            {/* hinges on the outer (hinged) edge */}
            {[0.4, H / 2, H - 0.4].map((hy, i) => (
              <mesh key={i} position={[0, hy, 0]}>
                <boxGeometry args={[0.12, 0.2, 0.1]} />
                <meshStandardMaterial color={CAST} roughness={0.5} metalness={0.75} />
              </mesh>
            ))}
          </group>
        ))}

        {/* ================= REFRIGERATION UNIT (machinery end, outside, -X) ================= */}
        <group position={[0.04, 0, 0]}>
          {/* housing — overlaps the shell end slightly so no coplanar z-fight */}
          <mesh position={[-0.3, H * 0.52, 0]}>
            <boxGeometry args={[0.62, H * 0.92, W - 0.08]} />
            <meshStandardMaterial color={UNIT} metalness={0.5} roughness={0.46} />
          </mesh>
          {/* recessed darker inset the fans sit in */}
          <mesh position={[-0.5, H * 0.62, 0]}>
            <boxGeometry args={[0.14, 1.35, W - 0.22]} />
            <meshStandardMaterial color="#3c444d" metalness={0.4} roughness={0.7} />
          </mesh>

          {/* two condenser fans with protective grilles */}
          {[-0.56, 0.56].map((z, i) => (
            <group key={i} position={[-0.58, H * 0.62, z]}>
              {/* shroud */}
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[0.34, 0.34, 0.12, 26, 1, true]} />
                <meshStandardMaterial color="#4a525b" metalness={0.5} roughness={0.6} side={BackSide} />
              </mesh>
              {/* spinning blades */}
              <group ref={i === 0 ? fanA : fanB} position={[-0.02, 0, 0]}>
                {Array.from({ length: 5 }).map((_, b) => (
                  <mesh
                    key={b}
                    rotation={[0, Math.PI / 2, (b * Math.PI * 2) / 5]}
                    position={[0, 0, 0]}
                  >
                    <boxGeometry args={[0.02, 0.28, 0.12]} />
                    <meshStandardMaterial color="#9aa3ac" metalness={0.7} roughness={0.4} />
                  </mesh>
                ))}
                <mesh rotation={[0, Math.PI / 2, 0]}>
                  <cylinderGeometry args={[0.07, 0.09, 0.14, 14]} />
                  <meshStandardMaterial color="#7d858e" metalness={0.7} roughness={0.4} />
                </mesh>
              </group>
              {/* wire grille */}
              {[0.14, 0.26].map((rr, gi) => (
                <mesh key={gi} position={[-0.09, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <torusGeometry args={[rr, 0.012, 8, 28]} />
                  <meshStandardMaterial color="#565e66" metalness={0.6} roughness={0.5} />
                </mesh>
              ))}
              {detail === 'high' &&
                Array.from({ length: 4 }).map((_, wi) => (
                  <mesh key={wi} position={[-0.09, 0, 0]} rotation={[(wi * Math.PI) / 4, Math.PI / 2, 0]}>
                    <cylinderGeometry args={[0.012, 0.012, 0.62, 6]} />
                    <meshStandardMaterial color="#565e66" metalness={0.6} roughness={0.5} />
                  </mesh>
                ))}
            </group>
          ))}

          {/* condenser louvers (lower band) */}
          {Array.from({ length: 7 }).map((_, i) => (
            <mesh key={i} position={[-0.52, 0.35 + i * 0.09, 0]} rotation={[0.5, 0, 0]}>
              <boxGeometry args={[0.05, 0.02, W - 0.3]} />
              <meshStandardMaterial color="#7f878f" metalness={0.6} roughness={0.5} />
            </mesh>
          ))}

          {/* control panel with an LED that lights when powered */}
          <group position={[-0.58, H * 0.3, W * 0.28]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh>
              <boxGeometry args={[0.34, 0.28, 0.06]} />
              <meshStandardMaterial color="#e7ebee" metalness={0.2} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.04, 0.035]}>
              <planeGeometry args={[0.22, 0.1]} />
              <meshStandardMaterial
                ref={lcdMat}
                color={RAVA.abyss}
                emissive={RAVA.light}
                emissiveIntensity={0.2}
                toneMapped={false}
              />
            </mesh>
          </group>

          {/* compressor box, low */}
          <mesh position={[-0.42, 0.34, -0.5]}>
            <boxGeometry args={[0.4, 0.5, 0.6]} />
            <meshStandardMaterial color="#5b636c" metalness={0.55} roughness={0.55} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

useTexture.preload('/brand/rava-logo.png');
