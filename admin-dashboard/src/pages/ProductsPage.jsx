import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Package } from 'lucide-react';
import { supabase } from '../services/supabase';

const EMPTY_FORM = { name: '', brand: '', price: '', compare_price: '', stock: '', description: '', is_featured: false, is_active: true, images: [] };

const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEdit] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });
      if (data) setProducts(data);
    } catch (err) {
      console.warn('Products fetch error:', err.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEdit(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p) => {
    setEdit(p);
    setForm({
      name: p.name,
      brand: p.brand || '',
      price: p.price,
      compare_price: p.compare_price || '',
      stock: p.stock,
      description: p.description || '',
      is_featured: p.is_featured,
      is_active: p.is_active,
      images: p.images || []
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setSaving(true);
    const newImages = [...form.images];

    for (const file of files) {
      if (newImages.length >= 5) break;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) {
        alert('Error uploading image: ' + error.message);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        newImages.push(publicUrl);
      }
    }
    setForm({ ...form, images: newImages });
    setSaving(false);
  };

  const removeImage = (index) => {
    const newImages = form.images.filter((_, i) => i !== index);
    setForm({ ...form, images: newImages });
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden', background: '#f5f5f5', border: '1px solid #eee' }}>
                        {p.images?.[0] ? <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={20} style={{ margin: 10, color: '#bbb' }} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.brand}</div>
                      </div>
                    </div>
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
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
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
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Product Images (Up to 5)</label>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                      {form.images.map((url, i) => (
                        <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12 }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {form.images.length < 5 && (
                        <label style={{
                          width: 80, height: 80, borderRadius: 8, border: '2px dashed var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: 'var(--text-muted)'
                        }}>
                          <Plus size={20} />
                          <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Description</label>
                    <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description..." style={{ resize: 'vertical' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 20, gridColumn: 'span 2' }}>
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
