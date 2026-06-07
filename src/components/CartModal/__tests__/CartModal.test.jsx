import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CartModal from '../CartModal';
import { AppProvider } from '../../context/AppContext';

// Mock context to inject state
vi.mock('../../context/AppContext', async () => {
  const actual = await vi.importActual('../../context/AppContext');
  return {
    ...actual,
    useApp: () => ({
      cart: [{ id: '1', name: 'Ring', price: 50000, quantity: 1, image: '' }],
      removeFromCart: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      user: { uid: 'user1', email: 'test@example.com' },
      showToast: vi.fn()
    })
  };
});

// Mock hooks
vi.mock('../../hooks/useOrders', () => ({
  useOrders: () => ({
    createOrder: vi.fn().mockResolvedValue('ORD-123')
  })
}));

// Mock fetch for payment API
global.fetch = vi.fn().mockImplementation((url) => {
  if (url === '/api/payment/create-order') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 'razorpay_order_id_123', amount: 5000000 })
    });
  }
  if (url === '/api/payment/verify') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
});

// Mock Razorpay
global.Razorpay = class Razorpay {
  constructor(options) {
    this.options = options;
  }
  open() {
    // Simulate immediate successful payment callback
    this.options.handler({
      razorpay_payment_id: 'pay_123',
      razorpay_order_id: 'order_123',
      razorpay_signature: 'sig_123'
    });
  }
};

describe('CartModal (Payments Flow)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders cart items correctly', () => {
    render(<CartModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Ring')).toBeInTheDocument();
    expect(screen.getByText(/50,000/)).toBeInTheDocument();
  });

  it('initiates Razorpay checkout flow when clicking Proceed to Checkout', async () => {
    render(<CartModal isOpen={true} onClose={vi.fn()} />);
    
    const checkoutBtn = screen.getByText('Proceed to Checkout');
    fireEvent.click(checkoutBtn);

    // Verify /api/payment/create-order is called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/payment/create-order', expect.any(Object));
    });

    // The test simulates Razorpay.open() success which triggers /api/payment/verify
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/payment/verify', expect.any(Object));
    });
  });
});
