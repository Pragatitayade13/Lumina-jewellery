import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProducts } from '../useProducts';

// Mock dependencies
const mockLogAudit = vi.fn();
vi.mock('../useAudit', () => ({
  useAudit: () => ({
    logAudit: mockLogAudit
  })
}));

vi.mock('../../context/AppContext', () => ({
  useApp: () => ({
    user: { uid: 'test-user', role: 'admin' }
  })
}));

vi.mock('firebase/firestore', () => {
  const mockDoc = { id: 'new-product-id' };
  return {
    collection: vi.fn(() => ({})),
    addDoc: vi.fn().mockResolvedValue(mockDoc),
    deleteDoc: vi.fn().mockResolvedValue(),
    doc: vi.fn(() => ({ id: '1' })),
    updateDoc: vi.fn().mockResolvedValue(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    query: vi.fn(),
    limit: vi.fn(),
    startAfter: vi.fn(),
    orderBy: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(() => vi.fn()),
    getDocs: vi.fn().mockResolvedValue({
      empty: false,
      docs: [
        { id: '1', data: () => ({ name: 'Gold Ring', price: 50000, sku: 'R01' }) },
        { id: '2', data: () => ({ name: 'Diamond Necklace', price: 150000, sku: 'N01' }) }
      ]
    })
  };
});

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
    const { result } = renderHook(() => useProducts('eoNjBBBlw1edDfPWufPD'));
    
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
    const { result } = renderHook(() => useProducts('eoNjBBBlw1edDfPWufPD'));
    
    let newId;
    await act(async () => {
      newId = await result.current.addProduct({ name: 'Silver Bracelet', price: 15000 });
    });

    expect(newId).toBe('new-product-id');
    expect(mockLogAudit).toHaveBeenCalledWith('PRODUCT_CREATED', 'Products', 'new-product-id', null, { name: 'Silver Bracelet' });
  });

  it('should remove a product and log audit', async () => {
    const { result } = renderHook(() => useProducts('eoNjBBBlw1edDfPWufPD'));
    
    await act(async () => {
      await result.current.removeProduct('1');
    });

    expect(mockLogAudit).toHaveBeenCalledWith('PRODUCT_DELETED', 'Products', '1');
  });

  it('should update a product and log audit', async () => {
    const { result } = renderHook(() => useProducts('eoNjBBBlw1edDfPWufPD'));
    
    await act(async () => {
      await result.current.updateProduct('1', { price: 55000 });
    });

    expect(mockLogAudit).toHaveBeenCalledWith('PRODUCT_UPDATED', 'Products', '1', null, { price: 55000 });
  });
});
