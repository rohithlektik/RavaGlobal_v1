import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { clamp, range } from '@/animations/easing';
import { stageState } from '@/scene/stageState';
import { useScene } from '@/store/scene';

gsap.registerPlugin(ScrollTrigger);

const smooth = (t: number) => t * t * (3 - 2 * t);

// hero (navy cinematic)  ->  light product stage
const HEX = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const C_SURROUND = [HEX('#0a1522'), HEX('#f4f6f9')] as const;
const C_TEXT = [HEX('#e8f4fb'), HEX('#182c44')] as const;
const C_ACCENT = [HEX('#8cc9eb'), HEX('#3b5070')] as const;
const mixRGB = ([a, b]: readonly [number[], number[]], t: number) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(
    a[2] + (b[2] - a[2]) * t,
  )})`;

/**
 * The hero → statement transition. The full-bleed 3D hero does not end — it
 * compresses: four fixed bars grow inward from the viewport edges to frame a
 * near-square product stage on the right, where the SAME live WebGL container
 * keeps rendering (SceneDirector reads `stageState.form` and reframes the camera
 * into it — no cut, no reload). As it forms, the whole treatment lifts from the
 * navy cinematic to a clean light product stage: surround -> white, copy -> dark
 * blue, and the 3D backdrop -> soft light blue (SceneDirector maps
 * `stageState.tone` to `bgState.light`). One scrubbed timeline, fully reversible.
 */
export function StageFrame() {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = useScene((s) => s.reducedMotion);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reducedMotion) {
      stageState.form = 0;
      stageState.tone = 0;
      return;
    }
    const bars = Array.from(el.querySelectorAll<HTMLElement>('.stage-bar'));
    const byKey = (k: string) => bars.find((b) => b.dataset.bar === k)!;
    const L = byKey('l');
    const R = byKey('r');
    const T = byKey('t');
    const B = byKey('b');
    const docStyle = document.documentElement.style;

    // art-directed insets of the fully-formed stage (desktop-first)
    const layout = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const left = Math.round(Math.min(vw * 0.45, vw - 460));
      const right = Math.round(Math.min(vw * 0.07, 120));
      const side = Math.max(vw - left - right, 320); // stage edge = remaining width
      const vert = Math.max(Math.round((vh - side) / 2), Math.round(vh * 0.07));
      L.style.width = `${left}px`;
      R.style.width = `${right}px`;
      T.style.height = `${vert}px`;
      B.style.height = `${vert}px`;
    };
    layout();

    // span all the way to the (dark) solution-finder so both the square and the
    // light tone can fall back to nothing before it becomes active
    const endEl =
      document.querySelector('#solutions') ??
      document.querySelector('#world') ??
      document.querySelector('#statement');

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: '#top',
        start: 'top top',
        endTrigger: endEl as Element,
        end: 'top top',
        scrub: true,
        onRefresh: layout,
        onUpdate: (self) => {
          const p = self.progress;
          // square forms during the statement, retracts as the light #world
          // section slides up over it
          const f = clamp(range(p, 0.62, 0.78)) * (1 - clamp(range(p, 0.83, 0.9)));
          stageState.form = f;
          // light tone rises with the square, holds through #world (hidden behind
          // its opaque ground), then falls back to navy before #solutions
          stageState.tone =
            clamp(range(p, 0.64, 0.8)) * (1 - clamp(range(p, 0.88, 0.98)));

          const e = smooth(f);
          L.style.transform = `scaleX(${e})`;
          R.style.transform = `scaleX(${e})`;
          T.style.transform = `scaleY(${e})`;
          B.style.transform = `scaleY(${e})`;
          el.style.visibility = f > 0.0005 ? 'visible' : 'hidden';

          const tn = smooth(stageState.tone);
          docStyle.setProperty('--stage-surround', mixRGB(C_SURROUND, tn));
          docStyle.setProperty('--stage-text', mixRGB(C_TEXT, tn));
          docStyle.setProperty('--stage-accent', mixRGB(C_ACCENT, tn));
        },
      });
      return () => st.kill();
    }, el);

    window.addEventListener('resize', layout);
    return () => {
      window.removeEventListener('resize', layout);
      ctx.revert();
      docStyle.removeProperty('--stage-surround');
      docStyle.removeProperty('--stage-text');
      docStyle.removeProperty('--stage-accent');
    };
  }, [reducedMotion]);

  return (
    <div ref={root} className="stage-frame" aria-hidden="true" style={{ visibility: 'hidden' }}>
      <div className="stage-bar stage-bar--l" data-bar="l" />
      <div className="stage-bar stage-bar--r" data-bar="r" />
      <div className="stage-bar stage-bar--t" data-bar="t" />
      <div className="stage-bar stage-bar--b" data-bar="b" />
    </div>
  );
}
