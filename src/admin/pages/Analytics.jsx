import { useState, useEffect } from 'react';
import { revenueData, categoryRevenue } from '../data/mockData';
import { Calendar, Cpu, Download, DownloadCloud, FileText, FileSpreadsheet, TrendingUp, RefreshCcw, Store, Sparkles, PieChart, DollarSign, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useOrders } from '../../hooks/useOrders';
import { useInventory } from '../../hooks/useInventory';
import { useCustomers } from '../../hooks/useCustomers';

function SimpleLineChart({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  
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
    <div style={{ width: '100%', overflowX: 'auto', padding: '1rem 0', marginTop: '1rem', position: 'relative' }}>
      <svg viewBox={`0 -25 ${width} ${height + 55}`} style={{ width: '100%', minWidth: '600px', height: '280px', overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon 
          fill="url(#lineGrad)" 
          points={`${points} ${width},${height} 0,${height}`} 
          style={{ transition: 'all 0.3s ease' }}
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
          const isHovered = hoverIndex === i;
          
          return (
            <g 
              key={d.month}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: 'crosshair', transition: 'all 0.2s ease' }}
            >
              {/* Vertical Guide Line when hovered */}
              {isHovered && (
                <line x1={x} y1={0} x2={x} y2={height} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4" />
              )}
              
              <circle cx={x} cy={y} r={isHovered ? 8 : 5} fill="var(--gold)" stroke={isHovered ? "#fff" : "var(--surface)"} strokeWidth={isHovered ? 3 : 2} style={{ transition: 'all 0.2s ease' }} />
              
              <text x={x} y={height + 25} fill={isHovered ? "#fff" : "#ccc"} fontSize="12" fontWeight={isHovered ? "bold" : "normal"} textAnchor="middle" style={{ transition: 'all 0.2s ease' }}>{d.month}</text>
              
              {/* Show revenue label - brighter color and bigger if hovered */}
              {isHovered ? (
                <g>
                  <rect x={x - 40} y={y - 45} width="80" height="30" fill="#222" rx="6" stroke="var(--gold)" strokeWidth="1.5" />
                  <text x={x} y={y - 25} fill="#fff" fontSize="13" fontWeight="bold" textAnchor="middle">₹{(d.revenue / 100000).toFixed(1)}L</text>
                </g>
              ) : (
                <text x={x} y={y - 15} fill="#e0e0e0" fontSize="11" fontWeight="bold" textAnchor="middle">₹{(d.revenue / 100000).toFixed(1)}L</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function Analytics() {
  const { user, showToast } = useApp();
  const { orders } = useOrders();
  const { inventory } = useInventory();
  const { customers } = useCustomers();
  const [timeframe, setTimeframe] = useState('Monthly');
  const [liveChartData, setLiveChartData] = useState(revenueData);
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const isManagerOrAbove = ['manager', 'superadmin', 'admin'].includes(user?.role);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveChartData(prev => prev.map(d => ({
        ...d,
        revenue: d.revenue + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 80000)
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Live Calculations from Firebase Data
  const validOrders = orders?.filter(o => !['cancelled', 'refund_pending'].includes(o.status?.toLowerCase())) || [];
  const totalRev = validOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const totalCogs = totalRev * 0.70;
  const grossProfit = totalRev - totalCogs;
  const gpPct = totalRev ? ((grossProfit / totalRev) * 100).toFixed(1) + '%' : '0%';
  const enrolls = validOrders.length;
  const bridalSales = validOrders.filter(o => o.amount >= 100000).reduce((sum, o) => sum + (o.amount || 0), 0);
  const fmtCurr = (val) => `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const currentStats = { 
    rev: fmtCurr(totalRev), 
    cogs: fmtCurr(totalCogs), 
    gp: fmtCurr(grossProfit), 
    opex: fmtCurr(totalRev * 0.1), 
    np: fmtCurr(grossProfit - (totalRev * 0.1)),
    gpPct: gpPct, 
    enrolls: enrolls.toString(), 
    bridal: fmtCurr(bridalSales) 
  };

  const productSales = {};
  validOrders.forEach(o => {
    if (o.product) {
      if (!productSales[o.product]) productSales[o.product] = { n: o.product, v: 0, p: 0 };
      productSales[o.product].v += (o.amount || 0);
      productSales[o.product].p += 1;
    }
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.v - a.v).slice(0, 5).map(p => ({ ...p, v: fmtCurr(p.v), p: `${p.p} units` }));
  const displayTopProducts = topProducts.length > 0 ? topProducts : [{ n: 'No sales data yet', v: '₹0', p: '0 units' }];

  const catRevenues = { 'Diamond Jewellery': 0, 'Gold Jewellery (22KT)': 0, 'Polki & Kundan': 0, 'Silver & Gems': 0 };
  validOrders.forEach(o => {
    const name = (o.product || '').toLowerCase();
    if (name.includes('diamond') || name.includes('platinum')) catRevenues['Diamond Jewellery'] += o.amount || 0;
    else if (name.includes('gold')) catRevenues['Gold Jewellery (22KT)'] += o.amount || 0;
    else if (name.includes('polki') || name.includes('kundan')) catRevenues['Polki & Kundan'] += o.amount || 0;
    else catRevenues['Silver & Gems'] += o.amount || 0;
  });
  const totalCatRev = Object.values(catRevenues).reduce((a, b) => a + b, 0);
  const liveCategoryRevenue = [
    { name: 'Diamond Jewellery', value: totalCatRev ? Math.round((catRevenues['Diamond Jewellery'] / totalCatRev) * 100) : 40, color: '#f39c12' },
    { name: 'Gold Jewellery (22KT)', value: totalCatRev ? Math.round((catRevenues['Gold Jewellery (22KT)'] / totalCatRev) * 100) : 35, color: '#f1c40f' },
    { name: 'Polki & Kundan', value: totalCatRev ? Math.round((catRevenues['Polki & Kundan'] / totalCatRev) * 100) : 15, color: '#e67e22' },
    { name: 'Silver & Gems', value: totalCatRev ? Math.round((catRevenues['Silver & Gems'] / totalCatRev) * 100) : 10, color: '#ecf0f1' }
  ];

  const handleDownloadReport = (reportType) => {
    showToast(`Generating ${reportType}...`);
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>${reportType} - Lumina Jewels</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 2rem; max-width: 800px; margin: 0 auto; }
              h2 { margin: 0; font-family: 'Playfair Display', serif; font-size: 2rem; color: #111; }
              table { width: 100%; border-collapse: collapse; margin-top: 2rem; font-size: 0.9rem; }
              th, td { border-bottom: 1px solid #ddd; padding: 12px 8px; text-align: left; }
              th { background: #f9f9f9; color: #555; font-weight: 600; text-transform: uppercase; font-size: 0.8rem; }
            </style>
          </head>
          <body>
            <h2>LUMINA JEWELS</h2>
            <div style="font-size: 1.2rem; margin-top: 0.5rem; color: #777;">${reportType}</div>
            <div style="margin-top: 1rem; font-size: 0.85rem; color: #999;">Generated on: ${new Date().toLocaleString()} | Timeframe: ${timeframe}</div>
            
            ${reportType === 'Revenue Report' ? `
            <table>
              <tr><th>Metric</th><th>Value</th></tr>
              <tr><td>Total Revenue</td><td>${currentStats.rev}</td></tr>
              <tr><td>Cost of Goods Sold (COGS)</td><td>${currentStats.cogs}</td></tr>
              <tr><td>Gross Profit</td><td>${currentStats.gp}</td></tr>
              <tr><td>Gross Profit Margin</td><td>${currentStats.gpPct}</td></tr>
              <tr><td>Operating Expenses</td><td>${currentStats.opex}</td></tr>
              <tr><td>Net Profit</td><td>${currentStats.np}</td></tr>
            </table>
            ` : reportType === 'Product Performance Report' ? `
            <table>
              <tr><th>Product Category</th><th>Revenue Contribution</th></tr>
              <tr><td>Diamond Jewellery</td><td>${fmtCurr(catRevenues['Diamond Jewellery'])}</td></tr>
              <tr><td>Gold Jewellery (22KT)</td><td>${fmtCurr(catRevenues['Gold Jewellery (22KT)'])}</td></tr>
              <tr><td>Polki & Kundan</td><td>${fmtCurr(catRevenues['Polki & Kundan'])}</td></tr>
              <tr><td>Silver & Gems</td><td>${fmtCurr(catRevenues['Silver & Gems'])}</td></tr>
            </table>
            ` : reportType === 'Inventory Report' ? `
            <table>
              <tr><th>SKU</th><th>Product Name</th><th>Warehouse</th><th>Current Stock</th><th>Status</th></tr>
              ${inventory.map(item => `<tr><td>${item.sku}</td><td>${item.name}</td><td>${item.warehouse}</td><td>${item.stock}</td><td>${item.status.toUpperCase()}</td></tr>`).join('')}
            </table>
            ` : reportType === 'Customer Activity Report' ? `
            <table>
              <tr><th>Customer Metric</th><th>Value</th></tr>
              <tr><td>Total Registered Customers</td><td>${(customers || []).filter(c => c.role === 'customer').length}</td></tr>
              <tr><td>Active VIP Members</td><td>${(customers || []).filter(c => c.role === 'customer' && c.status === 'vip').length}</td></tr>
              <tr><td>Total Loyalty Points Issued</td><td>${(customers || []).filter(c => c.role === 'customer').reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0).toLocaleString()} pts</td></tr>
              <tr><td>Repeat Purchasers</td><td>${(customers || []).filter(c => c.role === 'customer' && c.totalOrders > 1).length}</td></tr>
            </table>
            ` : `
            <table>
              <tr><th>Sales Metric</th><th>Value</th></tr>
              <tr><td>Total Sales Value</td><td>${currentStats.rev}</td></tr>
              <tr><td>Total Transactions</td><td>${currentStats.enrolls}</td></tr>
              <tr><td>Bridal Sales Contribution</td><td>${currentStats.bridal}</td></tr>
            </table>
            `}
            
            <p style="margin-top: 3rem; text-align: center; color: #aaa; font-size: 0.75rem;">Confidential Financial Document - Authorized Personnel Only</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }, 800);
  };

  const handleGenerateForecast = () => {
    setIsGeneratingForecast(true);
    showToast("Analyzing historical data and seasonal market trends...");
    setTimeout(() => {
      setForecastData({
        surge: "18.5%",
        target: "Bridal & Kundan Collections",
        season: "Upcoming Q3 Festive Season",
        projectedRevenue: "₹3.8 Cr",
        actions: [
          "Increase inventory for Polki Kundan sets by 25%.",
          "Launch targeted email campaign for past engagement ring buyers.",
          "Optimize homepage banner for Bridal Collections.",
          "Adjust pricing dynamically on high-demand festive pieces."
        ]
      });
      setIsGeneratingForecast(false);
      showToast("Financial Forecasting Complete!");
    }, 2500);
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Analytics & AI Reports</h1>
          <p className="page-subtitle">Deep dive into sales performance, customer behavior, and predictive insights.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          {['Daily', 'Monthly', 'Yearly'].map(tf => (
            <button 
              key={tf}
              className={`btn btn-sm ${timeframe === tf ? 'btn-gold' : 'btn-outline'}`} 
              onClick={() => setTimeframe(tf)}
              style={timeframe === tf ? { background: 'var(--gold)', color: '#000' } : {}}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {isManagerOrAbove && (
        <div className="admin-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(90deg, var(--surface), rgba(201,168,76,0.05))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
               <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                 <DownloadCloud size={18} color="var(--gold)" /> Report Generation Studio
               </h3>
               <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Export critical business data in CSV or PDF formats.</p>
             </div>
             <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
               <button className="btn btn-outline btn-sm" onClick={() => handleDownloadReport('Sales Report')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FileText size={14} /> Sales Report</button>
               <button className="btn btn-outline btn-sm" onClick={() => handleDownloadReport('Revenue Report')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FileSpreadsheet size={14} /> Revenue Report</button>
               <button className="btn btn-outline btn-sm" onClick={() => handleDownloadReport('Product Performance Report')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Store size={14} /> Product Performance</button>
               <button className="btn btn-outline btn-sm" onClick={() => handleDownloadReport('Inventory Report')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Package size={14} /> Inventory</button>
               <button className="btn btn-outline btn-sm" onClick={() => handleDownloadReport('Customer Activity Report')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Sparkles size={14} /> Customer Activity</button>
             </div>
          </div>
        </div>
      )}

      {isManagerOrAbove && (
        <div className="grid-4 mb-15">
          <div className="admin-card text-center" style={{ padding: '1.5rem' }}>
             <div className="icon-wrapper" style={{ margin: '0 auto 1rem', background: 'rgba(201,168,76,0.1)' }}>
               <FileText color="var(--gold)" />
             </div>
             <div style={{ fontSize: '1.5rem', fontWeight: 600, fontFamily: 'Inter' }}>{currentStats.enrolls}</div>
             <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Scheme Enrollments ({timeframe})</div>
          </div>
          <div className="admin-card text-center" style={{ padding: '1.5rem' }}>
             <div className="icon-wrapper" style={{ margin: '0 auto 1rem', background: 'rgba(201,168,76,0.1)' }}>
               <DollarSign color="var(--gold)" />
             </div>
             <div style={{ fontSize: '1.5rem', fontWeight: 600, fontFamily: 'Inter' }}>{currentStats.rev}</div>
             <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Revenue ({timeframe})</div>
          </div>
          <div className="admin-card text-center" style={{ padding: '1.5rem' }}>
             <div className="icon-wrapper" style={{ margin: '0 auto 1rem', background: 'rgba(46, 204, 113, 0.1)' }}>
               <TrendingUp color="#2ecc71" />
             </div>
             <div style={{ fontSize: '1.5rem', fontWeight: 600, fontFamily: 'Inter', color: '#2ecc71' }}>{currentStats.gpPct}</div>
             <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gross Profit Margin ({timeframe})</div>
          </div>
          <div className="admin-card text-center" style={{ padding: '1.5rem' }}>
             <div className="icon-wrapper" style={{ margin: '0 auto 1rem', background: 'rgba(155, 89, 182, 0.1)' }}>
               <Sparkles color="#9b59b6" />
             </div>
             <div style={{ fontSize: '1.5rem', fontWeight: 600, fontFamily: 'Inter' }}>{currentStats.bridal}</div>
             <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Bridal Sales Analytics ({timeframe})</div>
          </div>
        </div>
      )}

      <div className="grid-2-1 mb-15">
        <div className="admin-card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="card-title">Comprehensive Revenue Analysis <span className="live-dot" style={{marginLeft: '0.5rem', display: 'inline-block'}}></span> <span style={{fontSize: '0.7rem', color: 'var(--status-green)'}}>LIVE</span></div>
              <div className="card-subtitle">Real-time tracking of revenue trends</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
               <button className="btn btn-outline btn-sm" onClick={() => handleDownloadReport(`${timeframe} Analysis Report`)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}><Download size={12} /> {timeframe} Report</button>
            </div>
          </div>
          <SimpleLineChart data={liveChartData} />
        </div>

        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Top Selling Products</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {displayTopProducts.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{i+1}. {p.n}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{p.p}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.85rem' }}>{p.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2 mb-15">
         <div className="ai-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="ai-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Cpu size={24} color="var(--gold)" />
              <div>
                <div className="ai-badge">AI Predictive Analytics</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Financial & Seasonal Forecasting</div>
              </div>
            </div>
            {!forecastData && (
              <button className="btn btn-gold btn-sm" onClick={handleGenerateForecast} disabled={isGeneratingForecast} style={{ color: '#000', fontWeight: 700 }}>
                {isGeneratingForecast ? 'Generating...' : 'Run Forecast'}
              </button>
            )}
          </div>
          
          {forecastData ? (
            <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Based on historical spending data and seasonal trends, our AI predicts an <strong>{forecastData.surge} surge</strong> in {forecastData.target} for the {forecastData.season}.
                <br/><br/>
                Projected Q3 Revenue: <strong style={{ color: 'var(--status-green)', fontSize: '1rem' }}>{forecastData.projectedRevenue}</strong>
              </p>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                 <div style={{ fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '0.5rem', fontWeight: 600 }}>Recommended Strategic Actions:</div>
                 <ul style={{ fontSize: '0.75rem', color: 'var(--text-primary)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {forecastData.actions.map((action, i) => (
                      <li key={i} style={{ listStyleType: 'square', color: 'var(--text-muted)' }}><span style={{ color: 'var(--text-primary)' }}>{action}</span></li>
                    ))}
                 </ul>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setForecastData(null)} style={{ marginTop: '1rem', width: '100%' }}>Reset Forecast Model</button>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem', textAlign: 'center', opacity: isGeneratingForecast ? 0.5 : 1 }}>
              <Sparkles size={32} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Ready to generate predictions</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Run the AI forecast engine to analyze seasonal sales trends, customer spending patterns, and project future revenue.</p>
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={18} color="var(--gold)" /> Category-wise Earnings
            </div>
          </div>
          <div className="progress-bar-wrap" style={{ marginTop: '1rem' }}>
            {liveCategoryRevenue.map((cat, idx) => (
              <div key={idx} className="progress-item">
                 <div className="progress-label-row">
                   <span className="progress-name">{cat.name}</span>
                   <span className="progress-val">{cat.value}%</span>
                 </div>
                 <div className="progress-track">
                   <div className="progress-fill" style={{ width: `${cat.value}%`, background: cat.color }}></div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
