import { Link } from 'react-router-dom';
import { Reveal } from './Reveal';

interface Props {
  title?: string[];
  href?: string;
  label?: string;
}

/** Full-bleed dark-navy conversion block used to close inner pages. */
export function QuoteCTA({
  title = ['Need the right', 'container?'],
  href = '/quote',
  label = 'Request a Quote',
}: Props) {
  return (
    <section className="quote-cta">
      <Reveal className="quote-cta__inner">
        <h2 className="quote-cta__title">
          {title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h2>
        <Link to={href} className="btn" data-cursor="cta">
          <span>{label}</span>
          <svg className="btn__arrow" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </Link>
      </Reveal>
    </section>
  );
}
