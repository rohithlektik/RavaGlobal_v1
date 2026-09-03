import { useEffect, type ReactNode } from 'react';
import { SiteFooter } from '@/components/SiteFooter';

/**
 * Shell for every inner (routed) page: light editorial ground that inherits the
 * homepage design tokens (inverted for a light background, matching the
 * "light" sections on the homepage), a fade-up page transition, and the shared
 * footer. No 3D canvas.
 */
export function InnerLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.route = 'inner';
    return () => {
      delete document.documentElement.dataset.route;
    };
  }, []);

  return (
    <div className="inner-page" data-tone="light">
      <div className="inner-page__body">{children}</div>
      <SiteFooter />
    </div>
  );
}
