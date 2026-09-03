import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useScene } from '@/store/scene';
import { primaryNav } from '@/data/megamenu';
import { Logo } from './Logo';

export function Navigation() {
  const menuOpen = useScene((s) => s.menuOpen);
  const setMenuOpen = useScene((s) => s.setMenuOpen);
  const active = useScene((s) => s.active);
  const scroll = useScene((s) => s.scroll); // 0..1 doc progress (Lenis)
  const reducedMotion = useScene((s) => s.reducedMotion);
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  // On the homepage the bar is transparent over the hero and always visible.
  // Past the hero (and on every inner page) it is a white bar that hides on a
  // decisive scroll-down and slides back in on scroll-up (headroom pattern).
  const inHero = isHome && active === 'hero';
  const [hidden, setHidden] = useState(false);
  const anchor = useRef(0);

  const evaluate = (pos: number) => {
    if (inHero) {
      setHidden(false);
      anchor.current = pos;
      return;
    }
    const dy = pos - anchor.current;
    if (dy > 0.012) {
      setHidden(true);
      anchor.current = pos;
    } else if (dy < -0.003) {
      setHidden(false);
      anchor.current = pos;
    }
  };

  useEffect(() => {
    if (reducedMotion) return;
    evaluate(scroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroll, inHero, pathname]);

  useEffect(() => {
    if (!reducedMotion) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      evaluate(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, inHero, pathname]);

  // reset the headroom anchor on route change so a new page starts visible
  useEffect(() => {
    anchor.current = 0;
    setHidden(false);
  }, [pathname]);

  const condensed = !inHero;
  const light = condensed || menuOpen;
  const show = !hidden || menuOpen || inHero;

  return (
    <header
      data-light={light || undefined}
      className="nav-bar fixed inset-x-0 top-0 transition-[transform,background-color,box-shadow] duration-[350ms] ease-[var(--ease-out-expo)]"
      style={{
        zIndex: menuOpen ? 'calc(var(--z-menu) + 1)' : 'var(--z-nav)',
        transform: show ? 'translateY(0)' : 'translateY(-100%)',
        backgroundColor: condensed && !menuOpen ? '#ffffff' : 'transparent',
        boxShadow: condensed && !menuOpen ? '0 1px 0 rgba(59,80,112,0.14)' : 'none',
      }}
    >
      <div className="flex items-center justify-between px-[var(--gutter)] py-4 md:py-5">
        {!menuOpen ? (
          <Link to="/" aria-label="RAVA Group — home" className="shrink-0">
            <Logo
              variant={light ? 'color' : 'white'}
              height={condensed ? 32 : 42}
              className="transition-all duration-500"
            />
          </Link>
        ) : (
          <span className="shrink-0" />
        )}

        {!menuOpen && (
          <nav aria-label="Primary" className="nav-sections hidden min-[1180px]:block">
            <ul className="flex items-center gap-7">
              {primaryNav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group relative inline-block whitespace-nowrap py-1 text-[var(--step-label)] font-[var(--font-tech)] uppercase tracking-[0.16em] text-[var(--text-dim)] transition-colors duration-300 hover:text-[var(--rava-pale)]"
                  >
                    {item.label}
                    <span className="nav-underline absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-[var(--rava-light)] transition-transform duration-400 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="flex items-center gap-3 md:gap-5">
          {!menuOpen && (
            <Link to="/quote" className="btn hidden sm:inline-flex" data-cursor="cta">
              <span>Request a Quote</span>
            </Link>
          )}
          <button
            type="button"
            className="menu-toggle flex items-center gap-3 text-[var(--step-label)] font-[var(--font-tech)] uppercase tracking-[0.2em] transition-colors duration-300"
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
