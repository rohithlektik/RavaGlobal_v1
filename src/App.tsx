import { Suspense } from 'react';
import { useReducedMotionSync } from '@/hooks/useReducedMotion';
import { useDeviceTierSync } from '@/hooks/useDeviceTier';
import { useLenisScroll } from '@/hooks/useLenis';
import { SceneCanvas } from '@/scene/SceneCanvas';
import { Loader } from '@/components/Loader';
import { Cursor } from '@/components/Cursor';
import { Navigation } from '@/components/Navigation';
import { FullscreenMenu } from '@/components/FullscreenMenu';
import { Hero } from '@/sections/Hero';
import { RavaWorld } from '@/sections/RavaWorld';
import { SolutionFinder } from '@/sections/SolutionFinder';
import { Products } from '@/sections/Products';
import { Industries } from '@/sections/Industries';
import { RentBuy } from '@/sections/RentBuy';
import { Service } from '@/sections/Service';
import { Coverage } from '@/sections/Coverage';
import { FinalCTA } from '@/sections/FinalCTA';
import { Footer } from '@/sections/Footer';

export default function App() {
  useReducedMotionSync();
  useDeviceTierSync();
  useLenisScroll();

  return (
    <>
      <Loader />
      <Cursor />

      <Suspense fallback={null}>
        <SceneCanvas />
      </Suspense>

      <Navigation />
      <FullscreenMenu />

      <a
        href="#world"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-loader)] focus:bg-[var(--rava-light)] focus:px-4 focus:py-2 focus:text-[var(--rava-abyss)]"
      >
        Skip to content
      </a>

      <main className="content-layer">
        <Hero />
        <RavaWorld />
        <SolutionFinder />
        <Products />
        <Industries />
        <RentBuy />
        <Service />
        <Coverage />
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}
