import { useEffect, useRef } from 'react';
import { SectionShell } from './SectionShell';
import { Reveal } from '@/components/Reveal';
import { SpinReveal } from '@/components/SpinReveal';

const PILLARS = [
  {
    k: 'Equipment',
    d: 'Refrigerated and dry containers, blast freezers, gensets and chassis.',
    icon: 'container',
  },
  {
    k: 'Delivery',
    d: 'Positioned, delivered and commissioned so day one is covered.',
    icon: 'truck',
  },
  { k: 'Power', d: 'Gensets sized to the load where the grid can&rsquo;t reach.', icon: 'bolt' },
  {
    k: 'Parts',
    d: 'In-house stock for Carrier, Thermo King, Daikin, Star Cool and Taylor.',
    icon: 'gear',
  },
  { k: 'Technicians', d: 'Factory-trained, dispatched across the service area.', icon: 'wrench' },
  {
    k: '24/7 support',
    d: 'Around the clock, 365 days a year &mdash; a real person answers.',
    icon: 'clock',
  },
];

export function RavaWorld() {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('.world-item'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.28, rootMargin: '0px 0px -10% 0px' },
    );
    items.forEach((it) => io.observe(it));
    return () => io.disconnect();
  }, []);

  return (
    <SectionShell
      id="world"
      anchor="world"
      index="02"
      label="The RAVA world"
      minH="100vh"
      tone="light"
      className="section--tight"
    >
      <Reveal
        as="h2"
        className="leading-[1.1] tracking-[-0.01em]"
        style={{ fontSize: 'clamp(2rem, 1.1rem + 3vw, 3.6rem)', fontWeight: 400 }}
      >
        More than containers.{' '}
        <span className="text-[var(--rava-blue)]">Engineered solutions.</span>
      </Reveal>

      <hr className="rule" style={{ margin: '30px 0' }} />

      <ul ref={listRef} className="world-grid">
        {PILLARS.map((p, i) => (
          <li key={p.k} className="world-item" style={{ ['--i' as string]: i }}>
            <SpinReveal icon={p.icon} />
            <div className="world-item__body">
              <span className="world-item__num">0{i + 1}</span>
              <h3 className="mt-2 text-[var(--step-sub)] font-black">{p.k}</h3>
              <p
                className="mt-2 max-w-xs text-[var(--text-dim)]"
                dangerouslySetInnerHTML={{ __html: p.d }}
              />
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
