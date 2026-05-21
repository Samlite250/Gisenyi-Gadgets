import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';

const EMPTY_BANNER = { type: 'banner', title: '', subtitle: '', button_text: 'Shop Now', color: '#1E293B', image_url: '', sort_order: 0, is_active: true };
const EMPTY_OFFER  = { type: 'offer',  label: '', discount: '', tagline: '', color: '#3B82F6', image_url: '', link_category: '', sort_order: 0, is_active: true };

const CATEGORY_SLUGS = ['smartphones','laptops','headphones','smartwatches','tablets','cameras','gaming','accessories'];

export default function BannersPage() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('banner'); // 'banner' | 'offer'
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]         = useState(EMPTY_BANNER);
  const [saving, setSaving]     = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const { data } = await supabase.from('banners').select('*').order('sort_order');
      if (data) setItems(data);
    } catch (err) {
      // // console.warn('Banners fetch error:', err.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter(b => b.type === tab);

  const openAdd = () => {
    setEditItem(null);
    setForm(tab === 'banner' ? { ...EMPTY_BANNER } : { ...EMPTY_OFFER });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ ...item });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        const { data, error } = await supabase.from('banners').update({ ...form, sort_order: Number(form.sort_order) }).eq('id', editItem.id).select().single();
        if (error) throw error;
        setItems(prev => prev.map(b => b.id === editItem.id ? data : b));
        toast.success('Item updated successfully!');
      } else {
        const { data, error } = await supabase.from('banners').insert({ ...form, sort_order: Number(form.sort_order) }).select().single();
        if (error) throw error;
        setItems(prev => [...prev, data]);
        toast.success('Item added successfully!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
      setItems(prev => prev.filter(b => b.id !== id));
      toast.success('Item deleted successfully!');
    } catch (err) { toast.error(err.message); }
  };

  const toggleActive = async (item) => {
    try {
      const updated = { ...item, is_active: !item.is_active };
      const { error } = await supabase.from('banners').update({ is_active: updated.is_active }).eq('id', item.id);
      if (error) throw error;
      setItems(prev => prev.map(b => b.id === item.id ? updated : b));
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Banners & Offers</h2>
          <p className="page-subtitle">Manage the promotional cards shown in the mobile app</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add {tab === 'banner' ? 'Banner' : 'Offer'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['banner', 'offer'].map(t => (
          <button
            key={t}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(t)}
          >
            {t === 'banner' ? '🖼️ Banners' : '🏷️ Special Offers'}
            <span className="badge badge-blue" style={{ marginLeft: 6 }}>
              {items.filter(b => b.type === t).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {filtered.map(item => (
          <div key={item.id} className="card" style={{ overflow: 'hidden', opacity: item.is_active ? 1 : 0.55 }}>
            {/* Color header */}
            <div style={{
              background: item.color, height: 100, position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px'
            }}>
              {item.image_url ? (
                <img src={item.image_url} alt="" style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 120, objectFit: 'cover', opacity: 0.7 }} />
              ) : (
                <ImageIcon size={32} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: 16 }} />
              )}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {tab === 'banner' ? (
                  <>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase' }}>{item.subtitle}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.3, marginTop: 4 }}>{item.title?.replace(/\\n/g, ' ')}</div>
                  </>
                ) : (
                  <>
                    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 900, color: '#fff', display: 'inline-block', marginBottom: 4 }}>{item.discount}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{item.tagline}</div>
                  </>
                )}
              </div>
            </div>
            {/* Card body */}
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className={`badge ${item.is_active ? 'badge-green' : 'badge-gray'}`} style={{ cursor: 'pointer' }} onClick={() => toggleActive(item)}>
                  {item.is_active ? 'Active' : 'Hidden'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>Order: {item.sort_order}</span>
                {tab === 'offer' && item.link_category && (
                  <span className="badge badge-blue" style={{ marginLeft: 6 }}>{item.link_category}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(item)}><Edit2 size={14} /></button>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && !loading && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div>No {tab === 'banner' ? 'banners' : 'special offers'} yet. Click "Add" to create one.</div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editItem ? 'Edit' : 'Add'} {tab === 'banner' ? 'Banner' : 'Special Offer'}</span>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  {tab === 'banner' ? (
                    <>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Title (use \n for line break) *</label>
                        <input className="input" required value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Big Sale Up to\n40% OFF" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Subtitle</label>
                        <input className="input" value={form.subtitle || ''} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="On all electronics" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Button Text</label>
                        <input className="input" value={form.button_text || ''} onChange={e => setForm({ ...form, button_text: e.target.value })} placeholder="Shop Now" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="form-label">Label (Category Name) *</label>
                        <input className="input" required value={form.label || ''} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Smartphones" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Discount Badge *</label>
                        <input className="input" required value={form.discount || ''} onChange={e => setForm({ ...form, discount: e.target.value })} placeholder="30% OFF" />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Tagline</label>
                        <input className="input" value={form.tagline || ''} onChange={e => setForm({ ...form, tagline: e.target.value })} placeholder="Top picks this week" />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Link to Category</label>
                        <select className="input" value={form.link_category || ''} onChange={e => setForm({ ...form, link_category: e.target.value })} style={{ appearance: 'auto' }}>
                          <option value="">— None —</option>
                          {CATEGORY_SLUGS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Image URL *</label>
                    <input className="input" required value={form.image_url || ''} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://images.unsplash.com/..." />
                    {form.image_url && <img src={form.image_url} alt="Preview" style={{ marginTop: 8, height: 80, borderRadius: 8, objectFit: 'cover' }} />}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Background Color</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={form.color || '#1E293B'} onChange={e => setForm({ ...form, color: e.target.value })} style={{ width: 44, height: 44, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }} />
                      <input className="input" value={form.color || ''} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="#1E293B" style={{ flex: 1 }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input className="input" type="number" min={0} value={form.sort_order ?? 0} onChange={e => setForm({ ...form, sort_order: e.target.value })} />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input type="checkbox" checked={!!form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                      Active (visible in app)
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
