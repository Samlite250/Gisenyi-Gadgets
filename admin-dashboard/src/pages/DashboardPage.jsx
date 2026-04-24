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
  { id: '#GGS002', customer: 'Amelia Uwase',      product: 'MacBook Air M3',    amount: 1450000, status: 'shipped',   date: '2026-04-22' },
  { id: '#GGS003', customer: 'Jean Baptiste',     product: 'AirPods Pro',       amount: 120000,  status: 'pending',   date: '2026-04-23' },
  { id: '#GGS004', customer: 'Grace Mutoni',      product: 'Samsung S24 Ultra', amount: 850000,  status: 'processing',date: '2026-04-23' },
  { id: '#GGS005', customer: 'Eric Habimana',     product: 'Sony WH-1000XM5',  amount: 195000,  status: 'delivered', date: '2026-04-21' },
];

const TOP_PRODUCTS = [
  { name: 'Samsung Galaxy S24 Ultra', sales: 87,  revenue: 73950000 },
  { name: 'iPhone 15 Pro Max',        sales: 54,  revenue: 64800000 },
  { name: 'MacBook Air M3',           sales: 31,  revenue: 44950000 },
  { name: 'Sony WH-1000XM5',          sales: 120, revenue: 23400000 },
  { name: 'AirPods Pro (3rd Gen)',     sales: 143, revenue: 17160000 },
];

const STATUS_BADGE = {
  delivered:  'badge-green',
  shipped:    'badge-blue',
  processing: 'badge-yellow',
  pending:    'badge-gray',
  cancelled:  'badge-red',
};

const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;

function StatCard({ icon: Icon, label, value, change, color, bgColor }) {
  const isUp = change >= 0;
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bgColor }}>
        <Icon size={22} color={color} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${isUp ? 'up' : 'down'}`}>
        {isUp ? <ArrowUpRight size={13} style={{ display: 'inline' }} /> : <ArrowDownRight size={13} style={{ display: 'inline' }} />}
        {Math.abs(change)}% this month
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(DEMO_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await import('../services/supabase').then(m => m.fetchDashboardStats());
        if (data) setStats({ ...DEMO_STATS, ...data });
      } catch { /* keep demo */ }
      finally { setLoading(false); }
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
        <StatCard icon={TrendingUp}   label="Total Revenue"  value={fmt(stats.totalRevenue)}  change={12.5} color="#34A853" bgColor="rgba(52,168,83,0.15)"  />
        <StatCard icon={ShoppingCart} label="Total Orders"   value={stats.totalOrders?.toLocaleString()}   change={8.2}  color="#4285F4" bgColor="rgba(66,133,244,0.15)" />
        <StatCard icon={Users}        label="Total Users"    value={stats.totalUsers?.toLocaleString()}    change={15.3} color="#FBBC04" bgColor="rgba(251,188,4,0.15)"  />
        <StatCard icon={Package}      label="Total Products" value={stats.totalProducts?.toLocaleString()} change={5.1}  color="#4285F4" bgColor="rgba(66,133,244,0.15)" />
        <StatCard icon={Store}        label="Active Vendors" value={stats.totalVendors?.toLocaleString()}  change={3.8}  color="#34A853" bgColor="rgba(52,168,83,0.15)"  />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Sales Revenue (Last 7 Months)</span>
          </div>
          <div className="card-body">
            <MiniBarChart />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Order Status</span>
          </div>
          <div className="card-body">
            <DonutChart />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Orders</span>
            <a href="/orders" className="btn btn-ghost btn-sm">View All</a>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((o) => (
                  <tr key={o.id}>
                    <td><span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{o.id}</span></td>
                    <td>{o.customer}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(o.amount)}</td>
                    <td><span className={`badge ${STATUS_BADGE[o.status]}`}>{o.status}</span></td>
                    <td className="text-muted">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Products</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TOP_PRODUCTS.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: 'var(--primary-blue)', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.sales} sold</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{fmt(p.revenue)}</div>
              </div>
            ))}
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
  const max = Math.max(...data.map(d => d.val));
  const H = 200, W = 480, barW = 40, gap = 20;

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} style={{ width: '100%' }}>
      {data.map((d, i) => {
        const x = i * (barW + gap) + gap;
        const barH = (d.val / max) * H;
        const y = H - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH}
              rx={6} fill="url(#barGrad)" opacity={0.85} />
            <text x={x + barW / 2} y={H + 18} textAnchor="middle"
              fill="var(--text-muted)" fontSize={11}>{d.month}</text>
            <text x={x + barW / 2} y={y - 6} textAnchor="middle"
              fill="var(--text-secondary)" fontSize={10}>{d.val}M</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="100%" stopColor="#4285F4" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Simple SVG Donut Chart ────────────────────────────────────
function DonutChart() {
  const data = [
    { label: 'Delivered',  val: 52, color: '#34A853' },
    { label: 'Shipped',    val: 20, color: '#4285F4' },
    { label: 'Processing', val: 15, color: '#FBBC04' },
    { label: 'Pending',    val: 10, color: '#94A3B8' },
    { label: 'Cancelled',  val: 3,  color: '#EA4335' },
  ];
  const total = data.reduce((s, d) => s + d.val, 0);
  const cx = 90, cy = 90, r = 70, innerR = 45;
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
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <svg viewBox="0 0 180 180" style={{ width: 140, flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize={18} fontWeight={800}>{total}%</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>orders</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
            <span style={{ fontWeight: 700, marginLeft: 'auto', paddingLeft: 8 }}>{d.val}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
