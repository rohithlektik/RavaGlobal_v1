import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  PointLight,
  Points,
  ShaderMaterial,
  SRGBColorSpace,
} from 'three';
import type { ContainerDriver } from './containerDriver';
import { clamp, damp } from '@/animations/easing';

const URL = '/models/container.glb';
useGLTF.preload(URL);

// real 20 ft reefer: doors at +X, machinery at -X after the Z->X rotate.
const S = 1;
const LIFT = 1.3;

// interior lamp colours: cold blue when it first flickers up -> clean white.
const LAMP_COLD = new Color('#3f6fa6');
const LAMP_WARM = new Color('#eef4fb');
const _lamp = new Color();

interface Props {
  driver: MutableRefObject<ContainerDriver>;
  detail?: 'high' | 'mid' | 'low';
}

export function GlbContainer({ driver, detail = 'high' }: Props) {
  const gltf = useGLTF(URL);

  const logo = useTexture('/brand/rava-decal.png');
  logo.colorSpace = SRGBColorSpace;
  logo.anisotropy = 16;

  const doorL = useRef<Object3D | null>(null);
  const doorR = useRef<Object3D | null>(null);
  const fanA = useRef<Group>(null);
  const fanB = useRef<Group>(null);
  const lamps = useRef<PointLight[]>([]);
  const fillLight = useRef<PointLight>(null);
  const skinMats = useRef<MeshStandardMaterial[]>([]);
  const ice = useRef<Points>(null);
  const iceMat = useRef<ShaderMaterial>(null);

  // one-time: keep the model's textured materials, double-side them so the
  // interior shell is visible from inside, drop the y-lift, hinge-correct doors.
  const scene = useMemo(() => {
    const root = gltf.scene.clone(true);
    skinMats.current = [];

    root.children.forEach((o) => (o.position.y -= LIFT));

    root.traverse((o) => {
      o.castShadow = false;
      o.receiveShadow = false;
      if (!(o as Mesh).isMesh) return;
      const m = o as Mesh;
      const list = Array.isArray(m.material) ? m.material : [m.material];
      const swapped = list.map((mm) => {
        // clone every skin material so we can double-side it (see the inner
        // shell from inside) without touching the shared source asset.
        const mat = (mm as MeshStandardMaterial).clone() as MeshStandardMaterial;
        mat.side = DoubleSide;
        mat.envMapIntensity = 0.55;
        // a whisper of cool self-illumination so the sealed interior reads as a
        // dark cold-store rather than a black void — far too faint to touch the
        // lit phases.
        mat.emissive = new Color('#15293f');
        mat.emissiveIntensity = 0.42;
        if (!skinMats.current.includes(mat)) skinMats.current.push(mat);
        return mat;
      });
      m.material = Array.isArray(m.material) ? swapped : swapped[0];
    });

    // the doors load as GROUPS (multi-primitive). move the hinge edge to the
    // group origin by translating every child geometry, then push the group
    // back -> group.rotation.y == hinge swing.
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

  // ---- ice / frost particles ------------------------------------------------
  const iceGeo = useMemo(() => {
    const n = detail === 'low' ? 130 : detail === 'mid' ? 240 : 360;
    const pos = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      // fill the interior volume (local: x = width, y = height, z = length)
      pos[i * 3] = -1.05 + Math.random() * 2.1;
      pos[i * 3 + 1] = -1.15 + Math.random() * 2.3;
      pos[i * 3 + 2] = -3.0 + Math.random() * 6.0;
      size[i] = 0.35 + Math.random() * Math.random() * 1.6; // mostly tiny, a few larger
      seed[i] = Math.random();
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('aSize', new BufferAttribute(size, 1));
    g.setAttribute('aSeed', new BufferAttribute(seed, 1));
    return g;
  }, [detail]);

  const iceUniforms = useMemo(
    () => ({ uOpacity: { value: 0 }, uColor: { value: new Color('#cfe4f6') } }),
    [],
  );

  // one shared material for the RAVA mark on both long sides — driver.logoReveal
  // fades it in. Slightly translucent + lit as paint so it reads printed, not
  // stuck on; polygonOffset keeps it flush without z-fighting.
  const decalMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        map: logo,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        envMapIntensity: 0.35,
        roughness: 0.72,
        metalness: 0.04,
        polygonOffset: true,
        polygonOffsetFactor: -8,
        polygonOffsetUnits: -8,
      }),
    [logo],
  );

  useFrame((state, dt) => {
    dt = Math.min(dt, 1 / 30);
    const d = driver.current;
    const k = Math.min(dt, 1 / 45);
    const t = state.clock.elapsedTime;

    // doors: ~100deg, swinging OUTWARD
    const a = clamp(d.doorOpen) * 1.72;
    if (doorL.current) doorL.current.rotation.y = damp(doorL.current.rotation.y, -a, 4, k);
    if (doorR.current) doorR.current.rotation.y = damp(doorR.current.rotation.y, a, 4, k);

    const spin = (1.5 + clamp(d.power) * 20) * dt;
    if (fanA.current) fanA.current.rotation.z -= spin;
    if (fanB.current) fanB.current.rotation.z -= spin;

    // top out at 0.92 so the white steel reads through a touch -> printed, not stuck on
    decalMaterial.opacity = damp(decalMaterial.opacity, clamp(d.logoReveal) * 0.92, 5, k);

    // interior refrigerated lamps: intensity + colour follow `interior`
    const lit = clamp(d.interior);
    const warm = clamp((lit - 0.35) / 0.65); // colour only shifts once they're on
    _lamp.copy(LAMP_COLD).lerp(LAMP_WARM, warm);
    const drO = clamp(d.doorOpen);
    lamps.current.forEach((L, i) => {
      if (!L) return;
      // 3 = door-end wash, 4 = doorway glow (pours light out once doors are open);
      // the ceiling lamps also brighten as the doors open.
      const target =
        i === 4
          ? lit * drO * drO * 4.2
          : i === 3
            ? lit * 4.4
            : lit * (2.3 + drO * 1.2);
      L.intensity = damp(L.intensity, target, 4, k);
      L.color.lerp(_lamp, 1 - Math.exp(-6 * k));
    });
    // the whole shell lifts as the lamps come up -> reads as "lights on"
    for (const m of skinMats.current) {
      m.emissiveIntensity = damp(m.emissiveIntensity, 0.42 + lit * 0.55, 4, k);
    }
    if (fillLight.current) {
      // the cold-store baseline fill — eases DOWN a little as the lamps take over
      fillLight.current.intensity = damp(fillLight.current.intensity, 1.7 * (1 - lit * 0.5), 4, k);
    }

    // ice / cold mist: opacity from `ice`, more of it once the doors are open;
    // particles near the doorway then drift OUT and billow into the open air.
    if (iceMat.current) {
      iceMat.current.uniforms.uOpacity.value = damp(
        iceMat.current.uniforms.uOpacity.value,
        clamp(d.ice) * (0.44 + drO * 0.42),
        3,
        k,
      );
    }
    if (ice.current && clamp(d.ice) > 0.001) {
      const p = iceGeo.attributes.position as BufferAttribute;
      const s = iceGeo.attributes.aSeed as BufferAttribute;
      const spill = drO > 0.15;
      for (let i = 0; i < p.count; i++) {
        const sd = s.getX(i);
        let y = p.getY(i) - (0.05 + sd * 0.06) * dt; // settle downward, slowly
        let x = p.getX(i) + Math.sin(t * 0.3 + sd * 30) * 0.0016; // faint swirl
        let z = p.getZ(i) + Math.cos(t * 0.22 + sd * 20) * 0.0016;
        // roll toward and then out through the +z doorway when it is open
        if (spill && z > -0.4) z += drO * (0.35 + sd * 0.55) * dt;
        if (z > 3.2) {
          // outside now — spread and lift a little, like vapour hitting warm air
          x += (sd - 0.5) * 0.5 * dt;
          y += 0.06 * dt;
        }
        if (y < -1.2) y = 1.2;
        else if (y > 1.7) y = -1.15;
        if (x < -1.6) x = 1.4;
        else if (x > 1.6) x = -1.4;
        if (z < -3.05) z = 3.05;
        else if (z > 5.2) z = -2.8 + sd * 0.6; // recycle spilled mist back inside
        p.setXYZ(i, x, y, z);
      }
      p.needsUpdate = true;
    }
  });

  return (
    <group name="rava-container">
      <group scale={S} rotation={[0, Math.PI / 2, 0]}>
        <primitive object={scene} />

        {/* refrigerated ceiling lamps — off (dark navy) at load, ramp to a clean
            white refrigerated interior as `interior` rises */}
        {[-2.1, 0, 2.1].map((z, i) => (
          <pointLight
            key={i}
            ref={(el) => {
              if (el) lamps.current[i] = el;
            }}
            position={[0, 1.02, z]}
            intensity={0}
            distance={6.5}
            decay={1.5}
            color={LAMP_COLD}
          />
        ))}
        {/* wash light on the door end + near walls, gated by `interior` so the
            "lights on" moment is clearly visible on the surfaces in shot */}
        <pointLight
          ref={(el) => {
            if (el) lamps.current[3] = el;
          }}
          position={[2.0, 0.35, 0]}
          intensity={0}
          distance={7}
          decay={1.4}
          color={LAMP_COLD}
        />
        {/* doorway glow — sits just inside the +z opening; comes up hard once the
            doors are open so the interior visibly pours light into the open air */}
        <pointLight
          ref={(el) => {
            if (el) lamps.current[4] = el;
          }}
          position={[0, 0.1, 2.7]}
          intensity={0}
          distance={8}
          decay={1.3}
          color={'#eaf1fb'}
        />
        {/* interior atmosphere lights (local frame is rotated +90deg about Y, so
            local z = world length toward the doors). A cool key rakes one wall
            for corrugation shape, a dim bounce keeps the deep end off pure black,
            and a faint glow at the door seam gives the "sliver of daylight". */}
        <pointLight
          ref={fillLight}
          position={[-0.9, 0.85, -0.3]}
          intensity={1.7}
          distance={13}
          decay={1.35}
          color={'#48709f'}
        />
        <pointLight position={[0.9, -0.25, -1.6]} intensity={0.45} distance={9} decay={1.5} color={'#2a4a70'} />
        <pointLight position={[0, 0.05, 2.6]} intensity={0.5} distance={4.5} decay={2} color={'#a2c6e8'} />

        {/* RAVA branding — the same mark, centred on BOTH long sides exactly like
            the real container. Flush on the steel (proud offset + polygonOffset
            -> no float, no z-fight), lit as paint, kept slightly translucent so
            it blends into the body. Texture aspect (0.758) is matched by the
            plane so the mark is never stretched. Rotates with the container. */}
        {[
          { x: -1.29, ry: -Math.PI / 2 }, // world +Z side
          { x: 1.29, ry: Math.PI / 2 }, // world -Z side
        ].map(({ x, ry }, i) => (
          <mesh
            key={i}
            position={[x, 0.02, 0]}
            rotation={[0, ry, 0]}
            renderOrder={3}
            material={decalMaterial}
          >
            <planeGeometry args={[0.644, 0.851]} />
          </mesh>
        ))}

        {/* two spinning condenser fans over the model's moulded fan grilles on
            the machinery (-Z) end. Mid-grey blades so they read as turning metal,
            not a black hole. */}
        {[
          { ref: fanA, x: -0.52 },
          { ref: fanB, x: 0.5 },
        ].map(({ ref, x }, fi) => (
          <group key={fi} ref={ref} position={[x, -0.16, -3.02]}>
            {Array.from({ length: 6 }).map((_, b) => (
              <mesh
                key={b}
                rotation={[0.3, 0, (b * Math.PI * 2) / 6]}
                position={[0, 0.19, 0]}
              >
                <boxGeometry args={[0.16, 0.42, 0.015]} />
                <meshStandardMaterial color="#4a525c" metalness={0.5} roughness={0.5} />
              </mesh>
            ))}
            <mesh>
              <cylinderGeometry args={[0.08, 0.1, 0.05, 16]} />
              <meshStandardMaterial color="#2b3138" metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        ))}

        {/* floating ice / frost — custom points so each speck has its own size */}
        <points ref={ice} geometry={iceGeo} frustumCulled={false}>
          <shaderMaterial
            ref={iceMat}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
            uniforms={iceUniforms}
            vertexShader={`
              attribute float aSize;
              attribute float aSeed;
              varying float vFade;
              void main(){
                vec4 mv = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mv;
                gl_PointSize = min(aSize * (16.0 / max(-mv.z, 0.25)), 22.0);
                // fade the specks nearest the camera (and the far ones) so
                // nothing pops as a hard blob
                vFade = smoothstep(0.4, 1.8, -mv.z) * (1.0 - smoothstep(9.0, 15.0, -mv.z));
              }`}
            fragmentShader={`
              uniform float uOpacity;
              uniform vec3 uColor;
              varying float vFade;
              void main(){
                float d = length(gl_PointCoord - 0.5);
                float m = smoothstep(0.5, 0.12, d);
                gl_FragColor = vec4(uColor, m * uOpacity * vFade);
              }`}
          />
        </points>
      </group>
    </group>
  );
}
