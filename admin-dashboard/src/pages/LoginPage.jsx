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
            Manage your<br />store with <em>ease</em>
          </h1>
          <p className="login-panel-desc">
            Full control over orders, products, customers, and analytics — all in one place.
          </p>
          <div className="login-panel-stats">
            <div className="login-stat">
              <span className="login-stat-val">RWF</span>
              <span className="login-stat-lbl">Currency</span>
            </div>
            <div className="login-stat">
              <span className="login-stat-val">24/7</span>
              <span className="login-stat-lbl">Live Data</span>
            </div>
            <div className="login-stat">
              <span className="login-stat-val">100%</span>
              <span className="login-stat-lbl">Secure</span>
            </div>
          </div>
        </div>

        <div className="login-panel-footer">
          © {new Date().getFullYear()} Gisenyi Gadgets · Rwanda
        </div>
      </div>

      {/* ── Right form area ── */}
      <div className="login-form-area">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-logo-mobile">
              <img src="/logo.png" alt="Gisenyi Gadgets" />
            </div>
            <div className="login-welcome">Admin Portal</div>
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Sign in to your dashboard to manage products, orders, and more</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="login-field">
              <label className="login-label">
                <Mail size={13} /> Email Address
              </label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Mail size={16} /></span>
                <input
                  type="email"
                  className="login-input"
                  required
                  placeholder="admin@gisenyigadgets.rw"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label">
                <Lock size={13} /> Password
              </label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Lock size={16} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  required
                  placeholder="••••••••"
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
                'Authenticating...'
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <div className="login-secure-dot" />
            <ShieldCheck size={13} />
            Secured with Supabase Auth
          </div>
        </div>
      </div>
    </div>
  );
}
