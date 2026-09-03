import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionShell } from './SectionShell';
import { Reveal } from '@/components/Reveal';
import { MagneticButton } from '@/components/MagneticButton';
import { RentBuyGlyph } from '@/components/RentBuyGlyph';
import { useScene } from '@/store/scene';

gsap.registerPlugin(ScrollTrigger);

const PATHS = [
  {
    key: 'Rent',
    glyph: 'rent' as const,
    lead: 'Flexibility, speed, capacity for now.',
  },
  {
    key: 'Buy',
    glyph: 'buy' as const,
    lead: 'Ownership, permanence, infrastructure to build on.',
  },
];

/**
 * 06 — Rent or Buy. Two-column: the framing copy on the left, the Rent and Buy
 * cards stacked as separate rows on the right. A light scroll-parallax drifts
 * the glyphs; the copy stays put.
 */
export function RentBuy() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useScene((s) => s.reducedMotion);

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('is-in');
        });
      },
      { threshold: 0.3 },
    );
    el.querySelectorAll('.deploy-card').forEach((c) => io.observe(c));

    if (reducedMotion) return () => io.disconnect();

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
  }, [reducedMotion]);

  return (
    <SectionShell
      id="rent-buy"
      anchor="rent-buy"
      index="06"
      label="Rent or buy"
      minH="100vh"
      tone="light"
      className="section--tight deploy"
    >
      <div className="deploy-grid">
        <div className="deploy-intro">
          <Reveal
            as="h2"
            className="leading-[1.12] tracking-[-0.01em]"
            style={{ fontSize: 'clamp(1.5rem, 1.05rem + 1.6vw, 2.4rem)', fontWeight: 400 }}
          >
            How do you want to deploy it?
          </Reveal>
          <Reveal className="mt-5 text-[var(--text-dim)]">
            RAVA won&rsquo;t assume rent or buy is better for you. We compare both against your
            duration and location — with the same 24/7 service either way.
          </Reveal>
          <Reveal className="mt-10">
            <MagneticButton href="#quote">Compare my options</MagneticButton>
          </Reveal>
        </div>

        <div ref={cardsRef} className="deploy-cards">
          {PATHS.map((p, i) => (
            <article key={p.key} className="deploy-card" style={{ ['--i' as string]: i }}>
              <div className="deploy-card__glyph">
                <RentBuyGlyph name={p.glyph} />
              </div>
              <div className="deploy-card__body">
                <h3 className="deploy-card__title">{p.key}</h3>
                <p className="deploy-card__lead">{p.lead}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
