/**
 * Brand-asset prep. Run: npm run assets
 *
 * Sources (local, not committed):
 *   ~/Downloads/Rava LOGO 2 (1) (2).ai   -> rendered to PNG via macOS qlmanage
 *   ~/Downloads/logo-rava.png            -> artist-made transparent full-colour lockup
 *
 * Outputs -> public/brand/
 *   rava-logo.png         full-colour transparent lockup (light backgrounds, small sizes)
 *   rava-logo-hi.png      high-res lockup, trimmed (large light placements / print refs)
 *   rava-logo-white.png   1-colour white knockout — sanctioned by the guidelines.
 *                         Used on the dark UI and as the 3D container decal.
 *   favicon.png           512px white mark on transparent
 *   og-image.png          1200x630 share image, ink ground + white lockup
 *
 * The RAVA mark itself is never redrawn, recoloured (beyond the sanctioned
 * 1-colour), rotated, stretched or given effects.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const OUT = join(process.cwd(), 'public', 'brand');
mkdirSync(OUT, { recursive: true });

const AI = join(homedir(), 'Downloads', 'Rava LOGO 2 (1) (2).ai');
const TRANSPARENT = join(homedir(), 'Downloads', 'logo-rava.png');
const work = join(tmpdir(), 'rava-logo-src');
mkdirSync(work, { recursive: true });

// 1. Render the .ai (PDF 1.6) to a high-res raster via Quick Look.
const rendered = join(work, 'Rava LOGO 2 (1) (2).ai.png');
if (!existsSync(rendered)) {
  execFileSync('qlmanage', ['-t', '-s', '2600', '-o', work, AI], { stdio: 'ignore' });
}
const master = sharp(rendered);
const { width, height } = await master.metadata();
console.log(`master render: ${width}x${height}`);

// 2. Full-colour transparent lockup (artist asset) — pass through + hi-res trim.
copyFileSync(TRANSPARENT, join(OUT, 'rava-logo.png'));
await sharp(rendered).trim({ threshold: 8 }).png().toFile(join(OUT, 'rava-logo-hi.png'));

// 3. 1-colour white knockout: paper -> transparent, all mark ink -> white.
//    alpha ramps from solid (min-channel < 0.86) to clear (> 0.99).
const raw = await sharp(rendered).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { data, info } = raw;
const lo = 0.86 * 255;
const hi = 0.99 * 255;
for (let i = 0; i < data.length; i += info.channels) {
  const m = Math.max(data[i], data[i + 1], data[i + 2]);
  let a = (hi - m) / (hi - lo);
  a = a < 0 ? 0 : a > 1 ? 1 : a;
  data[i] = 255;
  data[i + 1] = 255;
  data[i + 2] = 255;
  data[i + 3] = Math.round(a * (data[i + 3] / 255) * 255);
}
const whiteBuf = await sharp(data, {
  raw: { width: info.width, height: info.height, channels: info.channels },
})
  .trim({ threshold: 8 })
  .png()
  .toBuffer();
await sharp(whiteBuf).toFile(join(OUT, 'rava-logo-white.png'));

// 4. Favicon — the top crest of the white knockout, square.
const wMeta = await sharp(whiteBuf).metadata();
const crest = Math.round(wMeta.width * 0.62);
await sharp(whiteBuf)
  .extract({
    left: Math.round((wMeta.width - crest) / 2),
    top: 0,
    width: crest,
    height: crest,
  })
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(join(OUT, 'favicon.png'));

// 5. OG share image.
const ogLogo = await sharp(whiteBuf)
  .resize({ height: 360, fit: 'inside' })
  .toBuffer();
await sharp({
  create: { width: 1200, height: 630, channels: 4, background: { r: 11, g: 22, b: 34, alpha: 1 } },
})
  .composite([{ input: ogLogo, gravity: 'center' }])
  .png()
  .toFile(join(OUT, 'og-image.png'));

console.log('brand assets written to public/brand/');
