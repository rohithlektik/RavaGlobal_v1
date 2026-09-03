import { SectionShell } from './SectionShell';
import { Reveal } from '@/components/Reveal';
import { products } from '@/data/products';
import { MagneticButton } from '@/components/MagneticButton';
import { useScene } from '@/store/scene';

export function Products() {
  // mirror the 3D rail's active index so the matching title can lift — only
  // while the section actually owns the viewport
  const p = useScene((s) => s.sections['products'] ?? 0);
  const isHere = useScene((s) => s.active === 'products');
  const activeIdx = isHere ? Math.round(p * (products.length - 1)) : -1;

  return (
    <SectionShell
      id="products"
      anchor="products"
      index="04"
      label="Products & equipment"
      labelColor="var(--rava-pale)"
      minH="250vh"
    >
      <div className="section-scrim" aria-hidden="true" />
      <div className="stage-copy stage-copy--wide">
        <Reveal as="h2" className="text-[var(--step-title)]">
          Infrastructure for whatever comes next.
        </Reveal>
        <Reveal className="mt-6 text-[var(--text-dim)]">
          One product fills the frame at a time. Refrigerated and dry containers, blast
          freezers, gensets and chassis — for sale or rent, new or used, backed by
          factory-trained technicians and in-house parts.
        </Reveal>

        <div className="products-list mt-16 flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {products.map((prod, i) => (
            <Reveal key={prod.id} className="py-8">
              <div className="flex items-baseline gap-4">
                <span className="section__index">{String(i + 1).padStart(2, '0')}</span>
                <p className="tech-label">{prod.kicker}</p>
              </div>
              <h3
                className={`products-list__name mt-2 text-[var(--step-sub)] font-black${
                  i === activeIdx ? ' is-active' : ''
                }`}
              >
                {prod.name}
              </h3>
              <p className="mt-3 text-[var(--text-dim)]">{prod.summary}</p>
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                {prod.specs.map((s) => (
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
