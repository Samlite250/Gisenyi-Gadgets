import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin only.');
      }

      toast.success('Welcome back!');
      onLogin(data.user);
    } catch (err) {
      toast.error(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* ── Left branded panel ── */}
      <div className="login-panel">
        <div className="login-panel-grid" />
        <div className="login-panel-gradient" />

        <div className="login-brand">
          <div className="login-brand-logo-enhanced">
            <img src="/logo.png" alt="Gisenyi Gadgets Logo" />
          </div>
          <div className="login-brand-text">
            <span className="login-brand-name">Gisenyi Gadgets</span>
            <span className="login-brand-sub">Admin Dashboard</span>
          </div>
        </div>

        <div className="login-panel-body">
          <h1 className="login-panel-headline">
            Powerful tools<br />for your <em>business</em>
          </h1>
          <p className="login-panel-desc">
            Manage inventory, track orders, analyze sales, and grow your e-commerce business from one beautiful dashboard.
          </p>
          <div className="login-panel-features">
            <div className="login-feature">
              <div className="login-feature-icon">📦</div>
              <span>Inventory Management</span>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">📊</div>
              <span>Real-time Analytics</span>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">🔒</div>
              <span>Secure Platform</span>
            </div>
          </div>
        </div>

        <div className="login-panel-footer">
          <span>© {new Date().getFullYear()} Gisenyi Gadgets</span>
          <span className="login-footer-dot">•</span>
          <span>Gisenyi, Rwanda</span>
        </div>
      </div>

      {/* ── Right form area ── */}
      <div className="login-form-area">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-logo-mobile">
              <img src="/logo.png" alt="Gisenyi Gadgets" />
            </div>
            <h2 className="login-title">Welcome back</h2>
            <p className="login-subtitle">Enter your credentials to access the admin dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label className="login-label">Email address</label>
              <div className="login-input-wrap">
                <Mail size={18} className="login-input-icon" />
                <input
                  type="email"
                  className="login-input"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-input-wrap">
                <Lock size={18} className="login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <span className="login-submit-loading">
                  <span className="login-spinner"></span>
                  Signing in...
                </span>
              ) : (
                <>
                  Sign in to dashboard
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <ShieldCheck size={14} className="login-shield-icon" />
            <span>Secured with Supabase authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
