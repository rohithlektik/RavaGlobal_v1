import { useEffect, useRef, type CSSProperties } from 'react';

interface Props {
  src: string;
  alt?: string;
  className?: string;
  /** parallax strength in px across the viewport pass (0 = none) */
  parallax?: number;
  ratio?: string;
  priority?: boolean;
}

/**
 * Editorial image block: masked clip-path reveal on scroll-in, a slow settle
 * from scale(1.06), and optional subtle vertical parallax. Respects
 * prefers-reduced-motion (renders the image, no motion).
 */
export function ImageReveal({ src, alt = '', className = '', parallax = 0, ratio, priority }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (priority) el.classList.add('is-in');
    else {
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            el.classList.add('is-in');
            io.disconnect();
          }
        },
        { threshold: 0.2 },
      );
      io.observe(el);
    }

    if (!parallax || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onScroll = () => {
      raf ||= requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        el.style.setProperty('--img-shift', `${(-p * parallax).toFixed(1)}px`);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [parallax, priority]);

  const style: CSSProperties = ratio ? { aspectRatio: ratio } : {};

  return (
    <div ref={ref} className={`image-reveal ${className}`} style={style} role="img" aria-label={alt}>
      <div className="image-reveal__img" style={{ backgroundImage: `url(${src})` }} />
    </div>
  );
}
