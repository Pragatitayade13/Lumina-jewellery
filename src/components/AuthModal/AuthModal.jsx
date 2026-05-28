import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, User, Shield, Briefcase, Calculator, Truck, ShieldAlert, ArrowLeft, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import './AuthModal.css';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, setUser } = useApp();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Reset state when modal closes
  useEffect(() => {
    if (!isAuthOpen) {
      setTimeout(() => {
        setSelectedOption(null);
        setIsSignUp(false);
      }, 300);
      setEmail('');
      setPassword('');
      setFullName('');
      setConfirmPassword('');
    }
  }, [isAuthOpen]);

  if (!isAuthOpen) return null;

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsSignUp(false); // Default to sign in when selecting a new option
  };


  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    // Check if Firebase is configured
    if (auth && db) {
      try {
        if (isSignUp) {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, { displayName: fullName });
          
          // Create user doc with role
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: fullName,
            email: email,
            role: selectedOption.id,
            createdAt: new Date().toISOString()
          });
          setUser({ uid: userCredential.user.uid, email, role: selectedOption.id, name: fullName });
        } else {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              name: userCredential.user.displayName || 'User',
              email: email,
              role: selectedOption.id,
              createdAt: new Date().toISOString()
            });
            setUser({ uid: userCredential.user.uid, email, role: selectedOption.id, name: userCredential.user.displayName || 'User' });
          } else {
            setUser({ uid: userCredential.user.uid, email, ...userDoc.data() });
          }
        }
        
        setIsAuthOpen(false);
        if (selectedOption.path) {
          navigate(selectedOption.path);
        }
      } catch (error) {
        alert("Authentication Error: " + error.message);
      }
    } else {
      // Fallback to mock auth if Firebase is not configured yet
      console.warn("Firebase not configured. Falling back to mock auth.");
      setUser({ 
        role: selectedOption.id, 
        name: isSignUp ? fullName : `${selectedOption.title} User` 
      });

      setIsAuthOpen(false);
      if (selectedOption.path) {
        navigate(selectedOption.path);
      } else {
        alert(`${selectedOption.title} ${isSignUp ? 'Sign Up' : 'Sign In'} success!`);
      }
    }
  };

  const loginOptions = [
    {
      id: 'customer',
      title: 'Customer Login',
      desc: 'Access your orders and wishlist',
      icon: <User size={24} />,
      path: '/account'
    },
    {
      id: 'delivery',
      title: 'Delivery Partner',
      desc: 'Manage your deliveries',
      icon: <Truck size={24} />,
      path: '/admin'
    },
    {
      id: 'staff',
      title: 'Staff Login',
      desc: 'Access staff portal',
      icon: <Briefcase size={24} />,
      path: '/admin'
    },
    {
      id: 'finance',
      title: 'Finance Login',
      desc: 'Manage payments and reports',
      icon: <Calculator size={24} />,
      path: '/admin'
    },
    {
      id: 'manager',
      title: 'Manager Login',
      desc: 'Supervise store operations',
      icon: <ClipboardList size={24} />,
      path: '/admin'
    },
    {
      id: 'admin',
      title: 'Admin Login',
      desc: 'Store management',
      icon: <Shield size={24} />,
      path: '/admin'
    },
    {
      id: 'superadmin',
      title: 'Super Admin',
      desc: 'Full system access',
      icon: <ShieldAlert size={24} />,
      path: '/admin'
    }
  ];

  return (
    <div className="auth-modal-overlay" onClick={() => setIsAuthOpen(false)}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={() => setIsAuthOpen(false)}>
          <X size={20} />
        </button>
        
        <div className="auth-modal-header">
          {selectedOption ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <button 
                onClick={() => setSelectedOption(null)} 
                className="auth-modal-back"
                title="Back to options"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="auth-modal-title" style={{ margin: 0 }}>
                {isSignUp ? 'Create Account' : selectedOption.title}
              </h2>
            </div>
          ) : (
            <>
              <h2 className="auth-modal-title">Welcome Back</h2>
              <p className="auth-modal-subtitle">Select your account type to continue</p>
            </>
          )}
        </div>
        
        <div className="auth-modal-body">
          {!selectedOption ? (
            <div className="login-options-grid">
              {loginOptions.map(option => (
                <div 
                  key={option.id} 
                  className="login-option-card"
                  onClick={() => handleOptionClick(option)}
                >
                  <div className="icon-wrapper">
                    {option.icon}
                  </div>
                  <div>
                    <div className="login-option-title">{option.title}</div>
                    <div className="login-option-desc">{option.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleAuthSubmit}>
               {isSignUp && (
                 <div className="form-group">
                   <label>Full Name</label>
                   <input 
                     type="text" 
                     required 
                     placeholder="Enter your full name"
                     value={fullName}
                     onChange={e => setFullName(e.target.value)}
                   />
                 </div>
               )}
               
               <div className="form-group">
                 <label>Email Address / Username</label>
                 <input 
                   type="text" 
                   required 
                   placeholder={`Enter your ${selectedOption.id} email`}
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                 />
               </div>
               
               <div className="form-group">
                 <label>Password</label>
                 <input 
                   type="password" 
                   required 
                   placeholder="Enter your password"
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                 />
               </div>

               {isSignUp && (
                 <div className="form-group">
                   <label>Confirm Password</label>
                   <input 
                     type="password" 
                     required 
                     placeholder="Confirm your password"
                     value={confirmPassword}
                     onChange={e => setConfirmPassword(e.target.value)}
                   />
                 </div>
               )}

               {!isSignUp && (
                 <div className="form-actions">
                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                     <input type="checkbox" /> Remember me
                   </label>
                   <a href="#" className="forgot-password">Forgot password?</a>
                 </div>
               )}

               <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}>
                 {isSignUp ? 'Sign Up Securely' : 'Sign In Securely'}
               </button>

               {selectedOption?.id !== 'superadmin' && (
                 <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                   {isSignUp ? (
                     <>
                       Already have an account?{' '}
                       <span className="auth-toggle-link" onClick={() => setIsSignUp(false)}>
                         Sign In
                       </span>
                     </>
                   ) : (
                     <>
                       Don't have an account?{' '}
                       <span className="auth-toggle-link" onClick={() => setIsSignUp(true)}>
                         Sign Up
                       </span>
                     </>
                   )}
                 </div>
               )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
