import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Users, Package, Store,
  TrendingUp, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { supabase } from '../services/supabase';

const DEMO_STATS = {
  totalRevenue: 24560000,
  totalOrders: 1256,
  totalUsers: 3842,
  totalProducts: 184,
  totalVendors: 48,
};

const RECENT_ORDERS = [
  { id: '#GGS001', customer: 'Samuel Niyomugabo', product: 'iPhone 15 Pro Max', amount: 1200000, status: 'delivered', date: '2026-04-22' },
  { id: '#GGS002', customer: 'Amelia Uwase', product: 'MacBook Air M3', amount: 1450000, status: 'shipped', date: '2026-04-22' },
  { id: '#GGS003', customer: 'Jean Baptiste', product: 'AirPods Pro', amount: 120000, status: 'pending', date: '2026-04-23' },
  { id: '#GGS004', customer: 'Grace Mutoni', product: 'Samsung S24 Ultra', amount: 850000, status: 'processing', date: '2026-04-23' },
  { id: '#GGS005', customer: 'Eric Habimana', product: 'Sony WH-1000XM5', amount: 195000, status: 'delivered', date: '2026-04-21' },
];

const TOP_PRODUCTS = [
  { name: 'Samsung Galaxy S24 Ultra', sales: 87, revenue: 73950000 },
  { name: 'iPhone 15 Pro Max', sales: 54, revenue: 64800000 },
  { name: 'MacBook Air M3', sales: 31, revenue: 44950000 },
  { name: 'Sony WH-1000XM5', sales: 120, revenue: 23400000 },
  { name: 'AirPods Pro (3rd Gen)', sales: 143, revenue: 17160000 },
];

const STATUS_BADGE = {
  delivered: 'badge-green',
  shipped: 'badge-blue',
  processing: 'badge-yellow',
  pending: 'badge-gray',
  cancelled: 'badge-red',
};

const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;

function StatCard({ icon: Icon, label, value, change, color, bgColor }) {
  const isUp = change >= 0;
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bgColor }}>
        <Icon size={24} color={color} strokeWidth={2.5} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${isUp ? 'up' : 'down'}`}>
        <div style={{
          background: isUp ? 'rgba(52,168,83,0.1)' : 'rgba(234,67,53,0.1)',
          padding: '2px 6px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(change)}%
        </div>
        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>vs last month</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(DEMO_STATS);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await import('../services/supabase').then(m => m.fetchDashboardStats());
        if (data) {
          setStats({ ...DEMO_STATS, ...data });
          setRecentOrders(data.recentOrders || []);
          setTopProducts(data.topProducts || []);
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Welcome back — here's what's happening today.</p>
        </div>
        <span className="badge badge-green">● Live</span>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon={TrendingUp} label="Total Revenue" value={fmt(stats.totalRevenue)} change={12.5} color="#34A853" bgColor="rgba(52,168,83,0.15)" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders?.toLocaleString() || '0'} change={8.2} color="#4285F4" bgColor="rgba(66,133,244,0.15)" />
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers?.toLocaleString() || '0'} change={15.3} color="#FBBC04" bgColor="rgba(251,188,4,0.15)" />
        <StatCard icon={Package} label="Total Products" value={stats.totalProducts?.toLocaleString() || '0'} change={5.1} color="#4285F4" bgColor="rgba(66,133,244,0.15)" />
        <StatCard icon={Store} label="Active Vendors" value={stats.totalVendors?.toLocaleString() || '0'} change={3.8} color="#34A853" bgColor="rgba(52,168,83,0.15)" />
      </div>

      {/* Charts Row */}
      <div className="chart-row" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenue Forecast</span>
            <div className="flex gap-2">
              <span className="badge badge-blue">Weekly</span>
              <span className="badge badge-gray">Monthly</span>
            </div>
          </div>
          <div className="card-body">
            <MiniBarChart />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Order Distribution</span>
          </div>
          <div className="card-body">
            <DonutChart />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="chart-row" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Transactions</span>
            <a href="/orders" className="btn btn-ghost btn-sm">Manage All</a>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td><span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>#{o.id.slice(0, 6)}</span></td>
                    <td style={{ fontWeight: 600 }}>{o.profiles?.full_name || 'Guest User'}</td>
                    <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{fmt(o.total)}</td>
                    <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                    <td className="text-muted" style={{ fontSize: 13 }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No recent orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Performance Leaders</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {topProducts.length > 0 ? topProducts.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: 'var(--surface-bg)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 13, color: 'var(--primary-blue)',
                  flexShrink: 0, border: '1px solid var(--border)'
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{p.sales_count || 0} units sold</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary-blue)', flexShrink: 0 }}>{fmt(p.price * (p.sales_count || 0))}</div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 14 }}>No product metrics yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Simple SVG Bar Chart ──────────────────────────────────────
function MiniBarChart() {
  const data = [
    { month: 'Oct', val: 14 }, { month: 'Nov', val: 18 },
    { month: 'Dec', val: 22 }, { month: 'Jan', val: 16 },
    { month: 'Feb', val: 20 }, { month: 'Mar', val: 19 },
    { month: 'Apr', val: 24 },
  ];
  const max = 30; // Fixed scale for stability
  const H = 220, W = 600, barW = 44, gap = 24;

  return (
    <svg viewBox={`0 0 ${W} ${H + 40}`} style={{ width: '100%', height: 'auto' }}>
      {/* Grid Lines */}
      {[0, 10, 20, 30].map((v) => {
        const y = H - (v / max) * H;
        return (
          <g key={v}>
            <line x1="0" y1={y} x2={W} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
            <text x="-10" y={y + 4} fill="var(--text-muted)" fontSize={11} textAnchor="end">{v}M</text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const x = i * (barW + gap) + 40;
        const barH = (d.val / max) * H;
        const y = H - barH;
        return (
          <g key={i} className="chart-bar-group">
            <rect x={x} y={y} width={barW} height={barH}
              rx={8} fill="url(#barGrad)" style={{ transition: 'all 0.3s' }} />
            <text x={x + barW / 2} y={H + 24} textAnchor="middle"
              fill="var(--text-secondary)" fontSize={12} fontWeight={600}>{d.month}</text>
            <text x={x + barW / 2} y={y - 10} textAnchor="middle"
              fill="var(--primary-blue)" fontSize={12} fontWeight={800}>{d.val}M</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary-blue)" />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Simple SVG Donut Chart ────────────────────────────────────
function DonutChart() {
  const data = [
    { label: 'Delivered', val: 52, color: '#34A853' },
    { label: 'Shipped', val: 20, color: '#4285F4' },
    { label: 'Processing', val: 15, color: '#FBBC04' },
    { label: 'Pending', val: 10, color: '#94A3B8' },
    { label: 'Cancelled', val: 3, color: '#EA4335' },
  ];
  const total = data.reduce((s, d) => s + d.val, 0);
  const cx = 90, cy = 90, r = 75, innerR = 50;
  let startAngle = -Math.PI / 2;

  const slices = data.map((d) => {
    const angle = (d.val / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    startAngle += angle;
    const x2 = cx + r * Math.cos(startAngle);
    const y2 = cy + r * Math.sin(startAngle);
    const xi1 = cx + innerR * Math.cos(startAngle);
    const yi1 = cy + innerR * Math.sin(startAngle);
    const xi2 = cx + innerR * Math.cos(startAngle - angle);
    const yi2 = cy + innerR * Math.sin(startAngle - angle);
    const large = angle > Math.PI ? 1 : 0;
    return { ...d, path: `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${xi1} ${yi1} A${innerR} ${innerR} 0 ${large} 0 ${xi2} ${yi2} Z` };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 180, height: 180 }}>
        <svg viewBox="0 0 180 180" style={{ transform: 'rotate(-10deg)' }}>
          {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} style={{ transition: 'all 0.3s' }} />)}
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', pointerEvents: 'none'
        }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{total}%</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <div style={{ width: 12, height: 12, borderRadius: 4, background: d.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{d.label}</span>
            <span style={{ fontWeight: 800, marginLeft: 'auto', color: 'var(--text-primary)' }}>{d.val}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
