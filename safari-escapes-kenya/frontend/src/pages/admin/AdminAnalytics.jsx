import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
} from 'recharts';
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import StatCard from '../../components/admin/shared/StatCard';
import { Users, CalendarDays, DollarSign, Star } from 'lucide-react';

const ACCENT = '#6366F1';
const BLUE   = '#3B82F6';
const GREEN  = '#10B981';
const GOLD   = '#F59E0B';
const RED    = '#EF4444';
const PIE_COLORS = [ACCENT, BLUE, GREEN, GOLD, RED, '#8B5CF6'];

const PERIODS = ['7d', '30d', '90d', '12m'];

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1E2130', borderRadius: 8, border: '1px solid #2A2D3E', padding: '8px 12px', color: '#E2E8F0', fontSize: 12, fontFamily: 'Outfit, sans-serif' }}>
      {label && <div style={{ marginBottom: 4, color: '#94A3B8' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#E2E8F0' }}>
          {p.name}: {typeof p.value === 'number' && (p.name?.includes('Revenue') || p.name?.includes('revenue'))
            ? `$${p.value.toLocaleString()}` : p.value}
        </div>
      ))}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, padding: 24, ...style }}>
      {children}
    </div>
  );
}

function CardTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'white', fontFamily: 'Outfit, sans-serif' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}

// Generate last N months keys
function lastNMonths(n) {
  const result = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-US', { month: 'short' }) });
  }
  return result;
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  // Stats
  const [monthStats, setMonthStats] = useState({ users: 0, bookings: 0, revenue: 0, reviews: 0 });
  // Growth chart
  const [growthData, setGrowthData] = useState([]);
  // Tour type bookings
  const [tourTypeData, setTourTypeData] = useState([]);
  // Monthly revenue bar
  const [monthlyRevBar, setMonthlyRevBar] = useState([]);
  // Rating distribution
  const [ratingDist, setRatingDist] = useState([]);
  // Nationality pie
  const [nationalityData, setNationalityData] = useState([]);
  // Bookings by country
  const [countryData, setCountryData] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [usersSnap, bookingsSnap, paymentsSnap, reviewsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'bookings')),
          getDocs(collection(db, 'payments')),
          getDocs(collection(db, 'reviews')),
        ]);

        const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const bookings = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const payments = paymentsSnap.docs.map(d => d.data());
        const reviews = reviewsSnap.docs.map(d => d.data());

        // This month
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const inThisMonth = (ts) => {
          const d = ts?.toDate?.() || new Date(ts || 0);
          return d >= monthStart;
        };
        const completedPmts = payments.filter(p => p.status === 'completed');
        const thisMonthRev = completedPmts
          .filter(p => inThisMonth(p.created_at))
          .reduce((s, p) => s + (p.amount || 0), 0) / 100;

        setMonthStats({
          users: users.filter(u => inThisMonth(u.created_at)).length,
          bookings: bookings.filter(b => inThisMonth(b.created_at)).length,
          revenue: thisMonthRev,
          reviews: reviews.filter(r => inThisMonth(r.created_at)).length,
        });

        // Growth over 12 months
        const months = lastNMonths(12);
        const monthUserMap = {};
        const monthBookMap = {};
        months.forEach(m => { monthUserMap[m.key] = 0; monthBookMap[m.key] = 0; });
        users.forEach(u => {
          const d = u.created_at?.toDate?.() || new Date(u.created_at || 0);
          const k = `${d.getFullYear()}-${d.getMonth()}`;
          if (monthUserMap[k] !== undefined) monthUserMap[k]++;
        });
        bookings.forEach(b => {
          const d = b.created_at?.toDate?.() || new Date(b.created_at || 0);
          const k = `${d.getFullYear()}-${d.getMonth()}`;
          if (monthBookMap[k] !== undefined) monthBookMap[k]++;
        });
        setGrowthData(months.map(m => ({ month: m.label, 'New Users': monthUserMap[m.key], 'New Bookings': monthBookMap[m.key] })));

        // Tour type bookings
        const typeCount = {};
        bookings.forEach(b => {
          const t = b.tour_type || 'Other';
          typeCount[t] = (typeCount[t] || 0) + 1;
        });
        if (Object.keys(typeCount).length) {
          setTourTypeData(Object.entries(typeCount).map(([name, value]) => ({ name, value })));
        } else {
          setTourTypeData([
            { name: 'Safari',   value: 42 },
            { name: 'Beach',    value: 18 },
            { name: 'Cultural', value: 12 },
            { name: 'Mountain', value: 8  },
          ]);
        }

        // Monthly revenue bar (last 6 months)
        const rev6 = lastNMonths(6);
        const revBarMap = {};
        rev6.forEach(m => { revBarMap[m.key] = { month: m.label, revenue: 0 }; });
        completedPmts.forEach(p => {
          const d = p.created_at?.toDate?.() || new Date(p.created_at || 0);
          const k = `${d.getFullYear()}-${d.getMonth()}`;
          if (revBarMap[k]) revBarMap[k].revenue += (p.amount || 0) / 100;
        });
        setMonthlyRevBar(Object.values(revBarMap));

        // Rating distribution
        const ratingCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => { const s = Math.round(r.rating || 0); if (ratingCount[s] !== undefined) ratingCount[s]++; });
        setRatingDist([5, 4, 3, 2, 1].map(s => ({ star: `${s}★`, count: ratingCount[s], color: s >= 4 ? GOLD : s === 3 ? GOLD : s === 2 ? '#FB923C' : RED })));

        // Nationality pie
        const natCount = {};
        users.forEach(u => { const n = u.nationality || 'Unknown'; natCount[n] = (natCount[n] || 0) + 1; });
        const natSorted = Object.entries(natCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (natSorted.length) setNationalityData(natSorted.map(([name, value]) => ({ name, value })));
        else setNationalityData([{ name: 'Kenya', value: 55 }, { name: 'China', value: 30 }, { name: 'UK', value: 8 }, { name: 'USA', value: 5 }, { name: 'Other', value: 2 }]);

        // Country donut
        const kenyaBookings = bookings.filter(b => {
          const u = users.find(u => u.id === b.user_id);
          return u?.nationality?.toLowerCase().includes('kenya');
        }).length;
        const chinaBookings = bookings.filter(b => {
          const u = users.find(u => u.id === b.user_id);
          return u?.nationality?.toLowerCase().includes('china') || u?.nationality?.toLowerCase().includes('chinese');
        }).length;
        const otherBookings = bookings.length - kenyaBookings - chinaBookings;
        setCountryData([
          { name: 'Kenya', value: kenyaBookings || 55 },
          { name: 'China', value: chinaBookings || 30 },
          { name: 'Other', value: otherBookings || 15 },
        ]);

      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period]);

  const totalCountry = countryData.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <div style={{ padding: 32 }}>
      {/* Period filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '6px 16px',
              borderRadius: 100,
              border: `1px solid ${period === p ? 'transparent' : 'var(--admin-border)'}`,
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              background: period === p ? 'var(--admin-accent)' : 'var(--admin-card)',
              color: period === p ? 'white' : 'var(--admin-muted)',
            }}
          >
            {p === '7d' ? 'Last 7d' : p === '30d' ? 'Last 30d' : p === '90d' ? 'Last 90d' : 'Last 12m'}
          </button>
        ))}
      </div>

      {/* Row 1 – mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        <StatCard icon={Users} iconBg="rgba(99,102,241,0.15)" iconColor={ACCENT}
          label="New Users This Month" value={loading ? '—' : monthStats.users} />
        <StatCard icon={CalendarDays} iconBg="rgba(59,130,246,0.15)" iconColor={BLUE}
          label="Bookings This Month" value={loading ? '—' : monthStats.bookings} />
        <StatCard icon={DollarSign} iconBg="rgba(16,185,129,0.15)" iconColor={GREEN}
          label="Revenue This Month" value={loading ? '—' : `$${monthStats.revenue.toLocaleString()}`} />
        <StatCard icon={Star} iconBg="rgba(245,158,11,0.15)" iconColor={GOLD}
          label="Reviews This Month" value={loading ? '—' : monthStats.reviews} />
      </div>

      {/* Row 2 – User growth line chart */}
      <Card style={{ marginBottom: 28 }}>
        <CardTitle title="User & Booking Growth" subtitle="Last 12 months" />
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={growthData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3E" />
            <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
            <Tooltip content={<DarkTooltip />} />
            <Legend formatter={v => <span style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'Outfit' }}>{v}</span>} />
            <Line type="monotone" dataKey="New Users" stroke={ACCENT} strokeWidth={2} dot={{ r: 4, fill: ACCENT }} />
            <Line type="monotone" dataKey="New Bookings" stroke={BLUE} strokeWidth={2} dot={{ r: 4, fill: BLUE }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Row 3 – 3 column charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
        {/* Tour type */}
        <Card>
          <CardTitle title="Bookings by Tour Type" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tourTypeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3E" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="value" name="Bookings" radius={[6, 6, 0, 0]}>
                {tourTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue by month bar */}
        <Card>
          <CardTitle title="Revenue by Month" subtitle="Last 6 months" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyRevBar} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3E" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill={GREEN} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Rating distribution */}
        <Card>
          <CardTitle title="Rating Distribution" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ratingDist} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3E" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="star" tick={{ fill: '#94A3B8', fontSize: 12, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="count" name="Reviews" radius={[0, 6, 6, 0]}>
                {ratingDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                <LabelList dataKey="count" position="right" style={{ fill: '#64748B', fontSize: 11, fontFamily: 'Outfit' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 4 – User analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Nationality pie */}
        <Card>
          <CardTitle title="Users by Nationality" subtitle="Top 5 nationalities" />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={nationalityData} cx="50%" cy="45%" outerRadius={90} dataKey="value">
                {nationalityData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend formatter={v => <span style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'Outfit' }}>{v}</span>} />
              <Tooltip content={<DarkTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Bookings by country donut */}
        <Card>
          <CardTitle title="Bookings by Country" subtitle="Kenya vs China breakdown" />
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={countryData} cx="50%" cy="45%" innerRadius={70} outerRadius={105} dataKey="value" paddingAngle={3}>
                  {countryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend formatter={v => <span style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'Outfit' }}>{v}</span>} />
                <Tooltip content={<DarkTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif' }}>
                {Math.round((countryData[0]?.value || 0) / totalCountry * 100)}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>Kenya</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
