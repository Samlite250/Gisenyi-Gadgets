import React, { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import { supabase } from '../services/supabase';

const DEMO_VENDORS = [
  { id: 'v1', shop_name: 'TechHub Gisenyi',  owner_id: 'u2', email: 'techhub@gmail.com',   phone: '+250 788 111 000', location: 'Gisenyi',  is_verified: true,  is_active: true,  rating: 4.8, total_sales: 245, created_at: '2026-01-20T08:00:00Z', profiles: { full_name: 'Amelia Uwase'  } },
  { id: 'v2', shop_name: 'Kigali Electronics',owner_id: 'u5', email: 'kigalielec@gmail.com', phone: '+250 788 222 000', location: 'Kigali',   is_verified: true,  is_active: true,  rating: 4.5, total_sales: 189, created_at: '2026-02-01T09:00:00Z', profiles: { full_name: 'Eric Habimana' } },
  { id: 'v3', shop_name: 'Rwanda Gadgets',   owner_id: 'u3', email: 'rwgadgets@gmail.com',  phone: '+250 788 333 000', location: 'Musanze',  is_verified: false, is_active: true,  rating: 4.2, total_sales: 67,  created_at: '2026-03-10T11:00:00Z', profiles: { full_name: 'Jean Baptiste' } },
  { id: 'v4', shop_name: 'Smart Store RW',   owner_id: 'u6', email: 'smartstore@gmail.com', phone: '+250 788 444 000', location: 'Butare',   is_verified: false, is_active: false, rating: 0,   total_sales: 0,   created_at: '2026-04-01T10:00:00Z', profiles: { full_name: 'Claire Ingabire'} },
];

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' });

export default function VendorsPage() {
  const [vendors, setVendors]     = useState(DEMO_VENDORS);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);
  const [togglingId, setToggling] = useState(null);

  const fetchVendors = useCallback(async () => {
    try {
      const { data } = await supabase.from('vendors').select('*, profiles(full_name)').order('created_at', { ascending: false });
      if (data?.length) setVendors(data);
    } catch { /* keep demo */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const toggleVerify = async (v) => {
    setToggling(v.id);
    try {
      await supabase.from('vendors').update({ is_verified: !v.is_verified }).eq('id', v.id);
      setVendors((prev) => prev.map((x) => x.id === v.id ? { ...x, is_verified: !v.is_verified } : x));
    } catch (err) { alert(err.message); }
    finally { setToggling(null); }
  };

  const filtered = vendors.filter((v) =>
    v.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Vendors</h2>
          <p className="page-subtitle">{vendors.length} registered vendors · {vendors.filter(v => v.is_verified).length} verified</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 16 }}>
        {[
          { label: 'Total Vendors',    value: vendors.length },
          { label: 'Verified',         value: vendors.filter(v => v.is_verified).length },
          { label: 'Pending Review',   value: vendors.filter(v => !v.is_verified && v.is_active).length },
          { label: 'Total Sales',      value: vendors.reduce((s, v) => s + (v.total_sales || 0), 0) },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrap" style={{ width: 280 }}>
            <Search size={15} className="search-icon" />
            <input className="input input-sm" placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="text-muted">{filtered.length} vendors</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Shop</th><th>Owner</th><th>Location</th><th>Sales</th><th>Rating</th><th>Verified</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{v.shop_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.email}</div>
                  </td>
                  <td>{v.profiles?.full_name || '—'}</td>
                  <td className="text-muted">{v.location}</td>
                  <td><span style={{ fontWeight: 700 }}>{v.total_sales}</span></td>
                  <td>
                    {v.rating > 0
                      ? <span style={{ color: '#FBBC04', fontWeight: 700 }}>★ {v.rating}</span>
                      : <span className="text-muted">—</span>}
                  </td>
                  <td>
                    <span className={`badge ${v.is_verified ? 'badge-green' : 'badge-yellow'}`}>
                      {v.is_verified ? '✓ Verified' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelected(v)} title="View">
                        <Eye size={14} />
                      </button>
                      <button
                        className={`btn btn-sm ${v.is_verified ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleVerify(v)}
                        disabled={togglingId === v.id}
                        style={{ fontSize: 12, padding: '4px 10px' }}
                      >
                        {v.is_verified ? <><XCircle size={13} /> Revoke</> : <><CheckCircle size={13} /> Verify</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No vendors found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{selected.shop_name}</span>
              <span className={`badge ${selected.is_verified ? 'badge-green' : 'badge-yellow'}`}>{selected.is_verified ? 'Verified' : 'Pending'}</span>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Owner',    value: selected.profiles?.full_name },
                  { label: 'Email',    value: selected.email               },
                  { label: 'Phone',    value: selected.phone               },
                  { label: 'Location', value: selected.location            },
                  { label: 'Rating',   value: selected.rating > 0 ? `★ ${selected.rating}` : '—' },
                  { label: 'Total Sales', value: selected.total_sales      },
                  { label: 'Status',   value: selected.is_active ? 'Active' : 'Inactive' },
                  { label: 'Joined',   value: fmtDate(selected.created_at) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="form-label">{label}</div>
                    <div style={{ fontWeight: 600 }}>{value || '—'}</div>
                  </div>
                ))}
              </div>
              {selected.description && (
                <div style={{ marginTop: 16, background: 'var(--surface-bg)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                  <div className="form-label" style={{ marginBottom: 4 }}>Description</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{selected.description}</div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className={`btn ${selected.is_verified ? 'btn-danger' : 'btn-success'}`}
                onClick={() => { toggleVerify(selected); setSelected((s) => ({ ...s, is_verified: !s.is_verified })); }}
              >
                {selected.is_verified ? 'Revoke Verification' : 'Verify Vendor'}
              </button>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
