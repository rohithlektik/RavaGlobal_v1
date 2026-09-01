import { SectionShell } from './SectionShell';
import { Reveal } from '@/components/Reveal';
import { company } from '@/data/company';

export function Coverage() {
  return (
    <SectionShell id="coverage" anchor="about" index="08" label="RAVA scale & coverage" minH="240vh">
      <div className="stage-copy">
        <Reveal as="h2" className="text-[var(--step-title)]">
          Closer than you think.
        </Reveal>
        <Reveal className="mt-6 text-[var(--text-dim)]">
          One container. One site. A regional network. Headquartered in Miami with a new
          container depot and distribution warehouse, RAVA serves most of Florida and
          operates internationally in the Dominican Republic and Colombia.
        </Reveal>

        <ul className="mt-12 flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {company.regions.map((r, i) => (
            <Reveal as="li" key={r.name} delay={i * 50} className="flex items-baseline justify-between gap-6 py-4">
              <span className="text-[var(--step-sub)] font-black leading-none">{r.name}</span>
              <span className="tech-label text-right">{r.role}</span>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-10 text-[var(--step-label)]">
          <span className="tech-label">Headquarters</span>
          <p className="mt-2 text-[var(--text)]">{company.hq.address}</p>
          <p className="mt-1 text-[var(--text-dim)]">
            {company.support} · {company.phone}
          </p>
        </Reveal>
      </div>
    </SectionShell>
  );
}
