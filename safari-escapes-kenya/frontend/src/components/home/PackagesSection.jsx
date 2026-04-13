import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, Users, Star } from 'lucide-react';
import { getPackages } from '../../services/packageService';
import { useLanguage } from '../../context/LanguageContext';

const FALLBACK_PACKAGES = [
  { id: '1', name: 'Masai Mara Migration', duration_days: 7, max_group_size: 8, price_cents: 187000, price_usd: 1870, tour_type: 'Wildlife', rating: 4.9, reviews: 124, image_url: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600&h=400&fit=crop', is_featured: true },
  { id: '2', name: 'Samburu Wilderness', duration_days: 5, max_group_size: 6, price_cents: 142000, price_usd: 1420, tour_type: 'Wildlife', rating: 4.8, reviews: 89, image_url: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600&h=400&fit=crop' },
  { id: '3', name: 'Kenya Cultural Journey', duration_days: 10, max_group_size: 10, price_cents: 225000, price_usd: 2250, tour_type: 'Cultural', rating: 4.9, reviews: 67, image_url: 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=600&h=400&fit=crop' },
  { id: '4', name: 'Photography Safari', duration_days: 8, max_group_size: 6, price_cents: 295000, price_usd: 2950, tour_type: 'Photography', rating: 5.0, reviews: 42, image_url: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=600&h=400&fit=crop' },
];

function PackageCard({ pkg }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <div className="pkg-card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
      onClick={() => navigate(`/packages/${pkg.id}`)}>
      {/* Image */}
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

      {/* Body */}
      <div style={{ padding: '20px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 20,
          color: 'var(--charcoal)', marginBottom: 6, lineHeight: 1.2,
        }}>{pkg.name}</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          {pkg.duration_days && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Outfit'", fontSize: 12, color: 'var(--stone)' }}>
              <Clock size={12} /> {pkg.duration_days} {t('pkg_days')}
            </span>
          )}
          {(pkg.max_travelers || pkg.max_group_size) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Outfit'", fontSize: 12, color: 'var(--stone)' }}>
              <Users size={12} /> {t('pkg_max')} {pkg.max_travelers || pkg.max_group_size}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'Outfit'", fontSize: 12, color: 'var(--stone)' }}>
            <Star size={12} style={{ fill: '#D97706', color: '#D97706' }} /> {pkg.rating || '4.9'}
            <span style={{ color: '#D0CAC3' }}>({pkg.reviews || 0})</span>
          </span>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: "'Outfit'", fontSize: 22, fontWeight: 600, color: 'var(--earth)' }}>
              ${(pkg.price_per_person ? Math.round(pkg.price_per_person / 100) : (pkg.price_usd || Math.round((pkg.price_cents || 0) / 100))).toLocaleString()}
            </span>
            <span style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)' }}> {t('pkg_per_person')}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-outline"
              style={{ flex: 1, justifyContent: 'center', padding: '11px 16px', fontSize: 13 }}
              onClick={(e) => { e.stopPropagation(); navigate(`/packages/${pkg.slug}`); }}>
              {t('pkgsec_details')}
            </button>
            <button className="btn-earth"
              style={{ flex: 1, justifyContent: 'center', padding: '11px 16px', fontSize: 13 }}
              onClick={(e) => { e.stopPropagation(); navigate(`/packages/${pkg.slug}`); }}>
              {t('pkgsec_book')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
      <div style={{ height: 220, background: '#E5E7EB', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ padding: 24 }}>
        <div style={{ height: 22, background: '#E5E7EB', borderRadius: 6, width: '70%', marginBottom: 10 }} />
        <div style={{ height: 14, background: '#E5E7EB', borderRadius: 6, width: '50%' }} />
      </div>
    </div>
  );
}

export default function PackagesSection() {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    getPackages({})
      .then((data) => setPackages(data.length ? data : FALLBACK_PACKAGES))
      .catch(() => setPackages(FALLBACK_PACKAGES))
      .finally(() => setIsLoading(false));
  }, []);

  const display = packages.slice(0, 4);

  return (
    <section className="section" style={{ background: 'var(--mist)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p className="eyebrow" style={{ color: 'var(--stone)', marginBottom: 16 }}>{t('pkgsec_eyebrow')}</p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700,
            color: 'var(--charcoal)', marginBottom: 16,
          }}>{t('pkgsec_title')}</h2>
          <p style={{ fontFamily: "'Outfit'", fontSize: 16, color: 'var(--stone)', marginBottom: 24 }}>
            {t('pkgsec_sub')}
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--gold)', borderRadius: 100, padding: '10px 28px',
          }}>
            <span style={{ fontFamily: "'Outfit'", fontSize: 14, color: 'white', fontWeight: 500 }}>
              ⭐ 15% OFF your first booking — applied at checkout
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24, marginBottom: 48,
        }} className="packages-grid">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : display.map((pkg, i) => <PackageCard key={pkg.id} pkg={pkg} idx={i} />)
          }
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/packages" className="btn-dark">
            {t('pkgsec_view_all')}
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .packages-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .packages-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
