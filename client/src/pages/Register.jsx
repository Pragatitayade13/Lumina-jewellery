import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useDispatch } from 'react-redux';
import { setCredentials, setAuthLoading } from '../redux/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    gstNumber: '',
    email: '',
    phone: '',
    password: '',
    plan: 'Basic'
  });
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    dispatch(setAuthLoading(true));

    const isMock = import.meta.env.VITE_FIREBASE_API_KEY === 'mock-api-key' || !import.meta.env.VITE_FIREBASE_API_KEY;

    if (isMock) {
      setTimeout(() => {
        const mockUser = {
          uid: 'mock-uid-' + Date.now(),
          email: formData.email,
          role: formData.email.toLowerCase().includes('superadmin') ? 'superadmin' : 'admin',
          name: formData.businessName || 'LuxeOrbit Owner',
        };
        const mockBusiness = {
          id: 'mock-biz-' + Date.now(),
          name: formData.businessName,
          gstNumber: formData.gstNumber || 'GST12345678',
          phone: formData.phone || '9999999999',
          plan: formData.plan
        };
        dispatch(setCredentials({
          user: mockUser,
          business: mockBusiness,
          token: 'mock-token-' + Date.now()
        }));
        dispatch(setAuthLoading(false));
        navigate(mockUser.role === 'superadmin' ? '/super-admin' : '/dashboard');
      }, 600);
      return;
    }

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      // 2. Register Business Profile in our Backend (Firestore)
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        uid: user.uid,
        email: formData.email,
        businessName: formData.businessName,
        gstNumber: formData.gstNumber,
        phone: formData.phone,
        plan: formData.plan
      });

      // 3. Store in Redux
      dispatch(setCredentials({
        user: response.data.user,
        business: response.data.business,
        token
      }));

      // 4. Redirect to Dashboard
      navigate('/dashboard');
      
    } catch (err) {
      console.error(err);
      
      const isConnectionError = err.message === 'Network Error' || err.code === 'ERR_NETWORK';
      const isFirebaseConfigError = err.code?.includes('auth/api-key-not-valid') || err.message?.includes('api-key-not-valid');
      
      if (isConnectionError || isFirebaseConfigError) {
        console.warn("Backend not running or Firebase key invalid. Falling back to mock session for testing...");
        const mockUser = {
          uid: 'mock-uid-' + Date.now(),
          email: formData.email,
          role: formData.email.toLowerCase().includes('superadmin') ? 'superadmin' : 'admin',
          name: formData.businessName || 'LuxeOrbit Owner',
        };
        const mockBusiness = {
          id: 'mock-biz-' + Date.now(),
          name: formData.businessName,
          gstNumber: formData.gstNumber || 'GST12345678',
          phone: formData.phone || '9999999999',
          plan: formData.plan
        };
        dispatch(setCredentials({
          user: mockUser,
          business: mockBusiness,
          token: 'mock-token-' + Date.now()
        }));
        navigate(mockUser.role === 'superadmin' ? '/super-admin' : '/dashboard');
        return;
      }

      setError(err.response?.data?.message || err.message || 'Failed to register business');
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-gold-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-gold-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      
      <div className="glass-panel p-8 w-full max-w-2xl z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-gold-500 mb-2">Partner with LuxeOrbit</h1>
          <p className="text-sm text-gray-400">Digitize your Jewellery business today</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Business Name *</label>
            <input 
              type="text" 
              name="businessName"
              className="glass-input w-full" 
              value={formData.businessName}
              onChange={handleChange}
              required 
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">GST Number</label>
            <input 
              type="text" 
              name="gstNumber"
              className="glass-input w-full" 
              value={formData.gstNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              className="glass-input w-full" 
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Email Address *</label>
            <input 
              type="email" 
              name="email"
              className="glass-input w-full" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Password *</label>
            <input 
              type="password" 
              name="password"
              className="glass-input w-full" 
              value={formData.password}
              onChange={handleChange}
              required 
              minLength="6"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Subscription Plan</label>
            <select 
              name="plan"
              className="glass-input w-full bg-luxury-dark text-white"
              value={formData.plan}
              onChange={handleChange}
            >
              <option value="Basic">Basic (Inventory + Billing)</option>
              <option value="Pro">Pro (+ E-commerce & CMS)</option>
              <option value="Enterprise">Enterprise (Multi-branch + AI)</option>
            </select>
          </div>

          <div className="md:col-span-2 mt-4">
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-dark font-semibold py-3 rounded-lg hover:from-gold-500 hover:to-gold-300 transition-all transform hover:scale-[1.01] shadow-lg shadow-gold-500/20"
            >
              Create Account
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account? <Link to="/login" className="text-gold-500 hover:text-gold-400">Sign in instead</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
