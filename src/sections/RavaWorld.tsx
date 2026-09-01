import { SectionShell } from './SectionShell';
import { Reveal } from '@/components/Reveal';

const PILLARS = [
  { k: 'Equipment', d: 'Refrigerated and dry containers, blast freezers, gensets and chassis.' },
  { k: 'Delivery', d: 'Positioned, delivered and commissioned so day one is covered.' },
  { k: 'Power', d: 'Gensets sized to the load where the grid can&rsquo;t reach.' },
  { k: 'Parts', d: 'In-house stock for Carrier, Thermo King, Daikin, Star Cool and Taylor.' },
  { k: 'Technicians', d: 'Factory-trained, dispatched across the service area.' },
  { k: '24/7 support', d: 'Around the clock, 365 days a year — a real person answers.' },
];

export function RavaWorld() {
  return (
    <SectionShell id="world" anchor="world" index="02" label="The RAVA world" minH="140vh" tone="light">
      <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24">
        <Reveal as="h2" className="text-[var(--step-title)]">
          More than containers.
          <br />
          <span className="text-[var(--rava-blue)]">Engineered solutions.</span>
        </Reveal>
        <Reveal className="self-end text-[var(--text-dim)]">
          RAVA is not simply selling containers. RAVA builds the infrastructure that stores,
          protects and moves critical operations — and stands behind it every hour of every day.
        </Reveal>
      </div>

      <hr className="rule my-16" />

      <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map((p, i) => (
          <Reveal as="li" key={p.k} delay={i * 60}>
            <span className="section__index">0{i + 1}</span>
            <h3 className="mt-3 text-[var(--step-sub)] font-black">{p.k}</h3>
            <p
              className="mt-2 max-w-xs text-[var(--text-dim)]"
              dangerouslySetInnerHTML={{ __html: p.d }}
            />
          </Reveal>
        ))}
      </ul>
    </SectionShell>
  );
}
