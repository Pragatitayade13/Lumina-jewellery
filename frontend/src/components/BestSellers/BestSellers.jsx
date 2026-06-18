// src/components/BestSellers/BestSellers.jsx
import { useState } from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { products } from '../../data/products';
import { useCMS } from '../../context/CMSContext';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../ProductCard/ProductCard';
import './BestSellers.css';

export default function BestSellers() {
  const { products: fbProducts } = useProducts();
  const { landingPageData } = useCMS();
  const bs = landingPageData?.bestSellers || {
    sectionLabel: 'Customer Favorites',
    title: 'Best Sellers',
    subtitle: 'Our most loved pieces — trusted by thousands of happy customers across India.',
    items: []
  };

  const displayProducts = fbProducts.length > 0 ? fbProducts : products;
  const automaticItems = displayProducts.filter(p => p.isBestSeller === true || p.isBestSeller === 'true' || (p.badge && p.badge.toLowerCase().includes('best')));
  const hasCustomItems = bs.items && bs.items.length > 0;
  const bestsellers = hasCustomItems ? [...bs.items, ...automaticItems].slice(0, 8) : automaticItems.slice(0, 8);

  return (
    <section className="bestsellers-section" id="best-sellers">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">
            <TrendingUp size={12} style={{ display: 'inline', marginRight: 6 }} />
            {bs.sectionLabel}
          </span>
          <h2 className="section-title">{bs.title}</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            {bs.subtitle}
          </p>
        </div>

        <div className="bestsellers-featured">
          <div className="products-grid stagger-container">
            {bestsellers.map((product, i) => (
              <div key={product.id} className="stagger-item">
                <ProductCard product={product} />
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
