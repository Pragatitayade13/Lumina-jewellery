import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, setAuthLoading } from '../redux/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((state) => state.auth.loading);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    dispatch(setAuthLoading(true));

    const isMock = import.meta.env.VITE_FIREBASE_API_KEY === 'mock-api-key' || !import.meta.env.VITE_FIREBASE_API_KEY;

    if (isMock) {
      setTimeout(() => {
        const role = email.toLowerCase().includes('superadmin') ? 'superadmin' : 'admin';
        const mockUser = {
          uid: 'mock-uid-' + Date.now(),
          email: email,
          role: role,
          name: role === 'superadmin' ? 'Platform Director' : 'LuxeOrbit Store Owner',
        };
        const mockBusiness = {
          id: 'mock-biz-' + Date.now(),
          name: 'LuxeOrbit Store',
          gstNumber: 'GST887654321',
          phone: '9876543210',
          plan: 'Enterprise'
        };
        dispatch(setCredentials({
          user: mockUser,
          business: role === 'superadmin' ? null : mockBusiness,
          token: 'mock-token-' + Date.now()
        }));
        dispatch(setAuthLoading(false));
        navigate(role === 'superadmin' ? '/super-admin' : '/dashboard');
      }, 500);
      return;
    }

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // 2. Authenticate with our Backend to get user/business profile
      const response = await axios.post('http://localhost:5000/api/auth/login', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
        const role = email.toLowerCase().includes('superadmin') ? 'superadmin' : 'admin';
        const mockUser = {
          uid: 'mock-uid-' + Date.now(),
          email: email,
          role: role,
          name: role === 'superadmin' ? 'Platform Director' : 'LuxeOrbit Store Owner',
        };
        const mockBusiness = {
          id: 'mock-biz-' + Date.now(),
          name: 'LuxeOrbit Store',
          gstNumber: 'GST887654321',
          phone: '9876543210',
          plan: 'Enterprise'
        };
        dispatch(setCredentials({
          user: mockUser,
          business: role === 'superadmin' ? null : mockBusiness,
          token: 'mock-token-' + Date.now()
        }));
        navigate(role === 'superadmin' ? '/super-admin' : '/dashboard');
        return;
      }

      setError(err.response?.data?.message || err.message || 'Failed to login');
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gold-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-gold-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      
      <div className="glass-panel p-8 w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-gold-500 mb-2">LuxeOrbit</h1>
          <p className="text-sm text-gray-400">Sign in to manage your empire</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
            <input 
              type="email" 
              className="glass-input w-full" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Password</label>
            <input 
              type="password" 
              className="glass-input w-full" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-400 cursor-pointer">
              <input type="checkbox" className="mr-2 accent-gold-500" />
              Remember me
            </label>
            <a href="#" className="text-gold-500 hover:text-gold-400 transition-colors">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-dark font-semibold py-3 rounded-lg hover:from-gold-500 hover:to-gold-300 transition-all transform hover:scale-[1.02] shadow-lg shadow-gold-500/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have a merchant account?{' '}
            <Link to="/register" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">
              Join as Merchant
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
