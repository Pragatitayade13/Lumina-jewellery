// src/components/NewArrivals/NewArrivals.jsx
import { useState } from 'react';
import { ArrowRight, X, ShoppingBag, Heart, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { products as staticProducts } from '../../data/products';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../ProductCard/ProductCard';
import bgImage from '../../assets/new_arrivals_bg.png';
import './NewArrivals.css';



export default function NewArrivals() {
  const { products: fbProducts } = useProducts();
  
  const displayProducts = fbProducts.length > 0 ? fbProducts : staticProducts;
  const newProducts = displayProducts.filter(p => p.isNew).concat(displayProducts.slice(0, 8)).slice(0, 8);

  return (
    <section className="new-arrivals-section" id="new-arrivals">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">Just Arrived</span>
          <h2 className="section-title">New Arrivals</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            Discover our latest jewellery pieces fresh from our master craftsmen's studios.
          </p>
        </div>

        <div className="new-arrivals-slider-wrapper">
          <div className="new-arrivals-slider">
            {newProducts.map((product, i) => (
              <div key={product.id} className="new-arrivals-slide reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        <div className="section-actions reveal">
          <button
            className="btn btn-outline"
            id="view-all-new-arrivals-btn"
            onClick={() => {}}
          >
            View All New Arrivals <ArrowRight size={16} />
          </button>
        </div>
      </div>


    </section>
  );
}
