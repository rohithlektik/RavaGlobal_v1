import type { ReactNode } from 'react';
import { ImageReveal } from './ImageReveal';
import { Reveal } from './Reveal';

interface Props {
  eyebrow: string;
  title: string[];
  lead?: string;
  image: string;
  imageAlt?: string;
  actions?: ReactNode;
  meta?: { label: string; value: string }[];
}

/** Reusable inner-page hero: editorial title left, large masked image right. */
export function PageHero({ eyebrow, title, lead, image, imageAlt, actions, meta }: Props) {
  return (
    <header className="page-hero">
      <div className="page-hero__text">
        <Reveal as="p" className="page-hero__eyebrow">
          {eyebrow}
        </Reveal>
        <h1 className="page-hero__title">
          {title.map((line, i) => (
            <Reveal as="span" key={line} delay={80 + i * 90} className="page-hero__line">
              {line}
            </Reveal>
          ))}
        </h1>
        {lead && (
          <Reveal as="p" delay={260} className="page-hero__lead">
            {lead}
          </Reveal>
        )}
        {meta && meta.length > 0 && (
          <Reveal delay={320} className="page-hero__meta">
            {meta.map((m) => (
              <span key={m.label}>
                <span className="page-hero__meta-label">{m.label}</span>
                {m.value}
              </span>
            ))}
          </Reveal>
        )}
        {actions && (
          <Reveal delay={360} className="page-hero__cta">
            {actions}
          </Reveal>
        )}
      </div>

      <div className="page-hero__media">
        <ImageReveal src={image} alt={imageAlt} parallax={40} priority />
      </div>
    </header>
  );
}
