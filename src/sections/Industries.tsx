import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSectionScrub } from '@/hooks/useSectionScrub';
import { useScene } from '@/store/scene';
import { industries } from '@/data/industries';

gsap.registerPlugin(ScrollTrigger);

/**
 * 05 — Industries. An editorial Before → After stage: the industry challenge on
 * the left as a major headline, one large near-edge image frame on the right.
 * Hovering an industry reconfigures the scene — the "before" is pushed back and
 * blurred while the RAVA solution is wiped in from within it, on layered
 * parallax. No 3D. Light neutral ground, navy type, RAVA blue only as accent.
 */
export function Industries() {
  const ref = useRef<HTMLElement>(null);
  useSectionScrub(ref, 'industries');
  const reducedMotion = useScene((s) => s.reducedMotion);

  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // entrance reveal + restrained scroll parallax
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { threshold: 0.16 },
    );
    io.observe(el);

    if (!reducedMotion) {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            el.style.setProperty('--par', String((self.progress - 0.5) * 2)); // -1 .. 1
          },
        });
      }, el);
      return () => {
        io.disconnect();
        ctx.revert();
      };
    }
    return () => io.disconnect();
  }, [reducedMotion]);

  // mobile: hover -> scroll. When an industry block centres, make it active and
  // play its transformation.
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(max-width: 900px)').matches) return;
    const blocks = Array.from(el.querySelectorAll<HTMLElement>('.ind'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = blocks.indexOf(e.target as HTMLElement);
            if (i >= 0) {
              setActive(i);
              setRevealed(true);
            }
          }
        });
      },
      { threshold: 0.55 },
    );
    blocks.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, []);

  const select = (i: number) => {
    setActive(i);
    setRevealed(true);
  };

  return (
    <section ref={ref} id="industries" className="industries" aria-labelledby="industries-title">
      <div className="industries__bg" aria-hidden="true" />

      <div className="industries__inner">
        <p className="industries__eyebrow">
          <span>05</span> Industries
        </p>
        <h2 id="industries-title" className="sr-only">
          How RAVA transforms industry challenges
        </h2>

        <div
          className="industries__list"
          onPointerLeave={() => setRevealed(false)}
        >
          {industries.map((ind, i) => {
            const isActive = i === active;
            const show = isActive && revealed;
            return (
              <article
                key={ind.id}
                className="ind"
                data-active={isActive || undefined}
                data-transformed={show || undefined}
                onPointerEnter={() => select(i)}
              >
                <button
                  type="button"
                  className="ind__head"
                  aria-pressed={isActive}
                  onFocus={() => select(i)}
                  onClick={() => (isActive ? setRevealed((v) => !v) : select(i))}
                >
                  <span className="ind__num">{ind.index}</span>
                  <span className="ind__name">
                    {ind.name.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </span>
                  <span className="ind__desc">{ind.descriptor}</span>
                </button>

                <figure className="ind__stage">
                  <div className="ind__par">
                    <div
                      className="ind__img ind__img--before"
                      style={{ backgroundImage: `url(${ind.before})` }}
                      role="img"
                      aria-label={ind.beforeAlt}
                    />
                    <div
                      className="ind__img ind__img--after"
                      style={{ backgroundImage: `url(${ind.after})` }}
                      role="img"
                      aria-label={ind.afterAlt}
                    />
                  </div>
                  <div className="ind__sweep" aria-hidden="true" />

                  <figcaption className="ind__solution">{ind.solution}</figcaption>

                  <div className="ind__meter" aria-hidden="true">
                    <span>Before</span>
                    <span className="ind__meter-track">
                      <span className="ind__meter-fill" />
                    </span>
                    <span>After</span>
                  </div>
                </figure>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
