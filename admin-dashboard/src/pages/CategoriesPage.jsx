import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';

const EMPTY_FORM = { name: '', slug: '', icon: '', image_url: '', is_active: true, sort_order: 0 };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEdit] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      if (data) setCategories(data);
    } catch (err) {
      // // console.warn('Categories fetch error:', err.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEdit(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c) => {
    setEdit(c);
    setForm({ ...c });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, sort_order: Number(form.sort_order) };
      if (editCat) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editCat.id);
        if (error) throw error;
        setCategories((prev) => prev.map((c) => c.id === editCat.id ? { ...c, ...payload } : c));
        toast.success('Category updated successfully!');
      } else {
        const { data, error } = await supabase.from('categories').insert(payload).select().single();
        if (error) throw error;
        setCategories((prev) => [...prev, data]);
        toast.success('Category added successfully!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Category deleted successfully!');
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading Categories...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Categories</h2>
          <p className="page-subtitle">{categories.length} total categories</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrap" style={{ width: 280 }}>
            <Search size={15} className="search-icon" />
            <input className="input input-sm" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="text-muted">{filtered.length} results</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Category</th><th>Slug</th><th>Icon</th><th>Sort</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                  </td>
                  <td className="text-muted">{c.slug}</td>
                  <td style={{ fontSize: 20 }}>{c.icon}</td>
                  <td>{c.sort_order}</td>
                  <td>
                    <span className={`badge ${c.is_active ? 'badge-green' : 'badge-gray'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(c)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(c.id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editCat ? 'Edit Category' : 'Add Category'}</span>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Category Name *</label>
                    <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Slug</label>
                    <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Icon (Emoji)</label>
                    <input className="input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. 📱" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input className="input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 32, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                      Active Category
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
