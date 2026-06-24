import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Tag, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OffersPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'coupons'),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(q);
      const now = new Date();
      
      const fetchedCoupons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(coupon => {
        if (coupon.startDate && new Date(coupon.startDate) > now) return false;
        if (coupon.expiryDate && new Date(coupon.expiryDate) < now) return false;
        return true;
      });

      setCoupons(fetchedCoupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Coupon code ${code} copied to clipboard!`);
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-accent)', color: 'var(--gold)', marginBottom: '1rem' }}>
            Exclusive Offers & Promotions
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Discover our latest deals and apply these coupon codes at checkout to enjoy special discounts on your favorite pieces.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Loading offers...
          </div>
        ) : coupons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Tag size={48} color="var(--border)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No active offers</h3>
            <p style={{ color: 'var(--text-muted)' }}>Check back later for exciting new promotions and discounts.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem', paddingBottom: '4rem' }}>
            {coupons.map((coupon, index) => (
              <motion.div 
                key={coupon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                style={{
                  background: 'var(--surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ height: '8px', background: 'var(--gold)', width: '100%' }} />
                
                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ 
                      background: 'rgba(201, 168, 76, 0.1)', 
                      border: '1px dashed var(--gold)',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      color: 'var(--gold)',
                      fontWeight: 700,
                      letterSpacing: '2px',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onClick={() => copyToClipboard(coupon.code)}
                    title="Click to copy"
                    >
                      {coupon.code}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-accent)' }}>
                    {coupon.title}
                  </h3>
                  
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                    {coupon.description}
                  </p>

                  <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      <CheckCircle size={14} color="var(--gold)" />
                      <span>
                        <strong>{coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}</strong>
                      </span>
                    </div>
                    {coupon.minOrderAmount > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <Tag size={14} />
                        <span>On minimum purchase of ₹{coupon.minOrderAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {coupon.expiryDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e74c3c', fontSize: '0.8rem', fontWeight: 600 }}>
                      <Clock size={14} />
                      <span>Valid till {new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
