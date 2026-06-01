import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useInventory } from '../hooks/useInventory';
import ProductCard from '../components/ProductCard/ProductCard';
import './MensJewellery.css';
import { Gem, ArrowRight } from 'lucide-react';
import m1 from '../assets/products/mens_platinum_band_1780299606035.png';
import m2 from '../assets/products/mens_gold_chain_1780299628514.png';
import m3 from '../assets/products/mens_cufflinks_1780299644045.png';
import m4 from '../assets/products/mens_gold_kada_1780299659696.png';
import m5 from '../assets/products/mens_om_pendant_1780299676039.png';

export default function MensJewellery() {
  const { inventory, loading } = useInventory();
  const navigate = useNavigate();

  // Filter Men's products
  const mensProducts = useMemo(() => {
    return inventory.filter(item => item.category === 'Men\'s Jewellery' || item.category === "Men's Jewellery");
  }, [inventory]);

  const featured = mensProducts.slice(0, 4);
  const trending = mensProducts.slice(4, 8);

  const styles = [
    { name: 'Chains', image: m2 },
    { name: 'Rings', image: m1 },
    { name: 'Kada', image: m4 },
    { name: 'Cufflinks', image: m3 },
    { name: 'Religious Jewellery', image: m5 }
  ];

  const handleStyleClick = (style) => {
    navigate(`/collections?category=Men's Jewellery&subcategory=${style}`);
  };

  return (
    <div className="mens-page">
      {/* Hero Section */}
      <section className="mens-hero">
        <div className="mens-hero-overlay"></div>
        <div className="mens-hero-content">
          <span className="mens-badge">The Men's Collection</span>
          <h1>Define Your Legacy</h1>
          <p>Discover crafted elegance with our exclusive range of men's rings, chains, kadas, and accessories.</p>
          <button className="btn btn-primary" onClick={() => navigate('/collections?category=Men\'s Jewellery')}>
            Explore Collection
          </button>
        </div>
      </section>

      {/* Shop by Style */}
      <section className="mens-section">
        <div className="section-header center">
          <h2>Shop by Style</h2>
          <div className="title-accent"><Gem size={14} /></div>
        </div>
        <div className="mens-style-grid">
          {styles.map(style => (
            <div key={style.name} className="mens-style-card" onClick={() => handleStyleClick(style.name)}>
              <div className="style-image-wrap">
                <img src={style.image} alt={style.name} className="style-image" loading="lazy" />
              </div>
              <h3>{style.name}</h3>
              <span className="style-link">View Collection <ArrowRight size={14} /></span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mens-section bg-light">
        <div className="section-header">
          <h2>Featured for Him</h2>
          <div className="title-accent"><Gem size={14} /></div>
        </div>
        
        {loading ? (
          <div className="loading-state">Loading collections...</div>
        ) : (
          <div className="product-grid">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="mens-promo">
        <div className="mens-promo-content">
          <h2>The Platinum Wedding Band Collection</h2>
          <p>Unmatched durability and timeless style for your special day.</p>
          <button className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }} onClick={() => navigate('/collections?category=Men\'s Jewellery&subcategory=Wedding Bands')}>
            Shop Wedding Bands
          </button>
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="mens-section">
          <div className="section-header">
            <h2>Trending Now</h2>
            <div className="title-accent"><Gem size={14} /></div>
          </div>
          <div className="product-grid">
            {trending.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
