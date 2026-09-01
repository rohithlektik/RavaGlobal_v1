import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScene } from '@/store/scene';
import { clamp, range, lerp, easing } from '@/animations/easing';
import { MagneticButton } from '@/components/MagneticButton';

gsap.registerPlugin(ScrollTrigger);

const HEAD = ['BUILT TO MOVE', 'THE WORLD.'];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const loaded = useScene((s) => s.loaded);

  // drive both the DOM hero layer and the scene store from one scrub
  useLayoutEffect(() => {
    const el = layer.current;
    if (!el) return;
    const head = el.querySelector<HTMLElement>('[data-head]');
    const body = el.querySelector<HTMLElement>('[data-body]');
    const hint = el.querySelector<HTMLElement>('[data-hint]');
    const tail = el.querySelector<HTMLElement>('[data-tail]');

    const st = ScrollTrigger.create({
      trigger: ref.current!,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        const store = useScene.getState();
        store.setSection('hero', p);
        if (p < 0.985 && store.active !== 'hero') store.setActive('hero');
        // headline: full until the pull-back settles, then scale up + fade as the
        // camera moves past it
        const headOut = easing.inOutSine(range(p, 0.44, 0.6));
        if (head) {
          head.style.opacity = String(clamp(1 - headOut));
          head.style.transform = `translateY(${lerp(0, -70, headOut)}px) scale(${lerp(1, 1.16, headOut)})`;
        }
        if (body) {
          const bIn = easing.outQuint(range(p, 0.24, 0.42));
          const bOut = easing.inOutSine(range(p, 0.56, 0.7));
          body.style.opacity = String(clamp(bIn - bOut));
          body.style.transform = `translateY(${lerp(26, 0, bIn)}px)`;
        }
        if (hint) hint.style.opacity = String(clamp(1 - range(p, 0.015, 0.08)));
        if (tail) {
          const tIn = easing.outQuint(range(p, 0.8, 0.95));
          const tOut = range(p, 0.985, 1);
          tail.style.opacity = String(clamp(tIn - tOut));
          tail.style.transform = `translateY(${lerp(40, 0, tIn)}px)`;
        }
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section ref={ref} id="top" className="relative h-[560vh]">
      <div
        ref={layer}
        className="sticky top-0 h-screen overflow-hidden"
      >
        <p
          className="tech-label absolute left-[var(--gutter)] top-[76px] hidden text-left sm:block md:top-24"
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1s ease 0.4s' }}
        >
          RAVA Group — Engineered cold-chain infrastructure
        </p>

        <h1
          data-head
          className="absolute inset-x-0 top-[17vh] z-10 px-[var(--gutter)] text-center will-change-transform"
        >
          {HEAD.map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <span
                className="block"
                style={{
                  fontSize: 'var(--step-hero)',
                  transform: loaded ? 'translateY(0)' : 'translateY(110%)',
                  opacity: loaded ? 1 : 0,
                  transition: `transform 1s var(--ease-out-expo) ${0.35 + i * 0.12}s, opacity 1s ease ${0.35 + i * 0.12}s`,
                }}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

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
            <MagneticButton href="#quote" variant="ghost">
              Get a Quote
            </MagneticButton>
          </div>
        </div>

        <p
          data-tail
          className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-[var(--gutter)] text-center text-[var(--step-title)] font-[var(--font-display)] font-black leading-[1.02] tracking-[-0.02em]"
          style={{ opacity: 0, textShadow: '0 2px 40px rgba(11,22,34,0.95), 0 0 10px rgba(11,22,34,0.8)' }}
        >
          The container is only the beginning.
        </p>

        <div
          data-hint
          className="tech-label absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-3"
          aria-hidden="true"
        >
          <span>Scroll to enter</span>
          <span className="block h-8 w-px bg-[var(--line-strong)]">
            <span className="block h-1/2 w-full animate-pulse bg-[var(--rava-light)]" />
          </span>
        </div>
      </div>
    </section>
  );
}
