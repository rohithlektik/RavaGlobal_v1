import { Link } from 'react-router-dom';
import { InnerLayout } from './InnerLayout';
import { PageHero } from '@/components/PageHero';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';
import { company } from '@/data/company';

const LOCATIONS = [
  ['Miami Office', company.hq.address],
  ['Medley Depot', 'Container depot & distribution — Medley, FL'],
];

export function Contact() {
  return (
    <InnerLayout>
      <PageHero
        eyebrow="Contact"
        title={["Let's talk", 'containers.']}
        lead="Tell RAVA about the operation — a specialist will help you spec the right equipment, rental term and service plan."
        image="/industries/energy-after.jpg"
        imageAlt="RAVA container yard"
        actions={
          <a href={company.phoneHref} className="btn" data-cursor="cta">
            <span>{company.phone}</span>
          </a>
        }
      />

      <section className="inner-section inner-split">
        <div className="inner-split__text">
          <SectionHeading eyebrow="Locations">Where RAVA operates.</SectionHeading>
          <div className="contact-cards">
            {LOCATIONS.map(([t, d]) => (
              <Reveal as="div" key={t} className="contact-card">
                <h3>{t}</h3>
                <p>{d}</p>
              </Reveal>
            ))}
            <Reveal as="div" className="contact-card">
              <h3>Phone & Email</h3>
              <p>
                <a href={company.phoneHref}>{company.phone}</a>
                <br />
                {company.support}
              </p>
            </Reveal>
          </div>
        </div>
        <div className="inner-split__media contact-map" aria-hidden="true">
          <div className="contact-map__grid" />
          <span className="contact-map__pin" />
        </div>
      </section>

      <section className="inner-section inner-section--tint">
        <SectionHeading eyebrow="Careers">Join the team keeping equipment running.</SectionHeading>
        <p className="prose">
          RAVA is always interested in technicians, drivers and logistics people.
        </p>
        <Link to="/company#careers" className="link-arrow" data-cursor="hover">
          See openings
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </Link>
      </section>
    </InnerLayout>
  );
}
