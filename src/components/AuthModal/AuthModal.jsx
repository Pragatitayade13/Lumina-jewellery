import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useScrollLock } from '../../hooks/useScrollLock';
import { X, User, Shield, Briefcase, Calculator, Truck, ShieldAlert, ArrowLeft, ClipboardList, Diamond, Key, Mail, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import bgImage from '../../assets/login_bg.png';
import './AuthModal.css';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, setUser } = useApp();
  useScrollLock(isAuthOpen);
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState(null); // null | 'admin'
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [customJoinDate, setCustomJoinDate] = useState('');
  const [error, setError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isAuthOpen) {
      setTimeout(() => {
        setSelectedGroup(null);
        setSelectedOption(null);
        setIsSignUp(false);
      }, 300);
      setEmail('');
      setPassword('');
      setFullName('');
      setPhone('');
      setAddress('');
      setConfirmPassword('');
      setShowPassword(false);
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
          
          let formattedJoinDate = new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
          if (customJoinDate) {
            const d = new Date(customJoinDate);
            formattedJoinDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          }

          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: fullName,
            email: email,
            phone: phone,
            addresses: address ? [{
              id: Date.now().toString(),
              title: 'Home Address',
              street: address,
              city: '',
              state: '',
              pincode: '',
              isDefault: true
            }] : [],
            role: selectedOption.id,
            joinDate: formattedJoinDate,
            createdAt: new Date().toISOString(),
            lastCheckIn: serverTimestamp(),
            status: 'online'
          });
          setUser({ uid: userCredential.user.uid, email, role: selectedOption.id, name: fullName, phone, joinDate: formattedJoinDate });
        } else {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              name: userCredential.user.displayName || 'User',
              email: email,
              role: selectedOption.id,
              createdAt: new Date().toISOString(),
              lastCheckIn: serverTimestamp(),
              status: 'online'
            });
            setUser({ uid: userCredential.user.uid, email, role: selectedOption.id, name: userCredential.user.displayName || 'User' });
          } else {
            const data = userDoc.data();
            
            // SECURITY CHECK: Prevent customers from logging into admin/staff portals
            if (selectedOption.id !== 'customer' && data.role === 'customer') {
              throw new Error("Access Denied. This account does not have administrative privileges.");
            }
            
            await updateDoc(doc(db, 'users', userCredential.user.uid), {
              lastCheckIn: serverTimestamp(),
              status: 'online'
            });
            
            setUser({ uid: userCredential.user.uid, email, ...data, status: 'online' });
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
      let formattedJoinDate = new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      if (customJoinDate) {
        const d = new Date(customJoinDate);
        formattedJoinDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }

      const mockUser = { 
        uid: `mock-${Date.now()}`,
        role: selectedOption.id, 
        email: email,
        phone: phone || '+91 00000 00000',
        joinDate: `Joined ${formattedJoinDate}`,
        name: isSignUp ? fullName : `${selectedOption.title} User` 
      };
      setUser(mockUser);
      
      // Also add to local storage so Admin UserManagement sees them!
      if (isSignUp && selectedOption.id !== 'customer') {
        try {
          const existing = JSON.parse(localStorage.getItem('jw_admin_users') || '[]');
          existing.unshift({
            id: mockUser.uid,
            name: mockUser.name,
            email: mockUser.email,
            phone: mockUser.phone,
            role: mockUser.role,
            department: 'New Staff',
            status: 'active',
            avatar: mockUser.name.substring(0, 2).toUpperCase(),
            avatarColor: '#16a085',
            lastLogin: 'Just now',
            joinDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          });
          localStorage.setItem('jw_admin_users', JSON.stringify(existing));
        } catch(e) {}
      }

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
    <div className="auth-page-container" style={{ backgroundImage: `url(${bgImage})`, zIndex: 9999 }} data-lenis-prevent="true">
      <div className="auth-glass-modal" onClick={e => e.stopPropagation()} data-lenis-prevent="true">
        <button className="auth-glass-close" onClick={() => setIsAuthOpen(false)}>
          <X size={20} />
        </button>
        {selectedOption || selectedGroup === 'admin' ? (
          <button 
            onClick={() => {
              if (selectedOption) {
                setSelectedOption(null);
              } else if (selectedGroup === 'admin') {
                setSelectedGroup(null);
              }
            }} 
            className="auth-glass-back"
          >
            <ArrowLeft size={14} /> Back
          </button>
        ) : null}
        
        <div className="auth-glass-header">
          <div className="auth-logo-brand">
            <Diamond size={32} className="auth-logo-icon" />
            <h1 className="auth-brand-name">LUMINA</h1>
            <p className="auth-brand-sub">JEWELS</p>
          </div>
          
          <h2 className="auth-glass-title">
            {selectedOption ? (isSignUp ? 'CREATE ACCOUNT' : `SIGN IN TO ${selectedOption.title.toUpperCase()}`) : 'SIGN IN TO YOUR ACCOUNT'}
          </h2>
        </div>
        
        <div className="auth-modal-body" data-lenis-prevent>
          {!selectedOption && !selectedGroup && (
            <div className="login-options-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div 
                className="login-option-card"
                onClick={() => handleOptionClick(loginOptions.find(o => o.id === 'customer'))}
              >
                <div className="icon-wrapper">
                  <User size={24} />
                </div>
                <div>
                  <div className="login-option-title">Customer Login</div>
                  <div className="login-option-desc">Access your orders and wishlist</div>
                </div>
              </div>
              <div 
                className="login-option-card"
                onClick={() => setSelectedGroup('admin')}
              >
                <div className="icon-wrapper">
                  <Shield size={24} />
                </div>
                <div>
                  <div className="login-option-title">Admin / Staff Login</div>
                  <div className="login-option-desc">Access employee portals</div>
                </div>
              </div>
            </div>
          )}

          {!selectedOption && selectedGroup === 'admin' && (
            <div className="login-options-grid">
              {loginOptions.filter(o => o.id !== 'customer').map(option => (
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
          )}

          {selectedOption && (
            <form className="auth-glass-form" onSubmit={handleAuthSubmit}>
               {isSignUp && (
                 <>
                   <div className="glass-form-group">
                     <User className="glass-input-icon" size={18} />
                     <input 
                       type="text" 
                       required 
                       placeholder="Full Name"
                       value={fullName}
                       onChange={e => setFullName(e.target.value)}
                       className="glass-input"
                     />
                   </div>
                   
                   <div className="glass-form-group">
                     <Mail className="glass-input-icon" size={18} />
                     <input 
                       type="tel" 
                       required 
                       placeholder="Contact Number"
                       value={phone}
                       onChange={e => setPhone(e.target.value)}
                       className="glass-input"
                     />
                   </div>

                   <div className="glass-form-group">
                     <Key className="glass-input-icon" size={18} />
                     <input 
                       type="date" 
                       required 
                       value={customJoinDate}
                       onChange={e => setCustomJoinDate(e.target.value)}
                       className="glass-input"
                     />
                   </div>
                   
                   {selectedOption.id === 'customer' && (
                     <div className="glass-form-group">
                       <Truck className="glass-input-icon" size={18} />
                       <input 
                         type="text" 
                         required 
                         placeholder="Shipping Address"
                         value={address}
                         onChange={e => setAddress(e.target.value)}
                         className="glass-input"
                       />
                     </div>
                   )}
                 </>
               )}
               
               <div className="glass-form-group">
                 <User className="glass-input-icon" size={18} />
                 <input 
                   type="text" 
                   required 
                   placeholder="Username or Email Address"
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   className="glass-input"
                 />
               </div>
               
               <div className="glass-form-group">
                 <Key className="glass-input-icon" size={18} />
                 <input 
                   type={showPassword ? "text" : "password"} 
                   required 
                   placeholder="Password"
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   className="glass-input"
                 />
                 <button type="button" className="glass-input-action" onClick={() => setShowPassword(!showPassword)}>
                   {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                 </button>
               </div>

               {isSignUp && (
                 <div className="glass-form-group">
                   <Key className="glass-input-icon" size={18} />
                   <input 
                     type={showPassword ? "text" : "password"} 
                     required 
                     placeholder="Confirm Password"
                     value={confirmPassword}
                     onChange={e => setConfirmPassword(e.target.value)}
                     className="glass-input"
                   />
                 </div>
               )}

               {!isSignUp && (
                 <div className="glass-form-actions">
                   <label className="glass-checkbox">
                     <input type="checkbox" />
                     <span className="checkmark"></span>
                     Remember Me
                   </label>
                   <a href="#" className="glass-forgot-link">Forgot Password?</a>
                 </div>
               )}

               <button type="submit" className="btn-glass-submit">
                 {isSignUp ? 'CREATE ACCOUNT' : 'ACCESS ACCOUNT'}
               </button>

               {selectedOption?.id !== 'superadmin' && (
                 <div className="glass-auth-toggle">
                   {isSignUp ? (
                     <>
                       Already have an account?{' '}
                       <span className="glass-toggle-btn" onClick={() => setIsSignUp(false)}>
                         Sign In
                       </span>
                     </>
                   ) : (
                     <>
                       Don't have an account?{' '}
                       <span className="glass-toggle-btn" onClick={() => setIsSignUp(true)}>
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
