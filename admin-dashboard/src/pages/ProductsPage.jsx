import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Package } from 'lucide-react';
import { supabase } from '../services/supabase';

const DEMO_PRODUCTS = [
  { id: 'p1', name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: 850000, compare_price: 950000, stock: 12, is_active: true, is_featured: true,  categories: { name: 'Smartphones' } },
  { id: 'p2', name: 'iPhone 15 Pro Max',        brand: 'Apple',   price: 1200000,compare_price: null,   stock: 8,  is_active: true, is_featured: true,  categories: { name: 'Smartphones' } },
  { id: 'p3', name: 'AirPods Pro (3rd Gen)',    brand: 'Apple',   price: 120000, compare_price: 150000, stock: 25, is_active: true, is_featured: false, categories: { name: 'Headphones'  } },
  { id: 'p4', name: 'MacBook Air M3',           brand: 'Apple',   price: 1450000,compare_price: null,   stock: 5,  is_active: true, is_featured: true,  categories: { name: 'Laptops'     } },
  { id: 'p5', name: 'Sony WH-1000XM5',          brand: 'Sony',    price: 195000, compare_price: 220000, stock: 18, is_active: true, is_featured: false, categories: { name: 'Headphones'  } },
  { id: 'p6', name: 'iPad Pro 12.9"',           brand: 'Apple',   price: 980000, compare_price: 1100000,stock: 7,  is_active: true, is_featured: false, categories: { name: 'Tablets'     } },
];

const EMPTY_FORM = { name: '', brand: '', price: '', compare_price: '', stock: '', description: '', is_featured: false, is_active: true };

const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;

export default function ProductsPage() {
  const [products, setProducts]   = useState(DEMO_PRODUCTS);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEdit]    = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });
      if (data?.length) setProducts(data);
    } catch { /* keep demo */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setEdit(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p) => {
    setEdit(p);
    setForm({ name: p.name, brand: p.brand || '', price: p.price, compare_price: p.compare_price || '', stock: p.stock, description: p.description || '', is_featured: p.is_featured, is_active: p.is_active });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), compare_price: form.compare_price ? Number(form.compare_price) : null, stock: Number(form.stock) };
      if (editProduct) {
        await supabase.from('products').update(payload).eq('id', editProduct.id);
        setProducts((prev) => prev.map((p) => p.id === editProduct.id ? { ...p, ...payload } : p));
      } else {
        const { data } = await supabase.from('products').insert(payload).select().single();
        setProducts((prev) => [data || { ...payload, id: Date.now().toString() }, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err.message || 'Failed to save product.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    setDeleting(id);
    try {
      await supabase.from('products').delete().eq('id', id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) { alert(err.message); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Products</h2>
          <p className="page-subtitle">{products.length} total products</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrap" style={{ width: 280 }}>
            <Search size={15} className="search-icon" />
            <input className="input input-sm" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="text-muted">{filtered.length} results</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.brand}</div>
                  </td>
                  <td><span className="badge badge-blue">{p.categories?.name || '—'}</span></td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{fmt(p.price)}</div>
                    {p.compare_price && <div style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{fmt(p.compare_price)}</div>}
                  </td>
                  <td>
                    <span className={`badge ${p.stock > 10 ? 'badge-green' : p.stock > 0 ? 'badge-yellow' : 'badge-red'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.is_active ? 'badge-green' : 'badge-gray'}`}>
                      {p.is_active ? 'Active' : 'Hidden'}
                    </span>
                    {p.is_featured && <span className="badge badge-yellow" style={{ marginLeft: 4 }}>Featured</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(p)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(p.id)} disabled={deleting === p.id} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editProduct ? 'Edit Product' : 'Add Product'}</span>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Product Name *</label>
                    <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Samsung Galaxy S24" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Samsung, Apple..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock *</label>
                    <input className="input" type="number" required min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (RWF) *</label>
                    <input className="input" type="number" required min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="850000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Compare Price (RWF)</label>
                    <input className="input" type="number" min={0} value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} placeholder="950000" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Description</label>
                    <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description..." style={{ resize: 'vertical' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 20, gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                      Featured product
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                      Active (visible)
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editProduct ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
