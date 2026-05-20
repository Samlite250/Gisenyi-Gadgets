import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Eye, Radio, CheckCircle, XCircle, ImageIcon, Phone, User } from 'lucide-react';
import { supabase } from '../services/supabase';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_BADGE = {
  delivered: 'badge-green', shipped: 'badge-blue', processing: 'badge-yellow',
  confirmed: 'badge-blue', pending: 'badge-gray', cancelled: 'badge-red', refunded: 'badge-gray',
};
const PAY_BADGE = { paid: 'badge-green', unpaid: 'badge-yellow', refunded: 'badge-gray' };

const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;
const fmtDate = (iso) => new Date(iso).toLocaleString('en-RW', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatus] = useState('All');
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  // Modal Specific State
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      let q = supabase.from('orders').select('*, profiles(full_name, phone)').order('created_at', { ascending: false });
      if (statusFilter !== 'All') q = q.eq('status', statusFilter);
      const { data } = await q;
      if (data) setOrders(data);
    } catch (err) {
      console.warn('Orders fetch error:', err.message);
    } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Fetch items when a specific order is selected
  useEffect(() => {
    if (selected) {
      setLoadingItems(true);
      supabase.from('order_items')
        .select('*, products(supplier_id, suppliers(name))')
        .eq('order_id', selected.id)
        .then(({ data }) => {
          setItems(data || []);
          setLoadingItems(false);
        });
    }
  }, [selected]);

  // ── Real-time: incoming orders notify + auto-refresh ───────────────────
  const isFirstLoad = useRef(true);
  useEffect(() => {
    const channel = supabase
      .channel('admin_orders_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        if (!isFirstLoad.current) {
          toast.success(`📦 New order ${payload.new.order_number} received!`, { duration: 5000 });
        }
        fetchOrders();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe(() => { isFirstLoad.current = false; });
    return () => supabase.removeChannel(channel);
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    const tid = toast.loading('Updating status…');
    try {
      const { data: order } = await supabase.from('orders').select('user_id, order_number').eq('id', orderId).single();
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);

      // Push notification to the customer
      if (order) {
        await supabase.from('notifications').insert({
          user_id: order.user_id,
          title: 'Order Updated',
          body: `Your order ${order.order_number} is now ${newStatus}.`,
          type: 'order',
          metadata: { orderId, status: newStatus },
        });
      }

      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selected?.id === orderId) setSelected((s) => ({ ...s, status: newStatus }));
      toast.success(`Status updated to "${newStatus}"`, { id: tid });
    } catch (err) {
      toast.error(err.message, { id: tid });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApproveManual = async (order, approve) => {
    setApprovingId(order.id);
    const tid = toast.loading(approve ? 'Approving payment…' : 'Rejecting payment…');
    try {
      const updates = approve
        ? { payment_status: 'paid', status: 'confirmed', manual_payment_reviewed_at: new Date().toISOString() }
        : { payment_status: 'unpaid', status: 'pending', manual_payment_reviewed_at: new Date().toISOString() };

      await supabase.from('orders').update(updates).eq('id', order.id);

      await supabase.from('notifications').insert({
        user_id: order.user_id,
        title: approve ? 'Payment Confirmed! 🎉' : 'Payment Rejected',
        body: approve
          ? `Your manual payment for order ${order.order_number} has been verified. Your order is now confirmed!`
          : `Your manual payment for order ${order.order_number} was not verified. Please contact support.`,
        type: 'order',
        metadata: { orderId: order.id, status: approve ? 'confirmed' : 'rejected' },
      });

      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...updates } : o));
      setSelected(s => s ? { ...s, ...updates } : s);
      toast.success(approve ? 'Payment approved — order confirmed!' : 'Payment rejected.', { id: tid });
    } catch (err) {
      toast.error(err.message, { id: tid });
    } finally {
      setApprovingId(null);
    }
  };

  const handleMarkAsPaid = async (orderId) => {
    setUpdatingId(orderId);
    const tid = toast.loading('Marking order as paid…');
    try {
      const { data: order } = await supabase.from('orders').select('user_id, order_number').eq('id', orderId).single();
      await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', orderId);

      if (order) {
        await supabase.from('notifications').insert({
          user_id: order.user_id,
          title: 'Payment Confirmed',
          body: `Payment for order ${order.order_number} has been verified and confirmed.`,
          type: 'order',
          metadata: { orderId, payment_status: 'paid' },
        });
      }

      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, payment_status: 'paid' } : o));
      if (selected?.id === orderId) setSelected((s) => ({ ...s, payment_status: 'paid' }));
      toast.success('Order marked as paid! Revenue will now be counted.', { id: tid });
    } catch (err) {
      toast.error(err.message, { id: tid });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch = o.order_number?.toLowerCase().includes(search.toLowerCase())
      || o.profiles?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <Loader message="Fetching customer orders..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 className="page-title">Orders</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(52,168,83,0.12)', borderRadius: 20, padding: '3px 10px' }}>
              <Radio size={11} color="#34A853" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#34A853', letterSpacing: 0.5 }}>LIVE</span>
            </div>
          </div>
          <p className="page-subtitle">{orders.length} total orders · updates in real-time</p>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`badge ${PAY_BADGE[o.payment_status]}`}>{o.payment_status}</span>
                      {o.payment_type === 'manual' && o.payment_status === 'unpaid' && o.manual_payment_screenshot && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', background: '#FEF3C7', padding: '2px 6px', borderRadius: 6 }}>REVIEW</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{o.payment_type === 'manual' ? '📋 Manual' : o.payment_method}</div>
                  </td>
                  <td>
                    <select
                      className="input input-sm"
                      value={o.status}
                      style={{ width: 120 }}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    >
                      {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                        <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-muted">{fmtDate(o.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {o.payment_status === 'unpaid' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleMarkAsPaid(o.id)}
                          disabled={updatingId === o.id}
                          title="Mark as Paid"
                          style={{ fontSize: 11, padding: '4px 10px' }}
                        >
                          💰 Paid
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelected(o)} title="View">
                        <Eye size={14} />
                      </button>
                    </div>
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
          <div className="modal" style={{ maxWidth: 650 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selected.order_number}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{fmtDate(selected.created_at)}</div>
              </div>
              <span className={`badge ${STATUS_BADGE[selected.status]}`} style={{ textTransform: 'capitalize' }}>{selected.status}</span>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Customer', value: selected.profiles?.full_name },
                  { label: 'Phone', value: selected.profiles?.phone },
                  { label: 'Payment', value: selected.payment_method },
                  { label: 'Pay Status', value: selected.payment_status },
                  { label: 'Total Amount', value: fmt(selected.total) },
                  { label: 'Shipping Fee', value: fmt(selected.shipping_fee || 0) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="form-label">{label}</div>
                    <div style={{ fontWeight: 700 }}>{value || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Order Items Table */}
              <div style={{ marginBottom: 24 }}>
                <div className="form-label" style={{ marginBottom: 12 }}>Items & Suppliers</div>
                <div className="table-wrap" style={{ border: '1px solid var(--border)', borderRadius: 12 }}>
                  <table style={{ margin: 0 }}>
                    <thead style={{ background: 'var(--surface-bg)' }}>
                      <tr>
                        <th style={{ fontSize: 11 }}>Product</th>
                        <th style={{ fontSize: 11 }}>Qty</th>
                        <th style={{ fontSize: 11 }}>Supplier</th>
                        <th style={{ fontSize: 11, textAlign: 'right' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingItems ? (
                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, fontSize: 12 }}>Loading items...</td></tr>
                      ) : items.map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontSize: 13, fontWeight: 600 }}>{item.product_name}</td>
                          <td style={{ fontSize: 13 }}>{item.quantity}</td>
                          <td style={{ fontSize: 12 }}>
                            {item.products?.suppliers?.name ? (
                              <span style={{ color: '#F59E0B', fontWeight: 600 }}>🟡 {item.products.suppliers.name}</span>
                            ) : (
                              <span style={{ color: '#10B981', fontWeight: 600 }}>🟢 Own Stock</span>
                            )}
                          </td>
                          <td style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{fmt(item.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Manual Payment Review Panel */}
              {selected.payment_type === 'manual' && selected.manual_payment_screenshot && (
                <div style={{ marginBottom: 24, border: '2px solid #FDE68A', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ background: '#FFFBEB', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ImageIcon size={16} color='#F59E0B' />
                      <span style={{ fontWeight: 800, fontSize: 14, color: '#92400E' }}>Manual Payment Proof</span>
                    </div>
                    {selected.payment_status === 'paid'
                      ? <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', background: '#F0FDF4', padding: '3px 10px', borderRadius: 20 }}>✓ Approved</span>
                      : selected.manual_payment_reviewed_at
                      ? <span style={{ fontSize: 12, fontWeight: 700, color: '#EA4335', background: '#FEF2F2', padding: '3px 10px', borderRadius: 20 }}>✗ Rejected</span>
                      : <span style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B', background: '#FEF3C7', padding: '3px 10px', borderRadius: 20 }}>⏳ Awaiting Review</span>
                    }
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Payer details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{ background: 'var(--surface-bg)', borderRadius: 10, padding: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <User size={13} color='var(--text-muted)' />
                          <span className="form-label" style={{ marginBottom: 0 }}>Payer Name</span>
                        </div>
                        <div style={{ fontWeight: 700 }}>{selected.manual_payment_names || '—'}</div>
                      </div>
                      <div style={{ background: 'var(--surface-bg)', borderRadius: 10, padding: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Phone size={13} color='var(--text-muted)' />
                          <span className="form-label" style={{ marginBottom: 0 }}>Payer Number</span>
                        </div>
                        <div style={{ fontWeight: 700 }}>{selected.manual_payment_phone || '—'}</div>
                      </div>
                    </div>

                    {/* Screenshot */}
                    <div>
                      <div className="form-label" style={{ marginBottom: 8 }}>Payment Screenshot</div>
                      <a href={selected.manual_payment_screenshot} target="_blank" rel="noreferrer">
                        <img
                          src={selected.manual_payment_screenshot}
                          alt="Payment proof"
                          style={{ width: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 12, border: '1px solid var(--border)', cursor: 'zoom-in', background: '#F8FAFC' }}
                        />
                      </a>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Click image to open full size</p>
                    </div>

                    {/* Approve / Reject buttons — only if not yet reviewed */}
                    {selected.payment_status !== 'paid' && (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button
                          className="btn btn-primary"
                          style={{ flex: 1, background: '#16A34A', borderColor: '#16A34A', gap: 8 }}
                          disabled={approvingId === selected.id}
                          onClick={() => handleApproveManual(selected, true)}
                        >
                          <CheckCircle size={16} />
                          {approvingId === selected.id ? 'Processing…' : 'Approve & Confirm Order'}
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{ flex: 1, borderColor: '#EA4335', color: '#EA4335', gap: 8 }}
                          disabled={approvingId === selected.id}
                          onClick={() => handleApproveManual(selected, false)}
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selected.shipping_address && (
                <div style={{ background: 'var(--surface-bg)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div className="form-label" style={{ marginBottom: 0 }}>Delivery Address</div>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ padding: '2px 8px', fontSize: 11 }}
                      onClick={() => {
                        const newAddr = prompt('Edit Address:', selected.shipping_address.address);
                        if (newAddr) {
                          const updated = { ...selected.shipping_address, address: newAddr };
                          supabase.from('orders').update({ shipping_address: updated }).eq('id', selected.id).then(() => {
                            setSelected({ ...selected, shipping_address: updated });
                            setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, shipping_address: updated } : o));
                          });
                        }
                      }}
                    >
                      Edit
                    </button>
                  </div>
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
