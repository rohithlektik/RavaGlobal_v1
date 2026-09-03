import { Link } from 'react-router-dom';
import { InnerLayout } from './InnerLayout';
import { PageHero } from '@/components/PageHero';
import { SectionHeading } from '@/components/SectionHeading';
import { QuoteCTA } from '@/components/QuoteCTA';
import { Reveal } from '@/components/Reveal';

const TYPES = [
  ['Refrigerated Containers', 'On-site cold storage for spikes, seasons and emergency response.', 'refrigerated'],
  ['Dry Containers', 'Secure, ground-level storage on flexible terms.', 'dry'],
  ['Chassis & Support', 'Transport and supporting equipment to keep units moving.', 'support'],
];

const BENEFITS = [
  'Short-term or long-term rental',
  '24/7 maintenance',
  'Onsite delivery',
  'Flexible storage',
  'Reliable equipment',
  'Technical support',
];

const STEPS = [
  ['Tell us what you need', 'Size, temperature, timeline and location — a two-minute conversation.'],
  ['Choose the right equipment', 'RAVA matches a unit and power option to the operation.'],
  ['Delivery & setup', 'Delivered onsite and set running by RAVA technicians.'],
  ['24/7 support', 'Monitoring, maintenance and parts for the length of the lease.'],
];

export function Rentals() {
  return (
    <InnerLayout>
      <PageHero
        eyebrow="Rentals — Florida"
        title={['Rent the', 'capacity you need.']}
        lead="Refrigerated and dry containers delivered ready to run, on terms that flex with the operation — backed by RAVA's 24/7 service."
        image="/industries/food-after.jpg"
        imageAlt="RAVA refrigerated rental container"
        actions={
          <Link to="/quote" className="btn" data-cursor="cta">
            <span>Request a Rental Quote</span>
          </Link>
        }
      />

      <section className="inner-section" id="refrigerated">
        <SectionHeading eyebrow="Rental types">What you can put on site this week.</SectionHeading>
        <div className="rental-types">
          {TYPES.map(([t, d], i) => (
            <Reveal as="div" key={t} delay={i * 90} className="rental-types__item">
              <h3>{t}</h3>
              <p>{d}</p>
              <Link to="/quote" className="link-arrow" data-cursor="hover">
                Request this
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="inner-section inner-section--tint" id="faq">
        <SectionHeading eyebrow="Rental benefits">Why operations rent from RAVA.</SectionHeading>
        <ul className="tag-list tag-list--lg">
          {BENEFITS.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      <section className="inner-section" id="process">
        <SectionHeading eyebrow="Rental process">Four steps to running equipment.</SectionHeading>
        <ol className="process">
          {STEPS.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 90} className="process__step">
              <span className="process__num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <QuoteCTA title={['Rent the', 'right unit.']} label="Request a Rental Quote" />
    </InnerLayout>
  );
}
