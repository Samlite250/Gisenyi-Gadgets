import React, { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Star } from 'lucide-react';
import { supabase } from '../services/supabase';

const DEMO_REVIEWS = [
  { id: 'r1', rating: 5, title: 'Amazing phone!',      body: 'Best smartphone I have ever used. Camera quality is incredible.', created_at: '2026-04-20T09:00:00Z', profiles: { full_name: 'Samuel Niyomugabo' }, products: { name: 'Samsung Galaxy S24 Ultra' } },
  { id: 'r2', rating: 4, title: 'Great laptop',        body: 'Very fast and lightweight. Battery could be better.', created_at: '2026-04-19T11:00:00Z', profiles: { full_name: 'Amelia Uwase'       }, products: { name: 'MacBook Air M3'         } },
  { id: 'r3', rating: 2, title: 'Disappointed',        body: 'The noise cancellation is not as good as advertised.', created_at: '2026-04-18T14:00:00Z', profiles: { full_name: 'Jean Baptiste'     }, products: { name: 'Sony WH-1000XM5'        } },
  { id: 'r4', rating: 5, title: 'Perfect earbuds!',    body: 'Sound quality is phenomenal. Worth every franc.', created_at: '2026-04-17T08:00:00Z', profiles: { full_name: 'Grace Mutoni'       }, products: { name: 'AirPods Pro (3rd Gen)'  } },
  { id: 'r5', rating: 3, title: 'Good but expensive',  body: 'Nice product but the price is too high for Rwandan market.', created_at: '2026-04-16T16:00:00Z', profiles: { full_name: 'Eric Habimana'     }, products: { name: 'iPhone 15 Pro Max'      } },
];

const STAR_COLOR = { 5: '#34A853', 4: '#34A853', 3: '#FBBC04', 2: '#EA4335', 1: '#EA4335' };

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' });

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={14} color={s <= rating ? '#FBBC04' : 'var(--border)'} fill={s <= rating ? '#FBBC04' : 'none'} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews]   = useState(DEMO_REVIEWS);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [ratingFilter, setRating] = useState('All');
  const [deleting, setDeleting] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('reviews')
        .select('*, profiles(full_name), products(name)')
        .order('created_at', { ascending: false });
      if (data?.length) setReviews(data);
    } catch { /* keep demo */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    setDeleting(id);
    try {
      await supabase.from('reviews').delete().eq('id', id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) { alert(err.message); }
    finally { setDeleting(null); }
  };

  const filtered = reviews.filter((r) => {
    const matchSearch = r.title?.toLowerCase().includes(search.toLowerCase())
      || r.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
      || r.products?.name?.toLowerCase().includes(search.toLowerCase());
    const matchRating = ratingFilter === 'All' || String(r.rating) === ratingFilter;
    return matchSearch && matchRating;
  });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Reviews</h2>
          <p className="page-subtitle">{reviews.length} total reviews · Avg rating: ★ {avgRating}</p>
        </div>
      </div>

      {/* Rating distribution */}
      <div className="card" style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 32, color: '#FBBC04' }}>★ {avgRating}</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[5,4,3,2,1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct = reviews.length ? Math.round(count / reviews.length * 100) : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <Star size={13} color="#FBBC04" fill="#FBBC04" />
                  <span style={{ fontWeight: 600 }}>{star}</span>
                  <div style={{ width: 80, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: STAR_COLOR[star], borderRadius: 3 }} />
                  </div>
                  <span className="text-muted">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="search-wrap" style={{ width: 260 }}>
              <Search size={15} className="search-icon" />
              <input className="input input-sm" placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="input input-sm" style={{ width: 120 }} value={ratingFilter} onChange={(e) => setRating(e.target.value)}>
              <option value="All">All Stars</option>
              {[5,4,3,2,1].map((s) => <option key={s} value={String(s)}>★ {s} Stars</option>)}
            </select>
          </div>
          <span className="text-muted">{filtered.length} reviews</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Rating</th><th>Customer</th><th>Product</th><th>Review</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td><StarRating rating={r.rating} /></td>
                  <td style={{ fontWeight: 600 }}>{r.profiles?.full_name || '—'}</td>
                  <td><span style={{ color: 'var(--primary-blue)', fontWeight: 500, fontSize: 13 }}>{r.products?.name || '—'}</span></td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.body}</div>
                  </td>
                  <td className="text-muted">{fmtDate(r.created_at)}</td>
                  <td>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(r.id)} disabled={deleting === r.id} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No reviews found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
