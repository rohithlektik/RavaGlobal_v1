import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useReducedMotionSync } from '@/hooks/useReducedMotion';
import { useDeviceTierSync } from '@/hooks/useDeviceTier';
import { useLenisScroll } from '@/hooks/useLenis';
import { useScene } from '@/store/scene';
import { Cursor } from '@/components/Cursor';
import { Navigation } from '@/components/Navigation';
import { FullscreenMenu } from '@/components/FullscreenMenu';
import { HomePage } from '@/pages/HomePage';
import { ProductsIndex } from '@/pages/ProductsIndex';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProductPage } from '@/pages/ProductPage';
import { Rentals } from '@/pages/Rentals';
import { Company } from '@/pages/Company';
import { Services } from '@/pages/Services';
import { Quote } from '@/pages/Quote';
import { Contact } from '@/pages/Contact';
import { NotFound } from '@/pages/NotFound';

/** Reset scroll on route change (Lenis or native). */
function RouteEffects() {
  const { pathname } = useLocation();
  const setMenuOpen = useScene((s) => s.setMenuOpen);
  useEffect(() => {
    setMenuOpen(false);
    const lenis = (window as unknown as { __lenis?: { scrollTo: (v: number, o?: object) => void } })
      .__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname, setMenuOpen]);
  return null;
}

function Shell() {
  useReducedMotionSync();
  useDeviceTierSync();
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  useLenisScroll(isHome);

  return (
    <>
      <RouteEffects />
      <Cursor />
      <Navigation />
      <FullscreenMenu />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsIndex />} />
        <Route path="/products/:categorySlug" element={<CategoryPage />} />
        <Route path="/products/:categorySlug/:productSlug" element={<ProductPage />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/company" element={<Company />} />
        <Route path="/services" element={<Services />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
