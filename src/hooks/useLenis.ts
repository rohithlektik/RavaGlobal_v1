import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScene } from '@/store/scene';

gsap.registerPlugin(ScrollTrigger);

/**
 * One Lenis instance for the whole app, wired into GSAP ScrollTrigger and the
 * scene store. Disabled entirely under prefers-reduced-motion so the page falls
 * back to native scrolling with no inertia.
 */
export function useLenisScroll() {
  const reducedMotion = useScene((s) => s.reducedMotion);
  const setScroll = useScene((s) => s.setScroll);

  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.1,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    });

    lenis.on('scroll', (e: { progress: number }) => {
      setScroll(e.progress);
      ScrollTrigger.update();
    });

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // in-page anchor links -> smooth Lenis scroll
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -40, duration: 1.4 });
    };
    document.addEventListener('click', onClick);

    if (import.meta.env.DEV) {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    return () => {
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
      if (import.meta.env.DEV) delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, [reducedMotion, setScroll]);
}
