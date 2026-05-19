import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import {
  Search, RefreshCw, CheckCircle, XCircle, Clock,
  CreditCard, Smartphone, Banknote, TrendingUp,
  ArrowUpRight, ArrowDownRight, Eye, X, ExternalLink,
} from 'lucide-react';

// ─── constants ────────────────────────────────────────────────────────────────
const TABS = ['all', 'automatic', 'manual', 'cash'];

const STATUS_META = {
  paid:    { label: 'Paid',    color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  unpaid:  { label: 'Pending', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  failed:  { label: 'Failed',  color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  refunded:{ label: 'Refunded',color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
};

const TYPE_ICON = {
  automatic: <Smartphone size={14} />,
  manual:    <CreditCard size={14} />,
  cash:      <Banknote size={14} />,
};

const fmt = (n) => `RWF ${Number(n || 0).toLocaleString()}`;
const fmtDate = (d) => new Date(d).toLocaleString('en-RW', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── component ────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('all');
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [selected, setSelected]   = useState(null);
  const [approving, setApproving] = useState(false);
  const [stats, setStats]         = useState({ total: 0, paid: 0, pending: 0, failed: 0, revenue: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, total, payment_method, payment_status, payment_type,
        manual_payment_names, manual_payment_phone, manual_payment_screenshot,
        manual_payment_reviewed_at, created_at, updated_at, status,
        shipping_address
      `)
      .order('created_at', { ascending: false });

    if (error) { toast.error('Failed to load transactions'); setLoading(false); return; }

    setRows(data || []);

    const all = data || [];
    setStats({
      total:   all.length,
      paid:    all.filter(r => r.payment_status === 'paid').length,
      pending: all.filter(r => r.payment_status === 'unpaid').length,
      failed:  all.filter(r => r.payment_status === 'failed').length,
      revenue: all.filter(r => r.payment_status === 'paid').reduce((s, r) => s + Number(r.total), 0),
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Real-time
  useEffect(() => {
    const ch = supabase
      .channel('transactions-watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [load]);

  // ── derived rows ──────────────────────────────────────────────────────────
  const typeOf = (r) => {
    if (r.payment_method === 'cash') return 'cash';
    if (r.payment_type === 'manual') return 'manual';
    return 'automatic';
  };

  const filtered = rows.filter(r => {
    const matchTab    = tab === 'all' || typeOf(r) === tab;
    const matchStatus = statusFilter === 'all' || r.payment_status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || [
      r.order_number, r.manual_payment_names, r.manual_payment_phone,
      r.shipping_address?.name, r.payment_status,
    ].some(v => v?.toLowerCase().includes(q));
    return matchTab && matchStatus && matchSearch;
  });

  // ── approve / reject manual ───────────────────────────────────────────────
  const handleApprove = async (order, approve) => {
    setApproving(true);
    const update = approve
      ? { payment_status: 'paid', status: 'confirmed', manual_payment_reviewed_at: new Date().toISOString() }
      : { payment_status: 'unpaid', status: 'pending',  manual_payment_reviewed_at: new Date().toISOString() };

    const { error } = await supabase.from('orders').update(update).eq('id', order.id);
    if (error) { toast.error('Update failed'); setApproving(false); return; }

    toast.success(approve ? 'Payment approved ✓' : 'Payment rejected');
    setApproving(false);
    setSelected(null);
    load();
  };

  // ── stats cards ───────────────────────────────────────────────────────────
  const STAT_CARDS = [
    { label: 'Total Revenue',    value: fmt(stats.revenue), icon: TrendingUp,   color: '#2563EB', bg: '#EFF6FF', trend: '+12%', up: true  },
    { label: 'Paid',             value: stats.paid,         icon: CheckCircle,  color: '#16A34A', bg: '#F0FDF4', trend: null },
    { label: 'Pending Review',   value: stats.pending,      icon: Clock,        color: '#D97706', bg: '#FFFBEB', trend: null },
    { label: 'Failed / Unpaid',  value: stats.failed,       icon: XCircle,      color: '#DC2626', bg: '#FEF2F2', trend: null },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, trend, up }) => (
          <div key={label} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={22} color={color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{value}</div>
            </div>
            {trend && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: up ? '#16A34A' : '#DC2626' }}>
                {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{trend}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>

        {/* Type tabs */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--bg)', borderRadius: 10, padding: 4 }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 12, textTransform: 'capitalize', transition: 'all 0.15s',
                background: tab === t ? 'var(--primary-blue)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text-muted)',
              }}
            >{t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
          className="input input-sm"
          style={{ width: 140 }}
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Pending</option>
          <option value="failed">Failed</option>
        </select>

        {/* Search */}
        <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} className="search-icon" />
          <input
            className="input input-sm"
            placeholder="Search by order #, name, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>

        <button className="btn btn-ghost btn-sm" onClick={load} title="Refresh">
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* ── Table ── */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No transactions found</td></tr>
              ) : filtered.map(r => {
                const type    = typeOf(r);
                const meta    = STATUS_META[r.payment_status] || STATUS_META.unpaid;
                const needsReview = type === 'manual' && r.payment_status === 'unpaid' && r.manual_payment_screenshot;
                return (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(r)}>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 13 }}>#{r.order_number}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{r.manual_payment_names || r.shipping_address?.name || '—'}</div>
                      {r.manual_payment_phone && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.manual_payment_phone}</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: type === 'manual' ? '#EFF6FF' : type === 'cash' ? '#F0FDF4' : '#F5F3FF',
                          color: type === 'manual' ? '#2563EB' : type === 'cash' ? '#16A34A' : '#7C3AED',
                        }}>
                          {TYPE_ICON[type]}
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: 14 }}>{fmt(r.total)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
                        }}>
                          {meta.label}
                        </span>
                        {needsReview && (
                          <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
                            REVIEW
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(r.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={e => { e.stopPropagation(); setSelected(r); }}
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Row count */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {rows.length} transactions
        </div>
      </div>

      {/* ── Detail modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 560, width: '100%' }} onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--text-primary)' }}>
                  Transaction #{selected.order_number}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{fmtDate(selected.created_at)}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>

            {/* Summary grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Amount',   value: fmt(selected.total) },
                { label: 'Status',   value: (STATUS_META[selected.payment_status] || STATUS_META.unpaid).label },
                { label: 'Type',     value: typeOf(selected).charAt(0).toUpperCase() + typeOf(selected).slice(1) },
                { label: 'Method',   value: selected.payment_method?.toUpperCase() || '—' },
                { label: 'Customer', value: selected.manual_payment_names || selected.shipping_address?.name || '—' },
                { label: 'Phone',    value: selected.manual_payment_phone || selected.shipping_address?.phone || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Manual proof panel */}
            {selected.payment_type === 'manual' && selected.manual_payment_screenshot && (
              <div style={{ border: '1.5px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>

                <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>Payment Screenshot</span>
                  <a href={selected.manual_payment_screenshot} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--primary-blue)', fontWeight: 700, textDecoration: 'none' }}>
                    Open <ExternalLink size={12} />
                  </a>
                </div>

                <img
                  src={selected.manual_payment_screenshot}
                  alt="Payment proof"
                  style={{ width: '100%', maxHeight: 280, objectFit: 'contain', background: '#000', display: 'block' }}
                />
              </div>
            )}

            {/* Approve / reject — only for manual pending */}
            {selected.payment_type === 'manual' && selected.payment_status !== 'paid' && selected.manual_payment_screenshot && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn btn-sm"
                  style={{ flex: 1, background: '#16A34A', color: '#fff', fontWeight: 800, borderRadius: 12, height: 44, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: approving ? 0.6 : 1 }}
                  onClick={() => handleApprove(selected, true)}
                  disabled={approving}
                >
                  <CheckCircle size={16} /> Approve Payment
                </button>
                <button
                  className="btn btn-sm"
                  style={{ flex: 1, background: '#FEF2F2', color: '#DC2626', fontWeight: 800, borderRadius: 12, height: 44, border: '1.5px solid #FECACA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: approving ? 0.6 : 1 }}
                  onClick={() => handleApprove(selected, false)}
                  disabled={approving}
                >
                  <XCircle size={16} /> Reject
                </button>
              </div>
            )}

            {/* Already reviewed badge */}
            {selected.payment_status === 'paid' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#F0FDF4', borderRadius: 12, border: '1.5px solid #BBF7D0' }}>
                <CheckCircle size={18} color="#16A34A" />
                <span style={{ fontWeight: 700, fontSize: 13, color: '#16A34A' }}>Payment confirmed and approved</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
