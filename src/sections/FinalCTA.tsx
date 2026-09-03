import { useRef } from 'react';
import { useSectionScrub } from '@/hooks/useSectionScrub';
import { Reveal } from '@/components/Reveal';
import { MagneticButton } from '@/components/MagneticButton';

/**
 * 09 — closing CTA. A cinematic, brand-coloured animated backdrop (drifting
 * light blooms + a slow sheen + fine grain) fills what used to be dead space
 * behind "Ready to build your solution?". No external video — pure CSS, RAVA
 * navy/blue palette, honours prefers-reduced-motion. Content revealed with the
 * site's standard scroll-in `Reveal`.
 */
export function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  useSectionScrub(ref, 'final');

  return (
    <section
      ref={ref}
      id="quote"
      className="solution-cta section relative z-[1] flex min-h-screen flex-col items-center justify-center overflow-hidden text-center"
      aria-label="Ready to build your solution — request a quote"
    >
      <div className="solution-cta__bg" aria-hidden="true">
        <span className="solution-cta__bloom solution-cta__bloom--a" />
        <span className="solution-cta__bloom solution-cta__bloom--b" />
        <span className="solution-cta__bloom solution-cta__bloom--c" />
        <span className="solution-cta__sweep" />
        <span className="solution-cta__grain" />
      </div>

      <div className="solution-cta__inner">
        <Reveal as="p" className="solution-cta__eyebrow">
          The container is only the beginning
        </Reveal>

        <Reveal as="h2" delay={100} className="solution-cta__title">
          Ready to build
          <br />
          your solution?
        </Reveal>

        <Reveal as="p" delay={220} className="solution-cta__sub">
          Tell RAVA the operation — we match the container, power and service, and stand behind
          it every hour of every day.
        </Reveal>

        <Reveal delay={340} className="solution-cta__actions">
          <MagneticButton href="/quote">Get a Quote</MagneticButton>
          <MagneticButton href="/quote" variant="ghost">
            Talk to RAVA
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}
