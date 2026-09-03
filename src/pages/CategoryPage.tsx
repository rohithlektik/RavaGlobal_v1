import { useParams, Navigate, Link } from 'react-router-dom';
import { InnerLayout } from './InnerLayout';
import { PageHero } from '@/components/PageHero';
import { SectionHeading } from '@/components/SectionHeading';
import { ProductCard } from '@/components/ProductCard';
import { QuoteCTA } from '@/components/QuoteCTA';
import { Reveal } from '@/components/Reveal';
import { ImageReveal } from '@/components/ImageReveal';
import { categoryBySlug } from '@/data/catalog';

const WHY = [
  ['24/7 Service', 'Technicians on call every hour of every day, 365 days a year.'],
  ['Onsite Delivery', 'Units arrive where the operation is and are set running.'],
  ['Large Inventory', 'Refrigerated and dry equipment in depth, new and used.'],
  ['In-House Technicians', 'Factory-trained people, not a subcontracted call-out.'],
  ['In-House Parts Depot', 'Reefer, genset and structural parts on the shelf.'],
  ['Short / Long Term', 'Rent for a week, a season or years — or buy outright.'],
];

const INDUSTRIES = [
  'Food & Beverage',
  'Healthcare',
  'Pharmaceutical',
  'Retail',
  'Government',
  'Emergency Response',
];

export function CategoryPage() {
  const { categorySlug = '' } = useParams();
  const category = categoryBySlug(categorySlug);
  if (!category) return <Navigate to="/products" replace />;

  return (
    <InnerLayout>
      <PageHero
        eyebrow={`${category.eyebrow} — ${category.label}`}
        title={category.name}
        lead={category.intro}
        image={category.image}
        imageAlt={category.label}
        actions={
          <>
            <a href="#products" className="btn" data-cursor="cta">
              <span>Explore Products</span>
            </a>
            <Link to="/quote" className="btn btn--ghost" data-cursor="cta">
              <span>Request a Quote</span>
            </Link>
          </>
        }
      />

      <section className="inner-section" id="products">
        <SectionHeading eyebrow="Featured">
          Three ways to deploy {category.label.toLowerCase()}.
        </SectionHeading>
        <div className="product-list">
          {category.products.slice(0, 3).map((p, i) => (
            <ProductCard key={p.slug} product={p} categorySlug={category.slug} index={i} />
          ))}
        </div>
      </section>

      <section className="inner-section inner-section--tint">
        <SectionHeading eyebrow="Why RAVA">The difference is the support behind it.</SectionHeading>
        <div className="why-grid">
          {WHY.map(([t, d], i) => (
            <Reveal as="div" key={t} delay={i * 70} className="why-grid__item">
              <span className="why-grid__num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="inner-section inner-split">
        <div className="inner-split__media">
          <ImageReveal src={category.products[0].gallery[1] ?? category.image} parallax={30} />
        </div>
        <div className="inner-split__text">
          <SectionHeading eyebrow="Where it works">Built for demanding operations.</SectionHeading>
          <ul className="tag-list">
            {INDUSTRIES.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </section>

      <QuoteCTA title={['Need the right', 'container?']} />
    </InnerLayout>
  );
}
