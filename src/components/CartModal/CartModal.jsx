import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import './CartModal.css';

export default function CartModal({ isOpen, onClose }) {
  const { cart, removeFromCart, user, setIsAuthOpen } = useApp();
  const { createOrder } = useOrders();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckout = async () => {
    if (!user) {
      alert("Please login to place an order.");
      onClose();
      setIsAuthOpen(true);
      return;
    }

    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      const orderData = {
        customerId: user.uid,
        customer: user.name || 'Customer',
        city: 'Mumbai', // Defaulting for demo
        product: cart.map(c => `${c.qty}x ${c.name}`).join(', '),
        items: cart,
        amount: total,
        paymentMethod: 'Credit Card',
        status: 'pending',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      
      const orderId = await createOrder(orderData);
      
      alert(`Order Placed Successfully! Order ID: ${orderId}`);
      // In a full app, we would clear the cart here: clearCart()
      onClose();
    } catch (err) {
      alert("Checkout Failed: " + err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="auth-modal-overlay" style={{ zIndex: 9999 }}>
      <div className="auth-modal" style={{ width: '400px', maxWidth: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} /> Your Cart
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '60vh', marginBottom: '1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', background: 'var(--surface)', padding: '0.75rem', borderRadius: '8px' }}>
                <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.qty}</div>
                  <div style={{ fontWeight: 700, color: 'var(--gold)', marginTop: '0.25rem' }}>₹{item.price.toLocaleString('en-IN')}</div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--status-red)', cursor: 'pointer', padding: '0.5rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.1rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--gold)' }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <button 
              className="btn btn-gold" 
              style={{ width: '100%', padding: '1rem' }}
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? 'Processing...' : 'Secure Checkout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
