import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useScrollLock } from '../../hooks/useScrollLock';
import { X, Trash2, ShoppingBag, Plus, Minus, Tag, MapPin, CreditCard, CheckCircle, ArrowLeft, ArrowRight, Truck } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useTaxes } from '../../hooks/useTaxes';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { validateCouponLocally } from '../../utils/couponValidation';
import './CartModal.css';

export default function CartModal({ isOpen, onClose }) {
  useScrollLock(isOpen);
  const { cart, removeFromCart, updateQuantity, clearCart, user, setIsAuthOpen, customerSelectedStore, allPublicStores, setIsCustomerStorePromptOpen } = useApp();
  const { createOrder } = useOrders(customerSelectedStore);
  const navigate = useNavigate();
  
  // Resolve store data for UI display and payload
  const activeStoreObj = customerSelectedStore
    ? allPublicStores.find(s => s.id === customerSelectedStore)
    : null;
  const activeStoreName = activeStoreObj?.name || null;
  
  const [step, setStep] = useState(0); // 0: Cart, 1: Address, 2: Payment, 3: Success
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [lastOrderId, setLastOrderId] = useState(null);
  const { calculateTax } = useTaxes();

  useEffect(() => {
    const fetchActiveCoupons = async () => {
      try {
        const q = query(collection(db, 'coupons'), where('status', '==', 'active'));
        const snapshot = await getDocs(q);
        const now = new Date();
        const valid = snapshot.docs.map(d => ({id: d.id, ...d.data()})).filter(c => {
          if (c.startDate && new Date(c.startDate) > now) return false;
          if (c.expiryDate && new Date(c.expiryDate) < now) return false;
          return true;
        });
        setAvailableCoupons(valid);
      } catch (e) {
        console.error("Failed to fetch coupons", e);
      }
    };
    if (isOpen) fetchActiveCoupons();
  }, [isOpen]);

  const [shippingDetails, setShippingDetails] = useState({
    name: '', email: '', phone: '', address: '', city: 'Mumbai', state: 'Maharashtra'
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

  let subtotal = 0;
  let totalGstAmt = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  cart.forEach(item => {
    const basePrice = item.price * item.qty;
    subtotal += basePrice;
    if (calculateTax) {
      const tax = calculateTax(basePrice, item.category || 'gold', shippingDetails.state);
      totalGstAmt += tax.total;
      cgst += tax.cgst || 0;
      sgst += tax.sgst || 0;
      igst += tax.igst || 0;
    }
  });

  const deliveryFee = subtotal > 50000 ? 0 : (subtotal > 0 ? 500 : 0);
  const total = subtotal + totalGstAmt + deliveryFee - discount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsApplyingCoupon(true);
    
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', promoCode.toUpperCase().trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        alert("Invalid Coupon Code");
        setDiscount(0);
        setAppliedCoupon(null);
        return;
      }
      
      const couponDoc = querySnapshot.docs[0].data();
      couponDoc.id = querySnapshot.docs[0].id;
      
      const validation = validateCouponLocally(couponDoc, user?.uid, cart, subtotal, customerSelectedStore);
      
      if (validation.isValid) {
        setAppliedCoupon(couponDoc);
        setDiscount(validation.discountAmount);
        alert(validation.message);
      } else {
        alert(validation.message);
        setDiscount(0);
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Error verifying coupon:", error);
      alert("Failed to verify coupon. Please try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setPromoCode('');
    setDiscount(0);
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      let finalStoreId = customerSelectedStore || 'eoNjBBBlw1edDfPWufPD';

      const orderData = {
        customerId: user.uid,
        customer: shippingDetails.name,
        email: shippingDetails.email,
        phone: shippingDetails.phone,
        city: shippingDetails.city,
        state: shippingDetails.state,
        address: shippingDetails.address,
        product: cart.map(c => `${c.qty}x ${c.name}`).join(', '),
        items: cart,
        subtotal,
        gstAmt: totalGstAmt,
        cgst,
        sgst,
        igst,
        deliveryFee,
        discount,
        couponApplied: !!appliedCoupon,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        couponId: appliedCoupon ? appliedCoupon.id : null,
        amount: total,
        paymentMethod: paymentMethod,
        status: 'pending',
        storeName: activeStoreName || 'Lumina Jewels (HQ)',
        storeId: finalStoreId,
        storeCode: activeStoreObj?.code || 'HQ-01',
        storeAddress: activeStoreObj?.address || '',
        storeContact: activeStoreObj?.contact || activeStoreObj?.phone || '',
        storeGst: activeStoreObj?.gst || activeStoreObj?.gstin || '',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      
      if (paymentMethod === 'Cash on Delivery') {
        const orderId = await createOrder(orderData);
        setLastOrderId(orderId);
        clearCart();
        setStep(3); // Success step
        setIsCheckingOut(false);
        return;
      }

      // Online Payment Flow (Razorpay)
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsCheckingOut(false);
        return;
      }

      const { getAuth } = await import('firebase/auth');
      const firebaseAuth = getAuth();
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) {
        alert("Session expired. Please log in again.");
        setIsCheckingOut(false);
        return;
      }
      // Frontend-only Razorpay Integration (Bypassing Backend to avoid Authentication Failed errors)
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_T5NQJlht6v4kTz",
        amount: Math.round(total * 100),
        currency: "INR",
        name: "Lumina Jewels",
        description: "Secure Checkout",
        image: "/vite.svg", 
        handler: async function (response) {
          try {
            // Save the order to Firebase directly from the frontend
            const finalOrderData = {
              ...orderData,
              razorpayPaymentId: response.razorpay_payment_id,
              paymentStatus: 'paid',
              paymentMethod: 'razorpay'
            };
            
            const savedOrderId = await createOrder(finalOrderData);
            
            setLastOrderId(savedOrderId || response.razorpay_payment_id);
            clearCart();
            setStep(3);
          } catch (err) {
            alert("Error saving order: " + err.message);
          }
        },
        prefill: {
          name: shippingDetails.name,
          email: shippingDetails.email,
          contact: shippingDetails.phone
        },
        theme: {
          color: "#c9a84c"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
        setIsCheckingOut(false);
      });
      rzp1.open();

    } catch (err) {
      alert("Checkout Failed: " + err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="auth-modal-overlay" style={{ zIndex: 9999 }} data-lenis-prevent="true">
      <div className="auth-modal cart-modal-box" style={{ width: '800px', maxWidth: '100%', display: 'flex', flexDirection: 'column', height: '750px', maxHeight: '90vh' }} data-lenis-prevent="true">
        
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
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.5rem' }}>
              {/* Store Context Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                background: activeStoreName ? 'rgba(201,168,76,0.08)' : 'rgba(255,165,0,0.06)',
                border: `1px solid ${activeStoreName ? 'rgba(201,168,76,0.25)' : 'rgba(255,165,0,0.25)'}`,
                fontSize: '0.82rem',
                color: 'var(--text-secondary)'
              }}>
                {activeStoreName ? (
                  <>
                    <span style={{ color: 'var(--gold)' }}>✦</span>
                    <span>Shipping from <strong style={{ color: 'var(--text-primary)' }}>{activeStoreName}</strong></span>
                    <button onClick={() => setIsCustomerStorePromptOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.78rem', padding: '0 0 0 0.5rem', fontWeight: 600, textDecoration: 'underline' }}>Change</button>
                  </>
                ) : (
                  <>
                    <span style={{ color: 'orange' }}>⚠</span>
                    <span>No store selected — order will be processed centrally.</span>
                    <button onClick={() => setIsCustomerStorePromptOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.78rem', padding: '0 0 0 0.5rem', fontWeight: 600, textDecoration: 'underline' }}>Select Store</button>
                  </>
                )}
              </div>

              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                  <ShoppingBag size={56} style={{ opacity: 0.15, marginBottom: '1.5rem' }} />
                  <p style={{ fontSize: '1.1rem' }}>Your cart is empty.</p>
                  <button className="btn btn-gold" style={{ marginTop: '1.5rem' }} onClick={() => { onClose(); navigate('/collections'); }}>Continue Shopping</button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item-card">
                    <div className="cart-item-image-wrapper">
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=200'} 
                        alt={item.name} 
                        className="cart-item-image" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=200';
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '1.15rem', marginBottom: '0.4rem', color: '#fff' }}>{item.name}</div>
                      <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '1.3rem' }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                      
                      <div className="cart-qty-selector">
                        <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                        <span className="cart-qty-val">{item.qty}</span>
                        <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                      </div>
                    </div>
                    <button 
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-summary">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Tag size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Enter Coupon Code" 
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      disabled={!!appliedCoupon}
                      style={{ width: '100%', padding: '0.55rem 0.8rem 0.55rem 2.2rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.88rem', opacity: appliedCoupon ? 0.5 : 1 }}
                    />
                  </div>
                  {!appliedCoupon ? (
                    <button className="btn btn-outline" style={{ padding: '0 1.25rem', fontSize: '0.88rem' }} onClick={handleApplyPromo} disabled={isApplyingCoupon}>
                      {isApplyingCoupon ? '...' : 'Apply'}
                    </button>
                  ) : (
                    <button className="btn btn-outline" style={{ padding: '0 1.25rem', fontSize: '0.88rem', borderColor: 'var(--status-red)', color: 'var(--status-red)' }} onClick={removeCoupon}>
                      Remove
                    </button>
                  )}
                </div>

                {/* Available Coupons Section */}
                {!appliedCoupon && availableCoupons.length > 0 && (
                  <div style={{ marginTop: '0.75rem', marginBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Available Coupons</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto' }}>
                      {availableCoupons.map(coupon => {
                        const isApplicable = subtotal >= (coupon.minOrderAmount || 0);
                        return (
                          <div key={coupon.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px', border: '1px dashed var(--gold)', opacity: isApplicable ? 1 : 0.6 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--gold)' }}>{coupon.code}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                {coupon.minOrderAmount > 0 ? ` (Min ₹${coupon.minOrderAmount})` : ''}
                              </span>
                            </div>
                            <button 
                              onClick={() => {
                                setPromoCode(coupon.code);
                                setTimeout(() => handleApplyPromo(), 50);
                              }}
                              disabled={!isApplicable || isApplyingCoupon}
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: isApplicable ? 'var(--gold)' : 'rgba(255,255,255,0.1)', color: isApplicable ? '#000' : 'var(--text-muted)', border: 'none', borderRadius: '4px', cursor: isApplicable ? 'pointer' : 'not-allowed' }}
                            >
                              Apply
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span>
                  <span style={{ color: '#fff' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {igst > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span>IGST</span>
                    <span style={{ color: '#fff' }}>₹{igst.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {cgst > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span>CGST</span>
                    <span style={{ color: '#fff' }}>₹{cgst.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {sgst > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span>SGST</span>
                    <span style={{ color: '#fff' }}>₹{sgst.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.82rem', color: 'var(--status-green)' }}>
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span>Delivery Charges</span>
                  <span>{deliveryFee === 0 ? <span style={{color: 'var(--status-green)'}}>FREE</span> : `₹${deliveryFee}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontWeight: 600, fontSize: '1.2rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--gold)' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
                
                <button className="btn btn-gold cart-btn-checkout" onClick={proceedToAddress}>
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 1: ADDRESS */}
        {step === 1 && (
          <form onSubmit={handleAddressSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
              
              <div className="checkout-grid-2-col">
                <div className="checkout-form-group">
                  <label className="checkout-label">Full Name</label>
                  <input type="text" className="checkout-input" placeholder="e.g. Ram Kumar" required value={shippingDetails.name} onChange={e => setShippingDetails({...shippingDetails, name: e.target.value})} />
                </div>
                <div className="checkout-form-group">
                  <label className="checkout-label">Phone Number</label>
                  <input type="tel" className="checkout-input" placeholder="+91 9876543210" required value={shippingDetails.phone} onChange={e => setShippingDetails({...shippingDetails, phone: e.target.value})} />
                </div>
              </div>

              <div className="checkout-form-group">
                <label className="checkout-label">Email Address</label>
                <input type="email" className="checkout-input" placeholder="e.g. ram12@gmail.com" required value={shippingDetails.email} onChange={e => setShippingDetails({...shippingDetails, email: e.target.value})} />
              </div>
              
              <div className="checkout-form-group">
                <label className="checkout-label">Full Address</label>
                <textarea className="checkout-input checkout-textarea" placeholder="Flat No., Building Name, Street..." required value={shippingDetails.address} onChange={e => setShippingDetails({...shippingDetails, address: e.target.value})}></textarea>
              </div>
              
              <div className="checkout-grid-2-col">
                <div className="checkout-form-group">
                  <label className="checkout-label">City</label>
                  <input type="text" className="checkout-input" placeholder="e.g. Mumbai" required value={shippingDetails.city} onChange={e => setShippingDetails({...shippingDetails, city: e.target.value})} />
                </div>
                <div className="checkout-form-group">
                  <label className="checkout-label">State</label>
                  <select className="checkout-input" required value={shippingDetails.state} onChange={e => setShippingDetails({...shippingDetails, state: e.target.value})} style={{ background: '#222' }}>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Rajasthan">Rajasthan</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
               <button type="submit" className="btn btn-gold cart-btn-checkout" style={{ marginTop: 0 }}>
                 Continue to Payment <ArrowRight size={18} />
               </button>
            </div>
          </form>
        )}

        {/* STEP 2: PAYMENT */}
        {step === 2 && (
          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
               <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Please select your preferred payment method for a secure transaction.</p>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                 {['Credit/Debit Card', 'UPI', 'Net Banking', 'Cash on Delivery'].map(method => (
                   <label key={method} className={`payment-method-label ${paymentMethod === method ? 'active' : ''}`}>
                     <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="payment-radio" />
                     <span className="payment-method-text">{method}</span>
                   </label>
                 ))}
               </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                <span>GST ({igst > 0 ? 'IGST' : 'CGST+SGST'})</span>
                <span>₹{totalGstAmt.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <span>Amount to Pay</span>
                <span style={{ color: 'var(--gold)' }}>₹{total.toLocaleString('en-IN')}</span>
              </div>
               <button type="submit" className="btn btn-gold cart-btn-checkout" style={{ marginTop: 0 }} disabled={isCheckingOut}>
                 {isCheckingOut ? 'Processing Payment...' : 'Confirm Order & Pay'} <CheckCircle size={18} />
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
            <button 
              className="btn btn-gold" 
              style={{ width: '100%', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
              onClick={() => {
                onClose();
                navigate('/account/orders');
              }}
            >
              <Truck size={18} /> View & Track Order
            </button>
            <button className="btn btn-outline" style={{ width: '100%', padding: '1rem' }} onClick={() => { onClose(); navigate('/collections'); }}>
              Continue Shopping
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
