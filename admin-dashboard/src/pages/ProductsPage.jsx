import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Package, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';

const EMPTY_FORM = { name: '', brand: '', price: '', compare_price: '', stock: '', description: '', is_featured: false, is_active: true, images: [], supplier_id: null, category_id: null };

const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEdit] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*, categories(name), suppliers(name)')
        .order('created_at', { ascending: false });
      if (data) setProducts(data);
    } catch (err) {
      console.warn('Products fetch error:', err.message);
    } finally { setLoading(false); }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const { data } = await supabase.from('suppliers').select('*').order('name');
      if (data) setSuppliers(data);
    } catch (err) {
      console.warn('Suppliers fetch error:', err.message);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    } catch (err) {
      console.warn('Categories fetch error:', err.message);
    }
  }, []);

  useEffect(() => { 
    fetchProducts(); 
    fetchSuppliers();
    fetchCategories();
  }, [fetchProducts, fetchSuppliers, fetchCategories]);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.categories?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

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
      images: p.images || [],
      supplier_id: p.supplier_id || null,
      category_id: p.category_id || null
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
        toast.error('Error uploading image: ' + error.message);
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
        const { error } = await supabase.from('products').update(payload).eq('id', editProduct.id);
        if (error) throw error;
        setProducts((prev) => prev.map((p) => p.id === editProduct.id ? { ...p, ...payload } : p));
        toast.success('Product updated successfully!');
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select('*, categories(name), suppliers(name)').single();
        if (error) throw error;
        setProducts((prev) => [data, ...prev]);
        toast.success('Product created successfully!');
      }
      if (editProduct) fetchProducts(); // refresh relations
      setShowModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save product.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted successfully!');
    } catch (err) { toast.error(err.message); }
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

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Products', value: totalProducts, icon: Package, color: '#3B82F6' },
          { label: 'Active Listings', value: activeProducts, icon: CheckCircle, color: '#10B981' },
          { label: 'Out of Stock', value: outOfStock, icon: AlertCircle, color: '#EF4444' },
          { label: 'Total Stock Value', value: fmt(totalValue), icon: TrendingUp, color: '#8B5CF6' },
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

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        <button 
          className={`btn ${selectedCategory === 'All' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setSelectedCategory('All')}
          style={{ whiteSpace: 'nowrap' }}
        >
          All Products
        </button>
        {categories.map(c => (
          <button 
            key={c.id}
            className={`btn ${selectedCategory === c.name ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedCategory(c.name)}
            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, background: selectedCategory === c.name ? '' : '#fff', border: selectedCategory === c.name ? '' : '1px solid var(--border)' }}
          >
            {c.icon && <span>{c.icon}</span>}
            {c.name}
          </button>
        ))}
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
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Ownership</th><th>Status</th><th>Actions</th></tr>
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
                    {p.supplier_id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }}></span>
                          Consigned
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.suppliers?.name || 'Unknown Supplier'}</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#10B981', fontWeight: 600 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}></span>
                        Own Stock
                      </div>
                    )}
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
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No products found</td></tr>
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
                    <label className="form-label">Category *</label>
                    <select 
                      className="input" 
                      required
                      value={form.category_id || ''} 
                      onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
                      style={{ appearance: 'auto' }}
                    >
                      <option value="">— Select Category —</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Ownership / Supplier</label>
                    <select 
                      className="input" 
                      value={form.supplier_id || ''} 
                      onChange={(e) => setForm({ ...form, supplier_id: e.target.value || null })}
                      style={{ appearance: 'auto' }}
                    >
                      <option value="">🟢 Own Stock (100% Profit)</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>🟡 Consigned from: {s.name} ({s.commission_rate}% commission)</option>
                      ))}
                    </select>
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
