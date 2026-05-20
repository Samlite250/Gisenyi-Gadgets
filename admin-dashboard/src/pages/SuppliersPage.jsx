import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Edit2, Trash2, X, Phone,
  User, Percent, Package, TrendingUp, Eye,
  ChevronRight, Building2, CheckCircle, ShoppingBag, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';
import Loader from '../components/Loader';




const EMPTY_FORM = {
  name: '', phone: '', business_name: '', location: '',
  commission_rate: 15, notes: '', is_active: true,
};

const fmtRWF = (n) => `RWF ${Number(n || 0).toLocaleString()}`;
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' });

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Fetch suppliers with product counts
  const fetchSuppliers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false });
      if (!error && data?.length) {
        // Get product counts for each supplier
        const suppliersWithCounts = await Promise.all(
          data.map(async (supplier) => {
            const { count } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('supplier_id', supplier.id);
            return { ...supplier, products_count: count || 0 };
          })
        );
        setSuppliers(suppliersWithCounts);
      }
    } catch { /* use demo data */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  // Fetch products when viewing a supplier
  useEffect(() => {
    if (viewTarget) {
      setLoadingProducts(true);
      supabase
        .from('products')
        .select('*, categories(name)')
        .eq('supplier_id', viewTarget.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setSupplierProducts(data || []);
          setLoadingProducts(false);
        });
    } else {
      setSupplierProducts([]);
    }
  }, [viewTarget]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditTarget(s);
    setForm({
      name: s.name, phone: s.phone, business_name: s.business_name,
      location: s.location, commission_rate: s.commission_rate,
      notes: s.notes || '', is_active: s.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Name and phone are required.');
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        const { error } = await supabase.from('suppliers').update(form).eq('id', editTarget.id);
        if (error) throw error;
        setSuppliers(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...form } : s));
        toast.success('Supplier updated successfully!');
      } else {
        const { data, error } = await supabase.from('suppliers').insert(form).select().single();
        if (error) throw error;
        setSuppliers(prev => [data, ...prev]);
        toast.success('Supplier added successfully!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error('Error saving supplier: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    setDeleting(s.id);
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', s.id);
      if (error) throw error;
      setSuppliers(prev => prev.filter(x => x.id !== s.id));
      toast.success('Supplier removed successfully!');
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(null); }
  };

  const handleToggleActive = async (s) => {
    try {
      const { error } = await supabase.from('suppliers').update({ is_active: !s.is_active }).eq('id', s.id);
      if (error) throw error;
      setSuppliers(prev => prev.map(x => x.id === s.id ? { ...x, is_active: !x.is_active } : x));
    } catch (err) { toast.error(err.message); }
  };

  const filtered = suppliers.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.location?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search)
  );

  const totalOwed = suppliers.reduce((sum, s) => {
    const theirCut = (s.total_sold || 0) * (1 - s.commission_rate / 100);
    return sum + theirCut;
  }, 0);
  const myCommission = suppliers.reduce((sum, s) => {
    return sum + (s.total_sold || 0) * (s.commission_rate / 100);
  }, 0);

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading suppliers...</div>;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Suppliers</h2>
          <p className="page-subtitle">
            {suppliers.filter(s => s.is_active).length} active · manage consignment partners & commission rates
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={15} /> Add Supplier
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Suppliers', value: suppliers.length, icon: User, color: '#3B82F6' },
          { label: 'Active Partners', value: suppliers.filter(s => s.is_active).length, icon: CheckCircle, color: '#10B981' },
          { label: 'My Commission Earned', value: fmtRWF(myCommission), icon: TrendingUp, color: '#8B5CF6' },
          { label: 'Total Owed to Suppliers', value: fmtRWF(totalOwed), icon: Package, color: '#F59E0B' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div className="stat-card" key={label} style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: 16, top: 16, color, opacity: 0.15 }}>
              <Icon size={42} />
            </div>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div className="search-wrap" style={{ width: 280 }}>
            <Search size={15} className="search-icon" />
            <input
              className="input input-sm"
              placeholder="Search by name, business, location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="text-muted">{filtered.length} suppliers</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Business</th>
                <th>Phone</th>
                <th>Commission</th>
                <th>Products</th>
                <th>Total Sold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0
                      }}>
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.location}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Building2 size={13} color="var(--text-muted)" />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{s.business_name || '—'}</span>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={12} color="var(--text-muted)" />
                      <span style={{ fontSize: 13 }}>{s.phone}</span>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
                      color: '#7C3AED', fontWeight: 800, fontSize: 13,
                      padding: '3px 10px', borderRadius: 20,
                    }}>
                      <Percent size={11} />
                      {s.commission_rate}%
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 700 }}>{s.products_count}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> items</span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{fmtRWF(s.total_sold)}</div>
                      <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>
                        → Your cut: {fmtRWF((s.total_sold || 0) * s.commission_rate / 100)}
                      </div>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => handleToggleActive(s)}
                      style={{
                        border: 'none', background: 'none', cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <span className={`badge ${s.is_active ? 'badge-green' : 'badge-red'}`}>
                        {s.is_active ? '● Active' : '● Inactive'}
                      </span>
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" title="View details" onClick={() => setViewTarget(s)}>
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => openEdit(s)}>
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        title="Delete"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDelete(s)}
                        disabled={deleting === s.id}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48 }}>
                    <User size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
                    <div>No suppliers found. Add your first consignment partner.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editTarget ? 'Edit Supplier' : 'Add New Supplier'}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Full Name *</label>
                <input className="input" placeholder="e.g. Jean-Pierre Habimana" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Phone Number *</label>
                <input className="input" placeholder="+250 788 ..." value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Business Name</label>
                <input className="input" placeholder="e.g. JP Electronics" value={form.business_name}
                  onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Location / Area</label>
                <input className="input" placeholder="e.g. Gisenyi Market" value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Your Commission Rate (%)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type="number" min="1" max="50"
                    placeholder="e.g. 15"
                    value={form.commission_rate}
                    onChange={e => setForm(f => ({ ...f, commission_rate: Number(e.target.value) }))}
                    style={{ paddingRight: 36 }}
                  />
                  <Percent size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
                <div style={{ fontSize: 11, color: '#10B981', marginTop: 4, fontWeight: 600 }}>
                  You keep {form.commission_rate}% of every sale from this supplier
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Notes</label>
                <textarea className="input" rows={3} placeholder="Payment terms, product types, delivery schedule..."
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ resize: 'vertical', minHeight: 72 }} />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox" id="is_active" checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="is_active" style={{ cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  Active supplier (currently providing products)
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Supplier'}
              </button>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewTarget && (
        <div className="modal-overlay" onClick={() => setViewTarget(null)}>
          <div className="modal" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 18,
                }}>
                  {viewTarget.name.charAt(0)}
                </div>
                <div>
                  <div className="modal-title">{viewTarget.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{viewTarget.business_name}</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewTarget(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              {/* Commission Breakdown */}
              <div style={{
                background: 'linear-gradient(135deg, #EDE9FE, #F5F3FF)',
                borderRadius: 12, padding: 16, marginBottom: 16,
                border: '1px solid #DDD6FE'
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Settlement Summary
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Total Sales', value: fmtRWF(viewTarget.total_sold), color: '#1E293B' },
                    { label: 'Commission Rate', value: `${viewTarget.commission_rate}%`, color: '#7C3AED' },
                    { label: 'Your Earnings', value: fmtRWF((viewTarget.total_sold || 0) * viewTarget.commission_rate / 100), color: '#10B981' },
                    { label: 'Amount to Pay Back', value: fmtRWF((viewTarget.total_sold || 0) * (1 - viewTarget.commission_rate / 100)), color: '#EF4444' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact & Basic Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Phone', value: viewTarget.phone },
                  { label: 'Location', value: viewTarget.location },
                  { label: 'Products Listed', value: `${viewTarget.products_count} items` },
                  { label: 'Partner Since', value: fmtDate(viewTarget.created_at) },
                  { label: 'Status', value: viewTarget.is_active ? '● Active' : '● Inactive' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="form-label">{label}</div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{value || '—'}</div>
                  </div>
                ))}
              </div>

              {viewTarget.notes && (
                <div style={{ marginBottom: 16, background: 'var(--surface-bg)', borderRadius: 10, padding: 12, border: '1px solid var(--border)' }}>
                  <div className="form-label" style={{ marginBottom: 4 }}>Notes</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{viewTarget.notes}</div>
                </div>
              )}

              {/* Products from this supplier */}
              <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingBag size={16} color="#7C3AED" />
                    <div className="form-label" style={{ marginBottom: 0 }}>
                      Products from {viewTarget.name} ({supplierProducts.length})
                    </div>
                  </div>
                </div>

                {loadingProducts ? (
                  <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Loading products...</div>
                ) : supplierProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', background: 'var(--surface-bg)', borderRadius: 8 }}>
                    No products assigned to this supplier yet. Assign products when adding/editing them.
                  </div>
                ) : (
                  <div className="table-wrap" style={{ border: '1px solid var(--border)', borderRadius: 8, maxHeight: 400, overflow: 'auto' }}>
                    <table style={{ margin: 0 }}>
                      <thead style={{ background: 'var(--surface-bg)', position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ fontSize: 11 }}>Product Name</th>
                          <th style={{ fontSize: 11 }}>Category</th>
                          <th style={{ fontSize: 11, textAlign: 'right' }}>Selling Price</th>
                          <th style={{ fontSize: 11, textAlign: 'right' }}>Cost</th>
                          <th style={{ fontSize: 11, textAlign: 'right' }}>Your Income</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplierProducts.map((product) => {
                          const sellingPrice = Number(product.price || 0);
                          const cost = Number(product.cost || 0);
                          const yourIncome = sellingPrice * (viewTarget.commission_rate / 100);
                          const supplierGets = sellingPrice - yourIncome;

                          return (
                            <tr key={product.id}>
                              <td style={{ fontSize: 13, fontWeight: 600 }}>{product.name}</td>
                              <td style={{ fontSize: 12 }}>
                                <span style={{
                                  background: 'var(--surface-bg)',
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 600
                                }}>
                                  {product.categories?.name || 'Uncategorized'}
                                </span>
                              </td>
                              <td style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>
                                {fmtRWF(sellingPrice)}
                              </td>
                              <td style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
                                {fmtRWF(cost)}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>
                                  {fmtRWF(yourIncome)}
                                </div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                  ({viewTarget.commission_rate}%)
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {supplierProducts.length > 0 && (
                        <tfoot style={{ background: 'var(--surface-bg)', fontWeight: 700 }}>
                          <tr>
                            <td colSpan={4} style={{ fontSize: 13, textAlign: 'right', paddingRight: 12 }}>
                              Total Your Income Per Sale:
                            </td>
                            <td style={{ fontSize: 14, color: '#10B981', textAlign: 'right' }}>
                              {fmtRWF(
                                supplierProducts.reduce((sum, p) => {
                                  return sum + (Number(p.price || 0) * (viewTarget.commission_rate / 100));
                                }, 0)
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => { setViewTarget(null); openEdit(viewTarget); }}>
                <Edit2 size={14} /> Edit
              </button>
              <button className="btn btn-ghost" onClick={() => setViewTarget(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
