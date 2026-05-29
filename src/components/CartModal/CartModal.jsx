import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, ShoppingBag, Plus, Minus, Tag, MapPin, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import './CartModal.css';

export default function CartModal({ isOpen, onClose }) {
  const { cart, removeFromCart, updateQuantity, clearCart, user, setIsAuthOpen } = useApp();
  const { createOrder } = useOrders();
  
  const [step, setStep] = useState(0); // 0: Cart, 1: Address, 2: Payment, 3: Success
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [lastOrderId, setLastOrderId] = useState(null);

  const [shippingDetails, setShippingDetails] = useState({
    name: '', email: '', phone: '', address: '', city: 'Mumbai'
  });
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  useEffect(() => {
    if (isOpen && user) {
      setShippingDetails(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
    if (!isOpen) {
      // Reset after closing
      setTimeout(() => {
        setStep(0);
        setLastOrderId(null);
      }, 300);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = subtotal > 50000 ? 0 : (subtotal > 0 ? 500 : 0);
  const total = subtotal + deliveryFee - discount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'LUMINA10') {
      setDiscount(subtotal * 0.10);
    } else {
      alert("Invalid Promo Code");
      setDiscount(0);
    }
  };

  const proceedToAddress = () => {
    if (!user) {
      alert("Please login to proceed to checkout.");
      onClose();
      setIsAuthOpen(true);
      return;
    }
    setStep(1);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      const orderData = {
        customerId: user.uid,
        customer: shippingDetails.name,
        email: shippingDetails.email,
        phone: shippingDetails.phone,
        city: shippingDetails.city,
        address: shippingDetails.address,
        product: cart.map(c => `${c.qty}x ${c.name}`).join(', '),
        items: cart,
        subtotal,
        deliveryFee,
        discount,
        amount: total,
        paymentMethod: paymentMethod,
        status: 'pending',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      
      const orderId = await createOrder(orderData);
      setLastOrderId(orderId);
      clearCart();
      setStep(3); // Success step
    } catch (err) {
      alert("Checkout Failed: " + err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="auth-modal-overlay" style={{ zIndex: 9999 }}>
      <div className="auth-modal" style={{ width: '500px', maxWidth: '100%', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {step > 0 && step < 3 && (
              <button onClick={() => setStep(step - 1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              {step === 0 && <><ShoppingBag size={20} /> Your Cart</>}
              {step === 1 && <><MapPin size={20} /> Shipping Details</>}
              {step === 2 && <><CreditCard size={20} /> Payment Method</>}
              {step === 3 && <><CheckCircle size={20} color="var(--status-green)" /> Order Placed</>}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* STEP 0: CART */}
        {step === 0 && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', background: 'var(--surface)', padding: '0.75rem', borderRadius: '8px' }}>
                    <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{item.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: '#fff', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                        <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: '#fff', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--gold)', marginTop: '0.5rem' }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--status-red)', cursor: 'pointer', padding: '0.5rem', alignSelf: 'flex-start' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Tag size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Promo Code (Try LUMINA10)" 
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px', fontSize: '0.9rem' }}
                    />
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={handleApplyPromo}>Apply</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--status-green)' }}>
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>Delivery Charges</span>
                  <span>{deliveryFee === 0 ? <span style={{color: 'var(--status-green)'}}>FREE</span> : `₹${deliveryFee}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--gold)' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
                
                <button className="btn btn-gold" style={{ width: '100%', padding: '1rem' }} onClick={proceedToAddress}>
                  Proceed to Checkout
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 1: ADDRESS */}
        {step === 1 && (
          <form onSubmit={handleAddressSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
                <input type="text" className="form-input" required value={shippingDetails.name} onChange={e => setShippingDetails({...shippingDetails, name: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
                <input type="email" className="form-input" required value={shippingDetails.email} onChange={e => setShippingDetails({...shippingDetails, email: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                <input type="tel" className="form-input" required value={shippingDetails.phone} onChange={e => setShippingDetails({...shippingDetails, phone: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Address</label>
                <textarea className="form-input" required value={shippingDetails.address} onChange={e => setShippingDetails({...shippingDetails, address: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px', resize: 'vertical', minHeight: '80px' }}></textarea>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>City</label>
                <input type="text" className="form-input" required value={shippingDetails.city} onChange={e => setShippingDetails({...shippingDetails, city: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
               <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '1rem' }}>Continue to Payment</button>
            </div>
          </form>
        )}

        {/* STEP 2: PAYMENT */}
        {step === 2 && (
          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
               <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Please select your preferred payment method.</p>
               
               {['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Digital Wallet', 'Cash on Delivery'].map(method => (
                 <label key={method} style={{ display: 'block', background: 'var(--surface)', border: `1px solid ${paymentMethod === method ? 'var(--gold)' : 'var(--border-color)'}`, padding: '1rem', borderRadius: '8px', marginBottom: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} style={{ accentColor: 'var(--gold)', transform: 'scale(1.2)' }} />
                   <span style={{ fontWeight: 500, color: paymentMethod === method ? 'var(--gold)' : '#fff' }}>{method}</span>
                 </label>
               ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.2rem' }}>
                <span>Amount to Pay</span>
                <span style={{ color: 'var(--gold)' }}>₹{total.toLocaleString('en-IN')}</span>
              </div>
               <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '1rem' }} disabled={isCheckingOut}>
                 {isCheckingOut ? 'Processing Payment...' : 'Confirm Order & Pay'}
               </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ background: 'rgba(46, 204, 113, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle size={40} color="var(--status-green)" />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>Order Placed Successfully!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Thank you for shopping with Lumina Jewels. Your order <strong style={{ color: 'var(--gold)' }}>{lastOrderId}</strong> has been confirmed.
            </p>
            <button className="btn btn-outline" style={{ width: '100%', padding: '1rem' }} onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
