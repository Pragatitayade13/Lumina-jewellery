import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProducts } from '../useProducts';

// Mock dependencies
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'new-product-id' }),
  deleteDoc: vi.fn().mockResolvedValue(),
  doc: vi.fn(),
  updateDoc: vi.fn().mockResolvedValue(),
  query: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({
    empty: false,
    docs: [
      { id: '1', data: () => ({ name: 'Gold Ring', price: 50000, sku: 'R01' }) },
      { id: '2', data: () => ({ name: 'Diamond Necklace', price: 150000, sku: 'N01' }) }
    ]
  })
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn().mockReturnValue({ currentUser: { uid: 'test-user' } })
}));

vi.mock('../../config/firebase', () => ({
  db: {}
}));

vi.mock('../../services/logger', () => ({
  logAudit: vi.fn()
}));

describe('useProducts Hook (Inventory Flow)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch products on mount', async () => {
    const { result } = renderHook(() => useProducts());
    
    // Initial state
    expect(result.current.loading).toBe(true);
    
    // Wait for fetch to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.products).toHaveLength(2);
    expect(result.current.products[0].name).toBe('Gold Ring');
  });

  it('should add a product and log audit', async () => {
    const { result } = renderHook(() => useProducts());
    
    let newId;
    await act(async () => {
      newId = await result.current.addProduct({ name: 'Silver Bracelet', price: 15000 });
    });

    expect(newId).toBe('new-product-id');
    const { logAudit } = await import('../../services/logger');
    expect(logAudit).toHaveBeenCalledWith('ADD_PRODUCT', 'new-product-id', expect.any(Object), expect.any(Object));
  });

  it('should remove a product and log audit', async () => {
    const { result } = renderHook(() => useProducts());
    
    await act(async () => {
      await result.current.removeProduct('1');
    });

    const { logAudit } = await import('../../services/logger');
    expect(logAudit).toHaveBeenCalledWith('REMOVE_PRODUCT', '1', expect.any(Object), expect.any(Object));
  });

  it('should update a product and log audit', async () => {
    const { result } = renderHook(() => useProducts());
    
    await act(async () => {
      await result.current.updateProduct('1', { price: 55000 });
    });

    const { logAudit } = await import('../../services/logger');
    expect(logAudit).toHaveBeenCalledWith('UPDATE_PRODUCT', '1', { keysUpdated: ['price'] }, expect.any(Object));
  });
});
