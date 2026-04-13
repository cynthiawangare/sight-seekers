import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';
import { Search, Eye, EyeOff, Trash2, CheckCircle, LayoutGrid, List, Star as StarIcon } from 'lucide-react';
import StatCard from '../../components/admin/shared/StatCard';
import StarRating from '../../components/admin/shared/StarRating';
import ConfirmDialog from '../../components/admin/shared/ConfirmDialog';

const FLAG_MAP = {
  kenya: '🇰🇪', china: '🇨🇳', uk: '🇬🇧', 'united kingdom': '🇬🇧',
  usa: '🇺🇸', 'united states': '🇺🇸', germany: '🇩🇪',
};
function flag(nat = '') { return FLAG_MAP[nat.toLowerCase()] || '🌍'; }

const AVATAR_COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'];
function avatarColor(name = '') {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function avatarInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState({});
  const [packages, setPackages] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('card');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expanded, setExpanded] = useState({});

  async function loadReviews() {
    setLoading(true);
    try {
      const [revSnap, userSnap, pkgSnap] = await Promise.all([
        getDocs(collection(db, 'reviews')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'packages')),
      ]);
      const uMap = {};
      userSnap.docs.forEach(d => { uMap[d.id] = d.data(); });
      const pMap = {};
      pkgSnap.docs.forEach(d => { pMap[d.id] = d.data(); });
      setUsers(uMap);
      setPackages(pMap);

      const list = revSnap.docs.map(d => {
        const r = d.data();
        const user = uMap[r.user_id] || {};
        const pkg = pMap[r.package_id] || {};
        return {
          id: d.id,
          ...r,
          reviewer: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Guest',
          reviewer_nationality: user.nationality || '',
          package_name: pkg.name || r.package_name || 'Unknown Package',
          date: r.created_at?.toDate?.() || null,
        };
      }).sort((a, b) => (b.date || 0) - (a.date || 0));
      setReviews(list);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReviews(); }, []);

  const filtered = reviews.filter(r => {
    const matchSearch = !search ||
      r.reviewer.toLowerCase().includes(search.toLowerCase()) ||
      r.package_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.body?.toLowerCase().includes(search.toLowerCase());
    const matchRating = ratingFilter === 'all' || String(Math.round(r.rating)) === ratingFilter;
    const matchVis = visibilityFilter === 'all' || (visibilityFilter === 'visible' ? r.is_visible !== false : r.is_visible === false);
    return matchSearch && matchRating && matchVis;
  });

  // Stats
  const totalRev = reviews.length;
  const avgRating = totalRev ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / totalRev).toFixed(1) : '0.0';
  const fiveStar = reviews.filter(r => Math.round(r.rating) === 5).length;
  const hidden = reviews.filter(r => r.is_visible === false).length;

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map(s => {
    const cnt = reviews.filter(r => Math.round(r.rating) === s).length;
    return { star: s, count: cnt, pct: totalRev ? (cnt / totalRev) * 100 : 0 };
  });

  async function toggleVisibility(review) {
    const next = review.is_visible === false ? true : false;
    try {
      await updateDoc(doc(db, 'reviews', review.id), { is_visible: next });
      toast.success(next ? 'Review shown' : 'Review hidden');
      loadReviews();
    } catch { toast.error('Failed to update'); }
  }

  async function verifyReview(review) {
    try {
      await updateDoc(doc(db, 'reviews', review.id), { is_verified: true });
      toast.success('Review verified');
      loadReviews();
    } catch { toast.error('Failed to verify'); }
  }

  async function updateRating(reviewId, rating) {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), { rating });
      toast.success('Rating updated');
      loadReviews();
    } catch { toast.error('Failed to update rating'); }
  }

  async function handleDelete(review) {
    try {
      await deleteDoc(doc(db, 'reviews', review.id));
      toast.success('Review deleted');
      loadReviews();
    } catch { toast.error('Failed to delete'); }
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        <StatCard icon={StarIcon} iconBg="rgba(245,158,11,0.15)" iconColor="#F59E0B" label="Total Reviews" value={totalRev} />
        <StatCard icon={StarIcon} iconBg="rgba(16,185,129,0.15)" iconColor="#10B981" label="Average Rating" value={`${avgRating} ⭐`} />
        <StatCard icon={CheckCircle} iconBg="rgba(99,102,241,0.15)" iconColor="#6366F1" label="5★ Reviews" value={fiveStar} />
        <StatCard icon={EyeOff} iconBg="rgba(239,68,68,0.15)" iconColor="#EF4444" label="Hidden Reviews" value={hidden} />
      </div>

      {/* Rating distribution bar chart */}
      <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, padding: 24, marginBottom: 28 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'white', fontFamily: 'Outfit, sans-serif', marginBottom: 16 }}>Rating Distribution</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ratingDist.map(({ star, count, pct }) => {
            const barColor = star >= 4 ? '#F59E0B' : star === 3 ? '#FB923C' : '#EF4444';
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 24, fontSize: 13, color: '#F59E0B', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{star}★</span>
                <div style={{ flex: 1, height: 10, borderRadius: 5, background: 'var(--admin-border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 5, transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ width: 32, fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', textAlign: 'right' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters + view toggle */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reviews..."
            style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: 10, padding: '8px 12px 8px 36px', color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 13, outline: 'none', width: '100%' }}
          />
        </div>
        <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map(s => <option key={s} value={String(s)}>{s} Stars</option>)}
        </select>
        <select value={visibilityFilter} onChange={e => setVisibilityFilter(e.target.value)} style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          <option value="all">All</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
        {/* View toggle */}
        <div style={{ display: 'flex', background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 8, overflow: 'hidden', marginLeft: 'auto' }}>
          {[{ mode: 'card', icon: LayoutGrid }, { mode: 'table', icon: List }].map(({ mode, icon: Icon }) => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{ background: viewMode === mode ? 'var(--admin-accent)' : 'transparent', border: 'none', padding: '8px 12px', cursor: 'pointer', color: viewMode === mode ? 'white' : 'var(--admin-muted)', display: 'flex', alignItems: 'center' }}>
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Card view */}
      {viewMode === 'card' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {filtered.map(r => {
            const isExpanded = expanded[r.id];
            const body = r.body || r.comment || r.text || '';
            const truncated = body.length > 160 && !isExpanded;
            return (
              <div key={r.id} style={{
                background: 'var(--admin-card)',
                border: `1px solid ${r.is_visible === false ? 'rgba(239,68,68,0.3)' : 'var(--admin-border)'}`,
                borderRadius: 16, padding: 24,
                opacity: r.is_visible === false ? 0.65 : 1,
              }}>
                {/* Stars (clickable) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <StarRating value={Math.round(r.rating || 0)} onChange={v => updateRating(r.id, v)} size={18} />
                  {r.is_verified && (
                    <span style={{ fontSize: 11, color: '#10B981', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <CheckCircle size={12} /> Verified
                    </span>
                  )}
                </div>

                {/* Package */}
                <div style={{ fontSize: 10, color: 'var(--admin-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Outfit, sans-serif', marginBottom: 6 }}>
                  {r.package_name}
                </div>

                {/* Title */}
                {r.title && (
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'white', fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>
                    {r.title}
                  </div>
                )}

                {/* Body */}
                <div style={{ fontSize: 14, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.6, marginBottom: 12 }}>
                  {truncated ? body.slice(0, 160) + '…' : body}
                  {body.length > 160 && (
                    <button onClick={() => setExpanded(p => ({ ...p, [r.id]: !isExpanded }))} style={{ background: 'none', border: 'none', color: 'var(--admin-accent)', cursor: 'pointer', fontSize: 13, fontFamily: 'Outfit, sans-serif', padding: 0, marginLeft: 4 }}>
                      {isExpanded ? 'Read less' : 'Read more'}
                    </button>
                  )}
                </div>

                {/* Reviewer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarColor(r.reviewer), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {avatarInitials(r.reviewer)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--admin-text)', fontWeight: 500, fontFamily: 'Outfit, sans-serif' }}>
                      {r.reviewer} {r.reviewer_nationality ? flag(r.reviewer_nationality) : ''}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>
                      {r.date ? r.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => toggleVisibility(r)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 500, background: r.is_visible === false ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)', color: r.is_visible === false ? '#10B981' : '#EF4444' }}
                  >
                    {r.is_visible === false ? <><Eye size={13} /> Show</> : <><EyeOff size={13} /> Hide</>}
                  </button>
                  {!r.is_verified && (
                    <button
                      onClick={() => verifyReview(r)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 500, background: 'rgba(16,185,129,0.1)', color: '#10B981' }}
                    >
                      <CheckCircle size={13} /> Verify
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(r)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && !loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>No reviews found</div>
          )}
        </div>
      )}

      {/* Table view */}
      {viewMode === 'table' && (
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--admin-border)' }}>
                  {['Reviewer', 'Package', 'Rating', 'Review', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const body = r.body || r.comment || r.text || '';
                  return (
                    <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(42,45,62,0.5)' : 'none', opacity: r.is_visible === false ? 0.6 : 1 }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 13, color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
                          {r.reviewer} {r.reviewer_nationality ? flag(r.reviewer_nationality) : ''}
                        </div>
                        {r.is_verified && <div style={{ fontSize: 11, color: '#10B981', fontFamily: 'Outfit, sans-serif' }}>✓ Verified</div>}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--admin-accent)', fontFamily: 'Outfit, sans-serif', maxWidth: 160 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.package_name}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <StarRating value={Math.round(r.rating || 0)} onChange={v => updateRating(r.id, v)} size={14} />
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', maxWidth: 240 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{body.slice(0, 80)}{body.length > 80 ? '…' : ''}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'Outfit, sans-serif', padding: '3px 10px', borderRadius: 100, background: r.is_visible === false ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: r.is_visible === false ? '#EF4444' : '#10B981' }}>
                          {r.is_visible === false ? 'Hidden' : 'Visible'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
                        {r.date ? r.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => toggleVisibility(r)} title={r.is_visible === false ? 'Show' : 'Hide'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)', display: 'flex' }}>
                            {r.is_visible === false ? <Eye size={15} /> : <EyeOff size={15} />}
                          </button>
                          <button onClick={() => setDeleteTarget(r)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-red)', display: 'flex' }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>No reviews found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget)}
        title="Delete Review"
        message="Are you sure you want to permanently delete this review?"
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
