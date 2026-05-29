// src/components/BestSellers/BestSellers.jsx
import { useState } from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { products } from '../../data/products';
import ProductCard from '../ProductCard/ProductCard';
import './BestSellers.css';

export default function BestSellers() {
  const [quickView, setQuickView] = useState(null);
  const bestsellers = products.filter(p => p.isBestSeller);

  return (
    <section className="bestsellers-section" id="best-sellers">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">
            <TrendingUp size={12} style={{ display: 'inline', marginRight: 6 }} />
            Customer Favorites
          </span>
          <h2 className="section-title">Best Sellers</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            Our most loved pieces — trusted by thousands of happy customers across India.
          </p>
        </div>

        <div className="bestsellers-featured">
          <div className="products-grid stagger-container">
            {bestsellers.map((product, i) => (
              <div key={product.id} className="stagger-item">
                <ProductCard product={product} onQuickView={setQuickView} />
              </div>
            ))}
          </div>
        </div>

        <div className="section-actions reveal">
          <button className="btn btn-outline" id="view-all-bestsellers-btn">
            See All Best Sellers <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
