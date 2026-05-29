// src/components/ProductShowcase/ProductShowcase.jsx
import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { products as staticProducts } from '../../data/products';
import ProductCard from '../ProductCard/ProductCard';
import { useApp } from '../../context/AppContext';
import { X, ShoppingBag, Heart, Star } from 'lucide-react';
import slide1 from '../../assets/showcase_slide_1.jpg';
import slide2 from '../../assets/showcase_slide_2.jpg';
import slide3 from '../../assets/showcase_slide_3.png';
import slide4 from '../../assets/showcase_slide_4.jpg';
import slide5 from '../../assets/showcase_slide_5.jpg';
import './ProductShowcase.css';

export default function ProductShowcase() {
  const [quickView, setQuickView] = useState(null);
  const [filter, setFilter] = useState('All');
  const { addToCart, toggleWishlist, isWishlisted } = useApp();
  const { products: fbProducts } = useProducts();
  
  const products = fbProducts.length > 0 ? fbProducts : staticProducts;

  const categories = ['All', 'Necklaces', 'Rings', 'Earrings', 'Bangles'];
  const filtered = filter === 'All' ? products : products.filter(p => p.category === filter);

  return (
    <section className="showcase-section" id="product-showcase">
      <div className="showcase-glow" />
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">Luxury Gallery</span>
          <h2 className="section-title">Product Showcase</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">Explore our finest handcrafted jewellery with exquisite detail.</p>
        </div>

        {/* Sliding Image Gallery */}
        <div className="showcase-slider-container reveal">
          <div className="showcase-slider-track">
            {[slide1, slide2, slide3, slide4, slide5, slide1, slide2, slide3, slide4, slide5].map((img, i) => (
              <div key={i} className="showcase-slide-item">
                <img src={img} alt={`Showcase Gallery ${i}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="showcase-filters reveal">
          {categories.map(cat => (
            <button
              key={cat}
              className={`showcase-filter-btn${filter === cat ? ' active' : ''}`}
              onClick={() => setFilter(cat)}
              id={`filter-${cat.toLowerCase()}-btn`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="products-grid reveal">
          {filtered.map((product, i) => (
            <div key={product.id} style={{ transitionDelay: `${i * 0.1}s` }} className="reveal">
              <ProductCard product={product} onQuickView={setQuickView} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
