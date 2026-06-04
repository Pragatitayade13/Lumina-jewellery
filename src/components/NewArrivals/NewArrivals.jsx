import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, ShoppingBag, Heart, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCMS } from '../../context/CMSContext';
import { products as staticProducts } from '../../data/products';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../ProductCard/ProductCard';
import './NewArrivals.css';



export default function NewArrivals() {
  const { products: fbProducts } = useProducts();
  const { landingPageData } = useCMS();
  const navigate = useNavigate();
  
  const na = landingPageData?.newArrivals || {
    sectionLabel: 'Just Arrived',
    title: 'New Arrivals',
    subtitle: 'Discover our latest jewellery pieces fresh from our master craftsmen\'s studios.',
    items: []
  };

  const hasCustomItems = na.items && na.items.length > 0;
  
  const displayProducts = fbProducts.length > 0 ? fbProducts : staticProducts;
  const filteredNew = displayProducts.filter(p => p.isNew === true || p.isNew === 'true' || (p.badge && p.badge.toLowerCase() === 'new'));
  const newProducts = hasCustomItems ? na.items : [...filteredNew].reverse().concat(displayProducts).slice(0, 8);

  return (
    <section className="new-arrivals-section" id="new-arrivals">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">{na.sectionLabel}</span>
          <h2 className="section-title">{na.title}</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            {na.subtitle}
          </p>
        </div>

        <div className="products-grid">
          {newProducts.map((product, i) => (
            <div key={product.id} style={{ opacity: 0, animation: `fadeInUp 0.6s ease forwards ${i * 0.1}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="section-actions reveal">
          <button
            className="btn btn-outline"
            id="view-all-new-arrivals-btn"
            onClick={() => {
              navigate('/collections');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            View All New Arrivals <ArrowRight size={16} />
          </button>
        </div>
      </div>


    </section>
  );
}
