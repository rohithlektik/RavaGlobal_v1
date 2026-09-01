import { SectionShell } from './SectionShell';
import { Reveal } from '@/components/Reveal';
import { MagneticButton } from '@/components/MagneticButton';

const PATHS = [
  {
    key: 'Rent',
    lead: 'Flexibility, speed, capacity for now.',
    points: ['Short-term spikes', 'Seasonal demand', 'Emergency response', 'Delivered ready to run'],
  },
  {
    key: 'Buy',
    lead: 'Ownership, permanence, infrastructure to build on.',
    points: ['Ongoing capacity', 'Permanent siting', 'Long-term economics', 'An asset on the books'],
  },
];

export function RentBuy() {
  return (
    <SectionShell id="rent-buy" anchor="rent-buy" index="06" label="Rent or buy" minH="130vh" tone="light">
      <Reveal as="h2" className="max-w-3xl text-[var(--step-title)]">
        How do you want to deploy it?
      </Reveal>
      <Reveal className="mt-6 max-w-xl text-[var(--text-dim)]">
        RAVA won&rsquo;t assume rent or buy is better for you. We compare both against your
        duration and location — with the same 24/7 service either way.
      </Reveal>

      <div className="mt-16 grid gap-px overflow-hidden border border-[var(--line-strong)] bg-[var(--line-strong)] md:grid-cols-2">
        {PATHS.map((p, i) => (
          <Reveal
            key={p.key}
            delay={i * 90}
            className="group flex flex-col justify-between bg-[var(--rava-white)] p-10 transition-colors duration-500 hover:bg-[rgba(59,80,112,0.04)]"
          >
            <div>
              <h3 className="text-[clamp(2.25rem,1rem+4vw,4rem)] font-black leading-none">{p.key}</h3>
              <p className="mt-4 text-[var(--step-sub)] text-[var(--rava-blue)]">{p.lead}</p>
              <ul className="mt-8 space-y-2 text-[var(--text-dim)]">
                {p.points.map((pt) => (
                  <li key={pt} className="border-l border-[var(--line-strong)] pl-3">
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12">
        <MagneticButton href="#quote">Compare my options</MagneticButton>
      </div>
    </SectionShell>
  );
}
