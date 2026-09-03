import { Link } from 'react-router-dom';
import { InnerLayout } from './InnerLayout';
import { PageHero } from '@/components/PageHero';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';
import { categories } from '@/data/catalog';

export function ProductsIndex() {
  return (
    <InnerLayout>
      <PageHero
        eyebrow="Products"
        title={['Everything that', 'keeps it cold.']}
        lead="Refrigerated and dry containers, gensets, chassis, reefer and truck units, power packs, parts and remote monitoring — for sale or rent, new or used."
        image={categories[0].image}
        imageAlt="RAVA refrigerated container"
        actions={
          <Link to="/quote" className="btn" data-cursor="cta">
            <span>Request a Quote</span>
          </Link>
        }
      />

      <section className="inner-section">
        <SectionHeading eyebrow="Categories">Nine ways RAVA shows up on site.</SectionHeading>
        <div className="cat-grid">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 3) * 80}>
              <Link to={`/products/${c.slug}`} className="cat-card">
                <div className="cat-card__img" style={{ backgroundImage: `url(${c.image})` }} />
                <div className="cat-card__body">
                  <span className="cat-card__index">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{c.label}</h3>
                  <span className="link-arrow">
                    Explore
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </InnerLayout>
  );
}
