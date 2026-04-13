import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Star, SlidersHorizontal } from 'lucide-react';
import { getPackages } from '../services/packageService';
import { useLanguage } from '../context/LanguageContext';

const FALLBACK_PACKAGES = [
  { id: '1', name: 'Masai Mara Migration', duration_days: 7, max_group_size: 8, price_cents: 187000, price_usd: 1870, tour_type: 'Wildlife', rating: 4.9, reviews: 124, image_url: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600&h=400&fit=crop', is_featured: true },
  { id: '2', name: 'Samburu Wilderness', duration_days: 5, max_group_size: 6, price_cents: 142000, price_usd: 1420, tour_type: 'Wildlife', rating: 4.8, reviews: 89, image_url: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600&h=400&fit=crop' },
  { id: '3', name: 'Kenya Cultural Journey', duration_days: 10, max_group_size: 10, price_cents: 225000, price_usd: 2250, tour_type: 'Cultural', rating: 4.9, reviews: 67, image_url: 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=600&h=400&fit=crop' },
  { id: '4', name: 'Photography Safari', duration_days: 8, max_group_size: 6, price_cents: 295000, price_usd: 2950, tour_type: 'Photography', rating: 5.0, reviews: 42, image_url: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=600&h=400&fit=crop' },
  { id: '5', name: 'Amboseli Elephant Trek', duration_days: 4, max_group_size: 8, price_cents: 98000, price_usd: 980, tour_type: 'Wildlife', rating: 4.7, reviews: 55, image_url: 'https://images.unsplash.com/photo-1549366021-9f761d040a1f?w=600&h=400&fit=crop' },
  { id: '6', name: 'Lake Nakuru Flamingos', duration_days: 3, max_group_size: 12, price_cents: 75000, price_usd: 750, tour_type: 'Wildlife', rating: 4.6, reviews: 33, image_url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=600&h=400&fit=crop' },
];

function PackageCard({ pkg }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <div className="pkg-card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
      onClick={() => navigate(`/packages/${pkg.slug || pkg.id}`)}>
      <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
        <img
          src={pkg.images?.[0] || pkg.image_url || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop'}
          alt={pkg.name}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop'; e.target.onerror = null; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} />
        {pkg.is_featured && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: '#FEF08A', color: '#78350F',
            fontFamily: "'Outfit'", fontSize: 11, fontWeight: 600,
            padding: '4px 10px', borderRadius: 100,
          }}>⭐ Featured</span>
        )}
        <span style={{
          position: 'absolute', top: 12, right: 12,
          background: 'var(--mist)', color: 'var(--stone)',
          fontFamily: "'Outfit'", fontSize: 11, fontWeight: 500,
          padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>{pkg.tour_type}</span>
      </div>
      <div style={{ padding: '20px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--charcoal)', marginBottom: 6 }}>
          {pkg.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Outfit'", fontSize: 12, color: 'var(--stone)' }}>
            <Clock size={12} /> {pkg.duration_days} {t('pkg_days')}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Outfit'", fontSize: 12, color: 'var(--stone)' }}>
            <Users size={12} /> {t('pkg_max')} {pkg.max_travelers || pkg.max_group_size}
          </span>
          {(pkg.rating) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'Outfit'", fontSize: 12, color: 'var(--stone)' }}>
              <Star size={12} style={{ fill: '#D97706', color: '#D97706' }} />
              {pkg.rating} <span style={{ color: '#D0CAC3' }}>({pkg.reviews})</span>
            </span>
          )}
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: "'Outfit'", fontSize: 22, fontWeight: 600, color: 'var(--earth)' }}>
              ${(pkg.price_per_person ? Math.round(pkg.price_per_person / 100) : (pkg.price_usd || Math.round((pkg.price_cents || 0) / 100))).toLocaleString()}
            </span>
            <span style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)' }}> / person</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-outline"
              style={{ flex: 1, justifyContent: 'center', padding: '11px 16px', fontSize: 13 }}
              onClick={(e) => { e.stopPropagation(); navigate(`/packages/${pkg.slug || pkg.id}`); }}>
              {t('pkg_details')}
            </button>
            <button className="btn-earth"
              style={{ flex: 1, justifyContent: 'center', padding: '11px 16px', fontSize: 13 }}
              onClick={(e) => { e.stopPropagation(); navigate(`/enquiry/${pkg.slug || pkg.id}`); }}>
              {t('pkg_enquire')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ destination: '', duration: '', maxPrice: '' });
  const { t } = useLanguage();

  useEffect(() => {
    getPackages({})
      .then((data) => setPackages(data.length ? data : FALLBACK_PACKAGES))
      .catch(() => setPackages(FALLBACK_PACKAGES))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = packages.filter((p) => {
    if (filters.destination) {
      const dest = filters.destination.toLowerCase();
      if (!p.name?.toLowerCase().includes(dest) && !p.description?.toLowerCase().includes(dest)) return false;
    }
    if (filters.duration) {
      const d = parseInt(filters.duration);
      if (d === 3 && p.duration_days > 3) return false;
      if (d === 7 && (p.duration_days < 4 || p.duration_days > 7)) return false;
      if (d === 8 && p.duration_days < 8) return false;
    }
    if (filters.maxPrice) {
      const price = p.price_per_person ? Math.round(p.price_per_person / 100) : (p.price_usd || Math.round((p.price_cents || 0) / 100));
      if (price > parseInt(filters.maxPrice)) return false;
    }
    return true;
  });

  const selectStyle = {
    padding: '10px 16px', border: '1px solid #E5E7EB', borderRadius: 12,
    fontFamily: "'Outfit'", fontSize: 14, color: 'var(--charcoal)',
    background: 'white', outline: 'none', cursor: 'pointer',
  };

  return (
    <div style={{ background: 'var(--ivory)' }}>

      {/* Hero */}
      <section style={{ position: 'relative', height: 400, overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1400&h=400&fit=crop"
          alt="Giraffe and savanna"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(12,26,18,0.4), rgba(12,26,18,0.75))',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '0 24px',
        }}>
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>{t('pkg_explore')}</p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900,
            color: 'white', lineHeight: 1.1, marginBottom: 16,
          }}>{t('pkg_title')}</h1>
          <p style={{ fontFamily: "'Outfit'", fontSize: 18, color: 'rgba(255,255,255,0.8)' }}>
            {t('pkg_subtitle')}
          </p>
        </div>
      </section>

      {/* Filter bar — floats over the hero bottom */}
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{
          background: 'white', borderRadius: 16, padding: '20px 32px',
          marginTop: -40, boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--stone)' }}>
            <SlidersHorizontal size={16} />
            <span style={{ fontFamily: "'Outfit'", fontSize: 13, fontWeight: 500 }}>{t('pkg_filter')}</span>
          </div>
          <input
            type="text"
            value={filters.destination}
            onChange={(e) => setFilters((f) => ({ ...f, destination: e.target.value }))}
            placeholder="Search destination or package..."
            style={{ ...selectStyle, minWidth: 220, cursor: 'text' }}
          />
          <select style={selectStyle} value={filters.duration}
            onChange={(e) => setFilters((f) => ({ ...f, duration: e.target.value }))}>
            <option value="">{t('pkg_any_duration')}</option>
            <option value="3">{t('pkg_dur_1_3')}</option>
            <option value="7">{t('pkg_dur_4_7')}</option>
            <option value="8">{t('pkg_dur_8plus')}</option>
          </select>
          <select style={selectStyle} value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}>
            <option value="">{t('pkg_any_price')}</option>
            <option value="1000">{t('pkg_under_1000')}</option>
            <option value="2000">{t('pkg_under_2000')}</option>
            <option value="3000">{t('pkg_under_3000')}</option>
          </select>
          <button className="btn-earth" style={{ marginLeft: 'auto', padding: '10px 24px', fontSize: 13 }}
            onClick={() => setFilters({ destination: '', duration: '', maxPrice: '' })}>
            {t('pkg_clear')}
          </button>
        </div>
      </div>

      {/* Packages grid */}
      <section className="section">
        <div className="container">
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="pkg-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 24, overflow: 'hidden', height: 400 }}>
                  <div style={{ height: 220, background: '#E5E7EB' }} />
                  <div style={{ padding: 24 }}>
                    <div style={{ height: 20, background: '#E5E7EB', borderRadius: 6, width: '60%', marginBottom: 12 }} />
                    <div style={{ height: 14, background: '#E5E7EB', borderRadius: 6, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 12 }}>
                {t('pkg_no_match')}
              </h3>
              <p style={{ fontFamily: "'Outfit'", color: 'var(--stone)', marginBottom: 24 }}>
                {t('pkg_no_match_sub')}
              </p>
              <button className="btn-earth" onClick={() => setFilters({ destination: '', duration: '', maxPrice: '' })}>
                {t('pkg_clear')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="pkg-grid">
              {filtered.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .pkg-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .pkg-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
