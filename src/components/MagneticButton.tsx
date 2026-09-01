import { useRef, type ReactNode, type MouseEvent } from 'react';
import { useScene } from '@/store/scene';

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'solid' | 'ghost';
  arrow?: boolean;
  className?: string;
  ariaLabel?: string;
}

/** CTA with a restrained magnetic pull (max ~10px) and an arrow nudge on hover. */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = 'solid',
  arrow = true,
  className = '',
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const reducedMotion = useScene((s) => s.reducedMotion);

  const onMove = (e: MouseEvent) => {
    if (reducedMotion || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.18;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.3;
    ref.current.style.transform = `translate(${Math.max(-10, Math.min(10, x))}px, ${Math.max(-8, Math.min(8, y))}px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  const cls = `btn ${variant === 'ghost' ? 'btn--ghost' : ''} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      {arrow && (
        <svg className="btn__arrow" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      )}
    </>
  );

  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        className={cls}
        data-cursor="cta"
        aria-label={ariaLabel}
        onMouseMove={onMove}
        onMouseLeave={reset}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      ref={ref}
      type="button"
      className={cls}
      data-cursor="cta"
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {inner}
    </button>
  );
}
