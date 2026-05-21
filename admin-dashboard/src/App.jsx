import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router, Routes, Route,
  NavLink, useLocation,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Store, Star, Settings, LogOut, Menu,
  Bell, MessageCircle, Tag, Handshake, Image,
  Search, ChevronLeft, ChevronRight, CreditCard,
} from 'lucide-react';

import DashboardPage  from './pages/DashboardPage';
import ProductsPage   from './pages/ProductsPage';
import OrdersPage     from './pages/OrdersPage';
import UsersPage      from './pages/UsersPage';
import VendorsPage    from './pages/VendorsPage';
import ReviewsPage    from './pages/ReviewsPage';
import SettingsPage   from './pages/SettingsPage';
import SupportPage    from './pages/SupportPage';
import CategoriesPage from './pages/CategoriesPage';
import SuppliersPage  from './pages/SuppliersPage';
import BannersPage       from './pages/BannersPage';
import TransactionsPage    from './pages/TransactionsPage';
import NotificationsPage   from './pages/NotificationsPage';
import LoginPage           from './pages/LoginPage';
import Loader         from './components/Loader';
import { supabase }   from './services/supabase';


const NAV_ITEMS = [
  { path: '/',           icon: LayoutDashboard, label: 'Dashboard'  },
  { path: '/products',   icon: Package,         label: 'Products'   },
  { path: '/categories', icon: Tag,             label: 'Categories' },
  { path: '/banners',    icon: Image,           label: 'Banners'    },
  { path: '/orders',        icon: ShoppingCart,  label: 'Orders'       },
  { path: '/transactions',  icon: CreditCard,    label: 'Transactions' },
  { path: '/suppliers',     icon: Handshake,     label: 'Suppliers'    },
  { path: '/users',      icon: Users,           label: 'Users'      },
  { path: '/reviews',    icon: Star,            label: 'Reviews'    },
  { path: '/support',    icon: MessageCircle,   label: 'Support'    },
  { path: '/notifications', icon: Bell,          label: 'Notifications' },
  { path: '/settings',   icon: Settings,        label: 'Settings'   },
];

function AppInner({ user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();


  const pageTitle = NAV_ITEMS.find((item) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path)
  )?.label || 'Dashboard';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showLabels = !collapsed || isMobile;

  return (
    <>
      <div className="app-layout">

        {/* Mobile overlay */}
        <div
          className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* ── Sidebar ── */}
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>

          {/* Header row: logo + brand + toggle */}
          <div className="sidebar-header">
            {/* Logo */}
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: '#fff', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}>
              <img
                src="/logo.png"
                alt="Logo"
                style={{ width: '85%', height: '85%', objectFit: 'contain' }}
              />
            </div>

            {/* Brand text — hidden when collapsed on desktop */}
            {showLabels && (
              <div className="sidebar-brand">
                <div className="sidebar-brand-name" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: 'var(--primary-blue)', textTransform: 'uppercase', fontSize: 13, fontWeight: 900 }}>Gisenyi</span>
                  <span style={{ color: 'var(--primary-green)', textTransform: 'uppercase', fontSize: 13, fontWeight: 900 }}>Gadgets</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span className="sidebar-brand-sub" style={{ fontSize: 9 }}>Admin Console</span>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34A853', boxShadow: '0 0 6px #34A853' }} />
                </div>
              </div>
            )}

            {/* Desktop collapse toggle */}
            {!isMobile && (
              <button
                onClick={() => setCollapsed((c) => !c)}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="sidebar-toggle"
                style={collapsed ? {} : { marginLeft: 'auto' }}
              >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
            )}
          </div>

          {/* Nav links */}
          <nav className="sidebar-nav">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                title={collapsed ? label : ''}
                onClick={() => isMobile && setMobileOpen(false)}
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              >
                <Icon size={20} />
                {showLabels && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Sign out */}
          <div style={{ padding: '16px 14px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
            <button 
              className="nav-item nav-item-logout" 
              style={{ width: '100%', margin: 0 }}
              title={collapsed ? "Sign Out" : ""}
              onClick={onLogout}
            >
              <LogOut size={20} />
              {showLabels && <span>Sign Out</span>}
            </button>
          </div>

        </aside>

        {/* ── Main area ── */}
        <div className="main-area">

          {/* Topbar */}
          <header className="topbar">
            <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {isMobile && (
                <button className="topbar-btn" onClick={() => setMobileOpen(true)}>
                  <Menu size={20} />
                </button>
              )}
              <h1 className="topbar-title">{pageTitle}</h1>
              {!isMobile && (
                <div className="search-wrap" style={{ width: 300 }}>
                  <Search size={15} className="search-icon" />
                  <input type="text" className="input input-sm" placeholder="Search orders, products..." />
                </div>
              )}
            </div>

            <div className="topbar-right">
              <button className="topbar-btn">
                <Bell size={20} />
                <span className="notif-dot" />
              </button>
              <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {!isMobile && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{user?.user_metadata?.full_name || 'Samuel Admin'}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Super Admin</div>
                  </div>
                )}
                <div className="admin-avatar">{user?.email?.charAt(0).toUpperCase() || 'S'}</div>

              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="page-content">
            <Routes>
              <Route path="/"           element={<DashboardPage />}  />
              <Route path="/products"   element={<ProductsPage />}   />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/orders"     element={<OrdersPage />}     />
              <Route path="/suppliers"  element={<SuppliersPage />}  />
              <Route path="/users"      element={<UsersPage />}      />
              <Route path="/reviews"    element={<ReviewsPage />}    />
              <Route path="/banners"    element={<BannersPage />}    />
              <Route path="/support"       element={<SupportPage />}      />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/notifications"  element={<NotificationsPage />} />
              <Route path="/settings"     element={<SettingsPage />}     />
            </Routes>
          </main>
        </div>
      </div>

      <Toaster position="top-right" />
    </>
  );
}

async function verifyAdminSession(session) {
  if (!session?.user) return null;
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    if (error || profile?.role !== 'admin') {
      await supabase.auth.signOut({ scope: 'local' });
      return null;
    }
    return session;
  } catch {
    await supabase.auth.signOut({ scope: 'local' });
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On load: restore session only if the user is an admin
    const timeout = setTimeout(() => setLoading(false), 5000); // safety net
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout);
      const adminSession = await verifyAdminSession(session);
      setSession(adminSession);
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeout);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
      }
      // SIGNED_IN is handled directly by LoginPage via onLogin — skip here to avoid double round-trip
      // TOKEN_REFRESHED just updates the session tokens, role hasn't changed
      if (event === 'TOKEN_REFRESHED' && session) {
        setSession(prev => prev ? { ...prev, access_token: session.access_token, refresh_token: session.refresh_token } : prev);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) return <Loader message="Verifying session security..." />;

  if (!session) {
    return (
      <>
        <LoginPage onLogin={(s) => setSession(s)} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppInner user={session.user} onLogout={handleLogout} />
    </Router>
  );
}

