import { useEffect, useState } from 'react';
import { useScene } from '@/store/scene';
import { navItems, primaryCta } from '@/data/nav';
import { Logo } from './Logo';

export function Navigation() {
  const menuOpen = useScene((s) => s.menuOpen);
  const setMenuOpen = useScene((s) => s.setMenuOpen);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-[var(--z-nav)] transition-colors duration-500"
      style={{
        background: scrolled ? 'linear-gradient(to bottom, rgba(11,22,34,0.82), transparent)' : 'transparent',
        backdropFilter: scrolled ? 'blur(6px)' : 'none',
      }}
    >
      <div className="flex items-center justify-between px-[var(--gutter)] py-4 md:py-5">
        <a href="#top" aria-label="RAVA Group — home" className="shrink-0">
          <Logo height={scrolled ? 34 : 42} className="transition-all duration-500" />
        </a>

        <nav aria-label="Sections" className="hidden min-[1360px]:block">
          <ul className="flex items-center gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group relative inline-block whitespace-nowrap py-1 text-[var(--step-label)] font-[var(--font-tech)] uppercase tracking-[0.16em] text-[var(--text-dim)] transition-colors duration-300 hover:text-[var(--rava-pale)]"
                >
                  {item.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-[var(--rava-light)] transition-transform duration-400 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          <a href={primaryCta.href} className="btn hidden sm:inline-flex" data-cursor="cta">
            <span>{primaryCta.label}</span>
          </a>
          <button
            type="button"
            className="menu-toggle flex items-center gap-3 text-[var(--step-label)] font-[var(--font-tech)] uppercase tracking-[0.2em] text-[var(--text)]"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="hidden md:inline">{menuOpen ? 'Close' : 'Menu'}</span>
            <span className="relative flex h-4 w-6 flex-col justify-between">
              <span
                className="h-px w-full bg-current transition-transform duration-400 ease-[var(--ease-out-expo)]"
                style={{ transform: menuOpen ? 'translateY(7.5px) rotate(45deg)' : 'none' }}
              />
              <span
                className="h-px w-full bg-current transition-opacity duration-200"
                style={{ opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="h-px w-full bg-current transition-transform duration-400 ease-[var(--ease-out-expo)]"
                style={{ transform: menuOpen ? 'translateY(-7.5px) rotate(-45deg)' : 'none' }}
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
