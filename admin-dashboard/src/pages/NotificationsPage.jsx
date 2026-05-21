import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Trash2, Send, Users, User, X, Package, Tag, Star, Truck, ShoppingBag, Search } from 'lucide-react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const TYPE_OPTIONS = [
  { value: 'general',  label: 'General',  color: '#6366F1' },
  { value: 'promo',    label: 'Promo',    color: '#EA4335' },
  { value: 'order',    label: 'Order',    color: '#4285F4' },
  { value: 'delivery', label: 'Delivery', color: '#34A853' },
  { value: 'review',   label: 'Review',   color: '#FBBC04' },
  { value: 'system',   label: 'System',   color: '#F97316' },
];

const TYPE_ICON = {
  order: Package, promo: Tag, review: Star,
  delivery: Truck, general: ShoppingBag, system: Bell,
};

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-RW', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const EMPTY_FORM = { title: '', body: '', type: 'general', target: 'all', user_id: '' };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [userSearch, setUserSearch] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: notifs }, { data: profiles }] = await Promise.all([
        supabase.from('notifications').select('*, profiles(full_name, email)').order('created_at', { ascending: false }).limit(200),
        supabase.from('profiles').select('id, full_name, email').order('full_name'),
      ]);
      setNotifications(notifs || []);
      setUsers(profiles || []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Title and message are required');
      return;
    }
    if (form.target === 'user' && !form.user_id) {
      toast.error('Please select a user');
      return;
    }
    setSending(true);
    try {
      if (form.target === 'all') {
        // Broadcast: insert one row per user + one with null for future users
        const rows = users.map(u => ({
          user_id: u.id,
          title: form.title.trim(),
          body: form.body.trim(),
          type: form.type,
          is_read: false,
        }));
        if (rows.length > 0) {
          const { error } = await supabase.from('notifications').insert(rows);
          if (error) throw error;
        }
        toast.success(`Sent to ${rows.length} users`);
      } else {
        const { error } = await supabase.from('notifications').insert({
          user_id: form.user_id,
          title: form.title.trim(),
          body: form.body.trim(),
          type: form.type,
          is_read: false,
        });
        if (error) throw error;
        toast.success('Notification sent');
      }
      setForm(EMPTY_FORM);
      setShowCompose(false);
      fetchAll();
    } catch (err) {
      toast.error(err.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = notifications.filter(n => {
    const matchType = typeFilter === 'All' || n.type === typeFilter.toLowerCase();
    const matchSearch = !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.body?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    broadcast: notifications.filter(n => !n.user_id).length,
  };

  const filteredUsers = users.filter(u =>
    !userSearch || u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const selectedType = TYPE_OPTIONS.find(t => t.value === form.type);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Send and manage user notifications</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCompose(true)}>
          <Plus size={16} /> Compose
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Sent',  value: stats.total,     color: '#4285F4', bg: 'rgba(66,133,244,0.1)'  },
          { label: 'Unread',      value: stats.unread,    color: '#EA4335', bg: 'rgba(234,67,53,0.1)'   },
          { label: 'Broadcast',   value: stats.broadcast, color: '#F97316', bg: 'rgba(249,115,22,0.1)'  },
          { label: 'Users',       value: users.length,    color: '#34A853', bg: 'rgba(52,168,83,0.1)'   },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              <Bell size={20} />
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="table-toolbar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search notifications…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          {['All', ...TYPE_OPTIONS.map(t => t.label)].map(f => (
            <button
              key={f}
              className={`filter-pill ${typeFilter === f ? 'active' : ''}`}
              onClick={() => setTypeFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading…</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Message</th>
                <th>Recipient</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No notifications found</td></tr>
              ) : filtered.map(n => {
                const typeCfg = TYPE_OPTIONS.find(t => t.value === n.type) || TYPE_OPTIONS[0];
                const Icon = TYPE_ICON[n.type] || Bell;
                return (
                  <tr key={n.id}>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: typeCfg.color + '18', color: typeCfg.color,
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      }}>
                        <Icon size={11} />
                        {typeCfg.label}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, maxWidth: 180 }}>{n.title}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 240, fontSize: 13 }}>
                      <span title={n.body}>{n.body?.length > 80 ? n.body.slice(0, 80) + '…' : n.body}</span>
                    </td>
                    <td>
                      {n.user_id
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                            <User size={13} color="var(--text-muted)" />
                            {n.profiles?.full_name || n.profiles?.email || n.user_id.slice(0, 8) + '…'}
                          </span>
                        : <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#F97316', fontSize: 13, fontWeight: 600 }}>
                            <Users size={13} /> All Users
                          </span>
                      }
                    </td>
                    <td>
                      <span className={n.is_read ? 'badge badge-green' : 'badge badge-blue'}>
                        {n.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(n.created_at)}</td>
                    <td>
                      <button
                        className="icon-btn danger"
                        onClick={() => handleDelete(n.id)}
                        disabled={deletingId === n.id}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="modal-overlay" onClick={() => setShowCompose(false)}>
          <div className="modal-box" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Compose Notification</h3>
              <button className="modal-close" onClick={() => setShowCompose(false)}><X size={18} /></button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Target */}
              <div className="form-group">
                <label className="form-label">Send To</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { value: 'all',  label: 'All Users',      Icon: Users },
                    { value: 'user', label: 'Specific User',  Icon: User  },
                  ].map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      onClick={() => setForm(f => ({ ...f, target: value, user_id: '' }))}
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${form.target === value ? '#4285F4' : 'var(--border)'}`,
                        background: form.target === value ? 'rgba(66,133,244,0.08)' : 'var(--bg)',
                        color: form.target === value ? '#4285F4' : 'var(--text-secondary)',
                        fontWeight: 600, fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      <Icon size={15} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* User picker */}
              {form.target === 'user' && (
                <div className="form-group">
                  <label className="form-label">Select User</label>
                  <input
                    className="form-input"
                    placeholder="Search by name or email…"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
                    {filteredUsers.map(u => (
                      <div
                        key={u.id}
                        onClick={() => { setForm(f => ({ ...f, user_id: u.id })); setUserSearch(''); }}
                        style={{
                          padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                          background: form.user_id === u.id ? 'rgba(66,133,244,0.1)' : 'transparent',
                          color: form.user_id === u.id ? '#4285F4' : 'var(--text-primary)',
                          fontWeight: form.user_id === u.id ? 700 : 400,
                          borderBottom: '1px solid var(--border)',
                          display: 'flex', flexDirection: 'column', gap: 2,
                        }}
                      >
                        <span>{u.full_name || '(no name)'}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</span>
                      </div>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div style={{ padding: 16, color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>No users found</div>
                    )}
                  </div>
                  {form.user_id && (
                    <div style={{ marginTop: 6, fontSize: 12, color: '#4285F4', fontWeight: 600 }}>
                      ✓ {users.find(u => u.id === form.user_id)?.full_name || 'User selected'}
                    </div>
                  )}
                </div>
              )}

              {/* Type */}
              <div className="form-group">
                <label className="form-label">Type</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TYPE_OPTIONS.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setForm(f => ({ ...f, type: t.value }))}
                      style={{
                        padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                        border: `2px solid ${form.type === t.value ? t.color : 'var(--border)'}`,
                        background: form.type === t.value ? t.color + '18' : 'transparent',
                        color: form.type === t.value ? t.color : 'var(--text-secondary)',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="form-group">
                <label className="form-label">Title <span style={{ color: '#EA4335' }}>*</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. Flash Sale — 40% Off Today!"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  maxLength={100}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>{form.title.length}/100</div>
              </div>

              {/* Body */}
              <div className="form-group">
                <label className="form-label">Message <span style={{ color: '#EA4335' }}>*</span></label>
                <textarea
                  className="form-input"
                  placeholder="Write your notification message here…"
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  rows={4}
                  maxLength={500}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>{form.body.length}/500</div>
              </div>

              {/* Preview */}
              {(form.title || form.body) && (
                <div style={{
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: 14,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Preview</div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: (selectedType?.color || '#6366F1') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bell size={18} color={selectedType?.color || '#6366F1'} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{form.title || 'Notification title'}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{form.body || 'Message body…'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowCompose(false); setForm(EMPTY_FORM); }}>Cancel</button>
              <button className="btn-primary" onClick={handleSend} disabled={sending}>
                <Send size={15} />
                {sending ? 'Sending…' : form.target === 'all' ? `Send to All (${users.length})` : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
