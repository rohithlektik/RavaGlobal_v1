import { SectionShell } from './SectionShell';
import { Reveal } from '@/components/Reveal';
import { industries } from '@/data/industries';
import { company } from '@/data/company';

export function Industries() {
  return (
    <SectionShell id="industries" anchor="industries" index="05" label="Industries" minH="280vh">
      <div className="stage-copy">
        <Reveal as="h2" className="text-[var(--step-title)]">
          Different products.
          <br />
          Same consequence.
        </Reveal>
        <Reveal className="mt-6 text-[var(--text-dim)]">
          Temperature moves. Product doesn&rsquo;t forgive. The container stays constant —
          the world around it changes to match your operation.
        </Reveal>

        <ul className="mt-14 flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {industries.map((ind, i) => (
            <Reveal as="li" key={ind.name} delay={i * 50} className="py-7">
              <p className="tech-label">{ind.gear}</p>
              <h3 className="mt-2 text-[var(--step-sub)] font-black">{ind.name}</h3>
              <p className="mt-2 text-[var(--text-dim)]">{ind.body}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-12 text-[var(--text-dim)]">
          <span className="tech-label">Trusted where temperature matters</span>
          <p className="mt-3">In use today by {company.trustedBy.join(', ')}.</p>
        </Reveal>
      </div>
    </SectionShell>
  );
}
