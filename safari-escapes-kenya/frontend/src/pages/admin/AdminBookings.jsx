import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';
import { Search, Eye, Download, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import AdminModal from '../../components/admin/shared/AdminModal';
import StatCard from '../../components/admin/shared/StatCard';

const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'];

function daysDiff(date) {
  if (!date) return null;
  const diff = Math.round((date - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

function travelDateColor(date) {
  if (!date) return 'var(--admin-muted)';
  const diff = daysDiff(date);
  if (diff > 7) return 'var(--admin-green)';
  if (diff > 0) return 'var(--admin-gold)';
  return 'var(--admin-red)';
}

function travelDateLabel(date) {
  if (!date) return '—';
  const diff = daysDiff(date);
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (diff > 0) return `${formatted} (in ${diff}d)`;
  if (diff === 0) return `${formatted} (Today)`;
  return `${formatted} (${Math.abs(diff)}d ago)`;
}

const AVATAR_COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'];
function avatarColor(name = '') {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function avatarInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

const SELECT_STYLE = {
  background: 'var(--admin-bg)',
  border: '1px solid var(--admin-border)',
  borderRadius: 8,
  padding: '8px 12px',
  color: 'var(--admin-text)',
  fontFamily: 'Outfit, sans-serif',
  fontSize: 13,
  outline: 'none',
  cursor: 'pointer',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState({});
  const [viewBooking, setViewBooking] = useState(null);

  async function loadBookings() {
    setLoading(true);
    try {
      const [bookSnap, pkgSnap, userSnap] = await Promise.all([
        getDocs(collection(db, 'bookings')),
        getDocs(collection(db, 'packages')),
        getDocs(collection(db, 'users')),
      ]);
      const pkgMap = {};
      pkgSnap.docs.forEach(d => { pkgMap[d.id] = d.data(); });
      setPackages(pkgSnap.docs.map(d => ({ id: d.id, name: d.data().name })));

      const usrMap = {};
      userSnap.docs.forEach(d => { usrMap[d.id] = d.data(); });
      setUsers(usrMap);

      const sorted = bookSnap.docs
        .map(d => {
          const b = d.data();
          const pkg = pkgMap[b.package_id] || {};
          const usr = usrMap[b.user_id] || {};
          const travelDate = b.travel_date?.toDate?.() || (b.travel_date ? new Date(b.travel_date) : null);
          return {
            id: d.id,
            ref: b.booking_reference || d.id.slice(0, 8).toUpperCase(),
            traveler: `${usr.first_name || ''} ${usr.last_name || ''}`.trim() || usr.email || 'Guest',
            email: usr.email || '',
            package: pkg.name || b.package_name || 'Unknown',
            tour_type: pkg.tour_type || '',
            travel_date: travelDate,
            travelers: b.number_of_travelers || 1,
            total: (b.total_price || 0) / 100,
            status: b.status || 'pending',
            payment_status: b.payment_status || 'pending',
            package_id: b.package_id,
            created_at: b.created_at?.toDate?.() || null,
          };
        })
        .sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
      setBookings(sorted);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBookings(); }, []);

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      b.ref.toLowerCase().includes(search.toLowerCase()) ||
      b.traveler.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchPkg = packageFilter === 'all' || b.package_id === packageFilter;
    return matchSearch && matchStatus && matchPkg;
  });

  // Stats
  const stats = {
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  async function updateStatus(bookingId, newStatus) {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      loadBookings();
    } catch {
      toast.error('Failed to update status');
    }
  }

  function exportCSV() {
    const rows = [['Ref', 'Traveler', 'Email', 'Package', 'Travel Date', 'Travelers', 'Total', 'Status', 'Payment']];
    filtered.forEach(b => rows.push([
      b.ref, b.traveler, b.email, b.package,
      b.travel_date ? b.travel_date.toLocaleDateString() : '',
      b.travelers, b.total, b.status, b.payment_status,
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'bookings.csv';
    a.click();
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20, marginBottom: 28 }}>
        <StatCard icon={Clock} iconBg="rgba(245,158,11,0.15)" iconColor="#F59E0B" label="Pending" value={stats.pending} />
        <StatCard icon={AlertCircle} iconBg="rgba(59,130,246,0.15)" iconColor="#3B82F6" label="Confirmed" value={stats.confirmed} />
        <StatCard icon={CheckCircle} iconBg="rgba(16,185,129,0.15)" iconColor="#10B981" label="Completed" value={stats.completed} />
        <StatCard icon={XCircle} iconBg="rgba(239,68,68,0.15)" iconColor="#EF4444" label="Cancelled" value={stats.cancelled} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ref or traveler..."
            style={{ ...SELECT_STYLE, paddingLeft: 36, width: '100%', borderRadius: 10 }}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={SELECT_STYLE}>
          <option value="all">All Statuses</option>
          {BOOKING_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={packageFilter} onChange={e => setPackageFilter(e.target.value)} style={SELECT_STYLE}>
          <option value="all">All Packages</option>
          {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button
          onClick={exportCSV}
          style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: '8px 16px', color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--admin-border)' }}>
                {['Booking Ref', 'Traveler', 'Package', 'Travel Date', 'Travelers', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(42,45,62,0.5)' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontFamily: 'monospace', color: 'var(--admin-accent)', fontSize: 13, fontWeight: 600 }}>{b.ref}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: avatarColor(b.traveler), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>
                        {avatarInitials(b.traveler)}
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif' }}>{b.traveler}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 13, color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif' }}>{b.package}</div>
                    {b.tour_type && <div style={{ fontSize: 11, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>{b.tour_type}</div>}
                  </td>
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', color: travelDateColor(b.travel_date) }}>
                      {travelDateLabel(b.travel_date)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={13} color="var(--admin-muted)" /> {b.travelers}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: 'var(--admin-green)', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
                    ${b.total.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px' }}><StatusBadge status={b.payment_status} /></td>
                  <td style={{ padding: '14px 16px' }}><StatusBadge status={b.status} /></td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button onClick={() => setViewBooking(b)} title="View" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)', display: 'flex' }}>
                        <Eye size={15} />
                      </button>
                      <select
                        value={b.status}
                        onChange={e => updateStatus(b.id, e.target.value)}
                        title="Update status"
                        style={{ ...SELECT_STYLE, padding: '4px 8px', fontSize: 11, borderRadius: 6 }}
                      >
                        {BOOKING_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>No bookings found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View booking modal */}
      <AdminModal open={!!viewBooking} onClose={() => setViewBooking(null)} title={`Booking ${viewBooking?.ref || ''}`} maxWidth={680}>
        {viewBooking && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Traveler', value: viewBooking.traveler },
                { label: 'Email', value: viewBooking.email },
                { label: 'Package', value: viewBooking.package },
                { label: 'Travel Date', value: viewBooking.travel_date?.toLocaleDateString() || '—' },
                { label: 'Travelers', value: viewBooking.travelers },
                { label: 'Total Amount', value: `$${viewBooking.total.toLocaleString()}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--admin-bg)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
              <StatusBadge status={viewBooking.status} />
              <StatusBadge status={viewBooking.payment_status} label={`Payment: ${viewBooking.payment_status}`} />
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label style={{ fontSize: 14, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>Update Status:</label>
              <select
                defaultValue={viewBooking.status}
                onChange={e => { updateStatus(viewBooking.id, e.target.value); setViewBooking(null); }}
                style={SELECT_STYLE}
              >
                {BOOKING_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </>
        )}
      </AdminModal>
    </div>
  );
}
