import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useScene } from '@/store/scene';
import { megaSections } from '@/data/megamenu';

const DEFAULT_PREVIEW = {
  image: megaSections[0].image,
  label: megaSections[0].label,
  description: megaSections[0].description,
};

export function FullscreenMenu() {
  const open = useScene((s) => s.menuOpen);
  const setOpen = useScene((s) => s.setMenuOpen);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [preview, setPreview] = useState(DEFAULT_PREVIEW);
  const [prevImage, setPrevImage] = useState(DEFAULT_PREVIEW.image);

  const setImg = (image: string, label: string, description: string) => {
    setPreview((cur) => {
      if (cur.image !== image) setPrevImage(cur.image);
      return { image, label, description };
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    if (open) {
      document.documentElement.classList.add('lenis-stopped');
      window.addEventListener('keydown', onKey);
    } else {
      // reset after the close transition
      const t = setTimeout(() => {
        setExpanded(null);
        setPreview(DEFAULT_PREVIEW);
      }, 500);
      return () => clearTimeout(t);
    }
    return () => {
      document.documentElement.classList.remove('lenis-stopped');
      window.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);

  const close = () => setOpen(false);

  const rows = useMemo(() => megaSections, []);

  return (
    <div className={`mega${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="mega__media" aria-hidden="true">
        <div className="mega__media-layer" style={{ backgroundImage: `url(${prevImage})` }} />
        <div
          key={preview.image}
          className="mega__media-layer mega__media-layer--in"
          style={{ backgroundImage: `url(${preview.image})` }}
        />
        <div className="mega__media-cap">
          <span className="mega__media-label">{preview.label}</span>
          <p>{preview.description}</p>
        </div>
      </div>

      <nav className="mega__nav" aria-label="Primary">
        <a
          href="/"
          className="mega__logo"
          onClick={close}
          aria-label="RAVA Group — home"
          style={{ transitionDelay: open ? '60ms' : '0ms' }}
        >
          <img src="/brand/rava-logo-hi.png" alt="RAVA Group" />
        </a>

        <ul className="mega__list">
          {rows.map((row, i) => {
            const isOpen = expanded === row.label;
            return (
              <li
                key={row.label}
                className={`mega__item${isOpen ? ' is-expanded' : ''}`}
                style={{ transitionDelay: open ? `${120 + i * 55}ms` : '0ms' }}
                onMouseEnter={() => setImg(row.image, row.label, row.description)}
              >
                <div className="mega__row">
                  {row.expandable ? (
                    <button
                      type="button"
                      className="mega__link mega__link--btn"
                      aria-expanded={isOpen}
                      onClick={() => setExpanded(isOpen ? null : row.label)}
                    >
                      <span>{row.label}</span>
                    </button>
                  ) : (
                    <Link to={row.to} className="mega__link" onClick={close}>
                      <span>{row.label}</span>
                      <svg className="mega__arrow" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </Link>
                  )}

                  {row.expandable && (
                    <div className="mega__toggle-wrap">
                      <Link
                        to={row.to}
                        className="mega__all"
                        onClick={close}
                        onMouseEnter={() => setImg(row.image, row.label, row.description)}
                      >
                        View all
                      </Link>
                      <button
                        type="button"
                        className="mega__toggle"
                        aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${row.label}`}
                        onClick={() => setExpanded(isOpen ? null : row.label)}
                      >
                        <span className="mega__toggle-bar" />
                        <span className="mega__toggle-bar mega__toggle-bar--v" />
                      </button>
                    </div>
                  )}
                </div>

                {row.links && (
                  <div className="mega__sub">
                    <ul>
                      {row.links.map((l) => (
                        <li key={l.label}>
                          <Link
                            to={l.to}
                            onClick={close}
                            onMouseEnter={() =>
                              setImg(l.image ?? row.image, l.label, l.description ?? row.description)
                            }
                          >
                            <span>{l.label}</span>
                            <svg className="mega__arrow" viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                d="M5 12h14M13 6l6 6-6 6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mega__foot" style={{ transitionDelay: open ? '520ms' : '0ms' }}>
          <a href="tel:+18008285318">(800) 828-5318</a>
          <span>24/7 · 365 days a year</span>
        </div>
      </nav>
    </div>
  );
}
