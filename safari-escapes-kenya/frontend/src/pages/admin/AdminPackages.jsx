import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../components/admin/shared/ConfirmDialog';

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadPackages() {
    setLoading(true);
    try {
      const [pkgSnap, bookSnap] = await Promise.all([
        getDocs(collection(db, 'packages')),
        getDocs(collection(db, 'bookings')),
      ]);

      const bkMap = {};
      const revMap = {};
      bookSnap.docs.forEach(d => {
        const b = d.data();
        if (b.package_id) {
          bkMap[b.package_id] = (bkMap[b.package_id] || 0) + 1;
          if (b.payment_status === 'completed') revMap[b.package_id] = (revMap[b.package_id] || 0) + (b.total_price || 0);
        }
      });
const reviewSnap = await getDocs(collection(db, 'reviews'));
      const ratingMap = {};
      const ratingCountMap = {};
      reviewSnap.docs.forEach(d => {
        const r = d.data();
        if (r.package_id) {
          ratingMap[r.package_id] = (ratingMap[r.package_id] || 0) + (r.rating || 0);
          ratingCountMap[r.package_id] = (ratingCountMap[r.package_id] || 0) + 1;
        }
      });

      setPackages(pkgSnap.docs.map(d => {
        const data = d.data();
        const cnt = ratingCountMap[d.id] || 0;
        return {
          id: d.id,
          ...data,
          _bookings: bkMap[d.id] || 0,
          _revenue: (revMap[d.id] || 0) / 100,
          _rating: cnt ? (ratingMap[d.id] / cnt).toFixed(1) : '—',
        };
      }));
    } catch (err) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPackages(); }, []);

  const filtered = packages.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(pkg) {
    try {
      await deleteDoc(doc(db, 'packages', pkg.id));
      toast.success('Package deleted');
      loadPackages();
    } catch {
      toast.error('Failed to delete');
    }
  }

  async function toggleActive(pkg) {
    try {
      await updateDoc(doc(db, 'packages', pkg.id), { is_active: !pkg.is_active });
      toast.success(pkg.is_active ? 'Package deactivated' : 'Package activated');
      loadPackages();
    } catch {
      toast.error('Failed to update');
    }
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif', margin: 0 }}>Packages</h1>
          <p style={{ color: 'var(--admin-muted)', fontSize: 14, fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>Manage your tour packages</p>
        </div>
        <Link
          to="/admin/packages/new"
          style={{ background: 'var(--admin-accent)', color: 'white', borderRadius: 8, padding: '10px 20px', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={16} /> Add Package
        </Link>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search packages..."
          style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 10, padding: '10px 16px', color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 14, outline: 'none', width: '100%', maxWidth: 320 }}
        />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {filtered.map(pkg => (
          <div key={pkg.id} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Image */}
            <div style={{ position: 'relative', height: 180 }}>
              {pkg.images?.[0]
                ? <img src={pkg.images[0]} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1E2130, #2A2D3E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🦁</div>
              }
              {/* Status badge */}
              <span style={{
                position: 'absolute', top: 10, right: 10,
                padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, fontFamily: 'Outfit, sans-serif',
                background: pkg.is_active !== false ? 'rgba(16,185,129,0.9)' : 'rgba(100,116,139,0.9)',
                color: 'white',
                cursor: 'pointer',
              }}
                onClick={() => toggleActive(pkg)}
                title="Click to toggle"
              >
                ● {pkg.is_active !== false ? 'Active' : 'Inactive'}
              </span>
              {/* Featured badge */}
              {pkg.is_featured && (
                <span style={{
                  position: 'absolute', top: 10, left: 10,
                  padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, fontFamily: 'Outfit, sans-serif',
                  background: 'rgba(245,158,11,0.9)', color: 'white',
                }}>
                  ★ Featured
                </span>
              )}
            </div>

            {/* Body */}
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                {pkg.tour_type || 'Safari'}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', fontFamily: 'Outfit, sans-serif', margin: '0 0 8px' }}>
                {pkg.name}
              </h3>
              <div style={{ fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', marginBottom: 12 }}>
                📅 {pkg.duration_days || '—'} Days · 👥 Max {pkg.max_travelers || pkg.max_group_size || '—'} travelers
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--admin-green)', fontFamily: 'Outfit, sans-serif' }}>
                  ${((pkg.price_per_person || 0) / 100).toLocaleString()}
                </span>
                <span style={{ fontSize: 13, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>/person</span>
              </div>
              {pkg.discount_percent > 0 && (
                <div style={{ fontSize: 12, color: 'var(--admin-gold)', fontFamily: 'Outfit, sans-serif', marginBottom: 12 }}>
                  🏷️ {pkg.discount_percent}% discount active
                </div>
              )}

              {/* Stats */}
              <div style={{ borderTop: '1px solid var(--admin-border)', marginTop: 16, paddingTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { label: 'Bookings', value: pkg._bookings },
                  { label: 'Avg Rating', value: pkg._rating === '—' ? '—' : `${pkg._rating}⭐` },
                  { label: 'Revenue', value: `$${pkg._revenue.toLocaleString()}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif' }}>{value}</div>
                    <div style={{ fontSize: 11, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Link
                  to={`/admin/packages/${pkg.id}/edit`}
                  style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--admin-accent)', background: 'transparent', color: 'var(--admin-accent)', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 500, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <Pencil size={13} /> Edit
                </Link>
                <button
                  onClick={() => setDeleteTarget(pkg)}
                  style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--admin-red)', background: 'transparent', color: 'var(--admin-red)', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filtered.length === 0 && !loading && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>
            No packages found.{' '}
            <Link to="/admin/packages/new" style={{ color: 'var(--admin-accent)' }}>Add your first package →</Link>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget)}
        title="Delete Package"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
