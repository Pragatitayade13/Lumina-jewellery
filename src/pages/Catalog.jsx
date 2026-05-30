import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ShoppingCart, Heart } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard/ProductCard';
import './Catalog.css';

export default function Catalog() {
  const { inventory, loading } = useInventory();
  const { addToCart, toggleWishlist, isWishlisted } = useApp();
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [subcategory, setSubcategory] = useState('All');
  const [sort, setSort] = useState('featured');

  // Derive unique categories and subcategories from inventory
  const { categories, subcategories } = useMemo(() => {
    const cats = new Set();
    const subcats = new Set();
    
    inventory.forEach(item => {
      if (item.category) cats.add(item.category);
      if (item.subcategory && (category === 'All' || item.category === category)) {
        subcats.add(item.subcategory);
      }
    });
    
    return {
      categories: ['All', ...Array.from(cats)],
      subcategories: ['All', ...Array.from(subcats)]
    };
  }, [inventory, category]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setSubcategory('All');
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...inventory];

    if (search) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) || 
        item.sku.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== 'All') {
      result = result.filter(item => item.category === category);
    }

    if (subcategory !== 'All') {
      result = result.filter(item => item.subcategory === subcategory);
    }

    if (sort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === 'popularity') {
      result.sort((a, b) => b.stock - a.stock); // Mock popularity
    }

    return result;
  }, [inventory, search, category, sort]);

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

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div className="catalog-header-content">
          <h1>Fine Jewellery Collections</h1>
          <p>Discover our exclusive range of handcrafted masterpieces, designed to illuminate your every moment.</p>
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
              <button className="btn btn-outline" onClick={() => { setSearch(''); setCategory('All'); }}>Clear Filters</button>
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
