import React, { useState, useEffect } from 'react';

const ItemFormModal = ({ isOpen, onClose, onSubmit, item }) => {
  const initialFormState = {
    name: '',
    sku: '',
    category: 'Ring',
    material: 'Gold',
    purity: '22K',
    weight: '',
    price: '',
    stock: '',
    imageUrl: '',
    description: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        category: item.category || 'Ring',
        material: item.material || 'Gold',
        purity: item.purity || '',
        weight: item.weight || '',
        price: item.price || '',
        stock: item.stock || '',
        imageUrl: item.imageUrl || '',
        description: item.description || ''
      });
    } else {
      setFormData(initialFormState);
    }
    setError('');
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!formData.name.trim() || !formData.sku.trim() || !formData.purity.trim()) {
      setError('Please fill in Name, SKU, and Purity.');
      return;
    }

    const weightNum = parseFloat(formData.weight);
    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stock, 10);

    if (isNaN(weightNum) || weightNum < 0) {
      setError('Weight must be a positive number.');
      return;
    }

    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a positive number.');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      setError('Stock must be a positive integer.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        weight: weightNum,
        price: priceNum,
        stock: stockNum
      });
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while saving the item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="btn-icon-only modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2 className="modal-header">
          {item ? 'Modify Masterpiece Record' : 'Catalogue New Acquisition'}
        </h2>

        {error && (
          <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">Design Title / Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              placeholder="e.g. Imperial Diamond Solitaire Ring"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* SKU & Purity */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="sku">SKU / Design Code *</label>
              <input
                type="text"
                id="sku"
                name="sku"
                className="form-control"
                placeholder="e.g. JW-R-092"
                value={formData.sku}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="purity">Purity (e.g., 22K, 18K, Sterling) *</label>
              <input
                type="text"
                id="purity"
                name="purity"
                className="form-control"
                placeholder="e.g. 22K or 18K"
                value={formData.purity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Category & Material */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Ring">Ring</option>
                <option value="Necklace">Necklace</option>
                <option value="Earrings">Earrings</option>
                <option value="Bracelet">Bracelet</option>
                <option value="Pendant">Pendant</option>
                <option value="Chain">Chain</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="material">Material</label>
              <select
                id="material"
                name="material"
                className="form-control"
                value={formData.material}
                onChange={handleChange}
              >
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Platinum">Platinum</option>
                <option value="Rose Gold">Rose Gold</option>
                <option value="Diamond-Set">Diamond-Set</option>
              </select>
            </div>
          </div>

          {/* Weight, Price, Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }} className="form-row-3">
            <div className="form-group">
              <label htmlFor="weight">Weight (g) *</label>
              <input
                type="number"
                step="0.01"
                id="weight"
                name="weight"
                className="form-control"
                placeholder="0.00"
                value={formData.weight}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Retail Price ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                className="form-control"
                placeholder="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="stock">Vault Stock *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                className="form-control"
                placeholder="0"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label htmlFor="imageUrl">Image URL (Optional)</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              className="form-control"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows="3"
              placeholder="Enter metal certification, gemstone cut, clarity details, size..."
              value={formData.description}
              onChange={handleChange}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gold" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Records...' : item ? 'Save Changes' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemFormModal;
