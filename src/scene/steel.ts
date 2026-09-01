import {
  CanvasTexture,
  RepeatWrapping,
  LinearMipmapLinearFilter,
  LinearFilter,
  SRGBColorSpace,
} from 'three';

/**
 * Procedural corrugated-steel container skin: albedo + normal + roughness,
 * generated on canvases so no external texture files are needed. The real
 * `.glb` swap path can drop in scanned PBR maps later.
 */
export interface SteelTextures {
  map: CanvasTexture;
  normalMap: CanvasTexture;
  roughnessMap: CanvasTexture;
  dispose: () => void;
}

function setup(tex: CanvasTexture, srgb = false) {
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.anisotropy = 16; // max — kills the grazing-angle shimmer on the ribs
  tex.minFilter = LinearMipmapLinearFilter;
  tex.magFilter = LinearFilter;
  tex.generateMipmaps = true;
  if (srgb) tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
}

/**
 * @param tone base albedo (container body colour), e.g. "#e9eef2" for white steel
 * @param ridges number of vertical corrugations across the tile
 */
export function makeSteelTextures(tone = '#e9eef2', ridges = 6): SteelTextures {
  const W = 1024;
  const H = 512;

  // --- albedo ---
  const ac = document.createElement('canvas');
  ac.width = W;
  ac.height = H;
  const a = ac.getContext('2d')!;
  a.fillStyle = tone;
  a.fillRect(0, 0, W, H);

  // vertical corrugation shading (subtle — premium, not a picket fence)
  for (let x = 0; x < W; x++) {
    const u = (x / W) * ridges * Math.PI * 2;
    const s = Math.sin(u);
    const shade = 1 - 0.09 * Math.max(0, -s) - 0.03 * Math.max(0, s);
    a.fillStyle = `rgba(0,0,0,${(1 - shade).toFixed(3)})`;
    a.fillRect(x, 0, 1, H);
    if (Math.abs(s) > 0.994) {
      a.fillStyle = 'rgba(255,255,255,0.06)';
      a.fillRect(x, 0, 1, H);
    }
  }

  // horizontal panel seams
  a.strokeStyle = 'rgba(0,0,0,0.16)';
  a.lineWidth = 2;
  for (const y of [H * 0.5]) {
    a.beginPath();
    a.moveTo(0, y);
    a.lineTo(W, y);
    a.stroke();
  }

  // faint grime + wear blotches (kept subtle so it stays premium, not grungy)
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 6 + Math.random() * 60;
    const g = a.createRadialGradient(x, y, 0, x, y, r);
    const dark = Math.random() < 0.6;
    g.addColorStop(0, dark ? 'rgba(20,30,42,0.05)' : 'rgba(255,255,255,0.045)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    a.fillStyle = g;
    a.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // --- normal map ---
  const nc = document.createElement('canvas');
  nc.width = W;
  nc.height = H;
  const n = nc.getContext('2d')!;
  const img = n.createImageData(W, H);
  for (let x = 0; x < W; x++) {
    const u = (x / W) * ridges * Math.PI * 2;
    // derivative of the corrugation profile -> tangent tilt in X (shallow = calm)
    const dx = Math.cos(u) * 0.3;
    let nx = -dx;
    let nz = 1;
    const len = Math.hypot(nx, 0, nz);
    nx /= len;
    nz /= len;
    // smooth, deterministic — random per-texel noise shimmers under motion
    const r0 = Math.round((nx * 0.5 + 0.5) * 255);
    const g0 = 128;
    const b0 = Math.round((nz * 0.5 + 0.5) * 255);
    for (let y = 0; y < H; y++) {
      const i = (y * W + x) * 4;
      img.data[i] = r0;
      img.data[i + 1] = g0;
      img.data[i + 2] = b0;
      img.data[i + 3] = 255;
    }
  }
  n.putImageData(img, 0, 0);

  // --- roughness map ---
  const rc = document.createElement('canvas');
  rc.width = W;
  rc.height = H;
  const r = rc.getContext('2d')!;
  r.fillStyle = '#8f8f8f';
  r.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x++) {
    const u = (x / W) * ridges * Math.PI * 2;
    const crest = Math.max(0, Math.sin(u));
    const v = Math.round(150 - crest * 60); // crests a bit glossier
    r.fillStyle = `rgb(${v},${v},${v})`;
    r.fillRect(x, 0, 1, H);
  }

  const map = new CanvasTexture(ac);
  const normalMap = new CanvasTexture(nc);
  const roughnessMap = new CanvasTexture(rc);
  setup(map, true);
  setup(normalMap);
  setup(roughnessMap);

  return {
    map,
    normalMap,
    roughnessMap,
    dispose: () => {
      map.dispose();
      normalMap.dispose();
      roughnessMap.dispose();
    },
  };
}
