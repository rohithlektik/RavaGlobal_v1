import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScene, type SectionId } from '@/store/scene';

gsap.registerPlugin(ScrollTrigger);

interface Options {
  /** where the section starts scrubbing, GSAP start syntax */
  start?: string;
  end?: string;
  /** mark active when this much of the section is on screen */
  activateStart?: string;
  activateEnd?: string;
}

/**
 * Registers a section with the scene store:
 *  - writes 0..1 scrub progress to `sections[id]` as it passes through the viewport
 *  - flips `active` to this id while it owns the viewport centre
 */
export function useSectionScrub(
  ref: RefObject<HTMLElement | null>,
  id: SectionId,
  opts: Options = {},
) {
  const setSection = useScene((s) => s.setSection);
  const setActive = useScene((s) => s.setActive);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: opts.start ?? 'top bottom',
        end: opts.end ?? 'bottom top',
        scrub: true,
        onUpdate: (self) => setSection(id, self.progress),
      });

      ScrollTrigger.create({
        trigger: el,
        start: opts.activateStart ?? 'top center',
        end: opts.activateEnd ?? 'bottom center',
        onToggle: (self) => {
          if (self.isActive) setActive(id);
        },
      });
    });

    return () => ctx.revert();
  }, [ref, id, setSection, setActive, opts.start, opts.end, opts.activateStart, opts.activateEnd]);
}
