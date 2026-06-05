import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ShoppingCart, Heart } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard/ProductCard';
import './Catalog.css';

export default function Catalog() {
  const { inventory, loading } = useInventory();
  const { addToCart, toggleWishlist, isWishlisted } = useApp();
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || 'All';
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [subcategory, setSubcategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedMetals, setSelectedMetals] = useState([]);
  const [selectedGemstones, setSelectedGemstones] = useState([]);

  // Derive unique categories, subcategories, metals, and gemstones from inventory
  const { categories, subcategories, metals, gemstones } = useMemo(() => {
    const cats = new Set();
    const subcats = new Set();
    const mets = new Set();
    const gems = new Set();
    
    const knownGemstones = ['Diamond', 'Polki', 'Kundan', 'Pearl', 'Ruby', 'Emerald', 'Sapphire'];
    
    inventory.forEach(item => {
      if (item.category) cats.add(item.category);
      if (item.subcategory && (category === 'All' || item.category === category)) {
        subcats.add(item.subcategory);
      }
      
      if (item.purity) {
        const metal = item.purity.split('+')[0].trim();
        if (metal) mets.add(metal);
      }
      
      const textToScan = `${item.name} ${item.category} ${item.subcategory}`.toLowerCase();
      knownGemstones.forEach(gem => {
        if (textToScan.includes(gem.toLowerCase())) {
          gems.add(gem);
        }
      });
    });
    
    return {
      categories: ['All', ...Array.from(cats)],
      subcategories: ['All', ...Array.from(subcats)],
      metals: Array.from(mets),
      gemstones: Array.from(gems)
    };
  }, [inventory, category]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setSubcategory('All');
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cat = searchParams.get('category');
    if (cat) {
      setCategory(cat);
      setSubcategory('All');
    }
  }, [location.search]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...inventory];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(item => 
        (item.name && item.name.toLowerCase().includes(s)) || 
        (item.sku && item.sku.toLowerCase().includes(s)) ||
        (item.category && item.category.toLowerCase().includes(s)) ||
        (item.subcategory && item.subcategory.toLowerCase().includes(s)) ||
        (item.purity && item.purity.toLowerCase().includes(s)) ||
        (item.price && item.price.toString().includes(s))
      );
    }

    if (category !== 'All') {
      result = result.filter(item => item.category === category);
    }

    if (subcategory !== 'All') {
      result = result.filter(item => item.subcategory === subcategory);
    }

    result = result.filter(item => item.price >= priceRange[0] && item.price <= priceRange[1]);
    
    if (selectedMetals.length > 0) {
      result = result.filter(item => {
        if (!item.purity) return false;
        const metal = item.purity.split('+')[0].trim();
        return selectedMetals.includes(metal);
      });
    }
    
    if (selectedGemstones.length > 0) {
      result = result.filter(item => {
        const textToScan = `${item.name} ${item.category} ${item.subcategory}`.toLowerCase();
        return selectedGemstones.some(gem => textToScan.includes(gem.toLowerCase()));
      });
    }

    if (sort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === 'popularity') {
      result.sort((a, b) => b.stock - a.stock); // Mock popularity
    }

    return result;
  }, [inventory, search, category, subcategory, sort, priceRange, selectedMetals, selectedGemstones]);

  const handleAddToCart = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(item);
  };

  const handleAddToWishlist = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(item);
  };

  const getCategoryHeader = () => {
    switch (category) {
      case "Men's Jewellery":
      case "Mens Jewellery":
        return {
          title: "Men's Jewellery Collection",
          desc: "Define your legacy with our exclusive range of men's rings, chains, kadas, and accessories.",
          image: "https://images.unsplash.com/photo-1614949430268-c131498b98eb?auto=format&fit=crop&q=80"
        };
      case "Bridal":
        return {
          title: "Bridal Collections",
          desc: "Exquisite bridal sets crafted for your special day.",
          image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80"
        };
      case "Diamond Jewellery":
        return {
          title: "Diamond Jewellery",
          desc: "Brilliant diamonds crafted to perfection.",
          image: "https://images.unsplash.com/photo-1599643478524-fb66f7090098?auto=format&fit=crop&q=80"
        };
      default:
        return {
          title: "Fine Jewellery Collections",
          desc: "Discover our exclusive range of handcrafted masterpieces, designed to illuminate your every moment.",
          image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80"
        };
    }
  };
  
  const headerInfo = getCategoryHeader();

  return (
    <div className="catalog-page">
      <div 
        className="catalog-header"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('${headerInfo.image}')` }}
      >
        <div className="catalog-header-content">
          <h1>{headerInfo.title}</h1>
          <p>{headerInfo.desc}</p>
        </div>
      </div>

      <div className="catalog-container">
        <aside className="catalog-sidebar">
          <div className="filter-section">
            <h3 className="filter-title"><Filter size={18} /> Filters</h3>
            
            <div className="filter-group">
              <label>Search Collection</label>
              <div className="search-box">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Categories</label>
              <div className="category-list">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    className={`cat-btn ${category === cat ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {category !== 'All' && subcategories.length > 1 && (
              <div className="filter-group" style={{ marginTop: '2rem' }}>
                <label>Subcategories</label>
                <div className="category-list">
                  {subcategories.map(sub => (
                    <button 
                      key={sub} 
                      className={`cat-btn ${subcategory === sub ? 'active' : ''}`}
                      onClick={() => setSubcategory(sub)}
                      style={{ fontSize: '0.9rem', padding: '0.4rem 0.5rem' }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="filter-group" style={{ marginTop: '2rem' }}>
              <label>Price Range</label>
              <div className="price-inputs" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input 
                  type="number" 
                  value={priceRange[0]} 
                  onChange={e => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                  style={{ width: '100%', padding: '0.5rem', background: '#1a1a1a', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px' }}
                  placeholder="Min"
                />
                <span style={{ display: 'flex', alignItems: 'center' }}>-</span>
                <input 
                  type="number" 
                  value={priceRange[1]} 
                  onChange={e => setPriceRange([priceRange[0], Number(e.target.value) || 0])}
                  style={{ width: '100%', padding: '0.5rem', background: '#1a1a1a', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px' }}
                  placeholder="Max"
                />
              </div>
            </div>

            {metals.length > 0 && (
              <div className="filter-group" style={{ marginTop: '2rem' }}>
                <label>Metal Type</label>
                <div className="checkbox-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.8rem' }}>
                  {metals.map(metal => (
                    <label key={metal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedMetals.includes(metal)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedMetals([...selectedMetals, metal]);
                          else setSelectedMetals(selectedMetals.filter(m => m !== metal));
                        }}
                      />
                      {metal}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {gemstones.length > 0 && (
              <div className="filter-group" style={{ marginTop: '2rem' }}>
                <label>Gemstone</label>
                <div className="checkbox-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.8rem' }}>
                  {gemstones.map(gem => (
                    <label key={gem} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedGemstones.includes(gem)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedGemstones([...selectedGemstones, gem]);
                          else setSelectedGemstones(selectedGemstones.filter(g => g !== gem));
                        }}
                      />
                      {gem}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="catalog-main">
          <div className="catalog-toolbar">
            <div className="results-count">
              Showing {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'Product' : 'Products'}
            </div>
            <div className="sort-box">
              <SlidersHorizontal size={16} style={{ color: 'var(--text-muted)' }} />
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="featured">Featured / Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading collections...</div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button className="btn btn-outline" onClick={() => { setSearch(''); setCategory('All'); setPriceRange([0, 500000]); setSelectedMetals([]); setSelectedGemstones([]); }}>Clear Filters</button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredAndSortedProducts.map(product => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
