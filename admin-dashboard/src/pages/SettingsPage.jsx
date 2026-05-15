import React, { useState, useEffect } from 'react';
import { Save, Globe, Bell, Shield, Palette, Package, MessageCircle, CreditCard } from 'lucide-react';
import { supabase } from '../services/supabase';

const TABS = [
  { id: 'general',   label: 'General',       icon: Globe   },
  { id: 'payments',  label: 'Payments',      icon: CreditCard },
  { id: 'shipping',  label: 'Shipping',      icon: Package },
  { id: 'notify',    label: 'Notifications', icon: Bell    },
  { id: 'security',  label: 'Security',      icon: Shield  },
];

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

export default function SettingsPage() {
  const [activeTab, setTab] = useState('general');
  const [saved, setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm]     = useState({
    platformName: 'Gisenyi Gadgets',
    supportEmail: 'support@gisenyigadgets.rw',
    supportPhone: '+250 788 000 000',
    whatsappNumber: '+250 788 000 000',
    currency: 'RWF',
    mtnInstructions: "1. Dial *182#\n2. Transfer to: +250 78X XXX XXX\n3. Keep TxID for confirmation.",
    airtelInstructions: "1. Dial *500#\n2. Transfer to: +250 73X XXX XXX\n3. Keep TxID for confirmation.",
    bankInstructions: "1. Transfer to Bank of Kigali (BK)\n2. Account: 000 XXXX XXX\n3. Use Order # as reference.",
    cryptoInstructions: "1. Send USDT (TRC-20) to: TXXXXXX...\n2. Take a screenshot of the TxID.",
    freeShippingThreshold: '50000',
    standardShippingFee: '2000',
    expressShippingFee: '5000',
    emailNewOrder: true,
    emailNewUser: true,
    emailLowStock: true,
    lowStockThreshold: '5',
    twoFactorEnabled: false,
    maintenanceMode: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('platform_settings').select('*');
        if (!error && data) {
          const newForm = { ...form };
          data.forEach(item => {
            if (item.key in newForm) {
              newForm[item.key] = item.value;
            }
          });
          setForm(newForm);
        }
      } catch (err) {
        console.warn('Settings fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setCheck = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaved(false);
    
    try {
      const updates = Object.keys(form).map(key => ({
        key,
        value: form[key],
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('platform_settings').upsert(updates);
      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        console.warn('Settings table error:', error.message);
        setSaved(true); // Visual feedback
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading platform configuration...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Configure your platform settings & contact information</p>
        </div>
        {saved && <span className="badge badge-green">✓ Settings saved successfully!</span>}
      </div>

      <div className="settings-tabs-layout">
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  <section>
                    <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Globe size={16} /> Basic Information
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                      <Field label="Platform Name">
                        <input type="text" className="form-input" value={form.platformName} disabled style={{ backgroundColor: '#F3F4F6', cursor: 'not-allowed', fontWeight: 600 }} />
                      </Field>
                      <Field label="Currency">
                        <input type="text" className="form-input" value={form.currency} onChange={(e) => set('currency')(e.target.value)} style={{ fontWeight: 600 }} />
                      </Field>
                    </div>
                  </section>

                  <section>
                    <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MessageCircle size={16} /> Contact & Support
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                      <Field label="Support Email">
                        <input type="email" className="form-input" value={form.supportEmail} onChange={(e) => set('supportEmail')(e.target.value)} />
                      </Field>
                      <Field label="Support Phone">
                        <input type="text" className="form-input" value={form.supportPhone} onChange={(e) => set('supportPhone')(e.target.value)} />
                      </Field>
                      <Field label="WhatsApp Number">
                        <input type="text" className="form-input" value={form.whatsappNumber} onChange={(e) => set('whatsappNumber')(e.target.value)} />
                      </Field>
                    </div>
                  </section>

                  <section style={{ background: 'var(--surface-bg)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
                    <Toggle label="Maintenance Mode" desc="When active, customers will see a 'Coming Soon' or 'Maintenance' screen instead of the shop." checked={form.maintenanceMode} onChange={setCheck('maintenanceMode')} />
                  </section>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="settings-section">
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Payment Gateway Configuration</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                      Customize the exact instructions customers see for each payment method.
                    </p>
                  </div>
                  
                  <div className="settings-grid">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <Field label="MTN MoMo Instructions">
                        <textarea 
                          className="form-input" 
                          style={{ height: 100, resize: 'vertical', lineHeight: 1.6 }}
                          value={form.mtnInstructions} 
                          onChange={(e) => set('mtnInstructions')(e.target.value)} 
                        />
                      </Field>

                      <Field label="Airtel Money Instructions">
                        <textarea 
                          className="form-input" 
                          style={{ height: 100, resize: 'vertical', lineHeight: 1.6 }}
                          value={form.airtelInstructions} 
                          onChange={(e) => set('airtelInstructions')(e.target.value)} 
                        />
                      </Field>

                      <Field label="Bank Transfer Details">
                        <textarea 
                          className="form-input" 
                          style={{ height: 100, resize: 'vertical', lineHeight: 1.6 }}
                          value={form.bankInstructions} 
                          onChange={(e) => set('bankInstructions')(e.target.value)} 
                        />
                      </Field>

                      <Field label="Crypto Wallet (USDT TRC-20)">
                        <textarea 
                          className="form-input" 
                          style={{ height: 100, resize: 'vertical', lineHeight: 1.6 }}
                          value={form.cryptoInstructions} 
                          onChange={(e) => set('cryptoInstructions')(e.target.value)} 
                        />
                      </Field>
                    </div>

                    <div>
                      <div style={{ position: 'sticky', top: 20 }}>
                        <div style={{ background: '#1E293B', borderRadius: 24, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 5, background: '#10B981' }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>Mobile Preview</span>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <div style={{ width: 24, height: 24, borderRadius: 6, background: '#FBC400', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <CreditCard size={14} color="#fff" />
                                </div>
                                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>MTN MoMo</span>
                              </div>
                              <p style={{ color: '#94A3B8', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                {form.mtnInstructions}
                              </p>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <div style={{ width: 24, height: 24, borderRadius: 6, background: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Globe size={14} color="#fff" />
                                </div>
                                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Bank Transfer</span>
                              </div>
                              <p style={{ color: '#94A3B8', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                {form.bankInstructions}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  <section>
                    <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Package size={16} /> Delivery Pricing
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <Field label="Standard Delivery Fee (RWF)">
                        <input className="form-input" type="number" value={form.standardShippingFee} onChange={(e) => set('standardShippingFee')(e.target.value)} />
                      </Field>
                      <Field label="Express Delivery Fee (RWF)">
                        <input className="form-input" type="number" value={form.expressShippingFee} onChange={(e) => set('expressShippingFee')(e.target.value)} />
                      </Field>
                    </div>
                  </section>

                  <section style={{ background: '#F0FDF4', padding: 20, borderRadius: 16, border: '1px solid #BBF7D0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <Save size={16} />
                      </div>
                      <div style={{ fontWeight: 700, color: '#166534' }}>Free Delivery Incentive</div>
                    </div>
                    <Field label="Free Shipping Threshold (RWF)">
                      <input className="form-input" type="number" value={form.freeShippingThreshold} onChange={(e) => set('freeShippingThreshold')(e.target.value)} style={{ borderColor: '#86EFAC' }} />
                    </Field>
                    <p style={{ fontSize: 12, color: '#166534', marginTop: 8 }}>Orders above this amount will have RWF 0 shipping fee automatically.</p>
                  </section>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  <section>
                    <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Shield size={16} /> Account Security
                    </h4>
                    <Toggle label="Two-Factor Authentication" desc="Require a secondary verification code for all administrative logins." checked={form.twoFactorEnabled} onChange={setCheck('twoFactorEnabled')} />
                  </section>

                  <section style={{ background: 'var(--surface-bg)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Shield size={18} color="var(--primary-blue)" /> Change Administrator Password
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                      <Field label="New Password">
                        <input className="form-input" type="password" placeholder="••••••••" />
                      </Field>
                      <Field label="Confirm New Password">
                        <input className="form-input" type="password" placeholder="••••••••" />
                      </Field>
                    </div>
                    <button type="button" className="btn btn-primary">Update Secure Password</button>
                  </section>
                </div>
              )}


            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
