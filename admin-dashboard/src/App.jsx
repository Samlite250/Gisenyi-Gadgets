import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router, Routes, Route,
  NavLink, useNavigate,
} from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Store, Star, Settings, LogOut, Menu, X,
  ShoppingBag, Bell,
} from 'lucide-react';

import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import UsersPage from './pages/UsersPage';
import VendorsPage from './pages/VendorsPage';
import ReviewsPage from './pages/ReviewsPage';
import SettingsPage from './pages/SettingsPage';

const NAV_ITEMS = [
  { path: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/products', icon: Package,         label: 'Products'  },
  { path: '/orders',   icon: ShoppingCart,    label: 'Orders'    },
  { path: '/users',    icon: Users,           label: 'Users'     },
  { path: '/vendors',  icon: Store,           label: 'Vendors'   },
  { path: '/reviews',  icon: Star,            label: 'Reviews'   },
  { path: '/settings', icon: Settings,        label: 'Settings'  },
];



export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <Router>
      <div className="app-layout">
        {/* Mobile Overlay */}
        <div 
          className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`} 
          onClick={() => setMobileOpen(false)} 
        />

        <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <div style={{ 
              width: 42, height: 42, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden'
            }}>
              <img 
                src="/logo.png" 
                alt="Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="sidebar-brand">
                <span className="sidebar-brand-name">Gisenyi Gadgets</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="sidebar-brand-sub">Admin Console</span>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34A853', boxShadow: '0 0 8px #34A853' }} />
                </div>
              </div>
            )}
            {!isMobile && (
              <button className="sidebar-toggle" onClick={toggleSidebar}>
                {collapsed ? <Menu size={18} /> : <X size={18} />}
              </button>
            )}
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                onClick={() => isMobile && setMobileOpen(false)}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'nav-item-active' : ''}`
                }
              >
                <Icon size={20} />
                {(!collapsed || isMobile) && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="nav-item nav-item-logout">
              <LogOut size={20} />
              {(!collapsed || isMobile) && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        <div className="main-area">
          <header className="topbar">
            <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {isMobile && (
                <button className="topbar-btn" onClick={() => setMobileOpen(true)}>
                  <Menu size={20} />
                </button>
              )}
              <h1 className="topbar-title">Overview</h1>
              {!isMobile && (
                <div className="search-wrap" style={{ width: 300 }}>
                  <div className="search-icon">
                    <Bell size={16} />
                  </div>
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
              <div className="flex items-center gap-3">
                {!isMobile && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Samuel Admin</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Super Admin</div>
                  </div>
                )}
                <div className="admin-avatar">S</div>
              </div>
            </div>
          </header>

          <main className="page-content">
            <Routes>
              <Route path="/"         element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />}  />
              <Route path="/orders"   element={<OrdersPage />}    />
              <Route path="/users"    element={<UsersPage />}     />
              <Route path="/vendors"  element={<VendorsPage />}   />
              <Route path="/reviews"  element={<ReviewsPage />}   />
              <Route path="/settings" element={<SettingsPage />}  />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
