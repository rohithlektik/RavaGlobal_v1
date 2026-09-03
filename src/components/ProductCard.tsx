import { Link } from 'react-router-dom';
import type { Product } from '@/data/catalog';
import { Reveal } from './Reveal';

interface Props {
  product: Product;
  categorySlug: string;
  index?: number;
}

/** Large editorial product card — image left, copy + actions right. */
export function ProductCard({ product, categorySlug, index = 0 }: Props) {
  const to = `/products/${categorySlug}/${product.slug}`;
  return (
    <Reveal as="article" delay={index * 90} className="product-card">
      <Link to={to} className="product-card__media" aria-label={product.name.join(' ')}>
        <div
          className="product-card__img"
          style={{ backgroundImage: `url(${product.image})` }}
        />
      </Link>
      <div className="product-card__body">
        <span className="product-card__index">{String(index + 1).padStart(2, '0')}</span>
        <h3 className="product-card__name">
          {product.name.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </h3>
        <p className="product-card__desc">{product.short}</p>
        <p className="product-card__spec">
          <span>{product.keySpec.label}</span>
          {product.keySpec.value}
        </p>
        <div className="product-card__actions">
          <Link to={to} className="link-arrow" data-cursor="hover">
            View Product
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </Link>
          <Link to="/quote" className="link-arrow link-arrow--muted" data-cursor="hover">
            Request Quote
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
