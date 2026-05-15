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
  Search, ChevronLeft, ChevronRight,
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
import BannersPage    from './pages/BannersPage';
import LoginPage      from './pages/LoginPage';
import Loader         from './components/Loader';
import { supabase }   from './services/supabase';


const NAV_ITEMS = [
  { path: '/',           icon: LayoutDashboard, label: 'Dashboard'  },
  { path: '/products',   icon: Package,         label: 'Products'   },
  { path: '/categories', icon: Tag,             label: 'Categories' },
  { path: '/banners',    icon: Image,           label: 'Banners'    },
  { path: '/orders',     icon: ShoppingCart,    label: 'Orders'     },
  { path: '/suppliers',  icon: Handshake,       label: 'Suppliers'  },
  { path: '/users',      icon: Users,           label: 'Users'      },
  { path: '/reviews',    icon: Star,            label: 'Reviews'    },
  { path: '/support',    icon: MessageCircle,   label: 'Support'    },
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
              <Route path="/support"    element={<SupportPage />}    />
              <Route path="/settings"   element={<SettingsPage />}   />
            </Routes>
          </main>
        </div>
      </div>

      <Toaster position="top-right" />
    </>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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
        <LoginPage onLogin={(user) => setSession({ user })} />
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

