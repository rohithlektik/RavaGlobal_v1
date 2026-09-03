import { Suspense } from 'react';
import { SceneCanvas } from '@/scene/SceneCanvas';
import { Loader } from '@/components/Loader';
import { StageFrame } from '@/components/StageFrame';
import { StatementStage } from '@/components/StatementStage';
import { Hero } from '@/sections/Hero';
import { Statement } from '@/sections/Statement';
import { RavaWorld } from '@/sections/RavaWorld';
import { SolutionFinder } from '@/sections/SolutionFinder';
import { Products } from '@/sections/Products';
import { Industries } from '@/sections/Industries';
import { RentBuy } from '@/sections/RentBuy';
import { Coverage } from '@/sections/Coverage';
import { FinalCTA } from '@/sections/FinalCTA';
import { SiteFooter } from '@/components/SiteFooter';

/** The homepage — the cinematic 3D scroll experience. Route: "/" */
export function HomePage() {
  return (
    <>
      <Loader />

      <Suspense fallback={null}>
        <SceneCanvas />
      </Suspense>

      <StageFrame />
      <StatementStage />

      <a
        href="#world"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-loader)] focus:bg-[var(--rava-light)] focus:px-4 focus:py-2 focus:text-[var(--rava-abyss)]"
      >
        Skip to content
      </a>

      <main className="content-layer">
        <Hero />
        <Statement />
        <RavaWorld />
        <SolutionFinder />
        <Products />
        <Industries />
        <RentBuy />
        <Coverage />
        <FinalCTA />
      </main>

      <SiteFooter compact />
    </>
  );
}
