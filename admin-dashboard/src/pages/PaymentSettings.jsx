import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Settings, Zap, Upload, Banknote, AlertCircle, CheckCircle } from 'lucide-react';
import './PaymentSettings.css';

export default function PaymentSettings() {
  const [settings, setSettings] = useState({
    automatic_enabled: false,
    manual_enabled: true,
    cash_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'payment_methods')
        .single();

      if (error) throw error;

      if (data?.value) {
        setSettings(data.value);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load payment settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const saveSettings = async (newSettings) => {
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: newSettings })
        .eq('key', 'payment_methods');

      if (error) throw error;

      setMessage({ type: 'success', text: 'Payment settings updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
      // Revert on error
      fetchSettings();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-settings">
        <div className="settings-header">
          <Settings size={24} />
          <h1>Payment Settings</h1>
        </div>
        <div className="loading">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="payment-settings">
      <div className="settings-header">
        <Settings size={24} />
        <h1>Payment Settings</h1>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="settings-description">
        <AlertCircle size={18} />
        <p>
          Control which payment methods are visible to users in the mobile app.
          Use this to hide automatic payments until Paypack integration is ready.
        </p>
      </div>

      <div className="settings-grid">
        <div className="setting-card">
          <div className="setting-icon automatic">
            <Zap size={24} />
          </div>
          <div className="setting-info">
            <h3>Automatic Payment</h3>
            <p>
              Paypack integration for instant MTN MoMo and Airtel Money payments.
              Enable when your Paypack account is configured.
            </p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.automatic_enabled}
              onChange={() => handleToggle('automatic_enabled')}
              disabled={saving}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-card">
          <div className="setting-icon manual">
            <Upload size={24} />
          </div>
          <div className="setting-info">
            <h3>Manual Payment</h3>
            <p>
              Users upload payment screenshots for manual verification.
              Recommended to keep enabled for flexibility.
            </p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.manual_enabled}
              onChange={() => handleToggle('manual_enabled')}
              disabled={saving}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-card">
          <div className="setting-icon cash">
            <Banknote size={24} />
          </div>
          <div className="setting-info">
            <h3>Cash on Delivery</h3>
            <p>
              Allow customers to pay with cash when their order is delivered.
              No upfront payment required.
            </p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.cash_enabled}
              onChange={() => handleToggle('cash_enabled')}
              disabled={saving}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-footer">
        <div className="footer-note">
          <strong>Note:</strong> Changes take effect immediately for all users.
          At least one payment method must remain enabled.
        </div>
      </div>
    </div>
  );
}
