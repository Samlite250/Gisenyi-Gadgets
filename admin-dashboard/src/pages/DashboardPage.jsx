import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Users, Package, Store, Tag, Plus,
  TrendingUp, ArrowUpRight, ArrowDownRight, Handshake
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';


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
  const [stats, setStats] = useState({
    totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0, totalVendors: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [orderDistribution, setOrderDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          { count: totalOrdersCount },
          { count: totalUsers },
          { count: totalProducts },
          { count: totalSuppliers },
          { data: recentOrdersData },
          { data: topProductsData },
          { data: allOrdersData },
          { data: supData },
        ] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('suppliers').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('id, order_number, profiles(full_name), total, status, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('products').select('id, name, price, stock').order('created_at', { ascending: false }).limit(5),
          supabase.from('orders').select('total, status, created_at, payment_status'),
          supabase.from('suppliers').select('total_sold, commission_rate'),
        ]);

        const paidOrders = allOrdersData?.filter(o => o.payment_status === 'paid') || [];
        const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

        // Process Chart Data (Monthly)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyTotals = {};
        allOrdersData?.forEach(o => {
          const m = new Date(o.created_at).getMonth();
          monthlyTotals[m] = (monthlyTotals[m] || 0) + Number(o.total);
        });
        
        const processedChart = months.map((m, i) => ({ 
          month: m, 
          val: (monthlyTotals[i] || 0) / 1000000 // In Millions
        })).slice(-7); // Last 7 months

        // Process Distribution
        const statusCounts = {};
        allOrdersData?.forEach(o => {
          statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
        });
        const totalOrders = allOrdersData?.length || 1;
        const processedDist = [
          { label: 'Delivered',  val: Math.round(((statusCounts['delivered']  || 0) / totalOrders) * 100), color: '#34A853' },
          { label: 'Shipped',    val: Math.round(((statusCounts['shipped']    || 0) / totalOrders) * 100), color: '#4285F4' },
          { label: 'Processing', val: Math.round(((statusCounts['processing'] || 0) / totalOrders) * 100), color: '#FBBC04' },
          { label: 'Pending',    val: Math.round(((statusCounts['pending']    || 0) / totalOrders) * 100), color: '#94A3B8' },
          { label: 'Cancelled',  val: Math.round(((statusCounts['cancelled']  || 0) / totalOrders) * 100), color: '#EA4335' },
        ];

        setStats({
          totalRevenue,
          totalOrders: totalOrdersCount || 0,
          totalUsers: totalUsers || 0,
          totalProducts: totalProducts || 0,
          totalVendors: totalSuppliers || 0,
        });
        setRecentOrders(recentOrdersData || []);
        setTopProducts(topProductsData || []);
        setChartData(processedChart);
        setOrderDistribution(processedDist);
        if (supData) setSuppliers(supData);
      } catch (err) {
        console.warn('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const owedToSuppliers = suppliers.reduce((sum, s) => sum + (s.total_sold || 0) * (1 - s.commission_rate / 100), 0);
  const consignmentCommissions = suppliers.reduce((sum, s) => sum + (s.total_sold || 0) * (s.commission_rate / 100), 0);
  const ownStockRevenue = stats.totalRevenue - suppliers.reduce((sum, s) => sum + (s.total_sold || 0), 0);
  const myNetProfit = ownStockRevenue + consignmentCommissions;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      <div className="flex-col items-center gap-4">
        <div className="admin-avatar" style={{ width: 60, height: 60, fontSize: 24, animation: 'pulse 1.5s infinite' }}>G</div>
        <div style={{ fontWeight: 600, letterSpacing: 1 }}>SYNCHRONIZING DATA...</div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Welcome back — here's what's happening today.</p>
        </div>
        <span className="badge badge-green">● Live Data</span>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon={TrendingUp} label="Total Revenue" value={fmt(stats.totalRevenue)} change={12.5} color="#34A853" bgColor="rgba(52,168,83,0.15)" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders?.toLocaleString() || '0'} change={8.2} color="#4285F4" bgColor="rgba(66,133,244,0.15)" />
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers?.toLocaleString() || '0'} change={15.3} color="#FBBC04" bgColor="rgba(251,188,4,0.15)" />
        <StatCard icon={Package} label="Total Products" value={stats.totalProducts?.toLocaleString() || '0'} change={5.1} color="#4285F4" bgColor="rgba(66,133,244,0.15)" />
        <StatCard icon={Store} label="Active Vendors" value={stats.totalVendors?.toLocaleString() || '0'} change={3.8} color="#34A853" bgColor="rgba(52,168,83,0.15)" />
      </div>

      {/* Financial Settlement Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ 
          padding: 24, 
          background: 'linear-gradient(135deg, #1E293B, #0F172A)', 
          color: 'white',
          border: 'none',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>My Net Profit</div>
              <div style={{ fontSize: 36, fontWeight: 800, marginTop: 8, color: '#10B981', letterSpacing: -1 }}>{fmt(myNetProfit)}</div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} color="#10B981" />
            </div>
          </div>
          <div style={{ fontSize: 13, marginTop: 16, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 6 }}>
              <Package size={12} /> {fmt(ownStockRevenue)} (Own Stock)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 6 }}>
              <Handshake size={12} /> {fmt(consignmentCommissions)} (Commissions)
            </span>
          </div>
        </div>

        <div className="card" style={{ 
          padding: 24, 
          background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
          border: '1px solid #FDE68A',
          boxShadow: '0 10px 25px rgba(217, 119, 6, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, color: '#D97706', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Owed To Suppliers</div>
              <div style={{ fontSize: 36, fontWeight: 800, marginTop: 8, color: '#B45309', letterSpacing: -1 }}>{fmt(owedToSuppliers)}</div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(217, 119, 6, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Handshake size={24} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: 14, marginTop: 16, color: '#B45309', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Unpaid settlements for {suppliers.length} partners</span>
            <Link to="/suppliers" style={{ color: '#D97706', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 4 }}>
              View Details <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="chart-row" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenue Forecast</span>
            <div className="flex gap-2">
              <span className="badge badge-blue">Monthly</span>
            </div>
          </div>
          <div className="card-body">
            <MiniBarChart data={chartData} />
          </div>
        </div>

        <div className="flex-col gap-4">
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <span className="card-title">Quick Actions</span>
            </div>
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'New Product', icon: Plus, path: '/products', color: 'var(--primary-blue)' },
                { label: 'Add Category', icon: Tag, path: '/categories', color: 'var(--primary-green)' },
                { label: 'Verify Vendors', icon: Store, path: '/vendors', color: 'var(--warning)' },
                { label: 'Manage Users', icon: Users, path: '/users', color: 'var(--primary-blue)' },
              ].map((a) => (
                <Link key={a.label} to={a.path} className="btn btn-ghost" style={{ 
                  flexDirection: 'column', height: 'auto', padding: '16px 8px', 
                  gap: 8, fontSize: 12, border: '1px solid var(--border-light)'
                }}>
                  <div style={{ color: a.color }}><a.icon size={20} /></div>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Recent Orders</span>
          <Link to="/orders" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? recentOrders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>{o.order_number}</td>
                  <td>{o.profiles?.full_name || '—'}</td>
                  <td style={{ fontWeight: 700 }}>{fmt(o.total)}</td>
                  <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(o.created_at).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="chart-row" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Order Distribution</span>
          </div>
          <div className="card-body">
            <DonutChart data={orderDistribution} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Performance Leaders</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {topProducts.length > 0 ? topProducts.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, background: 'var(--surface-bg)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 13, color: 'var(--primary-blue)',
                  flexShrink: 0, border: '1px solid var(--border)'
                }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{p.stock} units in stock</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary-blue)', flexShrink: 0 }}>{fmt(p.price)}</div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 14 }}>No products found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniBarChart({ data }) {
  const max = 30; 
  const H = 220, W = 600, barW = 44, gap = 24;

  return (
    <svg viewBox={`0 0 ${W} ${H + 40}`} style={{ width: '100%', height: 'auto' }}>
      {[0, 10, 20, 30].map((v) => {
        const y = H - (v / max) * H;
        return (
          <g key={v}>
            {/* Grid lines removed for professional look */}
            <text x="-15" y={y + 4} fill="var(--text-muted)" fontSize={11} fontWeight={600} textAnchor="end">{v}M</text>
          </g>
        );
      })}

      {data?.map((d, i) => {
        const x = i * (barW + gap) + 40;
        const barH = (d.val / max) * H;
        const y = H - barH;
        return (
          <g key={i} className="chart-bar-group">
            <rect x={x} y={y} width={barW} height={barH} rx={8} fill="url(#barGrad)" style={{ transition: 'all 0.3s' }} />
            <text x={x + barW / 2} y={H + 24} textAnchor="middle" fill="var(--text-secondary)" fontSize={12} fontWeight={600}>{d.month}</text>
            <text x={x + barW / 2} y={y - 10} textAnchor="middle" fill="var(--primary-blue)" fontSize={12} fontWeight={800}>{Math.round(d.val)}M</text>
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

function DonutChart({ data }) {
  const total = data?.reduce((s, d) => s + (d.val || 0), 0) || 1;
  const cx = 90, cy = 90, r = 75, innerR = 50;
  let startAngle = -Math.PI / 2;

  const slices = data?.map((d) => {
    const angle = (d.val / 100) * 2 * Math.PI;
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
          {slices?.map((s, i) => <path key={i} d={s.path} fill={s.color} style={{ transition: 'all 0.3s' }} />)}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{total}%</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Orders</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
        {data?.map((d, i) => (
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
