import { Link } from 'react-router-dom';
import { company } from '@/data/company';
import { categories } from '@/data/catalog';

const COLS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Products',
    links: categories.slice(0, 5).map((c) => ({ label: c.label, to: `/products/${c.slug}` })),
  },
  {
    title: 'Rentals',
    links: [
      { label: 'Refrigerated Rentals', to: '/rentals#refrigerated' },
      { label: 'Dry Container Rentals', to: '/rentals#dry' },
      { label: 'Rental Process', to: '/rentals#process' },
      { label: 'Rental FAQ', to: '/rentals#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About RAVA', to: '/company' },
      { label: 'Services', to: '/services' },
      { label: 'Request a Quote', to: '/quote' },
      { label: 'Contact', to: '/contact' },
    ],
  },
];

/**
 * Redesigned footer — premium dark navy, consistent across every page.
 * `compact` (homepage) drops the brand/CTA block, which the homepage's closing
 * section already covers, and runs at a smaller size.
 */
export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className={`site-footer${compact ? ' site-footer--compact' : ''}`}>
      <div className="site-footer__top">
        {!compact && (
          <div className="site-footer__brand">
            <img src="/brand/rava-logo-white.png" alt="RAVA Group" className="site-footer__logo" />
            <p>Essential cold-chain infrastructure. Ready when you are.</p>
            <Link to="/quote" className="btn" data-cursor="cta">
              <span>Request a Quote</span>
            </Link>
          </div>
        )}

        <nav className="site-footer__cols" aria-label="Footer">
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="site-footer__col-title">{col.title}</p>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <address className="site-footer__contact">
            <p className="site-footer__col-title">Location</p>
            {company.hq.address}
            <br />
            <a href={company.phoneHref}>{company.phone}</a>
            <br />
            {company.support}
          </address>
        </nav>
      </div>

      <div className="site-footer__legal">
        <span>
          © {new Date().getFullYear()} {company.legalName}
        </span>
        <span className="site-footer__legal-links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#accessibility">Accessibility</a>
        </span>
      </div>
    </footer>
  );
}
