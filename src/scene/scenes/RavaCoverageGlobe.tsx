import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  QuadraticBezierCurve3,
  ShapeUtils,
  Vector2,
  Vector3,
} from 'three';
import { RAVA } from '../palette';
import { sceneState, sectionProgress } from '@/store/scene';
import { useScene } from '@/store/scene';
import { latLonToVec3, useUSStates, type StateShape } from '../geo/usStates';
import { coverageLocations, coverageHub, highlightedStates } from '@/data/coverage';

/* ------------------------------------------------------------------ *
 * A premium, U.S.-focused coverage globe.
 *
 *   Globe            deep-navy sphere + two additive atmosphere shells
 *   US state borders  thin subdued lines for every state
 *   Highlighted       brighter borders + a faint breathing fill for the
 *                     RAVA coverage states (see src/data/coverage.ts)
 *   Coverage pins      small white core + expanding ripple + soft glow
 *   Context arcs       faint great-circles from the Miami hub
 *   Animation          slow limited-range yaw pendulum — the U.S. never
 *                      rotates out of view; disabled under reduced motion
 *
 * Contract with the rig (unchanged from the old CoverageGlobe):
 *   - the root group is only visible while `active === 'coverage'`
 *   - `sectionProgress('coverage')` nudges the framing as the section scrubs
 *   - camera is owned externally by SceneDirector.sectionShot('coverage')
 * ------------------------------------------------------------------ */

const R = 3.15;
const GLOBE_POS: [number, number, number] = [5.3, 1.5, -0.2];
const BASE_YAW = -0.4; // orients the U.S. toward the camera, centred on the visible disc
const BASE_PITCH = 0.63; // tilts the U.S. into the frame centre
const YAW_SWING = 0.12; // ± rad of the slow pendulum (~7°) — subtle

const hi = new Set(highlightedStates);

/* ---- geometry builders (run once) -------------------------------- */

function ringToSegments(ring: number[][], radius: number, out: number[]) {
  const a = new Vector3();
  const b = new Vector3();
  for (let i = 0; i < ring.length - 1; i++) {
    latLonToVec3(ring[i][1], ring[i][0], radius, a);
    latLonToVec3(ring[i + 1][1], ring[i + 1][0], radius, b);
    out.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
}

function buildBorders(shapes: StateShape[], radius: number, want: (name: string) => boolean) {
  const pos: number[] = [];
  for (const s of shapes) {
    if (!want(s.name)) continue;
    for (const ring of s.rings) ringToSegments(ring, radius, pos);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  return geo;
}

function buildFill(shapes: StateShape[], radius: number) {
  const pos: number[] = [];
  const v = new Vector3();
  for (const s of shapes) {
    if (!hi.has(s.name)) continue;
    const ring = s.outer;
    if (ring.length < 4) continue;
    const closed =
      ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
    const coords = closed ? ring.slice(0, -1) : ring;
    const contour = coords.map(([lon, lat]) => new Vector2(lon, lat));
    let tris: number[][];
    try {
      tris = ShapeUtils.triangulateShape(contour, []);
    } catch {
      continue;
    }
    for (const tri of tris) {
      for (const idx of tri) {
        const [lon, lat] = coords[idx];
        latLonToVec3(lat, lon, radius, v);
        pos.push(v.x, v.y, v.z);
      }
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  return geo;
}

/* ---- subdued dotted land for the rest of the world -------------- */

function landMask() {
  const w = 512;
  const h = 256;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  const blob = (lon: number, lat: number, wl: number, hl: number) => {
    const x = ((lon + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    ctx.beginPath();
    ctx.ellipse(x, y, (wl / 360) * w, (hl / 180) * h, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  blob(-100, 45, 46, 26); // N America
  blob(-95, 62, 40, 18); // N Canada
  blob(-58, -12, 34, 40); // S America
  blob(-65, -35, 16, 18);
  blob(18, 8, 34, 34); // Africa
  blob(24, -18, 26, 26);
  blob(18, 52, 34, 20); // Europe
  blob(90, 55, 78, 34); // Asia
  blob(80, 22, 28, 20); // India
  blob(115, -3, 26, 18); // SE Asia
  blob(134, -25, 20, 16); // Australia
  const data = ctx.getImageData(0, 0, w, h).data;
  return (lat: number, lon: number) => {
    const x = Math.floor((((lon + 180) / 360) * w) % w);
    const y = Math.floor(((90 - lat) / 180) * h);
    return data[(y * w + x) * 4] > 128;
  };
}

function dotSprite() {
  const c = document.createElement('canvas');
  c.width = c.height = 48;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(24, 24, 22, 0, Math.PI * 2);
  ctx.fill();
  return new CanvasTexture(c);
}

/* ---------------------------------------------------------------- */

export function RavaCoverageGlobe() {
  const tier = useScene((s) => s.tier);
  const shapes = useUSStates();

  const root = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const fillMat = useRef<MeshBasicMaterial>(null);
  const hlLineMat = useRef<LineBasicMaterial>(null);
  const rings = useRef<(Mesh | null)[]>([]);
  const cores = useRef<(Mesh | null)[]>([]);
  const travellers = useRef<(Mesh | null)[]>([]);

  const step = tier === 'low' ? 4 : tier === 'mid' ? 3 : 2.4;
  const sphereSeg = tier === 'low' ? 40 : 64;

  const borders = useMemo(() => buildBorders(shapes, R + 0.004, () => true), [shapes]);
  const hlBorders = useMemo(() => buildBorders(shapes, R + 0.007, (n) => hi.has(n)), [shapes]);
  const fill = useMemo(() => buildFill(shapes, R + 0.003), [shapes]);

  const dotTex = useMemo(dotSprite, []);
  const dots = useMemo(() => {
    const inside = landMask();
    const pos: number[] = [];
    for (let lat = -78; lat <= 80; lat += step) {
      const lonStep = step / Math.max(0.22, Math.cos(lat * (Math.PI / 180)));
      for (let lon = -180; lon <= 180; lon += lonStep) {
        if (!inside(lat, lon)) continue;
        const v = latLonToVec3(
          lat + (Math.random() - 0.5) * step * 0.5,
          lon + (Math.random() - 0.5) * lonStep * 0.5,
          R + 0.012,
        );
        pos.push(v.x, v.y, v.z);
      }
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
    return geo;
  }, [step]);

  const hub = useMemo(() => latLonToVec3(coverageHub.lat, coverageHub.lon, R + 0.006), []);
  const pins = useMemo(
    () =>
      coverageLocations.map((l) => ({
        ...l,
        p: latLonToVec3(l.lat, l.lon, R + 0.006),
      })),
    [],
  );
  const curves = useMemo(() => {
    const list = coverageLocations.filter((l) => !l.hub).slice(0, 7);
    return list.map((l) => {
      const end = latLonToVec3(l.lat, l.lon, R + 0.006);
      const dist = hub.distanceTo(end);
      const mid = hub
        .clone()
        .add(end)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(R + dist * 0.34);
      return new QuadraticBezierCurve3(hub.clone(), mid, end);
    });
  }, [hub]);
  const arcPoints = useMemo(() => curves.map((c) => c.getPoints(40)), [curves]);

  useEffect(() => {
    const disposables = [borders, hlBorders, fill, dots, dotTex];
    return () => disposables.forEach((d) => d.dispose());
  }, [borders, hlBorders, fill, dots, dotTex]);

  useFrame((state, dt) => {
    dt = Math.min(dt, 1 / 30);
    const st = sceneState();
    const on = st.active === 'coverage';
    if (root.current) root.current.visible = on;
    if (!on || !root.current || !spin.current) return;

    const rm = st.reducedMotion;
    const p = sectionProgress('coverage');
    const t = state.clock.elapsedTime;
    const ease = 1 - Math.exp(-2 * dt);
    const easeSlow = 1 - Math.exp(-3 * dt);

    // limited-range yaw pendulum + a very small scrub-driven drift.
    // reduced motion => a fixed pose, U.S. centred, nothing moving.
    const targetYaw = rm ? BASE_YAW : BASE_YAW + Math.sin(t * 0.05) * YAW_SWING + p * 0.08;
    const targetPitch = rm ? BASE_PITCH : BASE_PITCH + Math.sin(t * 0.037) * 0.018 - p * 0.04;
    spin.current.rotation.y += (targetYaw - spin.current.rotation.y) * ease;
    spin.current.rotation.x += (targetPitch - spin.current.rotation.x) * ease;

    // responsive placement — shrink the globe and pull it toward the camera's
    // look point on narrow viewports so the U.S. stays centred, never cramped
    const w = state.size.width;
    const s = w < 620 ? 0.52 : w < 900 ? 0.66 : 1;
    const px = w < 620 ? 4.2 : w < 900 ? 4.8 : GLOBE_POS[0];
    const py = w < 620 ? 0.9 : w < 900 ? 1.1 : GLOBE_POS[1];
    root.current.scale.setScalar(root.current.scale.x + (s - root.current.scale.x) * easeSlow);
    root.current.position.x += (px - root.current.position.x) * easeSlow;
    root.current.position.y += (py - root.current.position.y) * easeSlow;
    root.current.position.z = GLOBE_POS[2];

    // subtle breathing on the highlight treatment
    if (fillMat.current) fillMat.current.opacity = 0.17 + (rm ? 0 : Math.sin(t * 0.8) * 0.04);
    if (hlLineMat.current) hlLineMat.current.opacity = 0.85 + (rm ? 0 : Math.sin(t * 0.8) * 0.08);

    // pin ripples + core pulse
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const mat = ring.material as MeshBasicMaterial;
      if (rm) {
        ring.scale.setScalar(0.03);
        mat.opacity = 0.26;
        return;
      }
      const u = (t * 0.32 + i * 0.16) % 1;
      ring.scale.setScalar(0.018 + u * 0.09);
      mat.opacity = (1 - u) * 0.5;
    });
    cores.current.forEach((c, i) => {
      if (!c) return;
      c.scale.setScalar(rm ? 1 : 1 + Math.sin(t * 2 + i) * 0.12);
    });

    // faint travellers along the context arcs
    travellers.current.forEach((m, i) => {
      if (!m) return;
      if (rm) {
        m.visible = false;
        return;
      }
      m.visible = true;
      const u = (t * 0.11 + i * 0.19) % 1;
      curves[i].getPoint(u, m.position);
      m.scale.setScalar(0.014 + Math.sin(u * Math.PI) * 0.02);
    });
  });

  return (
    <group ref={root} position={GLOBE_POS} visible={false}>
      {/* stable scoped lighting so the sphere reads a soft gradient */}
      <pointLight position={[4, 3, 5]} intensity={26} distance={40} decay={2} color={RAVA.pale} />
      <pointLight position={[-5, -2, -3]} intensity={10} distance={40} decay={2} color={RAVA.sky} />

      <group ref={spin} rotation={[BASE_PITCH, BASE_YAW, 0]}>
        {/* ocean sphere */}
        <mesh>
          <sphereGeometry args={[R, sphereSeg, sphereSeg]} />
          <meshStandardMaterial color={RAVA.abyss} roughness={0.94} metalness={0.05} />
        </mesh>

        {/* subdued dotted land (world context) */}
        <points geometry={dots}>
          <pointsMaterial
            map={dotTex}
            color={RAVA.blue}
            size={0.036}
            sizeAttenuation
            transparent
            opacity={0.72}
            alphaTest={0.4}
            depthWrite={false}
          />
        </points>

        {/* every U.S. state border — thin, subdued */}
        <lineSegments geometry={borders}>
          <lineBasicMaterial color={RAVA.sky} transparent opacity={0.28} depthWrite={false} />
        </lineSegments>

        {/* highlighted coverage states — brighter border + breathing fill */}
        <mesh geometry={fill}>
          <meshBasicMaterial
            ref={fillMat}
            color={RAVA.light}
            transparent
            opacity={0.18}
            blending={AdditiveBlending}
            depthWrite={false}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
        <lineSegments geometry={hlBorders}>
          <lineBasicMaterial
            ref={hlLineMat}
            color={RAVA.mist}
            transparent
            opacity={0.85}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>

        {/* inner rim + atmosphere */}
        <mesh scale={1.006}>
          <sphereGeometry args={[R, 48, 48]} />
          <meshBasicMaterial
            color={RAVA.sky}
            transparent
            opacity={0.05}
            side={BackSide}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh scale={1.15}>
          <sphereGeometry args={[R, 48, 48]} />
          <meshBasicMaterial
            color={RAVA.light}
            transparent
            opacity={0.06}
            side={BackSide}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* context arcs from the hub */}
        {arcPoints.map((pts, i) => (
          <Line
            key={`arc-${i}`}
            points={pts}
            color={RAVA.sky}
            lineWidth={1}
            transparent
            opacity={0.18}
            depthWrite={false}
          />
        ))}
        {curves.map((_, i) => (
          <mesh key={`trav-${i}`} ref={(el) => (travellers.current[i] = el)}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color={RAVA.white} toneMapped={false} />
          </mesh>
        ))}

        {/* coverage pins */}
        {pins.map((pin, i) => (
          <group key={`pin-${i}`} position={pin.p} onUpdate={(self) => self.lookAt(0, 0, 0)}>
            <mesh ref={(el) => (cores.current[i] = el)}>
              <sphereGeometry args={[pin.hub ? 0.032 : 0.022, 12, 12]} />
              <meshBasicMaterial color={RAVA.white} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, 0.002]}>
              <circleGeometry args={[pin.hub ? 0.09 : 0.06, 20]} />
              <meshBasicMaterial
                color={RAVA.light}
                transparent
                opacity={0.22}
                blending={AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            <mesh ref={(el) => (rings.current[i] = el)} position={[0, 0, 0.003]}>
              <ringGeometry args={[0.86, 1, 24]} />
              <meshBasicMaterial
                color={RAVA.light}
                transparent
                opacity={0.5}
                side={DoubleSide}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
