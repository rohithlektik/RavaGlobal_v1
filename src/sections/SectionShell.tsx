import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useSectionScrub } from '@/hooks/useSectionScrub';
import type { SectionId } from '@/store/scene';

interface Props {
  id: SectionId;
  anchor: string;
  index?: string;
  label?: string;
  children: ReactNode;
  className?: string;
  /** extra scroll length in viewport heights (for pinned-feel sections) */
  minH?: string;
  /** 'light' = opaque white editorial block (hides the 3D canvas behind it) */
  tone?: 'dark' | 'light';
  /** override the eyebrow label colour (e.g. white over a dark scrim) */
  labelColor?: string;
}

/** Inverts the token roles so every child component re-themes for a light ground. */
const LIGHT_VARS: CSSProperties = {
  background: 'var(--rava-pale)',
  color: 'var(--rava-abyss)',
  ['--text' as string]: 'var(--rava-abyss)',
  ['--text-dim' as string]: 'rgba(11,22,34,0.66)',
  ['--text-faint' as string]: 'rgba(11,22,34,0.42)',
  ['--line' as string]: 'rgba(59,80,112,0.2)',
  ['--line-strong' as string]: 'rgba(59,80,112,0.4)',
  ['--accent' as string]: 'var(--rava-blue)',
};

/** Wraps a section, registers it with the scroll director, exposes an anchor. */
export function SectionShell({
  id,
  anchor,
  index,
  label,
  children,
  className = '',
  minH,
  tone = 'dark',
  labelColor,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  useSectionScrub(ref, id);

  return (
    <section
      ref={ref}
      id={anchor}
      data-tone={tone}
      className={`section ${className}`}
      style={{ ...(minH ? { minHeight: minH } : {}), ...(tone === 'light' ? LIGHT_VARS : {}) }}
      aria-labelledby={label ? `${anchor}-title` : undefined}
    >
      {(index || label) && (
        <div className="mb-10 flex items-center gap-4">
          {index && (
            <span
              className="section__index"
              style={tone === 'light' ? { color: 'var(--rava-blue)' } : undefined}
            >
              {index}
            </span>
          )}
          {label && (
            <span className="tech-label" style={labelColor ? { color: labelColor } : undefined}>
              {label}
            </span>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
