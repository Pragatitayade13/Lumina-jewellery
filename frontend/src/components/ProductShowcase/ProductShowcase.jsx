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
import slide6 from '../../assets/showcase_slide_6.jpg';
import slide7 from '../../assets/showcase_slide_7.jpg';
import slide8 from '../../assets/showcase_slide_8.jpg';
import slide9 from '../../assets/showcase_slide_9.png';
import './ProductShowcase.css';

import { useCMS } from '../../context/CMSContext';

export default function ProductShowcase() {
  const [quickView, setQuickView] = useState(null);
  const [filter, setFilter] = useState('All');
  const { addToCart, toggleWishlist, isWishlisted } = useApp();
  const { products: fbProducts } = useProducts();
  const { landingPageData } = useCMS();
  
  const ps = landingPageData?.productShowcase || {
    sectionLabel: 'Luxury Gallery',
    title: 'Product Showcase',
    subtitle: 'Explore our finest handcrafted jewellery with exquisite detail.'
  };

  const products = fbProducts.length > 0 ? fbProducts : staticProducts;

  const categories = ['All', 'Necklaces', 'Rings', 'Earrings', 'Bangles'];
  const filtered = filter === 'All' ? products : products.filter(p => p.category === filter);

  const validImages = (ps.images || []).filter(img => img && img.trim() !== '');
  const defaultImages = [slide1, slide2, slide3, slide4, slide5, slide6, slide7, slide8, slide9];
  const combinedImages = validImages.length > 0 ? [...defaultImages, ...validImages] : defaultImages;
  const showcaseImages = [...combinedImages, ...combinedImages];

  return (
    <section className="showcase-section" id="product-showcase">
      <div className="showcase-glow" />
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">{ps.sectionLabel}</span>
          <h2 className="section-title">{ps.title}</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">{ps.subtitle}</p>
        </div>
      </div>

      {/* Sliding Image Gallery */}
      <div className="showcase-slider-container reveal">
        <div className="showcase-slider-track">
          {showcaseImages.map((img, i) => (
            <div key={i} className="showcase-slide-item">
              <img 
                src={img} 
                alt={`Showcase Gallery ${i}`} 
                loading="lazy"
                onError={(e) => {
                  // Hide broken images (like local localhost URLs deployed to Vercel)
                  e.target.closest('.showcase-slide-item').style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
