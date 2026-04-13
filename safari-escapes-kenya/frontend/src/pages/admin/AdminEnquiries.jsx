import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Search, Mail, Phone, Users, Calendar, MessageSquare, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../../components/admin/shared/StatCard';

const STATUS_STYLES = {
  new:         { label: 'New',         color: '#6366F1', bg: 'rgba(99,102,241,0.15)' },
  contacted:   { label: 'Contacted',   color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  converted:   { label: 'Converted',   color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  closed:      { label: 'Closed',      color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' },
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

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'enquiries'));
      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.created_at?.toDate?.()?.getTime() || 0;
          const tb = b.created_at?.toDate?.()?.getTime() || 0;
          return tb - ta;
        });
      setEnquiries(docs);
    } catch {
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'enquiries', id), { status });
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = enquiries.filter(e => {
    const matchSearch = !search ||
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.package_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = enquiries.length;
  const newCount = enquiries.filter(e => e.status === 'new').length;
  const contactedCount = enquiries.filter(e => e.status === 'contacted').length;
  const convertedCount = enquiries.filter(e => e.status === 'converted').length;

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ padding: 32 }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        <StatCard icon={MessageSquare} iconBg="rgba(99,102,241,0.15)"  iconColor="#6366F1" label="Total Enquiries"  value={total} />
        <StatCard icon={Mail}          iconBg="rgba(99,102,241,0.15)"  iconColor="#6366F1" label="New"              value={newCount} />
        <StatCard icon={Phone}         iconBg="rgba(245,158,11,0.15)"  iconColor="#F59E0B" label="Contacted"        value={contactedCount} />
        <StatCard icon={Users}         iconBg="rgba(16,185,129,0.15)"  iconColor="#10B981" label="Converted"        value={convertedCount} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or package..."
            style={{ ...SELECT_STYLE, paddingLeft: 36, width: '100%', borderRadius: 10 }}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={SELECT_STYLE}>
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
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
                  {['Name', 'Package', 'Travel Date', 'Travelers', 'Status', 'Received', 'Action'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} style={{ padding: '14px 16px' }}>
                        <div style={{ height: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>
                      No enquiries found
                    </td>
                  </tr>
                ) : filtered.map((e, i) => (
                  <tr
                    key={e.id}
                    onClick={() => setSelected(selected?.id === e.id ? null : e)}
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid rgba(42,45,62,0.5)' : 'none',
                      cursor: 'pointer',
                      background: selected?.id === e.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(el) => { if (selected?.id !== e.id) el.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={(el) => { if (selected?.id !== e.id) el.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{e.name}</div>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, color: 'var(--admin-muted)', marginTop: 2 }}>{e.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif' }}>
                      {e.package_name || <span style={{ color: 'var(--admin-muted)' }}>General</span>}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
                      {e.travel_date || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', textAlign: 'center' }}>
                      {e.travelers || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={e.status} />
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
                      {formatDate(e.created_at)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={e.status}
                        onClick={ev => ev.stopPropagation()}
                        onChange={ev => updateStatus(e.id, ev.target.value)}
                        disabled={updating}
                        style={{ ...SELECT_STYLE, fontSize: 12, padding: '4px 8px' }}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
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
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>{selected.name}</h3>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: 'var(--admin-muted)', marginTop: 4 }}>{formatDate(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)', fontSize: 18 }}>✕</button>
            </div>

            <StatusBadge status={selected.status} />

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Package</p>
                <p style={{ fontSize: 14, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-text)', fontWeight: 600 }}>{selected.package_name || 'General Enquiry'}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Contact</p>
                <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-text)' }}>{selected.email}</p>
                {selected.phone && <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-text)', marginTop: 2 }}>{selected.phone}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Travel Date</p>
                  <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={13} />{selected.travel_date || '—'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Travelers</p>
                  <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={13} />{selected.travelers || '—'}
                  </p>
                </div>
              </div>
              {selected.message && (
                <div>
                  <p style={{ fontSize: 11, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Message</p>
                  <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-text)', lineHeight: 1.6, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 12 }}>
                    {selected.message}
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href={`mailto:${selected.email}?subject=Your Safari Enquiry — ${selected.package_name || 'Sight Seekers'}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--admin-accent)', color: 'white', borderRadius: 10, padding: '11px 16px', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
              >
                <Mail size={14} /> Reply via Email
              </a>
              {selected.wechat ? (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selected.wechat);
                    toast.success(`WeChat ID copied: ${selected.wechat}`);
                  }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#07C160', color: 'white', borderRadius: 10, padding: '11px 16px', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  <svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c-.297-.815-.457-1.677-.457-2.576 0-3.965 3.763-7.178 8.405-7.178.148 0 .295.009.44.019C15.855 4.46 12.543 2.188 8.691 2.188zm-2.37 3.687a1.077 1.077 0 0 1 0 2.153 1.077 1.077 0 0 1 0-2.153zm4.741 0a1.077 1.077 0 0 1 0 2.153 1.077 1.077 0 0 1 0-2.153zM24 14.601c0-3.395-3.327-6.15-7.424-6.15-4.099 0-7.424 2.755-7.424 6.15 0 3.394 3.325 6.149 7.424 6.149.863 0 1.692-.12 2.465-.34a.748.748 0 0 1 .619.083l1.644.963a.28.28 0 0 0 .145.047.254.254 0 0 0 .252-.255c0-.063-.025-.124-.042-.184l-.337-1.279a.51.51 0 0 1 .184-.575C23.016 18.443 24 16.614 24 14.601zm-9.875-1.145a.93.93 0 1 1 0-1.86.93.93 0 0 1 0 1.86zm5.07 0a.93.93 0 1 1 0-1.86.93.93 0 0 1 0 1.86z"/></svg>
                  Reply via WeChat ({selected.wechat})
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(7,193,96,0.1)', color: '#07C160', borderRadius: 10, padding: '11px 16px', fontFamily: 'Outfit, sans-serif', fontSize: 12 }}>
                  No WeChat ID provided
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}
