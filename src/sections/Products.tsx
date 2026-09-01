import { SectionShell } from './SectionShell';
import { Reveal } from '@/components/Reveal';
import { products } from '@/data/products';
import { MagneticButton } from '@/components/MagneticButton';

export function Products() {
  return (
    <SectionShell id="products" anchor="products" index="04" label="Products & equipment" minH="300vh">
      <div className="stage-copy">
        <Reveal as="h2" className="text-[var(--step-title)]">
          Infrastructure for whatever comes next.
        </Reveal>
        <Reveal className="mt-6 text-[var(--text-dim)]">
          One product fills the frame at a time. Refrigerated and dry containers, blast
          freezers, gensets and chassis — for sale or rent, new or used, backed by
          factory-trained technicians and in-house parts.
        </Reveal>

        <div className="mt-16 flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {products.map((p, i) => (
            <Reveal key={p.id} className="py-8">
              <div className="flex items-baseline gap-4">
                <span className="section__index">{String(i + 1).padStart(2, '0')}</span>
                <p className="tech-label">{p.kicker}</p>
              </div>
              <h3 className="mt-2 text-[var(--step-sub)] font-black">{p.name}</h3>
              <p className="mt-3 text-[var(--text-dim)]">{p.summary}</p>
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                {p.specs.map((s) => (
                  <div key={s.label} className="border-l border-[var(--line-strong)] pl-3">
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                      {s.label}
                    </dt>
                    <dd className="font-[var(--font-tech)] text-[var(--text)]">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ))}
        </div>

        <div className="mt-12">
          <MagneticButton href="#solutions" variant="ghost">
            Not sure which one? Start with your operation
          </MagneticButton>
        </div>
      </div>
    </SectionShell>
  );
}
