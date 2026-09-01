import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}

/** Lightweight scroll-into-view reveal via IntersectionObserver + CSS. */
export function Reveal({ children, as: Tag = 'div', delay = 0, className = '' }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
