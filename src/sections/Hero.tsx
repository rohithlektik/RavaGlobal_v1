import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScene } from '@/store/scene';
import { clamp, range, lerp, easing } from '@/animations/easing';
import { MagneticButton } from '@/components/MagneticButton';

gsap.registerPlugin(ScrollTrigger);

const HEAD = ['Built for Storage.', 'Designed for Business.'];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const loaded = useScene((s) => s.loaded);

  useLayoutEffect(() => {
    const el = layer.current;
    if (!el) return;
    const head = el.querySelector<HTMLElement>('[data-head]');
    const eyebrow = el.querySelector<HTMLElement>('[data-eyebrow]');
    const body = el.querySelector<HTMLElement>('[data-body]');
    const hint = el.querySelector<HTMLElement>('[data-hint]');

    // ONE continuous scrub for the whole hero cinematic — it spans the hero
    // section AND the "Powering smarter storage" statement so the 3D camera and
    // the DOM never disagree and nothing freezes at the section hand-off.
    // SceneDirector reads sectionProgress('intro').
    const statementEl = document.querySelector<HTMLElement>('#statement');
    const st = ScrollTrigger.create({
      trigger: ref.current!,
      start: 'top top',
      endTrigger: statementEl ?? ref.current!,
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        const store = useScene.getState();
        store.setSection('intro', p);
        store.setSection('hero', p);
        if (p < 0.985 && store.active !== 'hero') store.setActive('hero');

        // opening title — held over the dark interior, then clears as the
        // camera starts moving
        const titleOut = easing.inOutSine(range(p, 0.05, 0.14));
        if (head) {
          head.style.opacity = String(clamp(1 - titleOut));
          head.style.transform = `translateY(${lerp(0, -48, titleOut)}px)`;
        }
        if (eyebrow) eyebrow.style.opacity = String(clamp(1 - easing.inOutSine(range(p, 0.03, 0.1))));
        if (hint) hint.style.opacity = String(clamp(1 - range(p, 0.015, 0.05)));

        // supporting line + CTAs — surface only once the exterior product view
        // has settled, gone again before the statement copy begins
        if (body) {
          const bIn = easing.outQuint(range(p, 0.8, 0.88));
          const bOut = easing.inOutSine(range(p, 0.93, 0.99));
          body.style.opacity = String(clamp(bIn - bOut));
          body.style.transform = `translateY(${lerp(24, 0, bIn)}px)`;
        }
      },
    });

    return () => st.kill();
  }, []);

  return (
    <section ref={ref} id="top" className="relative h-[620vh]">
      <div ref={layer} className="sticky top-0 h-screen overflow-hidden">
        <p
          data-eyebrow
          className="tech-label absolute left-[var(--gutter)] top-[76px] hidden text-left sm:block md:top-24"
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1s ease 0.4s' }}
        >
          Engineered cold-chain infrastructure
        </p>

        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-[var(--gutter)]">
          <h1 data-head className="text-center will-change-transform">
            {HEAD.map((line, i) => (
              <span key={line} className="block overflow-hidden py-[0.08em]">
                <span
                  className="block leading-[1.08]"
                  style={{
                    fontSize: 'var(--step-hero)',
                    transform: loaded ? 'translateY(0)' : 'translateY(115%)',
                    opacity: loaded ? 1 : 0,
                    transition: `transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + i * 0.14}s, opacity 0.9s ease ${0.3 + i * 0.14}s`,
                  }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>
        </div>

        <div
          data-body
          className="absolute bottom-[12vh] left-[var(--gutter)] z-10 max-w-md"
          style={{ opacity: 0 }}
        >
          <p className="text-[var(--text)] [text-shadow:0_2px_24px_rgba(11,22,34,0.95)]">
            RAVA engineers the containers, power and 24/7 service that store, protect and
            move what can&rsquo;t afford to fail.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <MagneticButton href="#solutions">Explore Solutions</MagneticButton>
            <MagneticButton href="/quote" variant="ghost">
              Get a Quote
            </MagneticButton>
          </div>
        </div>

        <div
          data-hint
          className="tech-label absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
          aria-hidden="true"
        >
          <span>Scroll to explore</span>
          <span className="block h-8 w-px bg-[var(--line-strong)]">
            <span className="block h-1/2 w-full animate-pulse bg-[var(--rava-light)]" />
          </span>
        </div>
      </div>
    </section>
  );
}
