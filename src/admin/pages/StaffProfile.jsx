import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Phone, MapPin, Award, CheckCircle, Package, ShieldCheck, X, Camera, Edit3, HeartPulse, Building, Bell, Eye, EyeOff, Clock, LogIn, LogOut, AlertCircle, Calendar } from 'lucide-react';
import { useAttendance } from '../../hooks/useAttendance';
import { useCustomers } from '../../hooks/useCustomers';

export default function StaffProfile() {
  const { user, showToast, currentStore } = useApp();
  const activeStoreId = currentStore || (user?.role === 'superadmin' ? 'GLOBAL' : 'NONE');
  const [activeModal, setActiveModal] = useState(null); // 'password', 'editProfile', 'notifications'

  const { customers } = useCustomers(activeStoreId);
  const currentUserData = customers.find(c => c.id === user?.uid);
  const mySchedule = currentUserData?.schedule;

  // Live clock
  const [liveClock, setLiveClock] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Attendance
  const { isClockedIn, checkInTime, checkOutTime, loading: attendanceLoading, clockIn, clockOut } = useAttendance(user?.uid);
  const [attendanceBusy, setAttendanceBusy] = useState(false);

  const handleAttendance = async () => {
    setAttendanceBusy(true);
    try {
      if (isClockedIn) {
        await clockOut();
        showToast('✅ Clocked out successfully!');
      } else {
        await clockIn();
        showToast('✅ Clocked in successfully!');
      }
    } catch (err) {
      showToast('❌ Failed to update attendance. Try again.');
    } finally {
      setAttendanceBusy(false);
    }
  };
  
  // Local state for edits
  const [profilePic, setProfilePic] = useState(null);
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || 'Staff User',
    phone: user?.phone || '+91 98765 43210',
    email: user?.email || 'staff@luminajewels.com',
    address: '101, Diamond Heights, Bandra West, Mumbai',
    emergencyContact: '+91 91234 56789'
  });
  const [notifPrefs, setNotifPrefs] = useState({ sms: true, email: true, push: true });
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        showToast("Profile photo updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Mock data for stats
  const stats = user?.role === 'delivery' ? [
    { label: 'Total Deliveries', value: '1,432', icon: <Package size={20} color="var(--gold)" /> },
    { label: 'Success Rate', value: '99.8%', icon: <CheckCircle size={20} color="var(--status-green)" /> },
    { label: 'Safety Rating', value: '5.0', icon: <ShieldCheck size={20} color="#3498db" /> },
    { label: 'Zone', value: 'Mumbai South', icon: <MapPin size={20} color="#e74c3c" /> }
  ] : [
    { label: 'Role Level', value: user?.role?.toUpperCase() || 'L1 - STAFF', icon: <Award size={20} color="var(--gold)" /> },
    { label: 'Tasks Completed', value: '840', icon: <CheckCircle size={20} color="var(--status-green)" /> },
    { label: 'Performance Score', value: '98/100', icon: <ShieldCheck size={20} color="#3498db" /> },
    { label: 'Base Branch', value: 'HQ - Mumbai', icon: <Building size={20} color="#e74c3c" /> }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Profile</h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)' }}>Manage your personal details, photo, and preferences.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '350px 1fr' }}>
        
        {/* Left Column: Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="admin-card" style={{ overflow: 'hidden', padding: 0, position: 'relative', background: 'var(--bg-card)' }}>
            {/* Banner Background */}
            <div style={{ height: '120px', background: 'linear-gradient(135deg, rgba(201,168,76,0.3) 0%, var(--bg-primary) 100%)', borderBottom: '1px solid var(--border)' }} />
            
            <div style={{ padding: '0 2rem 2rem', textAlign: 'center', marginTop: '-60px' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
                <div style={{ 
                  width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-card)', 
                  border: '4px solid var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: 'var(--gold)', fontSize: '2.5rem', fontWeight: 'bold', overflow: 'hidden',
                  boxShadow: 'var(--shadow-gold)'
                }}>
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    personalInfo.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                
                {/* Add Photo Button */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    position: 'absolute', bottom: '0', right: '0', background: 'var(--gold)', 
                    border: '4px solid var(--bg-card)', borderRadius: '50%', width: '40px', height: '40px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', 
                    cursor: 'pointer', transition: 'transform 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  title="Upload Profile Photo"
                >
                  <Camera size={16} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
              </div>
              
              <h2 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '1.5rem' }}>{personalInfo.name}</h2>
              <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(201,168,76,0.1)', color: 'var(--gold)', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(201,168,76,0.3)', marginBottom: '1.5rem', letterSpacing: '1px' }}>
                {user?.role ? user.role.toUpperCase() : 'ADMINISTRATION'}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--text-secondary)' }}>
                  <Mail size={18} color="var(--gold)" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Email Address</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{personalInfo.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--text-secondary)' }}>
                  <Phone size={18} color="var(--gold)" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Phone Number</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{personalInfo.phone}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={18} color="var(--gold)" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Residential Address</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{personalInfo.address}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--text-secondary)' }}>
                  <HeartPulse size={18} color="var(--status-red)" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Emergency Contact</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{personalInfo.emergencyContact}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* ── Today's Attendance Card ── */}
          <div className="admin-card" style={{ padding: '2rem', background: 'var(--bg-card)', border: isClockedIn ? '1px solid rgba(46,204,113,0.4)' : '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--gold)" /> Today's Attendance
            </h3>

            {/* Live Clock */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '2px', fontVariantNumeric: 'tabular-nums' }}>
                {liveClock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {liveClock.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>

            {/* Status Badge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1.25rem', borderRadius: '30px', fontWeight: 600, fontSize: '0.9rem',
                background: isClockedIn ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.05)',
                color: isClockedIn ? '#2ecc71' : 'var(--text-muted)',
                border: isClockedIn ? '1px solid rgba(46,204,113,0.4)' : '1px solid var(--border)',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isClockedIn ? '#2ecc71' : '#666', display: 'inline-block', boxShadow: isClockedIn ? '0 0 6px #2ecc71' : 'none' }} />
                {attendanceLoading ? 'Checking status...' : isClockedIn ? 'Currently Clocked In' : 'Not Clocked In'}
              </div>
            </div>

            {/* Check-in / Check-out Times */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <LogIn size={12} /> Check-In
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: checkInTime ? '#2ecc71' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {checkInTime || '--:--'}
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <LogOut size={12} /> Check-Out
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: checkOutTime ? '#e74c3c' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {checkOutTime || '--:--'}
                </div>
              </div>
            </div>

            {/* Clock In / Clock Out Button */}
            {checkOutTime && !isClockedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <AlertCircle size={16} color="var(--gold)" />
                You have completed your shift for today.
              </div>
            ) : (
              <button
                onClick={handleAttendance}
                disabled={attendanceBusy || attendanceLoading}
                style={{
                  width: '100%', padding: '1rem', borderRadius: '10px', border: 'none',
                  fontWeight: 700, fontSize: '1rem', cursor: attendanceBusy ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.2s',
                  background: isClockedIn
                    ? 'linear-gradient(135deg, #e74c3c, #c0392b)'
                    : 'linear-gradient(135deg, var(--gold), #b8860b)',
                  color: isClockedIn ? '#fff' : '#000',
                  opacity: attendanceBusy ? 0.6 : 1,
                  boxShadow: isClockedIn ? '0 4px 20px rgba(231,76,60,0.3)' : '0 4px 20px rgba(201,168,76,0.3)',
                }}
                onMouseOver={e => { if (!attendanceBusy) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {isClockedIn ? <LogOut size={18} /> : <LogIn size={18} />}
                {attendanceBusy ? 'Saving...' : isClockedIn ? 'Clock Out' : 'Clock In'}
              </button>
            )}
          </div>
          
          {mySchedule && (
            <div className="admin-card" style={{ padding: '2rem', background: 'var(--bg-card)', marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} color="var(--gold)" /> Your Weekly Schedule
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Weekend'].map(day => (
                  <div key={day} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{day}</div>
                    <div style={{ fontWeight: 600, color: mySchedule[day] === 'Off' ? 'var(--status-red)' : 'var(--text-primary)' }}>
                      {mySchedule[day] || 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="admin-card" style={{ padding: '2rem', background: 'var(--bg-card)' }}>
            <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="var(--gold)" /> Performance Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {stats.map((stat, i) => (
                <div key={i} style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 500 }}>
                    {stat.icon} {stat.label}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '1px' }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card" style={{ padding: '2rem', background: 'var(--bg-card)' }}>
            <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)', fontSize: '1.25rem' }}>Account Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                className="btn btn-outline" 
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-start', padding: '1.25rem', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '1rem', color: 'var(--text-primary)' }} 
                onClick={() => setActiveModal('editProfile')}
              >
                <Edit3 size={18} color="var(--gold)" /> Edit Personal Information
              </button>
              <button 
                className="btn btn-outline" 
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-start', padding: '1.25rem', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '1rem', color: 'var(--text-primary)' }} 
                onClick={() => setActiveModal('password')}
              >
                <ShieldCheck size={18} color="var(--gold)" /> Change Password
              </button>
              <button 
                className="btn btn-outline" 
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-start', padding: '1.25rem', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '1rem', color: 'var(--text-primary)' }} 
                onClick={() => setActiveModal('notifications')}
              >
                <Bell size={18} color="var(--gold)" /> Notification Preferences
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* MODALS */}

      {/* Edit Profile Modal */}
      {activeModal === 'editProfile' && (
        <div className="auth-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="auth-modal cart-modal-box" style={{ width: '500px', maxWidth: '100%', background: 'var(--bg-card)', padding: '2.5rem', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexShrink: 0 }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={20} color="var(--gold)" /> Edit Personal Info
              </h3>
              <button className="btn-icon" onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Full Name</label>
                <input type="text" value={personalInfo.name} onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})} className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Phone Number</label>
                <input type="text" value={personalInfo.phone} onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})} className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Email Address</label>
                <input type="email" value={personalInfo.email} onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})} className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Residential Address</label>
                <textarea value={personalInfo.address} onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})} className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px', minHeight: '80px', resize: 'vertical' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label style={{ color: 'var(--status-red)', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Emergency Contact</label>
                <input type="text" value={personalInfo.emergencyContact} onChange={(e) => setPersonalInfo({...personalInfo, emergencyContact: e.target.value})} className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px' }} />
              </div>
            </div>

            <div style={{ flexShrink: 0 }}>
              <button className="btn btn-gold" style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 600, borderRadius: '6px', color: '#fff' }} onClick={() => {
                showToast("Profile information updated successfully!");
                setActiveModal(null);
              }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {activeModal === 'password' && (
        <div className="auth-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="auth-modal cart-modal-box" style={{ width: '450px', maxWidth: '100%', background: 'var(--bg-card)', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="var(--gold)" /> Change Password
              </h3>
              <button className="btn-icon" onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="form-input" style={{ width: '100%', padding: '0.8rem 2.5rem 0.8rem 0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px' }} />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="form-input" style={{ width: '100%', padding: '0.8rem 2.5rem 0.8rem 0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px' }} />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="form-input" style={{ width: '100%', padding: '0.8rem 2.5rem 0.8rem 0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px' }} />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button className="btn btn-gold" style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 600, borderRadius: '6px', color: '#fff' }} onClick={() => {
              showToast("Password successfully updated!");
              setActiveModal(null);
            }}>Update Password</button>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {activeModal === 'notifications' && (
        <div className="auth-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="auth-modal cart-modal-box" style={{ width: '450px', maxWidth: '100%', background: 'var(--bg-card)', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={20} color="var(--gold)" /> Notification Preferences
              </h3>
              <button className="btn-icon" onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', color: 'var(--text-primary)', padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <input type="checkbox" checked={notifPrefs.sms} onChange={(e) => setNotifPrefs({...notifPrefs, sms: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: 'var(--gold)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>SMS Route Alerts & OTPs</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get immediate text messages for critical alerts.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', color: 'var(--text-primary)', padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <input type="checkbox" checked={notifPrefs.email} onChange={(e) => setNotifPrefs({...notifPrefs, email: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: 'var(--gold)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>Email Weekly Reports</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Receive your performance digest via email.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', color: 'var(--text-primary)', padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <input type="checkbox" checked={notifPrefs.push} onChange={(e) => setNotifPrefs({...notifPrefs, push: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: 'var(--gold)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>Push Notifications</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>App alerts for assigned tasks and orders.</div>
                </div>
              </label>
            </div>
            <button className="btn btn-gold" style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 600, borderRadius: '6px', color: '#fff' }} onClick={() => {
              showToast("Notification preferences saved successfully!");
              setActiveModal(null);
            }}>Save Preferences</button>
          </div>
        </div>
      )}
    </div>
  );
}
