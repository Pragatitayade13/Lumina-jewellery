import { useState, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { categories, products } from '../../data/products';
import { useScrollLock } from '../../hooks/useScrollLock';
import catGold from '../../assets/category_gold_1779901256829.png';
import catSilver from '../../assets/category_silver_1779901416560.png';
import catDiamond from '../../assets/category_diamond_1779901278017.png';
import catRings from '../../assets/category_rings_1779901339180.png';
import catNecklaces from '../../assets/category_necklaces_1779901360570.png';
import catEarrings from '../../assets/category_earrings_1779901376432.png';
import catBangles from '../../assets/category_bangles_1779901402606.png';
import catBridal from '../../assets/category_bridal_1779901298512.png';
import catMens from '../../assets/products/mens_platinum_band_1780299606035.png';
import './FeaturedCategories.css';

const categoryImages = [catGold, catSilver, catDiamond, catRings, catNecklaces, catEarrings, catBangles, catBridal, catMens];
const categoryBgs = ['cat-gold','cat-silver','cat-diamond','cat-rings','cat-necklaces','cat-earrings','cat-bangles','cat-bridal', 'cat-mens'];

export default function FeaturedCategories() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  useScrollLock(!!selectedCategory);

  const categoryProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory.name || (selectedCategory.name.includes('Jewellery') && p.material.includes(selectedCategory.name.split(' ')[0])))
    : [];

  return (
    <section className="categories-section" id="categories">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">Shop by Category</span>
          <h2 className="section-title">Explore Our Collections</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            From timeless gold classics to sparkling diamonds — find the perfect piece for every occasion.
          </p>
        </div>

        <div className="categories-grid stagger-container clip-reveal-trigger">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className={`category-card ${categoryBgs[i]} stagger-item`}
              id={`category-card-${cat.id}`}
              role="button"
              tabIndex={0}
              aria-label={`Browse ${cat.name}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <img
                src={categoryImages[i]}
                alt={cat.name}
                className="category-img"
              />
              <div className="category-icon">{cat.icon}</div>
                <div className="category-overlay">
                  <div className="category-name">{cat.name}</div>
                  <div className="category-count">{cat.count}</div>
                  <div className="category-explore">
                    <span>Explore</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedCategory && (
          <div className="auth-modal-overlay" onClick={() => setSelectedCategory(null)} data-lenis-prevent="true" style={{ zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="auth-modal" onClick={e => e.stopPropagation()} data-lenis-prevent="true" style={{ width: '80%', maxWidth: '1000px', maxHeight: '80vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
              <button 
                onClick={() => setSelectedCategory(null)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                <X size={18} />
              </button>
              
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ color: 'var(--gold)', fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedCategory.icon}</div>
                <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>{selectedCategory.name}</h2>
                <p style={{ color: 'var(--text-muted)' }}>Explore our exclusive collection of {selectedCategory.name.toLowerCase()}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {categoryProducts.length > 0 ? (
                  categoryProducts.map(product => (
                    <div key={product.id} className="product-card">
                      <div className="product-image-wrap">
                        <img src={product.image} alt={product.name} className="product-img" />
                      </div>
                      <div className="product-info">
                        <h3 className="product-title" style={{ fontSize: '1rem' }}>{product.name}</h3>
                        <div className="product-price-wrap" style={{ marginTop: '0.5rem' }}>
                          <span className="price-current">₹{product.price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <p>New collections for {selectedCategory.name} are arriving soon!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }
