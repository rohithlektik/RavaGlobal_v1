import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScene } from '@/store/scene';

gsap.registerPlugin(ScrollTrigger);

/**
 * One Lenis instance for the whole app, wired into GSAP ScrollTrigger and the
 * scene store. Disabled entirely under prefers-reduced-motion so the page falls
 * back to native scrolling with no inertia. Held at the top (stopped) until the
 * 3D asset + textures are ready, so the intro never starts against an empty
 * scene.
 */
export function useLenisScroll(isHome = true) {
  const reducedMotion = useScene((s) => s.reducedMotion);
  const setScroll = useScene((s) => s.setScroll);
  const loadedFlag = useScene((s) => s.loaded);
  const lenisRef = useRef<Lenis | null>(null);

  // inner (routed) pages have no 3D loader — never hold the scroll there
  const loaded = loadedFlag || !isHome;

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
    lenisRef.current = lenis;

    // start locked at the top; the loaded-effect below releases it
    if (!loaded) {
      lenis.scrollTo(0, { immediate: true, force: true });
      lenis.stop();
    }

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
      lenisRef.current = null;
      if (import.meta.env.DEV) delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, [reducedMotion, setScroll]);

  // release the scroll lock once assets are ready, then re-measure ScrollTrigger
  // now that the real (async-loaded) content is in place
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis || reducedMotion) return;
    if (loaded) {
      lenis.start();
      // wait for a laid-out frame; skip while the tab has no real viewport
      requestAnimationFrame(() => {
        if (window.innerHeight > 0) ScrollTrigger.refresh();
      });
    } else {
      lenis.scrollTo(0, { immediate: true, force: true });
      lenis.stop();
    }
  }, [loaded, reducedMotion]);
}
