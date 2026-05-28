import React, { useState } from 'react';
import { Save, Plus, Trash2, Globe, Percent, Tag, Zap } from 'lucide-react';

const FEATURES = [
  { id:'whatsapp_invoices', name:'WhatsApp Invoice Sending',  desc:'Allow stores to send bills via WhatsApp Business API', enabled:true,  plan:'Pro+'      },
  { id:'gst_reports',       name:'Automated GST Reports',     desc:'Monthly GST report generation and filing assistance',  enabled:true,  plan:'All'       },
  { id:'barcode_rfid',      name:'Barcode & RFID Tagging',   desc:'Barcode generation and RFID tag assignment for items',  enabled:true,  plan:'Pro+'      },
  { id:'loyalty_points',    name:'Customer Loyalty Points',   desc:'Points-based loyalty program for customer retention',   enabled:false, plan:'Enterprise'},
  { id:'multi_location',    name:'Multi-Location Inventory',  desc:'Manage inventory across multiple store locations',      enabled:true,  plan:'Enterprise'},
  { id:'api_access',        name:'REST API Access',           desc:'Full API access for custom integrations and ERP sync',  enabled:false, plan:'Enterprise'},
  { id:'sms_alerts',        name:'SMS Notifications',         desc:'Low stock and sales alerts via SMS gateway',            enabled:true,  plan:'All'       },
  { id:'attendance',        name:'Staff Attendance Module',   desc:'Digital attendance tracking for employees',             enabled:false, plan:'Enterprise'},
];

const GST_RATES = [
  { category:'Gold & Gold Jewellery',        hsnCode:'7113',   gst:3,  cess:0 },
  { category:'Silver Jewellery',             hsnCode:'7113',   gst:3,  cess:0 },
  { category:'Diamond & Precious Stones',    hsnCode:'7102',   gst:0.25, cess:0 },
  { category:'Imitation Jewellery',          hsnCode:'7117',   gst:3,  cess:0 },
  { category:'Making Charges (Service)',     hsnCode:'998898', gst:5,  cess:0 },
  { category:'Platinum',                     hsnCode:'7110',   gst:3,  cess:0 },
];

const ToggleSwitch = ({ enabled, onChange }) => (
  <div onClick={onChange} style={{ width:40, height:22, borderRadius:99, flexShrink:0, cursor:'pointer', background:enabled?'linear-gradient(135deg,#8463fa,#5b3fd4)':'rgba(255,255,255,0.1)', position:'relative', transition:'background 0.2s' }}>
    <div style={{ width:16, height:16, borderRadius:'50%', background:'white', position:'absolute', top:3, left:enabled?21:3, transition:'left 0.2s' }} />
  </div>
);

const SuperAdminConfig = () => {
  const [features, setFeatures] = useState(FEATURES);
  const [gst, setGst] = useState(GST_RATES);
  const [activeTab, setActiveTab] = useState('features');
  const [saved, setSaved] = useState(false);

  const toggleFeature = id => setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const tabs = [
    { id:'features', label:'Feature Flags', icon:Zap    },
    { id:'gst',      label:'GST Rules',     icon:Percent },
    { id:'platform', label:'Platform',      icon:Globe   },
  ];

  return (
    <div className="admin-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Config & GST</h1><p className="page-subtitle">System settings, GST configuration and feature management</p></div>
        <button className="admin-btn" style={{ background:'linear-gradient(135deg,#8463fa,#5b3fd4)', color:'#fff' }} onClick={handleSave}>
          <Save size={14} /> {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tab Bar */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem', background:'rgba(255,255,255,0.02)', borderRadius:12, padding:'0.4rem', width:'fit-content' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 1.25rem', borderRadius:9, fontSize:'0.82rem', fontWeight:600, cursor:'pointer', border:'none', background:activeTab===t.id?'rgba(132,99,250,0.2)':'transparent', color:activeTab===t.id?'#a78bfa':'rgba(232,224,208,0.45)', transition:'all 0.2s' }}>
              <Icon size={15} />{t.label}
            </button>
          );
        })}
      </div>

      {/* Feature Flags */}
      {activeTab === 'features' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {features.map(f => (
            <div key={f.id} className="admin-card" style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1.1rem 1.5rem' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                  <p style={{ margin:0, fontWeight:700, color:'#f0ebe0', fontSize:'0.875rem' }}>{f.name}</p>
                  <span className="badge badge-gray" style={{ fontSize:'0.6rem' }}>{f.plan}</span>
                </div>
                <p style={{ margin:'0.2rem 0 0', fontSize:'0.78rem', color:'rgba(232,224,208,0.45)' }}>{f.desc}</p>
              </div>
              <ToggleSwitch enabled={f.enabled} onChange={() => toggleFeature(f.id)} />
            </div>
          ))}
        </div>
      )}

      {/* GST Rules */}
      {activeTab === 'gst' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <p style={{ margin:0, fontSize:'0.82rem', color:'rgba(232,224,208,0.5)' }}>GST rates as per Indian Finance Act for jewellery categories</p>
            <button className="admin-btn admin-btn-outline" style={{ fontSize:'0.75rem', padding:'0.4rem 0.85rem' }}>
              <Plus size={12} /> Add Category
            </button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Category</th><th>HSN Code</th><th>GST Rate (%)</th><th>Cess (%)</th><th>Total Tax</th></tr></thead>
              <tbody>
                {gst.map((g, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:600, color:'#f0ebe0' }}>{g.category}</td>
                    <td style={{ fontFamily:'monospace', fontSize:'0.8rem', color:'rgba(167,139,250,0.7)' }}>{g.hsnCode}</td>
                    <td>
                      <input type="number" defaultValue={g.gst} step="0.01" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'0.35rem 0.6rem', color:'#f0ebe0', width:70, fontSize:'0.82rem', fontWeight:700 }} />
                    </td>
                    <td>
                      <input type="number" defaultValue={g.cess} step="0.01" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'0.35rem 0.6rem', color:'#f0ebe0', width:70, fontSize:'0.82rem', fontWeight:700 }} />
                    </td>
                    <td><span className="badge badge-gold">{(g.gst + g.cess)}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Platform Settings */}
      {activeTab === 'platform' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
          {[
            { label:'Platform Name',        val:'LuxeOrbit',      type:'text'   },
            { label:'Support Email',         val:'support@luxeorbit.com', type:'email' },
            { label:'Trial Period (days)',   val:'30',            type:'number' },
            { label:'Max Users (Basic)',     val:'1',             type:'number' },
            { label:'Max Users (Pro)',       val:'5',             type:'number' },
            { label:'Max Inventory (Basic)', val:'500',           type:'number' },
            { label:'Maintenance Mode',      val:'Off',           type:'text'   },
            { label:'Support Phone',         val:'+91 800 123 4567', type:'text' },
          ].map(f => (
            <div key={f.label} className="admin-form-group" style={{ marginBottom:0 }}>
              <label className="admin-form-label">{f.label}</label>
              <input className="admin-form-input" type={f.type} defaultValue={f.val} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperAdminConfig;
