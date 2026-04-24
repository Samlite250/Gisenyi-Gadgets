import React, { useState } from 'react';
import { Save, Globe, Bell, Shield, Palette, Package } from 'lucide-react';

const TABS = [
  { id: 'general',   label: 'General',       icon: Globe   },
  { id: 'shipping',  label: 'Shipping',      icon: Package },
  { id: 'notify',    label: 'Notifications', icon: Bell    },
  { id: 'security',  label: 'Security',      icon: Shield  },
  { id: 'appearance',label: 'Appearance',    icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setTab] = useState('general');
  const [saved, setSaved]   = useState(false);
  const [form, setForm]     = useState({
    platformName: 'Gisenyi Gadgets',
    supportEmail: 'support@gisenyigadgets.rw',
    supportPhone: '+250 788 000 000',
    currency: 'RWF',
    country: 'Rwanda',
    freeShippingThreshold: '50000',
    standardShippingFee: '2000',
    expressShippingFee: '5000',
    emailNewOrder: true,
    emailNewUser: true,
    emailLowStock: true,
    lowStockThreshold: '5',
    twoFactorEnabled: false,
    maintenanceMode: false,
    primaryColor: '#4285F4',
    accentColor: '#34A853',
  });

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setCheck = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Field = ({ label, children }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, checked, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>}
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{ position: 'absolute', inset: 0, background: checked ? 'var(--primary-blue)' : 'var(--border)', borderRadius: 12, transition: 'background 0.2s' }}>
          <span style={{ position: 'absolute', width: 18, height: 18, background: '#fff', borderRadius: '50%', top: 3, left: checked ? 23 : 3, transition: 'left 0.2s' }} />
        </span>
      </label>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Configure your platform settings</p>
        </div>
        {saved && <span className="badge badge-green">✓ Settings saved!</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
        {/* Tab Sidebar */}
        <div className="card" style={{ padding: 8, alignSelf: 'start' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`nav-item ${activeTab === id ? 'nav-item-active' : ''}`}
              style={{ width: '100%', borderRadius: 8, marginBottom: 2 }}
            >
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card">
          <form onSubmit={handleSave}>
            <div className="card-header">
              <span className="card-title">{TABS.find(t => t.id === activeTab)?.label} Settings</span>
              <button type="submit" className="btn btn-primary btn-sm"><Save size={14} /> Save Changes</button>
            </div>
            <div className="card-body">
              {activeTab === 'general' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="Platform Name"><input className="input" value={form.platformName} onChange={(e) => set('platformName')(e.target.value)} /></Field>
                  <Field label="Currency"><select className="input" value={form.currency} onChange={(e) => set('currency')(e.target.value)}><option>RWF</option><option>USD</option><option>EUR</option></select></Field>
                  <Field label="Support Email"><input className="input" type="email" value={form.supportEmail} onChange={(e) => set('supportEmail')(e.target.value)} /></Field>
                  <Field label="Support Phone"><input className="input" value={form.supportPhone} onChange={(e) => set('supportPhone')(e.target.value)} /></Field>
                  <Field label="Country"><input className="input" value={form.country} onChange={(e) => set('country')(e.target.value)} /></Field>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Toggle label="Maintenance Mode" desc="Hides the app from customers" checked={form.maintenanceMode} onChange={setCheck('maintenanceMode')} />
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="Free Shipping Threshold (RWF)"><input className="input" type="number" value={form.freeShippingThreshold} onChange={(e) => set('freeShippingThreshold')(e.target.value)} /></Field>
                  <Field label="Standard Shipping Fee (RWF)"><input className="input" type="number" value={form.standardShippingFee} onChange={(e) => set('standardShippingFee')(e.target.value)} /></Field>
                  <Field label="Express Shipping Fee (RWF)"><input className="input" type="number" value={form.expressShippingFee} onChange={(e) => set('expressShippingFee')(e.target.value)} /></Field>
                </div>
              )}

              {activeTab === 'notify' && (
                <div>
                  <Toggle label="New Order Notifications"  desc="Get notified when a new order is placed"         checked={form.emailNewOrder}  onChange={setCheck('emailNewOrder')} />
                  <Toggle label="New User Registrations"   desc="Get notified when a new customer registers"      checked={form.emailNewUser}   onChange={setCheck('emailNewUser')}  />
                  <Toggle label="Low Stock Alerts"         desc="Get notified when product stock is running low"  checked={form.emailLowStock}  onChange={setCheck('emailLowStock')} />
                  <div style={{ marginTop: 16 }}>
                    <Field label="Low Stock Threshold (units)"><input className="input" type="number" value={form.lowStockThreshold} onChange={(e) => set('lowStockThreshold')(e.target.value)} style={{ maxWidth: 120 }} /></Field>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <Toggle label="Two-Factor Authentication" desc="Require 2FA for admin logins" checked={form.twoFactorEnabled} onChange={setCheck('twoFactorEnabled')} />
                  <div style={{ marginTop: 24 }}>
                    <div style={{ background: 'var(--surface-bg)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                      <div style={{ fontWeight: 700, marginBottom: 8 }}>Change Admin Password</div>
                      <div style={{ display: 'grid', gap: 12 }}>
                        <Field label="Current Password"><input className="input" type="password" placeholder="••••••••" /></Field>
                        <Field label="New Password"><input className="input" type="password" placeholder="••••••••" /></Field>
                        <Field label="Confirm New Password"><input className="input" type="password" placeholder="••••••••" /></Field>
                        <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Update Password</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="Primary Color">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={form.primaryColor} onChange={(e) => set('primaryColor')(e.target.value)} style={{ width: 48, height: 38, border: 'none', background: 'none', cursor: 'pointer' }} />
                      <input className="input" value={form.primaryColor} onChange={(e) => set('primaryColor')(e.target.value)} style={{ fontFamily: 'monospace' }} />
                    </div>
                  </Field>
                  <Field label="Accent / Success Color">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={form.accentColor} onChange={(e) => set('accentColor')(e.target.value)} style={{ width: 48, height: 38, border: 'none', background: 'none', cursor: 'pointer' }} />
                      <input className="input" value={form.accentColor} onChange={(e) => set('accentColor')(e.target.value)} style={{ fontFamily: 'monospace' }} />
                    </div>
                  </Field>
                  <div style={{ gridColumn: '1 / -1', background: 'var(--surface-bg)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Preview</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ background: form.primaryColor, color: '#fff', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>Primary Button</div>
                      <div style={{ background: form.accentColor,  color: '#fff', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>Success Button</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
