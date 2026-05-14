import React, { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Star, Image as ImageIcon, CheckCircle, Flag, X } from 'lucide-react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

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
  const [reviews, setReviews]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [ratingFilter, setRating] = useState('All');
  const [deleting, setDeleting]   = useState(null);
  const [lightbox, setLightbox]   = useState(null); // photo URL for lightbox

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name), products(name, images)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      toast.error('Failed to load reviews: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Review deleted.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = reviews.filter((r) => {
    const matchSearch =
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      r.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.products?.name?.toLowerCase().includes(search.toLowerCase());
    const matchRating = ratingFilter === 'All' || String(r.rating) === ratingFilter;
    return matchSearch && matchRating;
  });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const withPhotos = reviews.filter(r => r.image_url).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Customer Reviews</h2>
          <p className="page-subtitle">{reviews.length} total · ★ {avgRating} avg · {withPhotos} with photos</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
        {[5,4,3,2,1].map((star) => {
          const count = reviews.filter(r => r.rating === star).length;
          const pct   = reviews.length ? Math.round(count / reviews.length * 100) : 0;
          return (
            <div key={star} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Star size={18} color={STAR_COLOR[star]} fill={STAR_COLOR[star]} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>{star} Star</span>
              <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: STAR_COLOR[star], borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', minWidth: 24 }}>{count}</span>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div className="search-wrap" style={{ width: 260 }}>
              <Search size={15} className="search-icon" />
              <input
                className="input input-sm"
                placeholder="Search reviews, customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input input-sm"
              style={{ width: 130 }}
              value={ratingFilter}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="All">All Stars</option>
              {[5,4,3,2,1].map((s) => <option key={s} value={String(s)}>★ {s} Stars</option>)}
            </select>
          </div>
          <span className="text-muted">{filtered.length} reviews</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading reviews…</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rating</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Comment</th>
                  <th>Photo</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  // Get product thumbnail
                  let productImg = null;
                  try {
                    const imgs = typeof r.products?.images === 'string'
                      ? JSON.parse(r.products.images)
                      : (r.products?.images || []);
                    productImg = imgs[0] || null;
                  } catch {}

                  return (
                    <tr key={r.id}>
                      <td><StarRating rating={r.rating} /></td>
                      <td style={{ fontWeight: 600 }}>{r.profiles?.full_name || 'Anonymous'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {productImg && (
                            <img
                              src={productImg}
                              alt=""
                              style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', background: '#f0f0f0' }}
                            />
                          )}
                          <span style={{ color: 'var(--primary-blue)', fontWeight: 500, fontSize: 13 }}>
                            {r.products?.name || '—'}
                          </span>
                        </div>
                      </td>
                      <td style={{ maxWidth: 280 }}>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.comment || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No comment</span>}
                        </div>
                      </td>
                      <td>
                        {r.image_url ? (
                          <button
                            onClick={() => setLightbox(r.image_url)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            title="View photo"
                          >
                            <img
                              src={r.image_url}
                              alt="review"
                              style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '2px solid var(--border)' }}
                            />
                          </button>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                            <ImageIcon size={14} />
                            <span>—</span>
                          </div>
                        )}
                      </td>
                      <td className="text-muted">{fmtDate(r.created_at)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm btn-icon"
                          onClick={() => handleDelete(r.id)}
                          disabled={deleting === r.id}
                          title="Delete review"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48 }}>
                      {reviews.length === 0 ? 'No reviews yet — customers will see a "Write a review" button on each product.' : 'No reviews match your filter.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Photo Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: '50%', width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={20} color="#fff" />
          </button>
          <img
            src={lightbox}
            alt="Review photo"
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
