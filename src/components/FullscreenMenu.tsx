import { useEffect } from 'react';
import { useScene } from '@/store/scene';
import { navItems, primaryCta } from '@/data/nav';

export function FullscreenMenu() {
  const open = useScene((s) => s.menuOpen);
  const setOpen = useScene((s) => s.setMenuOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    if (open) {
      document.documentElement.classList.add('lenis-stopped');
      window.addEventListener('keydown', onKey);
    }
    return () => {
      document.documentElement.classList.remove('lenis-stopped');
      window.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);

  return (
    <nav
      className={`menu-overlay${open ? ' is-open' : ''}`}
      aria-hidden={!open}
      aria-label="Primary"
    >
      <ul className="flex flex-col gap-2 md:gap-3">
        {navItems.map((item, i) => (
          <li key={item.href}>
            <a
              className="menu-link"
              href={item.href}
              tabIndex={open ? 0 : -1}
              style={{ transitionDelay: open ? `${120 + i * 70}ms` : '0ms' }}
              onClick={() => setOpen(false)}
            >
              <span className="menu-link__index">{item.index}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <div
        className="mt-12 flex flex-wrap items-center gap-6"
        style={{ transitionDelay: open ? '640ms' : '0ms' }}
      >
        <a
          href={primaryCta.href}
          className="btn"
          data-cursor="cta"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        >
          <span>{primaryCta.label}</span>
        </a>
        <span className="tech-label">The container is only the beginning.</span>
      </div>
    </nav>
  );
}
