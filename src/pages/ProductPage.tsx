import { useParams, Navigate, Link } from 'react-router-dom';
import { InnerLayout } from './InnerLayout';
import { PageHero } from '@/components/PageHero';
import { SectionHeading } from '@/components/SectionHeading';
import { ProductCard } from '@/components/ProductCard';
import { QuoteCTA } from '@/components/QuoteCTA';
import { Reveal } from '@/components/Reveal';
import { ImageReveal } from '@/components/ImageReveal';
import { findProduct } from '@/data/catalog';

const BENEFITS = [
  ['Thermal Performance', 'Holds set point through heat, power swings and constant door traffic.'],
  ['Durable Construction', 'Marine-grade steel built for repeated relocation and hard sites.'],
  ['Flexible Deployment', 'Ground-level, no dock required — rent or buy, new or used.'],
  ['24/7 Support', 'In-house technicians and an in-house parts depot behind every unit.'],
];

export function ProductPage() {
  const { categorySlug = '', productSlug = '' } = useParams();
  const match = findProduct(categorySlug, productSlug);
  if (!match || !match.cat) return <Navigate to="/products" replace />;
  const { cat, product } = match;
  const related = cat.products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <InnerLayout>
      <PageHero
        eyebrow={`${cat.label}`}
        title={product.name}
        lead={product.short}
        image={product.image}
        imageAlt={product.name.join(' ')}
        meta={[
          { label: 'Condition', value: 'New / Used' },
          { label: 'Availability', value: 'Buy / Rent' },
          { label: product.keySpec.label, value: product.keySpec.value },
        ]}
        actions={
          <>
            <Link to="/quote" className="btn" data-cursor="cta">
              <span>Request a Quote</span>
            </Link>
            <Link to="/contact" className="btn btn--ghost" data-cursor="cta">
              <span>Contact RAVA</span>
            </Link>
          </>
        }
      />

      <section className="inner-section inner-split inner-split--reverse">
        <div className="inner-split__text">
          <SectionHeading eyebrow="Product story">
            {cat.name.join(' ')} that earn their place on site.
          </SectionHeading>
          <p className="prose">{cat.intro}</p>
          <p className="prose">
            RAVA supplies, delivers and services every unit — so the {product.name.join(' ')} keeps
            running long after it lands.
          </p>
        </div>
        <div className="inner-split__media">
          <ImageReveal src={product.gallery[1] ?? product.image} parallax={30} />
        </div>
      </section>

      <section className="inner-section inner-section--tint">
        <SectionHeading eyebrow="Key benefits">What you actually get.</SectionHeading>
        <div className="benefits">
          {BENEFITS.map(([t, d], i) => (
            <Reveal as="div" key={t} delay={i * 80} className="benefits__item">
              <span className="benefits__num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="inner-section">
        <SectionHeading eyebrow="Technical specifications">The numbers.</SectionHeading>
        <dl className="spec-table">
          {product.specs.map((s) => (
            <Reveal as="div" key={s.label} className="spec-table__row">
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </Reveal>
          ))}
        </dl>
      </section>

      <section className="inner-section">
        <SectionHeading eyebrow="Gallery">See it in the field.</SectionHeading>
        <div className="gallery">
          {product.gallery.map((src, i) => (
            <ImageReveal key={src + i} src={src} parallax={i % 2 ? 24 : -18} />
          ))}
        </div>
      </section>

      <section className="inner-section inner-section--tint">
        <SectionHeading eyebrow="Related">More from {cat.label}.</SectionHeading>
        <div className="product-list">
          {related.map((p, i) => (
            <ProductCard key={p.slug} product={p} categorySlug={cat.slug} index={i} />
          ))}
        </div>
      </section>

      <QuoteCTA title={['Ready when', 'you are.']} label="Request a Quote" />
    </InnerLayout>
  );
}
