import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, PieChart, Pie, Cell, CartesianGrid,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Users, CalendarDays, DollarSign, Star } from 'lucide-react';
import { db } from '../../firebase/config';
import {
  collection, getDocs, query, orderBy, limit,
} from 'firebase/firestore';
import StatCard from '../../components/admin/shared/StatCard';
import StatusBadge from '../../components/admin/shared/StatusBadge';

const ACCENT = '#6366F1';
const BLUE   = '#3B82F6';
const GREEN  = '#10B981';
const GOLD   = '#F59E0B';

const PIE_COLORS = [ACCENT, BLUE, GREEN, GOLD];
const PIE_METHODS_FALLBACK = [
  { name: 'Stripe',   value: 40 },
  { name: 'PayPal',   value: 25 },
  { name: 'M-Pesa',   value: 25 },
  { name: 'UnionPay', value: 10 },
];

const SAMPLE_REVENUE = [
  { month: 'Oct', revenue: 8200  },
  { month: 'Nov', revenue: 11500 },
  { month: 'Dec', revenue: 9800  },
  { month: 'Jan', revenue: 14200 },
  { month: 'Feb', revenue: 12600 },
  { month: 'Mar', revenue: 17900 },
];

const AVATAR_COLORS = [ACCENT, BLUE, GREEN, GOLD, '#EC4899', '#8B5CF6'];

function avatarColor(name = '') {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}
function avatarInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1E2130', borderRadius: 8,
      border: '1px solid #2A2D3E', padding: '8px 12px',
      color: '#E2E8F0', fontSize: 12, fontFamily: 'Outfit, sans-serif',
    }}>
      <div style={{ marginBottom: 4, color: '#94A3B8' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {p.name?.toLowerCase().includes('revenue') ? `$${Number(p.value).toLocaleString()}` : p.value}
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, bookings: 0, revenue: 0, rating: '0.0' });
  const [recentBookings, setRecentBookings] = useState([]);
  const [topPackages, setTopPackages] = useState([]);
  const [revenueData, setRevenueData] = useState(SAMPLE_REVENUE);
  const [paymentMethods, setPaymentMethods] = useState(PIE_METHODS_FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersSnap, allBookingsSnap, paymentsSnap, reviewsSnap, packagesSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'bookings')),
          getDocs(collection(db, 'payments')),
          getDocs(collection(db, 'reviews')),
          getDocs(collection(db, 'packages')),
        ]);

        // Stats
        const payments = paymentsSnap.docs.map(d => d.data());
        const completedPayments = payments.filter(p => p.status === 'completed');
        const totalRevenue = completedPayments.reduce((s, p) => s + (p.amount || 0), 0) / 100;

        const reviews = reviewsSnap.docs.map(d => d.data());
        const avgRating = reviews.length
          ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
          : '0.0';

        setStats({
          users: usersSnap.size,
          bookings: allBookingsSnap.size,
          revenue: totalRevenue,
          rating: avgRating,
        });

        // Maps
        const pkgMap = {};
        packagesSnap.docs.forEach(d => { pkgMap[d.id] = d.data(); });
        const usersMap = {};
        usersSnap.docs.forEach(d => { usersMap[d.id] = d.data(); });

        // Recent bookings (last 6)
        const sortedBookings = allBookingsSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ta = a.created_at?.seconds || 0;
            const tb = b.created_at?.seconds || 0;
            return tb - ta;
          })
          .slice(0, 6);

        setRecentBookings(sortedBookings.map(b => {
          const pkg = pkgMap[b.package_id] || {};
          const usr = usersMap[b.user_id] || {};
          return {
            id: b.id,
            ref: b.booking_reference || b.id.slice(0, 8).toUpperCase(),
            traveler: `${usr.first_name || ''} ${usr.last_name || ''}`.trim() || usr.email || 'Guest',
            email: usr.email || '',
            package: pkg.name || b.package_name || 'Unknown Package',
            duration: pkg.duration_days ? `${pkg.duration_days} days` : '',
            date: b.travel_date?.toDate?.() || (b.travel_date ? new Date(b.travel_date) : null),
            amount: (b.total_price || 0) / 100,
            status: b.status || 'pending',
          };
        }));

        // Top packages
        const pkgBookings = {};
        allBookingsSnap.docs.forEach(d => {
          const pid = d.data().package_id;
          if (pid) pkgBookings[pid] = (pkgBookings[pid] || 0) + 1;
        });
        const top = packagesSnap.docs
          .map(d => ({ id: d.id, ...d.data(), bookings: pkgBookings[d.id] || 0 }))
          .sort((a, b) => b.bookings - a.bookings)
          .slice(0, 4);
        setTopPackages(top);

        // Revenue by month
        const now = new Date();
        const monthMap = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          monthMap[key] = { month: d.toLocaleString('en-US', { month: 'short' }), revenue: 0 };
        }
        completedPayments.forEach(p => {
          const d = p.created_at?.toDate?.() || new Date(p.created_at || 0);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (monthMap[key]) monthMap[key].revenue += (p.amount || 0) / 100;
        });
        const revData = Object.values(monthMap);
        if (revData.some(r => r.revenue > 0)) setRevenueData(revData);

        // Payment methods breakdown
        const methodCount = {};
        payments.forEach(p => {
          const m = p.method || p.payment_method || 'Other';
          methodCount[m] = (methodCount[m] || 0) + 1;
        });
        const pmData = Object.entries(methodCount).map(([name, value]) => ({ name, value }));
        if (pmData.length) setPaymentMethods(pmData);

      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxBookings = Math.max(...topPackages.map(p => p.bookings), 1);

  return (
    <div style={{ padding: 32 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        <StatCard icon={Users} iconBg="rgba(99,102,241,0.15)" iconColor={ACCENT}
          label="Total Users" value={loading ? '—' : stats.users.toLocaleString()}
          trend="12%" trendUp />
        <StatCard icon={CalendarDays} iconBg="rgba(59,130,246,0.15)" iconColor={BLUE}
          label="Total Bookings" value={loading ? '—' : stats.bookings.toLocaleString()}
          trend="8%" trendUp />
        <StatCard icon={DollarSign} iconBg="rgba(16,185,129,0.15)" iconColor={GREEN}
          label="Total Revenue" value={loading ? '—' : `$${stats.revenue.toLocaleString()}`}
          trend="21%" trendUp />
        <StatCard icon={Star} iconBg="rgba(245,158,11,0.15)" iconColor={GOLD}
          label="Avg Rating" value={loading ? '—' : `${stats.rating} ⭐`}
          trend="3%" trendUp />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 20, marginBottom: 28 }}>
        {/* Revenue */}
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'white', fontFamily: 'Outfit, sans-serif' }}>Revenue Overview</div>
            <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 2 }}>Last 6 months</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3E" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<DarkTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke={ACCENT} strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment methods pie */}
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'white', fontFamily: 'Outfit, sans-serif' }}>Payment Methods</div>
            <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 2 }}>All time</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={paymentMethods} cx="50%" cy="45%" innerRadius={60} outerRadius={90} dataKey="value">
                {paymentMethods.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={v => <span style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'Outfit' }}>{v}</span>} />
              <Tooltip content={<DarkTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 20 }}>
        {/* Recent bookings table */}
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--admin-border)' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'white', fontFamily: 'Outfit, sans-serif' }}>Recent Bookings</div>
            <Link to="/admin/bookings" style={{ fontSize: 13, color: 'var(--admin-accent)', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Traveler', 'Package', 'Date', 'Amount', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b, i) => (
                  <tr key={b.id} style={{ borderBottom: i < recentBookings.length - 1 ? '1px solid rgba(42,45,62,0.5)' : 'none' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: avatarColor(b.traveler), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>
                          {avatarInitials(b.traveler)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, color: 'var(--admin-text)', fontWeight: 500, fontFamily: 'Outfit, sans-serif' }}>{b.traveler}</div>
                          <div style={{ fontSize: 11, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>{b.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: 13, color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif' }}>{b.package}</div>
                      {b.duration && <div style={{ fontSize: 11, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>{b.duration}</div>}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
                      {b.date ? b.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: 'var(--admin-green)', fontFamily: 'Outfit, sans-serif' }}>
                      ${b.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px' }}><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
                {recentBookings.length === 0 && !loading && (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', fontSize: 14 }}>No bookings yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top packages */}
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'white', fontFamily: 'Outfit, sans-serif', marginBottom: 20 }}>Top Packages by Bookings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {topPackages.map((pkg, i) => (
              <div key={pkg.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--admin-muted)', fontSize: 14, fontWeight: 600, width: 20, textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>{i + 1}</span>
                {pkg.images?.[0]
                  ? <img src={pkg.images[0]} alt={pkg.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--admin-border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🦁</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--admin-text)', fontWeight: 500, fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pkg.name}</div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--admin-border)', marginTop: 6 }}>
                    <div style={{ height: '100%', borderRadius: 2, width: `${(pkg.bookings / maxBookings) * 100}%`, background: ACCENT, opacity: Math.max(0.3, 1 - i * 0.15) }} />
                  </div>
                </div>
                <span style={{ background: 'rgba(99,102,241,0.15)', color: ACCENT, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, fontFamily: 'Outfit, sans-serif', flexShrink: 0 }}>
                  {pkg.bookings}
                </span>
              </div>
            ))}
            {topPackages.length === 0 && !loading && (
              <p style={{ color: 'var(--admin-muted)', fontSize: 14, fontFamily: 'Outfit, sans-serif', textAlign: 'center', padding: '16px 0' }}>No packages yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
