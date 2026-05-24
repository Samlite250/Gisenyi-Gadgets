import React, { useState, useEffect } from 'react';
import { Save, Globe, Bell, Shield, Package, MessageCircle, CreditCard, Mail, Phone, MessageSquare, Send, Zap, Upload, Banknote } from 'lucide-react';
import { supabase } from '../services/supabase';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';


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
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  // Notification composer state
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [notificationType, setNotificationType] = useState('general');
  const [sendingNotification, setSendingNotification] = useState(false);
  const [form, setForm]     = useState({
    platformName: '',
    supportEmail: '',
    supportPhone: '',
    whatsappNumber: '',
    currency: '',
    mtnNumber: '',
    mtnAccountName: '',
    airtelNumber: '',
    airtelAccountName: '',
    mtnInstructions: '',
    airtelInstructions: '',
    bankInstructions: '',
    cryptoInstructions: '',
    freeShippingThreshold: '',
    standardShippingFee: '',
    expressShippingFee: '',
    emailNewOrder: false,
    emailNewUser: false,
    emailLowStock: false,
    lowStockThreshold: '',
    twoFactorEnabled: false,
    maintenanceMode: false,
  });

  // Payment method toggles (separate from platform_settings)
  const [paymentSettings, setPaymentSettings] = useState({
    automatic_enabled: false,
    manual_enabled: true,
    cash_enabled: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch platform settings
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

        // Fetch payment method settings
        const { data: paymentData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'payment_methods')
          .single();

        if (paymentData?.value) {
          setPaymentSettings(paymentData.value);
        }
      } catch (err) {
        // // console.warn('Settings fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setCheck = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  const ALLOWED_KEYS = new Set([
    'platformName','supportEmail','supportPhone','whatsappNumber','currency',
    'mtnNumber','mtnAccountName','airtelNumber','airtelAccountName',
    'mtnInstructions','airtelInstructions','bankInstructions','cryptoInstructions',
    'freeShippingThreshold','standardShippingFee','expressShippingFee',
    'emailNewOrder','emailNewUser','emailLowStock','lowStockThreshold',
    'twoFactorEnabled','maintenanceMode',
  ]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaved(false);
    try {
      const updates = Object.keys(form)
        .filter(key => ALLOWED_KEYS.has(key))
        .map(key => ({ key, value: form[key], updated_at: new Date().toISOString() }));

      const { error } = await supabase.from('platform_settings').upsert(updates);
      if (error) {
        toast.error('Failed to save: ' + error.message);
      } else {
        setSaved(true);
        toast.success('Settings saved!');
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      toast.error('Save error: ' + (err.message || 'Unknown error'));
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) return toast.error('Please fill both password fields.');
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match.');
    setChangingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error('Failed to update password: ' + err.message);
    } finally {
      setChangingPw(false);
    }
  };

  const handlePaymentToggle = async (key) => {
    const newSettings = { ...paymentSettings, [key]: !paymentSettings[key] };
    setPaymentSettings(newSettings);

    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: newSettings })
        .eq('key', 'payment_methods');

      if (error) throw error;

      toast.success('Payment settings updated!');
    } catch (err) {
      toast.error('Failed to save payment settings');
      // Revert on error
      setPaymentSettings(paymentSettings);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationTitle.trim()) return toast.error('Please enter a notification title.');
    if (!notificationBody.trim()) return toast.error('Please enter notification content.');

    setSendingNotification(true);

    try {
      // Get all customer users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'customer')
        .eq('is_active', true);

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        toast.error('No active customers found to notify.');
        setSendingNotification(false);
        return;
      }

      // Create notification for each user
      const notifications = users.map(user => ({
        user_id: user.id,
        title: notificationTitle.trim(),
        body: notificationBody.trim(),
        type: notificationType,
        is_read: false,
        created_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) throw insertError;

      toast.success(`Notification sent to ${users.length} user${users.length !== 1 ? 's' : ''}!`);

      // Clear form
      setNotificationTitle('');
      setNotificationBody('');
      setNotificationType('general');
    } catch (err) {
      toast.error('Failed to send notification: ' + err.message);
    } finally {
      setSendingNotification(false);
    }
  };

  if (loading) return <Loader message="Loading platform configuration..." />;

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

                  <section style={{
                    background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid #BAE6FD',
                    width: '100%',
                    maxWidth: '100%'
                  }}>
                    <h4 style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#0369A1',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      marginBottom: 24,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10
                    }}>
                      <MessageCircle size={18} /> Contact & Support Information
                    </h4>
                    <div className="contact-support-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                      gap: 24,
                      width: '100%'
                    }}>
                      <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 24,
                        border: '1px solid #E0F2FE',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        minHeight: 160,
                        width: '100%'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 10,
                          color: '#3B82F6',
                          fontWeight: 700,
                          fontSize: 12,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}>
                          <Mail size={16} />
                          <span>Support Email</span>
                        </div>
                        <input
                          type="email"
                          className="form-input"
                          value={form.supportEmail}
                          onChange={(e) => set('supportEmail')(e.target.value)}
                          placeholder="support@example.com"
                          style={{
                            borderColor: '#BFDBFE',
                            fontSize: 15,
                            fontWeight: 600,
                            padding: '12px 16px',
                            width: '100%'
                          }}
                        />
                      </div>

                      <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 24,
                        border: '1px solid #E0F2FE',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        minHeight: 160,
                        width: '100%'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 10,
                          color: '#10B981',
                          fontWeight: 700,
                          fontSize: 12,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}>
                          <Phone size={16} />
                          <span>Support Phone</span>
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          value={form.supportPhone}
                          onChange={(e) => set('supportPhone')(e.target.value)}
                          placeholder="+250 780 000 000"
                          style={{
                            borderColor: '#BFDBFE',
                            fontSize: 15,
                            fontWeight: 600,
                            padding: '12px 16px',
                            width: '100%'
                          }}
                        />
                      </div>

                      <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 24,
                        border: '1px solid #E0F2FE',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        minHeight: 160,
                        width: '100%'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 10,
                          color: '#22C55E',
                          fontWeight: 700,
                          fontSize: 12,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}>
                          <MessageSquare size={16} />
                          <span>WhatsApp Number</span>
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          value={form.whatsappNumber}
                          onChange={(e) => set('whatsappNumber')(e.target.value)}
                          placeholder="+250 780 000 000"
                          style={{
                            borderColor: '#BFDBFE',
                            fontSize: 15,
                            fontWeight: 600,
                            padding: '12px 16px',
                            width: '100%'
                          }}
                        />
                      </div>
                    </div>
                    <div style={{
                      marginTop: 16,
                      padding: 12,
                      background: 'rgba(59, 130, 246, 0.08)',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#1E40AF',
                      lineHeight: 1.6
                    }}>
                      <strong>💡 Tip:</strong> This information will be displayed to customers in the mobile app for support inquiries.
                    </div>
                  </section>

                  <section style={{ background: 'var(--surface-bg)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
                    <Toggle label="Maintenance Mode" desc="When active, customers will see a 'Coming Soon' or 'Maintenance' screen instead of the shop." checked={form.maintenanceMode} onChange={setCheck('maintenanceMode')} />
                  </section>
                </div>
              )}

              {activeTab === 'payments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  {/* Payment Method Visibility Controls */}
                  <section style={{
                    background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
                    borderRadius: 16,
                    padding: 24,
                    border: '1.5px solid #3B82F6'
                  }}>
                    <h4 style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#1E40AF',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <CreditCard size={18} /> Payment Method Visibility
                    </h4>
                    <p style={{ fontSize: 13, color: '#3B82F6', marginBottom: 20, lineHeight: 1.6 }}>
                      Control which payment methods customers see in the mobile app. Use this to hide automatic payments until Paypack integration is ready.
                    </p>

                    <div style={{ display: 'grid', gap: 16 }}>
                      {/* Automatic Payment Toggle */}
                      <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 20,
                        border: '1.5px solid #BFDBFE',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16
                      }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: '#FFF7ED',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Zap size={24} color="#EA580C" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 4 }}>
                            Automatic Payment (Paypack)
                          </div>
                          <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>
                            Instant MTN MoMo and Airtel Money via Paypack integration. Enable when configured.
                          </div>
                        </div>
                        <Toggle
                          label=""
                          checked={paymentSettings.automatic_enabled}
                          onChange={() => handlePaymentToggle('automatic_enabled')}
                        />
                      </div>

                      {/* Manual Payment Toggle */}
                      <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 20,
                        border: '1.5px solid #BFDBFE',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16
                      }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: '#EFF6FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Upload size={24} color="#2563EB" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 4 }}>
                            Manual Payment (Screenshot Upload)
                          </div>
                          <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>
                            Customers upload payment screenshots for manual verification. Recommended.
                          </div>
                        </div>
                        <Toggle
                          label=""
                          checked={paymentSettings.manual_enabled}
                          onChange={() => handlePaymentToggle('manual_enabled')}
                        />
                      </div>

                      {/* Cash on Delivery Toggle */}
                      <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 20,
                        border: '1.5px solid #BFDBFE',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16
                      }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: '#F0FDF4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Banknote size={24} color="#16A34A" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 4 }}>
                            Cash on Delivery
                          </div>
                          <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>
                            Customers pay with cash when order is delivered. No upfront payment required.
                          </div>
                        </div>
                        <Toggle
                          label=""
                          checked={paymentSettings.cash_enabled}
                          onChange={() => handlePaymentToggle('cash_enabled')}
                        />
                      </div>
                    </div>

                    <div style={{
                      marginTop: 16,
                      padding: 12,
                      background: 'rgba(59, 130, 246, 0.08)',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#1E40AF',
                      lineHeight: 1.6
                    }}>
                      <strong>💡 Note:</strong> Changes take effect immediately for all users. At least one payment method must remain enabled.
                    </div>
                  </section>

                  {/* Mobile Money Accounts */}
                  <section>
                    <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CreditCard size={16} /> Mobile Money Receiving Accounts
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
                      These are the accounts customers pay into. They appear automatically in the payment modal.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      {/* MTN */}
                      <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 16, padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FBC400', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={18} color="#fff" />
                          </div>
                          <span style={{ fontWeight: 800, fontSize: 15 }}>MTN MoMo Account</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          <Field label="Account Name">
                            <input className="form-input" type="text" placeholder="e.g. Samuel Ndayambaje" value={form.mtnAccountName} onChange={(e) => set('mtnAccountName')(e.target.value)} />
                          </Field>
                          <Field label="MTN Number">
                            <input className="form-input" type="text" placeholder="e.g. +250781234567" value={form.mtnNumber} onChange={(e) => set('mtnNumber')(e.target.value)} />
                          </Field>
                        </div>
                      </div>

                      {/* Airtel */}
                      <div style={{ background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: 16, padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E8002D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={18} color="#fff" />
                          </div>
                          <span style={{ fontWeight: 800, fontSize: 15 }}>Airtel Money Account</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          <Field label="Account Name">
                            <input className="form-input" type="text" placeholder="e.g. Samuel Ndayambaje" value={form.airtelAccountName} onChange={(e) => set('airtelAccountName')(e.target.value)} />
                          </Field>
                          <Field label="Airtel Number">
                            <input className="form-input" type="text" placeholder="e.g. +250731234567" value={form.airtelNumber} onChange={(e) => set('airtelNumber')(e.target.value)} />
                          </Field>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Payment Instructions */}
                  <section>
                    <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MessageCircle size={16} /> Customer-Facing Instructions
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <Field label="MTN MoMo Instructions">
                        <textarea className="form-input" style={{ height: 90, resize: 'vertical', lineHeight: 1.6 }} value={form.mtnInstructions} onChange={(e) => set('mtnInstructions')(e.target.value)} />
                      </Field>
                      <Field label="Airtel Money Instructions">
                        <textarea className="form-input" style={{ height: 90, resize: 'vertical', lineHeight: 1.6 }} value={form.airtelInstructions} onChange={(e) => set('airtelInstructions')(e.target.value)} />
                      </Field>
                      <Field label="Bank Transfer Details">
                        <textarea className="form-input" style={{ height: 90, resize: 'vertical', lineHeight: 1.6 }} value={form.bankInstructions} onChange={(e) => set('bankInstructions')(e.target.value)} />
                      </Field>
                      <Field label="Crypto Wallet (USDT TRC-20)">
                        <textarea className="form-input" style={{ height: 90, resize: 'vertical', lineHeight: 1.6 }} value={form.cryptoInstructions} onChange={(e) => set('cryptoInstructions')(e.target.value)} />
                      </Field>
                    </div>
                  </section>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  {/* Send Notification to Users Section */}
                  <section style={{
                    background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
                    borderRadius: 16,
                    padding: 24,
                    border: '1.5px solid #3B82F6'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 20
                    }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: 'var(--primary-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Send size={20} color="#fff" />
                      </div>
                      <div>
                        <h4 style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: '#1E40AF',
                          marginBottom: 2
                        }}>
                          Send Notification to All Users
                        </h4>
                        <p style={{
                          fontSize: 13,
                          color: '#3B82F6'
                        }}>
                          Compose and broadcast notifications to all active customers
                        </p>
                      </div>
                    </div>

                    <div style={{
                      background: '#fff',
                      borderRadius: 12,
                      padding: 20,
                      border: '1px solid #BFDBFE'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Notification Type */}
                        <Field label="Notification Type">
                          <select
                            className="form-input"
                            value={notificationType}
                            onChange={(e) => setNotificationType(e.target.value)}
                            style={{ fontWeight: 600 }}
                          >
                            <option value="general">📢 General Announcement</option>
                            <option value="promo">🎉 Promotion / Sale</option>
                            <option value="system">⚙️ System Update</option>
                            <option value="order">📦 Order Related</option>
                          </select>
                        </Field>

                        {/* Notification Title */}
                        <Field label="Notification Title">
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., New Products Available!"
                            value={notificationTitle}
                            onChange={(e) => setNotificationTitle(e.target.value)}
                            maxLength={100}
                            style={{ fontWeight: 600, fontSize: 15 }}
                          />
                          <div style={{
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            marginTop: 4,
                            textAlign: 'right'
                          }}>
                            {notificationTitle.length}/100 characters
                          </div>
                        </Field>

                        {/* Notification Body */}
                        <Field label="Notification Message">
                          <textarea
                            className="form-input"
                            placeholder="Write your notification message here... This will be displayed to all active users in the mobile app."
                            value={notificationBody}
                            onChange={(e) => setNotificationBody(e.target.value)}
                            maxLength={500}
                            rows={6}
                            style={{
                              resize: 'vertical',
                              lineHeight: 1.6,
                              fontSize: 14
                            }}
                          />
                          <div style={{
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            marginTop: 4,
                            textAlign: 'right'
                          }}>
                            {notificationBody.length}/500 characters
                          </div>
                        </Field>

                        {/* Preview */}
                        {(notificationTitle || notificationBody) && (
                          <div style={{
                            background: '#F8FAFC',
                            borderRadius: 10,
                            padding: 16,
                            border: '1px dashed #CBD5E1'
                          }}>
                            <div style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#64748B',
                              marginBottom: 8,
                              textTransform: 'uppercase',
                              letterSpacing: 0.5
                            }}>
                              Preview
                            </div>
                            {notificationTitle && (
                              <div style={{
                                fontWeight: 700,
                                fontSize: 15,
                                color: '#0F172A',
                                marginBottom: 6
                              }}>
                                {notificationTitle}
                              </div>
                            )}
                            {notificationBody && (
                              <div style={{
                                fontSize: 13,
                                color: '#475569',
                                lineHeight: 1.5
                              }}>
                                {notificationBody}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Send Button */}
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleSendNotification}
                          disabled={sendingNotification || !notificationTitle.trim() || !notificationBody.trim()}
                          style={{
                            width: '100%',
                            padding: '14px 20px',
                            fontSize: 15,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                          }}
                        >
                          <Send size={18} />
                          {sendingNotification ? 'Sending Notification...' : 'Send Notification to All Users'}
                        </button>

                        <div style={{
                          fontSize: 12,
                          color: '#64748B',
                          textAlign: 'center',
                          paddingTop: 8,
                          borderTop: '1px solid #E2E8F0'
                        }}>
                          💡 This will send notifications to all active customers in the mobile app
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Admin Notification Settings */}
                  <section>
                    <h4 style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: 'var(--primary-blue)',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <Bell size={16} /> Admin Notification Preferences
                    </h4>
                    <div style={{ background: 'var(--surface-bg)', borderRadius: 12, padding: 16 }}>
                      <Toggle label="New Order Notifications"  desc="Get notified when a new order is placed"         checked={form.emailNewOrder}  onChange={setCheck('emailNewOrder')} />
                      <Toggle label="New User Registrations"   desc="Get notified when a new customer registers"      checked={form.emailNewUser}   onChange={setCheck('emailNewUser')}  />
                      <Toggle label="Low Stock Alerts"         desc="Get notified when product stock is running low"  checked={form.emailLowStock}  onChange={setCheck('emailLowStock')} />
                      <div style={{ marginTop: 16, paddingLeft: 16 }}>
                        <Field label="Low Stock Threshold (units)">
                          <input
                            className="input"
                            type="number"
                            value={form.lowStockThreshold}
                            onChange={(e) => set('lowStockThreshold')(e.target.value)}
                            style={{ maxWidth: 120 }}
                          />
                        </Field>
                      </div>
                    </div>
                  </section>
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
                        <input className="form-input" type="password" placeholder="Min. 8 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      </Field>
                      <Field label="Confirm New Password">
                        <input className="form-input" type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                      </Field>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={handlePasswordChange} disabled={changingPw}>
                      {changingPw ? 'Updating...' : 'Update Secure Password'}
                    </button>
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
