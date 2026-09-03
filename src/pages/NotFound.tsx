import { Link } from 'react-router-dom';
import { InnerLayout } from './InnerLayout';

export function NotFound() {
  return (
    <InnerLayout>
      <section className="inner-section notfound">
        <p className="page-hero__eyebrow">404</p>
        <h1 className="page-hero__title">
          <span>Page not</span>
          <span>found.</span>
        </h1>
        <Link to="/" className="btn" data-cursor="cta">
          <span>Back to home</span>
        </Link>
      </section>
    </InnerLayout>
  );
}
