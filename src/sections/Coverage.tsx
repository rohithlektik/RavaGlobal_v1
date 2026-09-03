import { useMemo } from 'react';
import { SectionShell } from './SectionShell';
import { Reveal } from '@/components/Reveal';
import { CoverageFallback } from './CoverageFallback';
import { company } from '@/data/company';
import { hasWebGL } from '@/utils/webgl';

export function Coverage() {
  // the coverage globe lives in the shared 3D canvas; only when WebGL is
  // unavailable do we render a static SVG map in its place
  const webgl = useMemo(hasWebGL, []);

  return (
    <SectionShell id="coverage" anchor="about" index="07" label="RAVA scale & coverage" minH="240vh">
      {!webgl && <CoverageFallback />}
      <div className="stage-copy">
        <Reveal as="h2" className="text-[var(--step-title)]">
          Closer than you think.
        </Reveal>
        <Reveal className="mt-6 text-[var(--text-dim)]">
          One container. One site. A regional network. Headquartered in Miami with a new
          container depot and distribution warehouse, RAVA serves most of Florida and
          operates internationally in the Dominican Republic and Colombia.
        </Reveal>

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
