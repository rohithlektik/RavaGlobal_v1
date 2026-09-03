import { InnerLayout } from './InnerLayout';
import { PageHero } from '@/components/PageHero';
import { SectionHeading } from '@/components/SectionHeading';
import { QuoteCTA } from '@/components/QuoteCTA';
import { Reveal } from '@/components/Reveal';

const SERVICES = [
  ['24/7 Service', 'Technicians on call every hour of every day, 365 days a year.'],
  ['Repair & Maintenance', 'Scheduled servicing and rapid response to keep units in spec.'],
  ['Parts', 'An in-house depot of reefer, genset, chassis and structural parts.'],
  ['Technical Support', 'Factory-trained people who know Carrier, Thermo King, Daikin, Star Cool and Taylor.'],
  ['Global Shipping', 'Equipment and parts moved to where the operation needs them.'],
];

export function Services() {
  return (
    <InnerLayout>
      <PageHero
        eyebrow="Services"
        title={['Keeping your', 'operation moving.']}
        lead="RAVA backs every container, unit and genset with 24/7/365 support, trained technicians, an in-house parts inventory and rapid repair and maintenance."
        image="/industries/pharma-after.jpg"
        imageAlt="RAVA service technicians"
      />

      <section className="inner-section">
        <SectionHeading eyebrow="What RAVA covers">Support that shows up.</SectionHeading>
        <ol className="service-list">
          {SERVICES.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 80} className="service-list__item">
              <span className="service-list__num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <QuoteCTA title={['Talk to', 'RAVA service.']} label="Request a Quote" />
    </InnerLayout>
  );
}
