import { company } from '@/data/company';
import { navItems } from '@/data/nav';
import { Logo } from '@/components/Logo';

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] px-[var(--gutter)] py-16">
      <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Logo height={52} />
          <p className="mt-5 text-[var(--step-label)] text-[var(--text-dim)]">
            Cold-chain infrastructure. Ready when you are.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-3">
          {navItems.map((i) => (
            <a
              key={i.href}
              href={i.href}
              className="text-[var(--step-label)] uppercase tracking-[0.16em] text-[var(--text-dim)] transition-colors hover:text-[var(--rava-light)]"
            >
              {i.label}
            </a>
          ))}
        </nav>

        <address className="not-italic text-[var(--step-label)] text-[var(--text-dim)]">
          {company.hq.address}
          <br />
          <a href={company.phoneHref} className="text-[var(--text)]">
            {company.phone}
          </a>{' '}
          · {company.support}
        </address>
      </div>

      <div className="mt-14 flex flex-col justify-between gap-3 border-t border-[var(--line)] pt-6 text-[var(--step-label)] text-[var(--text-faint)] sm:flex-row">
        <span>© {new Date().getFullYear()} {company.legalName}. 24/7 support.</span>
        <span className="flex gap-6">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#accessibility">Accessibility</a>
        </span>
      </div>
    </footer>
  );
}
