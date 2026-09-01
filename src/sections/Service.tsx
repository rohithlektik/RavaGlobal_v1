import { SectionShell } from './SectionShell';
import { Reveal } from '@/components/Reveal';
import { MagneticButton } from '@/components/MagneticButton';
import { company } from '@/data/company';

const STAGES = [
  { k: 'Container', d: 'The unit as it stands on your site.' },
  { k: 'Components', d: 'Doors, seals, liner, floor, corner castings — inspected.' },
  { k: 'Refrigeration', d: 'Compressor, condenser, evaporator, fans, controller and charge.' },
  { k: 'Maintenance', d: 'Factory-trained technicians, in-house parts, documented.' },
  { k: 'Ready', d: 'Reassembled, verified, holding set point.' },
];

export function Service() {
  return (
    <SectionShell id="service" anchor="service" index="07" label="Service & support" minH="280vh">
      <div className="stage-copy">
        <Reveal as="h2" className="text-[var(--step-title)]">
          Sometimes it&rsquo;s planned.
          <br />
          Sometimes it&rsquo;s 2:17&nbsp;AM.
        </Reveal>
        <Reveal className="mt-6 text-[var(--text-dim)]">
          Either way, RAVA answers. Around-the-clock maintenance backed by factory-trained
          technicians and in-house parts — {company.support}.
        </Reveal>

        <ol className="mt-14 flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {STAGES.map((s, i) => (
            <Reveal as="li" key={s.k} delay={i * 60} className="flex gap-5 py-6">
              <span className="section__index pt-1">0{i + 1}</span>
              <div>
                <h3 className="text-[var(--step-sub)] font-black leading-none">{s.k}</h3>
                <p className="mt-2 text-[var(--text-dim)]">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-10 text-[var(--text-dim)]">
          In-house parts for {company.equipmentBrands.join(', ')}. Don&rsquo;t know the part
          number? Send a photo of the label and RAVA identifies it.
        </Reveal>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <MagneticButton href="#quote">Request service</MagneticButton>
          <a href={company.phoneHref} className="tech-label underline underline-offset-4" data-cursor>
            Call 24/7 · {company.phone}
          </a>
        </div>
      </div>
    </SectionShell>
  );
}
