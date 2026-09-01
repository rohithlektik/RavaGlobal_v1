import { useEffect, useMemo } from 'react';
import { SRGBColorSpace, Vector2, type CanvasTexture } from 'three';
import { makeSteelTextures } from './steel';
import { RAVA } from './palette';

const NS = new Vector2(0.5, 0.5);

export interface Steel {
  m: CanvasTexture;
  n: CanvasTexture;
  r: CanvasTexture;
  dispose: () => void;
}

/** One shared corrugated-steel texture set, cloned per repeat where needed. */
export function useSteel(tone = '#eef2f5', ridges = 6): Steel {
  const base = useMemo(() => makeSteelTextures(tone, ridges), [tone, ridges]);
  useEffect(() => () => base.dispose(), [base]);
  return useMemo(() => {
    const m = base.map.clone();
    const n = base.normalMap.clone();
    const r = base.roughnessMap.clone();
    m.colorSpace = SRGBColorSpace;
    return { m, n, r, dispose: base.dispose };
  }, [base]);
}

interface BoxProps {
  args: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  steel: Steel;
  repeat?: [number, number];
  color?: string;
}

/** A steel-skinned box — the RAVA container surface language, reusable. */
export function SteelBox({ args, position, rotation, steel, repeat, color = RAVA.white }: BoxProps) {
  const tex = useMemo(() => {
    const m = steel.m.clone();
    const n = steel.n.clone();
    const r = steel.r.clone();
    const rp = repeat ?? [Math.max(1, args[0] / 2.6), 1];
    [m, n, r].forEach((t) => t.repeat.set(rp[0], rp[1]));
    m.colorSpace = SRGBColorSpace;
    return { m, n, r };
  }, [steel, repeat, args]);

  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={args} />
      <meshStandardMaterial
        map={tex.m}
        normalMap={tex.n}
        roughnessMap={tex.r}
        color={color}
        metalness={0.12}
        roughness={0.82}
        envMapIntensity={0.55}
        normalScale={NS}
      />
    </mesh>
  );
}
