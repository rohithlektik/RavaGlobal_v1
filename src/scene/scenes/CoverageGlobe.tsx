import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Group,
  Mesh,
  QuadraticBezierCurve3,
  Vector3,
} from 'three';
import { RAVA } from '../palette';
import { sceneState, sectionProgress } from '@/store/scene';
import { lerp } from '@/animations/easing';

const R = 2.6;
const D2R = Math.PI / 180;

function ll(lat: number, lon: number, r = R): Vector3 {
  const phi = (90 - lat) * D2R;
  const theta = (lon + 180) * D2R;
  return new Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

const HUB = { name: 'Miami', lat: 25.77, lon: -80.19 };
const NODES = [
  { lat: 27.95, lon: -82.46 }, // Tampa
  { lat: 33.75, lon: -84.39 }, // Atlanta
  { lat: 29.76, lon: -95.37 }, // Houston
  { lat: 41.88, lon: -87.63 }, // Chicago
  { lat: 39.74, lon: -104.99 }, // Denver
  { lat: 34.05, lon: -118.24 }, // Los Angeles
  { lat: 47.61, lon: -122.33 }, // Seattle
  { lat: 40.71, lon: -74.01 }, // New York
  { lat: 25.79, lon: -80.13 }, // (near hub, short hop)
  { lat: 18.74, lon: -70.16 }, // Dominican Republic
  { lat: 4.71, lon: -74.07 }, // Colombia
];

/** Rough equirectangular land mask, drawn as blobs — enough for a dotted-globe read. */
function landMask(): (lat: number, lon: number) => boolean {
  const W = 720;
  const H = 360;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#fff';
  const px = (lon: number) => ((lon + 180) / 360) * W;
  const py = (lat: number) => ((90 - lat) / 180) * H;
  const blob = (lon: number, lat: number, wLon: number, hLat: number) => {
    g.beginPath();
    g.ellipse(px(lon), py(lat), (wLon / 360) * W, (hLat / 180) * H, 0, 0, Math.PI * 2);
    g.fill();
  };
  // continents (approximate)
  blob(-100, 45, 42, 26); // N America body
  blob(-90, 60, 26, 16); // N America north
  blob(-78, 24, 14, 12); // SE US / Gulf
  blob(-40, 72, 20, 12); // Greenland
  blob(-60, -15, 24, 34); // S America
  blob(-65, -35, 14, 16); // S America south
  blob(18, 5, 32, 34); // Africa
  blob(22, -28, 16, 14); // Africa south
  blob(15, 50, 24, 14); // Europe
  blob(90, 55, 62, 26); // Asia
  blob(78, 24, 26, 16); // India / SE Asia
  blob(134, -25, 18, 12); // Australia
  const img = g.getImageData(0, 0, W, H).data;
  return (lat: number, lon: number) => {
    const x = Math.max(0, Math.min(W - 1, Math.round(px(lon))));
    const y = Math.max(0, Math.min(H - 1, Math.round(py(lat))));
    return img[(y * W + x) * 4] > 128;
  };
}

function dotTexture() {
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  g.beginPath();
  g.arc(s / 2, s / 2, s / 2 - 4, 0, Math.PI * 2);
  g.fillStyle = '#fff';
  g.fill();
  return new CanvasTexture(c);
}

export function CoverageGlobe() {
  const root = useRef<Group>(null);
  const globe = useRef<Group>(null);
  const travellers = useRef<(Mesh | null)[]>([]);

  const dotTex = useMemo(dotTexture, []);

  const dots = useMemo(() => {
    const isLand = landMask();
    const pos: number[] = [];
    for (let lat = -78; lat <= 82; lat += 2) {
      // fewer dots near the poles
      const step = 2 / Math.max(0.25, Math.cos(lat * D2R));
      for (let lon = -180; lon < 180; lon += step) {
        if (isLand(lat, lon)) {
          const v = ll(lat + (Math.random() - 0.5), lon + (Math.random() - 0.5), R + 0.015);
          pos.push(v.x, v.y, v.z);
        }
      }
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
    return geo;
  }, []);

  const hubV = useMemo(() => ll(HUB.lat, HUB.lon), []);
  const arcs = useMemo(
    () =>
      NODES.map((n) => {
        const end = ll(n.lat, n.lon);
        const dist = hubV.distanceTo(end);
        const mid = hubV
          .clone()
          .add(end)
          .multiplyScalar(0.5)
          .normalize()
          .multiplyScalar(R + dist * 0.42);
        return new QuadraticBezierCurve3(hubV.clone(), mid, end.clone());
      }),
    [hubV],
  );
  const arcPoints = useMemo(() => arcs.map((c) => c.getPoints(44)), [arcs]);

  useFrame((state, dt) => {
    dt = Math.min(dt, 1 / 30);
    const on = sceneState().active === 'coverage';
    if (root.current) root.current.visible = on;
    if (!on) return;
    const p = sectionProgress('coverage');
    if (globe.current) {
      globe.current.rotation.y += dt * 0.06;
      globe.current.rotation.x = lerp(globe.current.rotation.x, -0.3 + p * 0.12, 0.05);
    }
    const t = state.clock.elapsedTime;
    travellers.current.forEach((m, i) => {
      if (!m) return;
      const u = (t * 0.18 + i * 0.11) % 1;
      arcs[i].getPoint(u, m.position);
      const s = 0.02 + Math.sin(u * Math.PI) * 0.03;
      m.scale.setScalar(s);
    });
  });

  return (
    <group ref={root} position={[6.6, 0.3, -1]} visible={false}>
      <group ref={globe} rotation={[-0.3, 0, 0.36]}>
        {/* ocean sphere — deep RAVA blue, faceted subtly */}
        <mesh>
          <sphereGeometry args={[R, 64, 64]} />
          <meshStandardMaterial color={RAVA.deep} roughness={0.85} metalness={0.15} />
        </mesh>
        {/* land as a dotted mask */}
        <points geometry={dots}>
          <pointsMaterial
            map={dotTex}
            color={RAVA.light}
            size={0.055}
            sizeAttenuation
            transparent
            alphaTest={0.4}
            depthWrite={false}
          />
        </points>
        {/* inner rim glow */}
        <mesh scale={1.04}>
          <sphereGeometry args={[R, 32, 32]} />
          <meshBasicMaterial color={RAVA.sky} transparent opacity={0.06} blending={AdditiveBlending} />
        </mesh>
        {/* atmosphere */}
        <mesh scale={1.14}>
          <sphereGeometry args={[R, 32, 32]} />
          <meshBasicMaterial color={RAVA.light} transparent opacity={0.05} side={2} blending={AdditiveBlending} />
        </mesh>

        {/* hub */}
        <mesh position={hubV}>
          <sphereGeometry args={[0.05, 14, 14]} />
          <meshBasicMaterial color={RAVA.white} toneMapped={false} />
        </mesh>

        {/* arcs — thick glowing lines + travelling pulses */}
        {arcPoints.map((pts, i) => (
          <group key={i}>
            <Line points={pts} color={RAVA.light} lineWidth={1.4} transparent opacity={0.55} />
            <mesh position={ll(NODES[i].lat, NODES[i].lon)}>
              <sphereGeometry args={[0.028, 10, 10]} />
              <meshBasicMaterial color={RAVA.light} toneMapped={false} />
            </mesh>
            <mesh ref={(el) => (travellers.current[i] = el)}>
              <sphereGeometry args={[1, 10, 10]} />
              <meshBasicMaterial color={RAVA.white} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
