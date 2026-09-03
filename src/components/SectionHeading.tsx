import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

interface Props {
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}

/** Small uppercase label above a strong, restrained section title. */
export function SectionHeading({ eyebrow, children, className = '' }: Props) {
  return (
    <div className={`section-heading ${className}`}>
      {eyebrow && (
        <Reveal as="p" className="section-heading__eyebrow">
          {eyebrow}
        </Reveal>
      )}
      <Reveal as="h2" delay={80} className="section-heading__title">
        {children}
      </Reveal>
    </div>
  );
}
