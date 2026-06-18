import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
// Static import removed to avoid hoisting/resolution conflicts with firebase mocks


vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  addDoc: vi.fn().mockResolvedValue({ id: 'new-id' }),
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
    docs: []
  })
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn().mockReturnValue({ currentUser: { uid: 'test-user', getIdToken: vi.fn().mockResolvedValue('mock-token') } })
}));

vi.mock('../../../config/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user', getIdToken: vi.fn().mockResolvedValue('mock-token') } }
}));

const mockCart = [{ id: '1', name: 'Ring', price: 50000, qty: 1, quantity: 1, image: '' }];
const mockUser = { uid: 'user1', email: 'test@example.com', getIdToken: vi.fn().mockResolvedValue('mock-token') };
const mockStores = [{ id: 'eoNjBBBlw1edDfPWufPD', name: 'Lumina Jewels (HQ)', code: 'HQ-01' }];

// Mock context to inject state
vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({
    cart: mockCart,
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    user: mockUser,
    showToast: vi.fn(),
    setIsAuthOpen: vi.fn(),
    customerSelectedStore: 'eoNjBBBlw1edDfPWufPD',
    allPublicStores: mockStores,
    setIsCustomerStorePromptOpen: vi.fn()
  })
}));

vi.mock('../../../hooks/useScrollLock', () => ({
  useScrollLock: vi.fn()
}));

vi.mock('../CartModal.css', () => ({}));

global.alert = vi.fn();

vi.mock('lucide-react', () => {
  const dummyIcon = () => null;
  return {
    X: dummyIcon,
    Trash2: dummyIcon,
    ShoppingBag: dummyIcon,
    Plus: dummyIcon,
    Minus: dummyIcon,
    Tag: dummyIcon,
    MapPin: dummyIcon,
    CreditCard: dummyIcon,
    CheckCircle: dummyIcon,
    ArrowLeft: dummyIcon,
    ArrowRight: dummyIcon,
    Truck: dummyIcon
  };
});

// Intercept document.body.appendChild to mock Razorpay script loader and prevent network requests in JSDOM
const originalAppendChild = document.body.appendChild;
document.body.appendChild = function (element) {
  if (element && element.tagName && element.tagName.toLowerCase() === 'script') {
    setTimeout(() => {
      if (element.onload) element.onload();
    }, 0);
    return element;
  }
  return originalAppendChild.call(document.body, element);
};

// Mock hooks
vi.mock('../../../hooks/useOrders', () => ({
  useOrders: () => ({
    createOrder: vi.fn().mockResolvedValue('ORD-123')
  })
}));

vi.mock('../../../hooks/useTaxes', () => ({
  useTaxes: () => ({
    calculateTax: (basePrice) => ({
      total: basePrice * 0.03,
      cgst: (basePrice * 0.03) / 2,
      sgst: (basePrice * 0.03) / 2,
      igst: 0
    })
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
      json: () => Promise.resolve({ success: true, orderId: 'ORD-123' })
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
  on() {}
};

describe('CartModal (Payments Flow)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders cart items correctly', async () => {
    const { default: CartModal } = await import('../CartModal');
    render(
      <MemoryRouter>
        <CartModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText('Ring')).toBeInTheDocument();
    expect(screen.getAllByText(/50,000/).length).toBeGreaterThan(0);
  });

  it('initiates Razorpay checkout flow when clicking through checkout steps', async () => {
    const { default: CartModal } = await import('../CartModal');
    render(
      <MemoryRouter>
        <CartModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );
    
    // Step 0: Cart summary -> Click Proceed to Checkout
    const checkoutBtn = screen.getByText('Proceed to Checkout');
    fireEvent.click(checkoutBtn);

    // Step 1: Address Details -> Fill form and submit
    await waitFor(() => {
      expect(screen.getByText('Shipping Details')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByPlaceholderText('e.g. Ram Kumar'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('+91 9876543210'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. ram12@gmail.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Flat No., Building Name, Street...'), { target: { value: '123 Test Street' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Mumbai'), { target: { value: 'Mumbai' } });
    
    const addressSubmitBtn = screen.getByText('Continue to Payment');
    fireEvent.click(addressSubmitBtn);

    // Step 2: Payment Method -> Submit
    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });
    
    const payBtn = screen.getByText('Confirm Order & Pay');
    fireEvent.click(payBtn);

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
