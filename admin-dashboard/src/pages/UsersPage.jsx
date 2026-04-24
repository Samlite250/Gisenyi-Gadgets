import React, { useState, useEffect, useCallback } from 'react';
import { Search, Shield, ShieldOff, Eye } from 'lucide-react';
import { supabase } from '../services/supabase';

const DEMO_USERS = [
  { id: 'u1', full_name: 'Samuel Niyomugabo', phone: '+250 788 111 222', role: 'customer', is_active: true,  city: 'Gisenyi', created_at: '2026-01-15T10:00:00Z' },
  { id: 'u2', full_name: 'Amelia Uwase',       phone: '+250 788 333 444', role: 'vendor',   is_active: true,  city: 'Kigali',  created_at: '2026-01-20T08:00:00Z' },
  { id: 'u3', full_name: 'Jean Baptiste',      phone: '+250 788 555 666', role: 'customer', is_active: true,  city: 'Musanze', created_at: '2026-02-05T12:00:00Z' },
  { id: 'u4', full_name: 'Grace Mutoni',       phone: '+250 788 777 888', role: 'customer', is_active: false, city: 'Huye',    created_at: '2026-02-14T09:00:00Z' },
  { id: 'u5', full_name: 'Eric Habimana',      phone: '+250 788 999 000', role: 'vendor',   is_active: true,  city: 'Rubavu',  created_at: '2026-03-01T11:00:00Z' },
  { id: 'u6', full_name: 'Claire Ingabire',    phone: '+250 788 111 333', role: 'customer', is_active: true,  city: 'Gisenyi', created_at: '2026-03-12T14:00:00Z' },
  { id: 'u7', full_name: 'Patrick Uwimana',    phone: '+250 788 222 444', role: 'admin',    is_active: true,  city: 'Kigali',  created_at: '2026-01-01T00:00:00Z' },
];

const ROLE_BADGE   = { customer: 'badge-blue', vendor: 'badge-green', admin: 'badge-yellow' };

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' });

export default function UsersPage() {
  const [users, setUsers]   = useState(DEMO_USERS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRole] = useState('All');
  const [selected, setSelected] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data?.length) setUsers(data);
    } catch { /* keep demo */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleActive = async (u) => {
    setTogglingId(u.id);
    try {
      await supabase.from('profiles').update({ is_active: !u.is_active }).eq('id', u.id);
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, is_active: !u.is_active } : x));
    } catch (err) { alert(err.message); }
    finally { setTogglingId(null); }
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase())
      || u.phone?.includes(search);
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCounts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Users</h2>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        {[
          { label: 'Total Users',     value: users.length,                   color: '#4285F4', bg: 'rgba(66,133,244,0.15)'  },
          { label: 'Customers',       value: roleCounts.customer || 0,        color: '#34A853', bg: 'rgba(52,168,83,0.15)'   },
          { label: 'Vendors',         value: roleCounts.vendor   || 0,        color: '#FBBC04', bg: 'rgba(251,188,4,0.15)'   },
          { label: 'Active',          value: users.filter(u => u.is_active).length, color: '#34A853', bg: 'rgba(52,168,83,0.15)' },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg }}>
              <span style={{ fontSize: 20 }}>👤</span>
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter + Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="search-wrap" style={{ width: 260 }}>
              <Search size={15} className="search-icon" />
              <input className="input input-sm" placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="input input-sm" style={{ width: 130 }} value={roleFilter} onChange={(e) => setRole(e.target.value)}>
              {['All', 'customer', 'vendor', 'admin'].map((r) => <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r === 'All' ? 'All Roles' : r}</option>)}
            </select>
          </div>
          <span className="text-muted">{filtered.length} users</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Role</th><th>City</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                        {u.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.full_name || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted">{u.phone || '—'}</td>
                  <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                  <td className="text-muted">{u.city || '—'}</td>
                  <td><span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>{u.is_active ? 'Active' : 'Blocked'}</span></td>
                  <td className="text-muted">{fmtDate(u.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelected(u)} title="View"><Eye size={14} /></button>
                      <button
                        className={`btn btn-sm btn-icon ${u.is_active ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleActive(u)}
                        disabled={togglingId === u.id || u.role === 'admin'}
                        title={u.is_active ? 'Block User' : 'Activate User'}
                      >
                        {u.is_active ? <ShieldOff size={14} /> : <Shield size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">User Profile</span>
              <span className={`badge ${ROLE_BADGE[selected.role] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{selected.role}</span>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, flexShrink: 0 }}>
                  {selected.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{selected.full_name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Joined {fmtDate(selected.created_at)}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Phone',   value: selected.phone    },
                  { label: 'City',    value: selected.city     },
                  { label: 'Country', value: selected.country  },
                  { label: 'Status',  value: selected.is_active ? 'Active' : 'Blocked' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="form-label">{label}</div>
                    <div style={{ fontWeight: 600 }}>{value || '—'}</div>
                  </div>
                ))}
              </div>
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
