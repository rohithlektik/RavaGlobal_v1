import { useRef } from 'react';
import { useSectionScrub } from '@/hooks/useSectionScrub';
import { Reveal } from '@/components/Reveal';
import { MagneticButton } from '@/components/MagneticButton';

export function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  useSectionScrub(ref, 'final');

  return (
    <section
      ref={ref}
      id="quote"
      className="section relative z-[1] flex min-h-screen flex-col items-center justify-center bg-[var(--rava-abyss)] text-center"
      aria-labelledby="quote-title"
    >
      <Reveal as="h2" className="max-w-4xl text-[var(--step-hero)] leading-[0.95]">
        Ready to build your solution?
      </Reveal>
      <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <MagneticButton href="/quote">Get a Quote</MagneticButton>
        <MagneticButton href="/quote" variant="ghost">
          Talk to RAVA
        </MagneticButton>
      </Reveal>
      <Reveal className="tech-label mt-12">The container is only the beginning.</Reveal>
    </section>
  );
}
