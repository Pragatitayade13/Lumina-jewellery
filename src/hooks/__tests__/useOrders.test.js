import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOrders } from '../useOrders';

// Mock dependencies
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'new-order-id' }),
  doc: vi.fn(),
  updateDoc: vi.fn().mockResolvedValue(),
  serverTimestamp: vi.fn(),
  query: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({
    empty: false,
    docs: [
      { id: '1', data: () => ({ id: 'ORD-001', amount: 50000, status: 'pending' }) }
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

vi.mock('../useLogistics', () => ({
  useLogistics: vi.fn().mockReturnValue({
    shipments: [],
    createShipment: vi.fn().mockResolvedValue(),
    updateStatus: vi.fn().mockResolvedValue()
  })
}));

describe('useOrders Hook (Orders Flow)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch orders on mount', async () => {
    const { result } = renderHook(() => useOrders());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.orders).toHaveLength(1);
    expect(result.current.orders[0].id).toBe('ORD-001');
  });

  it('should create an order and log audit', async () => {
    const { result } = renderHook(() => useOrders());
    
    let newId;
    await act(async () => {
      newId = await result.current.createOrder({ amount: 15000, items: [] });
    });

    expect(newId).toBe('new-order-id');
    const { logAudit } = await import('../../services/logger');
    expect(logAudit).toHaveBeenCalledWith('CREATE_ORDER', 'new-order-id', expect.any(Object), expect.any(Object));
  });

  it('should update order status and log audit', async () => {
    const { result } = renderHook(() => useOrders());
    
    await act(async () => {
      // Simulate fetch
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.updateOrderStatus('ORD-001', 'shipped');
    });

    const { logAudit } = await import('../../services/logger');
    expect(logAudit).toHaveBeenCalledWith('UPDATE_ORDER_STATUS', '1', expect.any(Object), expect.any(Object));
  });

  it('should assign order partner and log audit', async () => {
    const { result } = renderHook(() => useOrders());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.assignOrderToPartner('ORD-001', 'DEL-123', 'FastDelivery');
    });

    const { logAudit } = await import('../../services/logger');
    expect(logAudit).toHaveBeenCalledWith('ASSIGN_ORDER_PARTNER', '1', expect.any(Object), expect.any(Object));
  });
});
