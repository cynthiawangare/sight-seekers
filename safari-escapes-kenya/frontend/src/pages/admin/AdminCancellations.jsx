import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Search, Mail, Phone, Calendar, RefreshCw, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../../components/admin/shared/StatCard';

const STATUS_STYLES = {
  new:       { label: 'New',       color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  reviewing: { label: 'Reviewing', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  resolved:  { label: 'Resolved',  color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  closed:    { label: 'Closed',    color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' },
};

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

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.new;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 600, fontFamily: 'Outfit, sans-serif', background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function AdminCancellations() {
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'cancellations'));
      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.created_at?.toDate?.()?.getTime() || 0;
          const tb = b.created_at?.toDate?.()?.getTime() || 0;
          return tb - ta;
        });
      setCancellations(docs);
    } catch {
      toast.error('Failed to load cancellations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'cancellations', id), { status });
      setCancellations(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = cancellations.filter(c => {
    const matchSearch = !search ||
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.booking_ref?.toLowerCase().includes(search.toLowerCase()) ||
      c.package_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = cancellations.length;
  const newCount = cancellations.filter(c => c.status === 'new').length;
  const reviewingCount = cancellations.filter(c => c.status === 'reviewing').length;
  const resolvedCount = cancellations.filter(c => c.status === 'resolved').length;

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ padding: 32 }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        <StatCard icon={XCircle} iconBg="rgba(239,68,68,0.15)"  iconColor="#EF4444" label="Total Requests"  value={total} />
        <StatCard icon={Mail}    iconBg="rgba(239,68,68,0.15)"  iconColor="#EF4444" label="New"             value={newCount} />
        <StatCard icon={Search}  iconBg="rgba(245,158,11,0.15)" iconColor="#F59E0B" label="Reviewing"       value={reviewingCount} />
        <StatCard icon={Phone}   iconBg="rgba(16,185,129,0.15)" iconColor="#10B981" label="Resolved"        value={resolvedCount} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, booking ref or package..."
            style={{ ...SELECT_STYLE, paddingLeft: 36, width: '100%', borderRadius: 10 }}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={SELECT_STYLE}>
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="reviewing">Reviewing</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <button
          onClick={load}
          style={{ ...SELECT_STYLE, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--admin-border)' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 24 }}>

        {/* Table */}
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--admin-border)' }}>
                  {['Customer', 'Booking Ref', 'Package', 'Travel Date', 'Reason', 'Status', 'Received', 'Action'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} style={{ padding: '14px 16px' }}>
                        <div style={{ height: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>
                      No cancellation requests found
                    </td>
                  </tr>
                ) : filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(selected?.id === c.id ? null : c)}
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid rgba(42,45,62,0.5)' : 'none',
                      cursor: 'pointer',
                      background: selected?.id === c.id ? 'rgba(239,68,68,0.06)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(el) => { if (selected?.id !== c.id) el.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={(el) => { if (selected?.id !== c.id) el.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{c.full_name}</div>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, color: 'var(--admin-muted)', marginTop: 2 }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--admin-accent)', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                      {c.booking_ref}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif' }}>
                      {c.package_name}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
                      {c.travel_date || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.reason}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={c.status} />
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
                      {formatDate(c.created_at)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={c.status}
                        onClick={ev => ev.stopPropagation()}
                        onChange={ev => updateStatus(c.id, ev.target.value)}
                        disabled={updating}
                        style={{ ...SELECT_STYLE, fontSize: 12, padding: '4px 8px' }}
                      >
                        <option value="new">New</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, padding: 24, height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>{selected.full_name}</h3>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: 'var(--admin-muted)', marginTop: 4 }}>{formatDate(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)', fontSize: 18 }}>✕</button>
            </div>

            <StatusBadge status={selected.status} />

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Booking Ref</p>
                  <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-accent)', fontWeight: 700 }}>{selected.booking_ref}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Travel Date</p>
                  <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={13} />{selected.travel_date || '—'}
                  </p>
                </div>
              </div>

              <div>
                <p style={{ fontSize: 11, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Package</p>
                <p style={{ fontSize: 14, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-text)', fontWeight: 600 }}>{selected.package_name}</p>
              </div>

              <div>
                <p style={{ fontSize: 11, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Contact</p>
                <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-text)' }}>{selected.email}</p>
                {selected.phone && <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-text)', marginTop: 2 }}>{selected.phone}</p>}
              </div>

              <div>
                <p style={{ fontSize: 11, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Reason</p>
                <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-text)', fontWeight: 600 }}>{selected.reason}</p>
              </div>

              {selected.additional_info && (
                <div>
                  <p style={{ fontSize: 11, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Additional Info</p>
                  <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-text)', lineHeight: 1.6, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 12 }}>
                    {selected.additional_info}
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href={`mailto:${selected.email}?subject=Your Cancellation Request — ${selected.booking_ref}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--admin-accent)', color: 'white', borderRadius: 10, padding: '11px 16px', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
              >
                <Mail size={14} /> Reply via Email
              </a>
              <div style={{ display: 'flex', gap: 8 }}>
                {['reviewing', 'resolved', 'closed'].filter(s => s !== selected.status).map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    disabled={updating}
                    style={{ flex: 1, background: STATUS_STYLES[s]?.bg, color: STATUS_STYLES[s]?.color, border: 'none', borderRadius: 10, padding: '10px 12px', fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}
                  >
                    Mark {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}
