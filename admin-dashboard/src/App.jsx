import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router, Routes, Route,
  NavLink, useNavigate,
} from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Store, Star, Settings, LogOut, Menu, X,
  ShoppingBag, Bell, MessageCircle, Tag, Handshake, Image,
} from 'lucide-react';

import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import UsersPage from './pages/UsersPage';
import VendorsPage from './pages/VendorsPage';
import ReviewsPage from './pages/ReviewsPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import CategoriesPage from './pages/CategoriesPage';
import SuppliersPage from './pages/SuppliersPage';
import BannersPage from './pages/BannersPage';

const NAV_ITEMS = [
  { path: '/',           icon: LayoutDashboard, label: 'Dashboard'  },
  { path: '/products',   icon: Package,         label: 'Products'   },
  { path: '/categories', icon: Tag,             label: 'Categories' },
  { path: '/banners',    icon: Image,           label: 'Banners'    },
  { path: '/orders',     icon: ShoppingCart,    label: 'Orders'     },
  { path: '/suppliers',  icon: Handshake,       label: 'Suppliers'  },
  { path: '/users',      icon: Users,           label: 'Users'      },
  { path: '/vendors',    icon: Store,           label: 'Vendors'    },
  { path: '/reviews',    icon: Star,            label: 'Reviews'    },
  { path: '/support',    icon: MessageCircle,   label: 'Support'    },
  { path: '/settings',   icon: Settings,        label: 'Settings'   },
];



export default function App() {
  const [collapsed, setCollapsed] = useState(false); // Default to expanded for label visibility
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
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              <img 
                src="/logo.png" 
                alt="Logo" 
                style={{ width: '85%', height: '85%', objectFit: 'contain' }} 
              />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="sidebar-brand">
                <div className="sidebar-brand-name" style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--primary-blue)', textTransform: 'uppercase', fontSize: 13, fontWeight: 900 }}>Gisenyi</span>
                  <span style={{ color: 'var(--primary-green)', textTransform: 'uppercase', fontSize: 13, fontWeight: 900 }}>Gadgets</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span className="sidebar-brand-sub" style={{ fontSize: 9 }}>Admin Console</span>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34A853', boxShadow: '0 0 6px #34A853' }} />
                </div>
              </div>
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

          <div className="mt-auto" style={{ padding: '16px 14px', borderTop: '1px solid var(--border)' }}>
            <button className="nav-item nav-item-logout" style={{ width: '100%', margin: 0 }}>
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
              <Route path="/"           element={<DashboardPage />} />
              <Route path="/products"   element={<ProductsPage />}  />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/orders"     element={<OrdersPage />}    />
              <Route path="/suppliers"  element={<SuppliersPage />} />
              <Route path="/users"      element={<UsersPage />}     />
              <Route path="/vendors"    element={<VendorsPage />}   />
              <Route path="/reviews"    element={<ReviewsPage />}   />
              <Route path="/banners"    element={<BannersPage />}    />
              <Route path="/support"    element={<SupportPage />}   />
              <Route path="/settings"   element={<SettingsPage />}  />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
