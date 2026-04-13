import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';
import { Search, DollarSign, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import StatCard from '../../components/admin/shared/StatCard';
import StatusBadge from '../../components/admin/shared/StatusBadge';

const METHOD_STYLES = {
  stripe:    { emoji: '💳', label: 'Stripe',   color: '#6366F1', bg: 'rgba(99,102,241,0.15)' },
  visa:      { emoji: '💳', label: 'Visa',     color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  unionpay:  { emoji: '🏦', label: 'UnionPay', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  mpesa:     { emoji: '📱', label: 'M-Pesa',   color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
};

function MethodBadge({ method = '' }) {
  const key = method.toLowerCase().replace(/[\s-]/g, '');
  const style = METHOD_STYLES[key] || { emoji: '💰', label: method, color: '#94A3B8', bg: 'rgba(100,116,139,0.15)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 600, fontFamily: 'Outfit, sans-serif', background: style.bg, color: style.color }}>
      {style.emoji} {style.label}
    </span>
  );
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

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const [pmtSnap, bookSnap, userSnap] = await Promise.all([
          getDocs(collection(db, 'payments')),
          getDocs(collection(db, 'bookings')),
          getDocs(collection(db, 'users')),
        ]);

        const bookMap = {};
        bookSnap.docs.forEach(d => { bookMap[d.id] = d.data(); });
        const userMap = {};
        userSnap.docs.forEach(d => { userMap[d.id] = d.data(); });

        const list = pmtSnap.docs.map(d => {
          const p = d.data();
          const booking = bookMap[p.booking_id] || {};
          const user = userMap[p.user_id || booking.user_id] || {};
          return {
            id: d.id,
            booking_ref: booking.booking_reference || p.booking_id?.slice(0, 8).toUpperCase() || '—',
            user: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unknown',
            method: p.method || p.payment_method || 'Unknown',
            amount: (p.amount || 0) / 100,
            currency: p.currency || 'USD',
            status: p.status || 'pending',
            transaction_id: p.transaction_id || p.payment_intent_id || d.id,
            date: p.created_at?.toDate?.() || null,
          };
        }).sort((a, b) => (b.date || 0) - (a.date || 0));

        setPayments(list);
      } catch (err) {
        toast.error('Failed to load payments');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = payments.filter(p => {
    const matchSearch = !search ||
      p.booking_ref.toLowerCase().includes(search.toLowerCase()) ||
      p.user.toLowerCase().includes(search.toLowerCase()) ||
      p.transaction_id.toLowerCase().includes(search.toLowerCase());
    const matchMethod = methodFilter === 'all' || p.method.toLowerCase().includes(methodFilter.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchMethod && matchStatus;
  });

  // Stats
  const completed = payments.filter(p => p.status === 'completed');
  const totalRevenue = completed.reduce((s, p) => s + p.amount, 0);
  const now = new Date();
  const thisMonthRevenue = completed
    .filter(p => p.date && p.date.getMonth() === now.getMonth() && p.date.getFullYear() === now.getFullYear())
    .reduce((s, p) => s + p.amount, 0);
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const refundedAmount = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0);

  // Method breakdown cards
  const methodMap = {};
  payments.forEach(p => {
    const key = p.method;
    if (!methodMap[key]) methodMap[key] = { total: 0, count: 0 };
    methodMap[key].total += p.amount;
    methodMap[key].count += 1;
  });
  const totalCount = payments.length || 1;
  const methodCards = Object.entries(methodMap).map(([method, data]) => ({ method, ...data, pct: Math.round((data.count / totalCount) * 100) }));

  return (
    <div style={{ padding: 32 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        <StatCard icon={DollarSign} iconBg="rgba(16,185,129,0.15)" iconColor="#10B981" label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} trend="18%" trendUp />
        <StatCard icon={TrendingUp} iconBg="rgba(99,102,241,0.15)" iconColor="#6366F1" label="This Month" value={`$${thisMonthRevenue.toLocaleString()}`} trend="12%" trendUp />
        <StatCard icon={Clock} iconBg="rgba(245,158,11,0.15)" iconColor="#F59E0B" label="Pending Payments" value={pendingCount} />
        <StatCard icon={RefreshCw} iconBg="rgba(59,130,246,0.15)" iconColor="#3B82F6" label="Refunded" value={`$${refundedAmount.toLocaleString()}`} />
      </div>

      {/* Method breakdown cards */}
      {methodCards.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(methodCards.length, 4)}, 1fr)`, gap: 16, marginBottom: 28 }}>
          {methodCards.map(({ method, total, count, pct }) => {
            const key = method.toLowerCase().replace(/[\s-]/g, '');
            const style = METHOD_STYLES[key] || { emoji: '💰', color: '#94A3B8', bg: 'rgba(100,116,139,0.1)' };
            return (
              <div key={method} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{style.emoji}</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'white', fontFamily: 'Outfit, sans-serif' }}>{method}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--admin-green)', fontFamily: 'Outfit, sans-serif', marginBottom: 2 }}>
                  ${total.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>{count} transactions · {pct}% of total</div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--admin-border)', marginTop: 12 }}>
                  <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: style.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by booking ref, user or transaction ID..."
            style={{ ...SELECT_STYLE, paddingLeft: 36, width: '100%', borderRadius: 10 }}
          />
        </div>
        <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} style={SELECT_STYLE}>
          <option value="all">All Methods</option>
          <option value="stripe">Stripe</option>
          <option value="mpesa">M-Pesa</option>
          <option value="unionpay">UnionPay</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={SELECT_STYLE}>
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--admin-border)' }}>
                {['Payment ID', 'Booking Ref', 'User', 'Method', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(42,45,62,0.5)' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <span title={p.transaction_id} style={{ fontFamily: 'monospace', color: 'var(--admin-muted)', fontSize: 12 }}>
                      {p.transaction_id.slice(0, 16)}{p.transaction_id.length > 16 ? '…' : ''}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontFamily: 'monospace', color: 'var(--admin-accent)', fontSize: 13, fontWeight: 600 }}>{p.booking_ref}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif' }}>{p.user}</td>
                  <td style={{ padding: '14px 16px' }}><MethodBadge method={p.method} /></td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: 'var(--admin-green)', fontFamily: 'Outfit, sans-serif' }}>
                    ${p.amount.toLocaleString()} <span style={{ fontSize: 11, color: 'var(--admin-muted)', fontWeight: 400 }}>{p.currency}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}><StatusBadge status={p.status} /></td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
                    {p.date ? p.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>No payments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
