/**
 * Turn the purchased TurboSquid FBX (converted to GLB by FBX2glTF) + its
 * Textures.rar into a lean, RAVA-ready container.glb WITH the real PBR maps.
 *
 *  - weld + simplify (204k tris -> ~100k), prune
 *  - per material (Mat_01 skin, Mat_02 reefer unit, Mat_03 doors/dark):
 *      baseColor  (Mat_01 / Mat_03 desaturated + RAVA-tinted to mute any
 *                  residual third-party branding; Mat_02 kept near-original)
 *      normal, metallic-roughness (packed), occlusion
 *  - textures downsized (2048 for the big skin, 1024 for the rest), embedded
 *
 * Run:  npm run assets:container   (or: node scripts/process-container.mjs)
 * In:   /private/tmp/reefer/reefer_raw.glb  +  /private/tmp/reefer/tex_raw/Textures
 * Out:  public/models/container.glb
 */
import { NodeIO } from '@gltf-transform/core';
import { weld, simplify, prune } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

const SRC = '/private/tmp/reefer/reefer_raw.glb';
const TEX = '/private/tmp/reefer/tex_raw/Textures';
const OUT = join(process.cwd(), 'public', 'models', 'container.glb');
mkdirSync(join(process.cwd(), 'public', 'models'), { recursive: true });

await MeshoptSimplifier.ready;
const io = new NodeIO();
const doc = await io.read(SRC);

// NOTE: textures are assigned FIRST (below). prune() must run only after the
// materials reference a base-colour texture, otherwise it treats TEXCOORD_0 as
// unused and strips the UVs — which leaves the model untextured. weld/simplify
// then run with the maps in place so the UV set is carried through.

// ---- texture builders ----------------------------------------------------
const RAVA = { r: 168, g: 180, b: 196 }; // cool blue-grey the body reads as

async function baseColor(mat, size, _tint) {
  // faithful — use the purchased textures as-is (white steel, blue Carrier unit,
  // container markings). The RAVA logo goes on as a decal on top.
  return sharp(join(TEX, `${mat}_Diffuse.png`))
    .resize(size, size)
    .jpeg({ quality: 88 })
    .toBuffer();
}
async function normal(mat, size) {
  return sharp(join(TEX, `${mat}_Normal.png`)).resize(size, size).jpeg({ quality: 92 }).toBuffer();
}
async function ao(mat, size) {
  return sharp(join(TEX, `${mat}_AO.png`)).resize(size, size).jpeg({ quality: 84 }).toBuffer();
}
/** pack roughness -> G, metallic -> B (glTF metallic-roughness convention) */
async function metalRough(mat, size) {
  const [rough, metal] = await Promise.all([
    sharp(join(TEX, `${mat}_Roughness.png`)).resize(size, size).greyscale().raw().toBuffer(),
    sharp(join(TEX, `${mat}_Metallic.png`)).resize(size, size).greyscale().raw().toBuffer(),
  ]);
  const n = size * size;
  const rgb = Buffer.alloc(n * 3);
  for (let i = 0; i < n; i++) {
    rgb[i * 3] = 255;
    rgb[i * 3 + 1] = rough[i];
    rgb[i * 3 + 2] = metal[i];
  }
  return sharp(rgb, { raw: { width: size, height: size, channels: 3 } })
    .jpeg({ quality: 90 })
    .toBuffer();
}

// ---- assign per material ------------------------------------------------
const PLAN = {
  Mat_01: { size: 2048, tint: true }, // container skin — the big visible surface
  Mat_02: { size: 1024, tint: false }, // reefer unit (blue Carrier housing — on-brand enough)
  Mat_03: { size: 1024, tint: true }, // doors / dark parts (carried a small logo)
};

// build one shared texture set per material NAME, then assign to EVERY slot
// with that name (the model has duplicate Mat_01 / Mat_03 slots for the doors).
const cache = {};
async function texSet(name) {
  if (cache[name]) return cache[name];
  const { size, tint } = PLAN[name];
  const [bc, nm, mr, oc] = await Promise.all([
    baseColor(name, size, tint),
    normal(name, size),
    metalRough(name, size),
    ao(name, size),
  ]);
  const mk = (buf, label) => doc.createTexture(`${name}_${label}`).setImage(buf).setMimeType('image/jpeg');
  cache[name] = { bc: mk(bc, 'base'), nm: mk(nm, 'normal'), mr: mk(mr, 'mr'), oc: mk(oc, 'ao') };
  console.log('  built texture set', name, `@${size}`);
  return cache[name];
}

for (const m of doc.getRoot().listMaterials()) {
  const name = m.getName();
  if (!PLAN[name]) continue;
  const c = await texSet(name);
  m.setBaseColorTexture(c.bc);
  m.setNormalTexture(c.nm);
  m.setMetallicRoughnessTexture(c.mr);
  m.setOcclusionTexture(c.oc);
  m.setBaseColorFactor([1, 1, 1, 1]);
  m.setMetallicFactor(1);
  m.setRoughnessFactor(1);
  m.setOcclusionStrength(1);
  console.log('  assigned', name);
}

// now that every material carries its maps, it is safe to weld / simplify /
// prune — the UV set is referenced and will be preserved.
await doc.transform(
  weld({ tolerance: 0.0001 }),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.5, error: 0.005 }),
  prune(),
);

// sanity: every textured primitive must still have UVs
for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const hasUV = !!prim.getAttribute('TEXCOORD_0');
    const hasTex = !!prim.getMaterial()?.getBaseColorTexture();
    if (hasTex && !hasUV) {
      throw new Error(`UVs lost on ${mesh.getName()} after simplify/prune`);
    }
  }
}

await io.write(OUT, doc);
const fs = await import('node:fs');
console.log('wrote', OUT, (fs.statSync(OUT).size / 1e6).toFixed(2), 'MB');
