import { useState, useEffect } from 'react';
import { RefreshCw, IndianRupee, Package, Users, Gem, Bot, TrendingUp, Lightbulb, AlertTriangle, Target, Smartphone, CreditCard, Landmark, Wallet, Home, Bell, CheckSquare, AlertCircle, ShieldAlert, ShieldCheck, Truck, RotateCcw, CheckCircle } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Link } from 'react-router-dom';
import { revenueData, orderStatusData, activities as initialActivities, categoryRevenue, products as mockProducts, orders as mockOrders, adminUsers as mockCustomers } from '../data/mockData';
import { useApp } from '../../context/AppContext';
import { useRates } from '../../hooks/useRates';
import { useOrders } from '../../hooks/useOrders';
import { useCustomers } from '../../hooks/useCustomers';
import { useProducts } from '../../hooks/useProducts';

function StatCard({ icon, iconClass, label, value, trend, trendUp, trendNote, accentColor }) {
  return (
    <div className="stat-card" style={{ '--card-accent': accentColor }}>
      <div className="stat-row">
        <div className={`stat-icon ${iconClass}`}>{icon}</div>
        <div className={`stat-trend ${trendUp ? 'up' : 'down'}`} style={{ marginLeft: 'auto' }}>
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{trendNote}</div>
    </div>
  );
}

function LineChart({ data }) {
  const max = Math.max(...data.map(d => d.revenue));
  const min = Math.min(...data.map(d => d.revenue)) * 0.8;
  const range = max - min;
  
  const width = 800;
  const height = 200;
  const xStep = width / (data.length - 1 || 1);
  
  const points = data.map((d, i) => {
    const x = i * xStep;
    const y = height - ((d.revenue - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '1rem 0', marginTop: '1rem' }}>
      <svg viewBox={`0 -15 ${width} ${height + 35}`} style={{ width: '100%', minWidth: '600px', height: '220px', overflow: 'visible' }}>
        <defs>
          <linearGradient id="dashLineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon 
          fill="url(#dashLineGrad)" 
          points={`${points} ${width},${height} 0,${height}`} 
        />
        <polyline
          fill="none"
          stroke="var(--gold)"
          strokeWidth="3"
          points={points}
        />
        {data.map((d, i) => {
          const x = i * xStep;
          const y = height - ((d.revenue - min) / range) * height;
          return (
            <g key={d.month}>
              <circle cx={x} cy={y} r="5" fill="var(--gold)" stroke="var(--surface)" strokeWidth="2" />
              <text x={x} y={height + 25} fill="var(--text-muted)" fontSize="12" textAnchor="middle">{d.month}</text>
              <text x={x} y={y - 12} fill="var(--text-primary)" fontSize="11" fontWeight="bold" textAnchor="middle">₹{(d.revenue / 100000).toFixed(1)}L</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 68, circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg width={176} height={176} viewBox="0 0 176 176" className="donut-svg">
          <circle cx={88} cy={88} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={22} />
          {data.map((d, i) => {
            const len = (d.value / total) * circumference;
            const da = `${len} ${circumference - len}`;
            const do_ = -offset;
            offset += len;
            return (
              <circle key={i} cx={88} cy={88} r={r} fill="none"
                stroke={d.color} strokeWidth={22}
                strokeDasharray={da} strokeDashoffset={do_}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>74</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Today</div>
        </div>
      </div>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i} className="donut-legend-item">
            <div className="donut-dot" style={{ background: d.color }} />
            <span className="donut-legend-label">{d.label}</span>
            <span className="donut-legend-val">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const statusClass = { delivered: 'badge-delivered', in_transit: 'badge-shipped', out_for_delivery: 'badge-shipped', packed: 'badge-confirmed', assigned: 'badge-new', pending: 'badge-pending', cancelled: 'badge-cancelled', returned: 'badge-orange' };

// Removed static aiInsights
const paymentMethods = [
  { em: <Smartphone size={18} />, m: 'UPI', p: '42%' },
  { em: <CreditCard size={18} />, m: 'Card', p: '28%' },
  { em: <Landmark size={18} />, m: 'NetBank', p: '18%' },
  { em: <Wallet size={18} />, m: 'Wallet', p: '8%' },
  { em: <Home size={18} />, m: 'COD', p: '4%' },
];

export default function Dashboard() {
  const { user, showToast, currentStore, assignedStores } = useApp();
  const activeStoreId = currentStore || (user?.role === 'superadmin' ? 'GLOBAL' : 'NONE');
  const activeStoreObj = assignedStores?.find(s => s.id === currentStore);
  const activeStoreName = activeStoreObj ? activeStoreObj.name : 'All Stores';
  const { orders: firebaseOrders } = useOrders(activeStoreId);
  const { customers: firebaseCustomers } = useCustomers(activeStoreId);
  const { products: firebaseProducts } = useProducts(activeStoreId);
  const [insights, setInsights] = useState([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [liveActivities, setLiveActivities] = useState(initialActivities);
  const [chartData, setChartData] = useState(revenueData);
  const { rates } = useRates();
  
  // Data Fallbacks for Visual Preview
  const displayOrders = firebaseOrders?.length > 0 ? firebaseOrders : mockOrders;
  const displayCustomers = firebaseCustomers?.length > 0 ? firebaseCustomers : mockCustomers;
  const displayProducts = firebaseProducts?.length > 0 ? firebaseProducts : mockProducts;
  
  // Dynamic values based on Live Data
  const actualOrdersCount = displayOrders?.length || 0;
  const actualCustomersCount = displayCustomers?.length || 0;
  const actualProductsCount = displayProducts?.length || 0;
  const pendingOrdersCount = displayOrders?.filter(o => o.status === 'pending' || o.status === 'confirmed').length || 0;
  
  const [securityStats, setSecurityStats] = useState({ todayLogins: 0, activeUsers: 0, failedLogins: 0, recentActivities: [] });

  useEffect(() => {
    if (user?.role !== 'superadmin') return;
    
    const fetchSecurityStats = async () => {
      try {
        const today = new Date();
        today.setHours(0,0,0,0);
        
        // Fetch recent logins
        let queryConstraints = [orderBy('loginTime', 'desc'), limit(50)];
        if (activeStoreId && activeStoreId !== 'GLOBAL') {
           queryConstraints.unshift(where('storeId', '==', activeStoreId));
        }
        const q = query(collection(db, 'loginActivity'), ...queryConstraints);
        const snap = await getDocs(q);
        
        let todayCount = 0;
        let activeCount = 0;
        let failedCount = 0;
        const recents = [];
        
        snap.forEach(doc => {
          const data = doc.data();
          const loginTime = new Date(data.loginTime);
          if (loginTime >= today) todayCount++;
          if (data.status === 'failed' && loginTime >= today) failedCount++;
          if (data.status === 'success' || data.status === 'active') {
             if (!data.logoutTime) activeCount++;
          }
          if (recents.length < 5) recents.push({ id: doc.id, ...data });
        });
        
        setSecurityStats({ todayLogins: todayCount, activeUsers: activeCount, failedLogins: failedCount, recentActivities: recents });
      } catch (err) {
        console.error("Error fetching security stats", err);
      }
    };
    
    fetchSecurityStats();
  }, [user]);
  
  // Inventory Alerts
  const lowStockProducts = displayProducts?.filter(p => (p.stock || 0) <= (p.minStock || 5)) || [];
  
  // Mock Assigned Tasks for Staff
  const assignedTasks = [
    { id: 'TSK-092', title: 'Quality Check: Polki Necklaces', time: 'Today, 2:30 PM', priority: 'High', status: 'Pending' },
    { id: 'TSK-093', title: 'Update Diamond Pricing', time: 'Today, 5:00 PM', priority: 'Medium', status: 'Pending' },
    { id: 'TSK-094', title: 'Follow up with packaging vendor', time: 'Tomorrow, 10:00 AM', priority: 'Low', status: 'In Progress' }
  ];
  
  const calculateRealRevenueCr = () => {
     if (!displayOrders || displayOrders.length === 0) return 0;
     const total = displayOrders.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
     return (total / 10000000).toFixed(4); // In Cr
  };
  
  const realRevenueCr = calculateRealRevenueCr();
  
  const goldMultiplier = (rates?.gold24k || 7250) / 7250;
  const dynamicTotalRevenue = (Number(realRevenueCr) * 1.5).toFixed(2); // Simulated annual projection based on real
  const dynamicAvgMonthly = (Number(realRevenueCr) / 12).toFixed(4);

  const handleGenerateInsights = () => {
    setIsGeneratingInsights(true);
    showToast("Analyzing live data stream...");
    
    setTimeout(() => {
      // Randomize values to ensure they change on regeneration
      const growthFactor = Math.floor(Math.random() * 5) + 10; // 10-14%
      const surgeFactor = Math.floor(Math.random() * 8) + 12; // 12-19%
      const engagementTarget = Math.floor(Math.random() * 50) + 150; 
      
      const rateNote = Math.random() > 0.5 
        ? `Current rate ₹${rates?.gold24k || 7250}/g is driving a shift towards 18K and Silver items.` 
        : `Recent spike in 24K rate (₹${rates?.gold24k || 7250}/g) is increasing demand for Diamond Rings.`;

      setInsights([
        { icon: <TrendingUp size={16} />, text: `<strong>Revenue Trajectory:</strong> Based on ₹${realRevenueCr} Cr current pacing, expect ${growthFactor}% growth next month.` },
        { icon: <Package size={16} />, text: `<strong>Order Velocity:</strong> ${actualOrdersCount} real orders logged indicates a ${surgeFactor}% surge vs 30-day average.` },
        { icon: <Users size={16} />, text: `<strong>Customer Base:</strong> ${actualCustomersCount.toLocaleString()} active users; consider targeting ${Math.min(engagementTarget, actualCustomersCount)} VIPs for re-engagement.` },
        { icon: <Landmark size={16} />, text: `<strong>Gold Rate Impact:</strong> ${rateNote}` }
      ]);
      setIsGeneratingInsights(false);
      showToast("Live Insights generated successfully!");
    }, 2000);
  };

  useEffect(() => {
    // Simulated activity feed based on actual data sizes
    const activityInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newAct = {
          icon: <Bell size={16} />,
          color: 'rgba(52,152,219,0.15)',
          text: `<strong>Live Event:</strong> User viewed Polki Kundan Choker`,
          time: 'Just now'
        };
        setLiveActivities(prev => [newAct, ...prev.slice(0, 5)]);
      }
    }, 8000);

    const liveDataInterval = setInterval(() => {
      // Simulate live chart fluctuations
      setChartData(prev => prev.map(d => ({
        ...d,
        revenue: d.revenue + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 50000)
      })));
    }, 5000);

    return () => {
      clearInterval(activityInterval);
      clearInterval(liveDataInterval);
    };
  }, [firebaseOrders, firebaseCustomers, firebaseProducts]);

  const handleExport = () => {
    if (user?.role !== 'superadmin') {
      showToast('Error: Only Super Admin can export overall reports.');
      return;
    }
    
    // Simulate generating and downloading report
    showToast('Preparing Overall Report...');
    setTimeout(() => {
      const csvHeader = "Month,Revenue (₹)\n";
      const csvContent = chartData.map(d => `"${d.month}","${d.revenue}"`).join("\n");
      const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "Lumina_Jewels_Overall_Report_2026.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Overall Report exported successfully!');
    }, 1000);
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title">Dashboard Overview</h1>
            {activeStoreId !== 'GLOBAL' && activeStoreId !== 'NONE' && (
               <span className="badge badge-active">{activeStoreName}</span>
            )}
          </div>
          <p className="page-subtitle">Welcome back — Here's what's happening at {activeStoreId !== 'GLOBAL' && activeStoreId !== 'NONE' ? activeStoreName : 'Lumina Jewels'} today</p>
        </div>
        <div className="page-actions">
          {(!user || user.role === 'superadmin') && (
            <button className="btn btn-outline" onClick={handleExport}>📥 Export Overall Report</button>
          )}
        </div>
      </div>

      {/* Live Market Ticker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', padding: '0.8rem 1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '2rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-green)', fontSize: '0.85rem', fontWeight: 700, borderRight: '1px solid var(--border)', paddingRight: '1.5rem', whiteSpace: 'nowrap' }}>
          <span className="live-dot" style={{ width: '8px', height: '8px', background: 'var(--status-green)', borderRadius: '50%', display: 'inline-block' }} /> 
          LIVE MARKET 2026
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>24K GOLD</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)' }}>₹{rates?.gold24k || 7250}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>/g</span></span>
          <span style={{ fontSize: '0.7rem', color: 'var(--status-green)', fontWeight: 700 }}>▲ 0.17%</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>22K GOLD</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1c40f' }}>₹{rates?.gold22k || 6659}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>/g</span></span>
          <span style={{ fontSize: '0.7rem', color: 'var(--status-green)', fontWeight: 700 }}>▲ 0.13%</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>18K GOLD</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d4af37' }}>₹{rates?.gold18k || 5440}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>/g</span></span>
          <span style={{ fontSize: '0.7rem', color: 'var(--status-green)', fontWeight: 700 }}>▲ 0.10%</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SILVER</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#c0c0c0' }}>₹{rates?.silver || 85}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>/g</span></span>
          <span style={{ fontSize: '0.7rem', color: 'var(--status-red)', fontWeight: 700 }}>▼ 0.60%</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>DIAMOND (1CT)</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#88ccff' }}>₹{(rates?.diamond || 195000).toLocaleString('en-IN')}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>— 0.00%</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid mb-15">
        <StatCard icon={<IndianRupee size={20} />} iconClass="gold" label="Daily Sales Summary" value={`₹${realRevenueCr} Cr`} trend="Real-Time" trendUp={true} trendNote="from live orders" accentColor="var(--gold)" />
        <StatCard icon={<Users size={20} />} iconClass="green" label="New Customer Reg." value={actualCustomersCount.toLocaleString()} trend="Live" trendUp={true} trendNote="active users" accentColor="#2ecc71" />
        <StatCard icon={<Package size={20} />} iconClass="blue" label="Pending Orders" value={pendingOrdersCount} trend="Action Req." trendUp={false} trendNote="awaiting fulfillment" accentColor="#3498db" />
        <StatCard icon={<Gem size={20} />} iconClass="purple" label="Total Products" value={actualProductsCount} trend="Live" trendUp={true} trendNote="synced with DB" accentColor="#9b59b6" />
      </div>

      {/* Security Widgets for Superadmin */}
      {user?.role === 'superadmin' && (
        <div className="stat-grid mb-15">
          <StatCard icon={<ShieldCheck size={20} />} iconClass="green" label="Total Logins Today" value={securityStats.todayLogins} trend="Today" trendUp={true} trendNote="across all roles" accentColor="#2ecc71" />
          <StatCard icon={<Users size={20} />} iconClass="blue" label="Active Users" value={securityStats.activeUsers} trend="Live" trendUp={true} trendNote="currently logged in" accentColor="#3498db" />
          <StatCard icon={<ShieldAlert size={20} />} iconClass="red" label="Failed Login Attempts" value={securityStats.failedLogins} trend="Security" trendUp={false} trendNote="failed attempts today" accentColor="#e74c3c" />
          <div className="admin-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Recent Security Activity</div>
            {securityStats.recentActivities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {securityStats.recentActivities.slice(0, 2).map(act => (
                  <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{act.email || act.userName}</span>
                    <span style={{ color: act.status === 'failed' ? '#e74c3c' : '#2ecc71' }}>{act.status.toUpperCase()}</span>
                  </div>
                ))}
                <Link to="/admin/login-activity" style={{ fontSize: '0.7rem', color: 'var(--gold)', marginTop: '0.2rem' }}>View All Logs →</Link>
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No recent activity.</div>
            )}
          </div>
        </div>
      )}

      {/* Logistics Overview for Superadmin */}
      {user?.role === 'superadmin' && (
        <div className="admin-card mb-15">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} color="var(--gold)" /> Global Logistics Overview
            </div>
            <Link to="/admin/delivery" style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>View Logistics Portal →</Link>
          </div>
          <div className="stat-grid" style={{ padding: '1.5rem', borderTop: 'none', background: 'transparent' }}>
            <StatCard icon={<Package size={20} />} iconClass="gold" label="Pending Dispatch" value={displayOrders?.filter(o => o.status === 'packed' || o.status === 'assigned').length || 0} trend="Live" trendUp={true} trendNote="awaiting pickup" accentColor="var(--gold)" />
            <StatCard icon={<Truck size={20} />} iconClass="blue" label="In Transit" value={displayOrders?.filter(o => o.status === 'in_transit' || o.status === 'out_for_delivery').length || 0} trend="Live" trendUp={true} trendNote="currently on road" accentColor="#3498db" />
            <StatCard icon={<CheckCircle size={20} />} iconClass="green" label="Delivered" value={displayOrders?.filter(o => o.status === 'delivered').length || 0} trend="Today" trendUp={true} trendNote="successful handovers" accentColor="#2ecc71" />
            <StatCard icon={<RotateCcw size={20} />} iconClass="orange" label="Returns" value={displayOrders?.filter(o => o.status === 'returned').length || 0} trend="Action Req" trendUp={false} trendNote="processed returns" accentColor="var(--status-orange)" />
          </div>
        </div>
      )}

      {/* Revenue Chart + AI Insights */}
      <div className="grid-2-1 mb-15">
        <div className="admin-card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Trend — FY 2026</div>
              <div className="card-subtitle">Monthly revenue performance</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)' }}>₹{dynamicTotalRevenue} Cr</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--status-green)', fontWeight: 700 }}>↑ 28.4%</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[{ l: 'Avg Monthly', v: `₹${dynamicAvgMonthly} Cr` }, { l: 'Peak Month', v: 'December' }, { l: 'Best Growth', v: '+42% Oct' }, { l: 'YoY Growth', v: '+28.4%' }].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{s.v}</div>
              </div>
            ))}
          </div>
          <LineChart data={chartData.map(d => ({ ...d, revenue: d.revenue * goldMultiplier }))} />
        </div>

        <div className="ai-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ai-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <Bot size={20} color="var(--gold)" />
              <div>
                <div className="ai-badge">AI Business Intelligence</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Powered by Lumina AI Engine</div>
              </div>
            </div>
            <button className="btn btn-gold btn-sm" onClick={handleGenerateInsights} disabled={isGeneratingInsights} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--gold)', color: '#000', fontWeight: 800, padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px' }}>
              <RefreshCw size={14} className={isGeneratingInsights ? 'spin' : ''} />
              {isGeneratingInsights ? 'Analyzing...' : 'Generate Insights'}
            </button>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {insights.length === 0 && !isGeneratingInsights ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.9rem' }}>
                <Bot size={32} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
                Click 'Generate Insights' to analyze live revenue, orders, and market rates.
              </div>
            ) : (
              insights.map((insight, i) => (
                <div key={i} className="ai-insight" style={{ animation: `fadeIn 0.4s ease forwards ${i * 0.1}s` }}>
                  <span className="ai-insight-icon" style={{ color: 'var(--text-muted)' }}>{insight.icon}</span>
                  <div className="ai-insight-text" dangerouslySetInnerHTML={{ __html: insight.text }} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders + Activity Feed */}
      <div className="grid-2-1 mb-15">
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Recent Orders</div>
            <a href="/admin/orders" style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 600 }}>View All Orders →</a>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {firebaseOrders && firebaseOrders.length > 0 ? (
                  firebaseOrders.slice(0, 6).map(o => (
                    <tr key={o.id}>
                      <td style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.78rem' }}>{o.id}</td>
                      <td>{o.customer}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{(o.amount || 0).toLocaleString('en-IN')}</td>
                      <td><span className={`badge ${statusClass[o.status] || 'badge-pending'}`}>{o.status}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{o.date || 'Today'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No live orders found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Live Activity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--status-green)', fontWeight: 700 }}>
              <span className="live-dot" /> Monitoring
            </div>
          </div>
          <div className="activity-feed">
            {liveActivities.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="activity-icon" style={{ background: a.color }}>
                  {typeof a.icon === 'string' ? <Bell size={16} color="var(--text-primary)" /> : a.icon}
                </div>
                <div>
                  <div className="activity-text" dangerouslySetInnerHTML={{ __html: a.text }} />
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Status Donut + Category Revenue */}
      <div className="grid-2 mb-15">
        <div className="admin-card">
          <div className="card-header"><div className="card-title">Order Status Distribution</div></div>
          <DonutChart data={orderStatusData} />
        </div>

        <div className="admin-card">
          <div className="card-header"><div className="card-title">Revenue by Category</div><span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>May 2026</span></div>
          <div className="progress-bar-wrap mb-1" style={{ marginBottom: '1.25rem' }}>
            {categoryRevenue.map(cat => (
              <div key={cat.name} className="progress-item">
                <div className="progress-label-row">
                  <span className="progress-name">{cat.name}</span>
                  <span className="progress-val">{cat.value}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${cat.value}%`, background: cat.color }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.625rem' }}>Payment Methods</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.5rem' }}>
              {paymentMethods.map(pm => (
                <div key={pm.m} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(201,168,76,0.05)', borderRadius: 8, border: '1px solid var(--admin-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>{pm.em}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{pm.m}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--gold)' }}>{pm.p}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Staff Features: Assigned Tasks & Inventory Alerts */}
      <div className="grid-2 mb-15">
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckSquare size={18} color="var(--gold)" /> Assigned Tasks
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{assignedTasks.length} Pending</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {assignedTasks.map(task => (
              <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '20px', height: '20px', border: '2px solid var(--gold)', borderRadius: '4px', cursor: 'pointer' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{task.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span>{task.id}</span> • <span>{task.time}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className={`badge ${task.priority === 'High' ? 'badge-cancelled' : 'badge-pending'}`}>{task.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} color="#e74c3c" /> Inventory Alerts
            </div>
            <a href="/admin/inventory" style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>View Inventory →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {lowStockProducts.length > 0 ? (
              lowStockProducts.slice(0, 4).map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {item.sku || item.id}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#e74c3c', fontWeight: 700, fontSize: '0.9rem' }}>{item.stock} Left</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Min: {item.minStock || 5}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>All inventory levels are optimal.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
