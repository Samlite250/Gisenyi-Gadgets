import React, { useState } from 'react';
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

function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary-blue), #60A5FA)',
          width: 38, height: 38, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(66, 133, 244, 0.3)',
          flexShrink: 0
        }}>
          <ShoppingBag size={22} color="white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">Gisenyi</span>
            <span className="sidebar-brand-sub">Management</span>
          </div>
        )}
        <button className="sidebar-toggle" onClick={onToggle} style={{ marginLeft: collapsed ? 0 : 'auto' }}>
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item nav-item-logout">
          <LogOut size={20} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <h1 className="topbar-title">Overview</h1>
        <div className="search-wrap" style={{ width: 300 }}>
          <div className="search-icon">
            <Bell size={16} />
          </div>
          <input type="text" className="input input-sm" placeholder="Search orders, products..." />
        </div>
      </div>
      <div className="topbar-right">
        <button className="topbar-btn">
          <Bell size={20} />
          <span className="notif-dot" />
        </button>
        <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }} />
        <div className="flex items-center gap-3">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Samuel Admin</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Super Admin</div>
          </div>
          <div className="admin-avatar">S</div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Router>
      <div className="app-layout">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className="main-area">
          <TopBar />
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
