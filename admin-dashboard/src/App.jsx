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
        <ShoppingBag size={28} color="var(--primary-blue)" />
        {!collapsed && (
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">Gisenyi</span>
            <span className="sidebar-brand-sub">Admin</span>
          </div>
        )}
        <button className="sidebar-toggle" onClick={onToggle}>
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
      <div className="topbar-left">
        <h1 className="topbar-title">Gisenyi Gadgets Admin</h1>
      </div>
      <div className="topbar-right">
        <button className="topbar-btn">
          <Bell size={20} />
          <span className="notif-dot" />
        </button>
        <div className="admin-avatar">A</div>
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
