import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../services/supabase';

const DEMO_ORDERS = [
  { id: 'o1', order_number: '#GGS001', created_at: '2026-04-23T08:12:00Z', status: 'delivered',  payment_method: 'momo', payment_status: 'paid',   total: 1200000, profiles: { full_name: 'Samuel Niyomugabo', phone: '+250 788 111 222' } },
  { id: 'o2', order_number: '#GGS002', created_at: '2026-04-23T09:45:00Z', status: 'shipped',    payment_method: 'card', payment_status: 'paid',   total: 1450000, profiles: { full_name: 'Amelia Uwase',       phone: '+250 788 333 444' } },
  { id: 'o3', order_number: '#GGS003', created_at: '2026-04-23T11:00:00Z', status: 'pending',    payment_method: 'cash', payment_status: 'unpaid', total: 120000,  profiles: { full_name: 'Jean Baptiste',     phone: '+250 788 555 666' } },
  { id: 'o4', order_number: '#GGS004', created_at: '2026-04-22T14:30:00Z', status: 'processing', payment_method: 'momo', payment_status: 'paid',   total: 850000,  profiles: { full_name: 'Grace Mutoni',      phone: '+250 788 777 888' } },
  { id: 'o5', order_number: '#GGS005', created_at: '2026-04-22T10:00:00Z', status: 'cancelled',  payment_method: 'card', payment_status: 'refunded',total: 195000, profiles: { full_name: 'Eric Habimana',     phone: '+250 788 999 000' } },
  { id: 'o6', order_number: '#GGS006', created_at: '2026-04-21T16:20:00Z', status: 'delivered',  payment_method: 'momo', payment_status: 'paid',   total: 980000,  profiles: { full_name: 'Claire Ingabire',   phone: '+250 788 111 333' } },
];

const STATUS_OPTIONS = ['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_BADGE = {
  delivered:  'badge-green', shipped: 'badge-blue', processing: 'badge-yellow',
  confirmed:  'badge-blue',  pending: 'badge-gray',  cancelled:  'badge-red', refunded: 'badge-gray',
};
const PAY_BADGE = { paid: 'badge-green', unpaid: 'badge-yellow', refunded: 'badge-gray' };

const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;
const fmtDate = (iso) => new Date(iso).toLocaleString('en-RW', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function OrdersPage() {
  const [orders, setOrders]         = useState(DEMO_ORDERS);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('All');
  const [selected, setSelected]     = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      let q = supabase.from('orders').select('*, profiles(full_name, phone)').order('created_at', { ascending: false });
      if (statusFilter !== 'All') q = q.eq('status', statusFilter);
      const { data } = await q;
      if (data?.length) setOrders(data);
    } catch { /* keep demo */ }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selected?.id === orderId) setSelected((s) => ({ ...s, status: newStatus }));
    } catch (err) { alert(err.message); }
    finally { setUpdatingId(null); }
  };

  const filtered = orders.filter((o) => {
    const matchSearch = o.order_number?.toLowerCase().includes(search.toLowerCase())
      || o.profiles?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Orders</h2>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setStatus(s)}
            style={{ textTransform: s === 'All' ? 'none' : 'capitalize' }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrap" style={{ width: 280 }}>
            <Search size={15} className="search-icon" />
            <input className="input input-sm" placeholder="Search orders or customers..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="text-muted">{filtered.length} results</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td><span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{o.order_number}</span></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.profiles?.full_name || '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{o.profiles?.phone}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{fmt(o.total)}</td>
                  <td>
                    <div><span className={`badge ${PAY_BADGE[o.payment_status]}`}>{o.payment_status}</span></div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{o.payment_method}</div>
                  </td>
                  <td>
                    <select
                      className="input input-sm"
                      value={o.status}
                      style={{ width: 120 }}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    >
                      {['pending','confirmed','processing','shipped','delivered','cancelled'].map((s) => (
                        <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-muted">{fmtDate(o.created_at)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelected(o)} title="View">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selected.order_number}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{fmtDate(selected.created_at)}</div>
              </div>
              <span className={`badge ${STATUS_BADGE[selected.status]}`} style={{ textTransform: 'capitalize' }}>{selected.status}</span>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Customer', value: selected.profiles?.full_name },
                  { label: 'Phone',    value: selected.profiles?.phone     },
                  { label: 'Payment',  value: selected.payment_method      },
                  { label: 'Pay Status', value: selected.payment_status    },
                  { label: 'Total',    value: fmt(selected.total)          },
                  { label: 'Shipping', value: fmt(selected.shipping_fee || 0) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="form-label">{label}</div>
                    <div style={{ fontWeight: 600 }}>{value || '—'}</div>
                  </div>
                ))}
              </div>
              {selected.shipping_address && (
                <div style={{ background: 'var(--surface-bg)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                  <div className="form-label" style={{ marginBottom: 4 }}>Delivery Address</div>
                  <div>{selected.shipping_address.address}</div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
