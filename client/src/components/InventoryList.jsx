import React from 'react';
import InventoryItem from './InventoryItem';

const InventoryList = ({ 
  items, 
  filters, 
  onFilterChange, 
  onEditItem, 
  onDeleteItem 
}) => {

  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (e) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  const handleMaterialChange = (e) => {
    onFilterChange({ ...filters, material: e.target.value });
  };

  const handleStockChange = (e) => {
    onFilterChange({ ...filters, stockStatus: e.target.value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: '',
      material: '',
      stockStatus: ''
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.material || filters.stockStatus;

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{
        padding: '1.2rem',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center'
      }}>
        {/* Search Input */}
        <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, SKU or design code..."
            value={filters.search}
            onChange={handleSearchChange}
            style={{ width: '100%' }}
          />
        </div>

        {/* Category Filter */}
        <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <select
            className="form-control"
            value={filters.category}
            onChange={handleCategoryChange}
            style={{ cursor: 'pointer' }}
          >
            <option value="">All Categories</option>
            <option value="Ring">Rings</option>
            <option value="Necklace">Necklaces</option>
            <option value="Earrings">Earrings</option>
            <option value="Bracelet">Bracelets</option>
            <option value="Pendant">Pendants</option>
            <option value="Chain">Chains</option>
            <option value="Other">Others</option>
          </select>
        </div>

        {/* Material Filter */}
        <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <select
            className="form-control"
            value={filters.material}
            onChange={handleMaterialChange}
            style={{ cursor: 'pointer' }}
          >
            <option value="">All Materials</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Platinum">Platinum</option>
            <option value="Rose Gold">Rose Gold</option>
            <option value="Diamond-Set">Diamond-Set</option>
          </select>
        </div>

        {/* Stock Status Filter */}
        <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <select
            className="form-control"
            value={filters.stockStatus}
            onChange={handleStockChange}
            style={{ cursor: 'pointer' }}
          >
            <option value="">All Stock Status</option>
            <option value="in">In Stock (Normal)</option>
            <option value="low">Low Stock (1-5)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button 
            className="btn btn-outline" 
            onClick={clearFilters}
            style={{ padding: '0.7rem 1.2rem', height: 'fit-content' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Grid List */}
      {items.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <h3 className="brand-title" style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-gold)' }}>
            No Treasures Found
          </h3>
          <p style={{ fontSize: '0.9rem' }}>
            Adjust your filters or add a new piece to your inventory catalog.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {items.map((item) => (
            <InventoryItem
              key={item.id}
              item={item}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryList;
