import { InnerLayout } from './InnerLayout';
import { PageHero } from '@/components/PageHero';
import { SectionHeading } from '@/components/SectionHeading';
import { QuoteCTA } from '@/components/QuoteCTA';
import { Reveal } from '@/components/Reveal';
import { ImageReveal } from '@/components/ImageReveal';
import { company } from '@/data/company';

const EXPERTISE = ['Containers', 'Refrigeration', 'Logistics', 'Service', 'Parts', 'Rental'];
const INDUSTRIES = [
  'Healthcare',
  'Food',
  'Pharmaceutical',
  'Retail',
  'Government',
  'Emergency response',
];

export function Company() {
  return (
    <InnerLayout>
      <PageHero
        eyebrow="Company"
        title={['Built around', 'what matters.']}
        lead="RAVA Group Container Services supplies, rents and services the refrigerated and dry container infrastructure that stores and moves critical product — headquartered in Miami with a container depot in Medley."
        image="/industries/energy-after.jpg"
        imageAlt="RAVA container operation"
      />

      <section className="inner-section inner-split">
        <div className="inner-split__text">
          <SectionHeading eyebrow="Our approach">Equipment is only the start.</SectionHeading>
          <p className="prose">
            RAVA keeps refrigeration, gensets, chassis and parts in depth, delivers onsite, and
            stands behind every unit with in-house, factory-trained technicians — every hour of every
            day.
          </p>
        </div>
        <div className="inner-split__media">
          <ImageReveal src="/industries/pharma-after.jpg" parallax={30} />
        </div>
      </section>

      <section className="inner-section inner-section--tint">
        <SectionHeading eyebrow="Our expertise">Six things RAVA does end to end.</SectionHeading>
        <ul className="tag-list tag-list--lg">
          {EXPERTISE.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>

      <section className="inner-section">
        <SectionHeading eyebrow="Industries we serve">
          Trusted where temperature is not optional.
        </SectionHeading>
        <div className="why-grid">
          {INDUSTRIES.map((x, i) => (
            <Reveal as="div" key={x} delay={i * 60} className="why-grid__item">
              <span className="why-grid__num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{x}</h3>
            </Reveal>
          ))}
        </div>
        <Reveal as="p" className="prose prose--muted">
          Trusted by {company.trustedBy.slice(0, 6).join(', ')} and more.
        </Reveal>
      </section>

      <QuoteCTA title={["Let's solve your", 'storage challenge.']} label="Request a Quote" />
    </InnerLayout>
  );
}
