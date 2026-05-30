// src/components/NewArrivals/NewArrivals.jsx
import { useState, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { products as staticProducts } from '../../data/products';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../ProductCard/ProductCard';
import './NewArrivals.css';



export default function NewArrivals() {
  const { products: fbProducts } = useProducts();
  const scrollContainerRef = useRef(null);
  
  const displayProducts = fbProducts.length > 0 ? fbProducts : staticProducts;
  const newProducts = displayProducts.filter(p => p.isNew).concat(displayProducts).slice(0, 8);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.clientWidth * 0.8;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

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
          <button className="slider-btn prev" onClick={() => scroll('left')} aria-label="Previous">
            <ChevronLeft size={24} />
          </button>
          
          <div className="products-slider" ref={scrollContainerRef}>
            {newProducts.map((product, i) => (
              <div key={`${product.id}-${i}`} className="slider-item reveal" style={{ transitionDelay: `${(i % 4) * 0.1}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <button className="slider-btn next" onClick={() => scroll('right')} aria-label="Next">
            <ChevronRight size={24} />
          </button>
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
