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
  const { customerSelectedStore, allPublicStores, setIsCustomerStorePromptOpen } = useApp();
  const { inventory, loading } = useInventory(customerSelectedStore);
  const navigate = useNavigate();

  // Auto-open store selector if user lands on Men's Jewellery with no store chosen
  useEffect(() => {
    if (!customerSelectedStore && allPublicStores.length > 1) {
      setIsCustomerStorePromptOpen(true);
    }
  }, [customerSelectedStore, allPublicStores.length]);

  const [selectedType, setSelectedType] = useState('All');

  // Filter Men's products
  const mensProducts = useMemo(() => {
    return inventory.filter(item => item.category === 'Men\'s Jewellery' || item.category === "Men's Jewellery");
  }, [inventory]);

  const filteredProducts = useMemo(() => {
    if (selectedType === 'All') return mensProducts;
    return mensProducts.filter(item => item.subcategory === selectedType);
  }, [mensProducts, selectedType]);

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

      {/* Products Grid */}
      <section className="mens-section bg-light" id="collection-grid">
        <div className="section-header">
          <h2>Our Collection</h2>
          <div className="title-accent"><Gem size={14} /></div>
        </div>
        
        <div className="mens-filter-tabs" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${selectedType === 'All' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedType('All')}
          >
            All
          </button>
          {styles.map(style => (
            <button 
              key={style.name}
              className={`btn ${selectedType === style.name ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedType(style.name)}
            >
              {style.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">Loading collections...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">No products found for this category.</div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
