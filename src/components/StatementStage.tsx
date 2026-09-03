import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { clamp, range, lerp, easing } from '@/animations/easing';
import { stageState } from '@/scene/stageState';
import { useScene } from '@/store/scene';

gsap.registerPlugin(ScrollTrigger);

const HEAD = ['Powering smarter storage', 'solutions with RAVA.'];
const BODY =
  'From temperature-controlled units to heavy-duty dry containers, RAVA delivers ' +
  'scalable storage solutions backed by 24/7 expert support.';
const WORDS = BODY.split(' ');

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * The "Powering smarter storage" copy — a fixed overlay pinned in the cleared
 * column on the left while the square product stage holds the live container on
 * the right. Rendered OUTSIDE the transformed content layer so it can truly pin.
 * Reveal is scrubbed and gated on `stageState.form`, so the words only surface
 * once the stage has formed, and everything reverses cleanly.
 */
export function StatementStage() {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = useScene((s) => s.reducedMotion);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const lineEls = Array.from(el.querySelectorAll<HTMLElement>('[data-line]'));
    const wordEls = Array.from(el.querySelectorAll<HTMLElement>('[data-word]'));
    const section = document.querySelector('#statement');
    if (!section) return;

    if (reducedMotion) {
      el.style.opacity = '1';
      lineEls.forEach((s) => {
        s.style.transform = 'translateY(0)';
        s.style.opacity = '1';
      });
      wordEls.forEach((s) => (s.style.opacity = '1'));
      return;
    }

    lineEls.forEach((s) => {
      s.style.transform = 'translateY(115%)';
      s.style.opacity = '0';
    });
    wordEls.forEach((s) => (s.style.opacity = '0.14'));

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          // gate: nothing until the square stage is mostly formed
          const gate = smooth(clamp((stageState.form - 0.34) / 0.5));
          // hold through the middle of the section, then release near the end
          const exit = easing.inOutSine(range(p, 0.82, 0.96));
          const groupOpacity = gate * (1 - exit);
          el.style.opacity = String(groupOpacity);
          el.style.visibility = groupOpacity > 0.002 ? 'visible' : 'hidden';

          lineEls.forEach((s, i) => {
            const t = easing.outQuint(range(p, 0.26 + i * 0.08, 0.46 + i * 0.08));
            s.style.transform = `translateY(${lerp(115, 0, t)}%)`;
            s.style.opacity = String(t);
          });

          const n = wordEls.length;
          const sweep = range(p, 0.36, 0.72);
          for (let i = 0; i < n; i++) {
            const local = sweep * (n + 5) - i;
            wordEls[i].style.opacity = String(clamp(local * 0.95, 0.14, 1));
          }
        },
      });
      return () => st.kill();
    }, el);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div ref={root} className="statement-stage" style={{ opacity: 0, visibility: 'hidden' }}>
      <div className="statement-stage__inner">
        <h2 className="statement-stage__head">
          {HEAD.map((line) => (
            <span key={line} className="block overflow-hidden py-[0.06em]">
              <span data-line className="block will-change-transform leading-[1.18]">
                {line.split(' ').map((w, j, arr) => (
                  <span key={j}>
                    {w.replace(/[.,]/g, '') === 'RAVA' ? (
                      <span className="accent">{w}</span>
                    ) : (
                      w
                    )}
                    {j < arr.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </h2>
        <p className="statement-stage__body">
          {WORDS.map((w, i) => (
            <span key={i} data-word style={{ opacity: 0.14, willChange: 'opacity' }}>
              {w}
              {i < WORDS.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
