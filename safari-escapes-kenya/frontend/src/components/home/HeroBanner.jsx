import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStorageImages } from '../../hooks/useStorageImages';

const HERO_FALLBACKS = [
  'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=1920&h=1080&fit=crop',
  'https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327173818_26_6.jpg?alt=media&token=0434b241-3f63-403b-a6b0-a294cde4d8be',
];

const STRIP_FALLBACKS = [
  'https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327173822_29_6.jpg?alt=media&token=0fedd40a-dbb1-4d11-86a9-75d5c98d57b1',
  'https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327173824_30_6.jpg?alt=media&token=5433c91e-7e67-4573-9d0c-264712027e36',
  'https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327173832_33_6.jpg?alt=media&token=80d3d949-1a7f-4df2-ac70-6d0bb411fa72',
  'https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327173926_45_6.jpg?alt=media&token=a63b8e0f-6035-430a-880e-fdb608b0276b',
  'https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327174445_59_6.jpg?alt=media&token=76211348-c7cd-4d8d-a234-028ae2545a86',
];

const FLOATING_BADGES = [
  { bottom: '32%', right: '3%', rotate: '10deg', delay: '2s', bg: '#FEF3C7', content: <span style={{ fontFamily: "'Caveat'", fontSize: 16, fontWeight: 600 }}>15% OFF first trip! 🌍</span> },
  { bottom: '37%', left: '4%', rotate: '-8deg', delay: '1.5s', bg: '#fff', content: <><span style={{ fontSize: 16 }}>⭐</span> <span style={{ fontFamily: "'Outfit'", fontSize: 13, fontWeight: 600 }}>4.9 / 5.0 Rating</span></> },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [date, setDate] = useState('');
  const [destination, setDestination] = useState('');
  const [travelers, setTravelers] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { images: heroImages } = useStorageImages('hero', HERO_FALLBACKS);
  const { images: stripImages } = useStorageImages('strip', STRIP_FALLBACKS);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % heroImages.length), 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/packages');
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Main hero */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 700, overflow: 'hidden' }}>
        {/* Crossfading images */}
        {heroImages.map((src, i) => (
          <img key={src} src={src} alt="" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', transition: 'opacity 1.2s ease',
            opacity: i === current ? 1 : 0, zIndex: 0,
          }} />
        ))}

        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(12,26,18,0.3) 0%, rgba(12,26,18,0.5) 60%, rgba(12,26,18,0.85) 100%)',
        }} />

        {/* Floating badges */}
        {FLOATING_BADGES.map((b, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: b.top, left: b.left, right: b.right, bottom: b.bottom,
            background: b.bg, borderRadius: 16, padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: 8, zIndex: 3,
            animation: `float 5s ease-in-out ${b.delay} infinite`,
            '--r': b.rotate,
            transform: `rotate(${b.rotate})`,
          }}>
            {b.content}
          </div>
        ))}

        {/* Hero content */}
        <div style={{
          position: 'relative', zIndex: 2, height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          alignItems: 'center', textAlign: 'center', padding: '0 24px',
        }}>
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>
            {t('hero_eyebrow')}
          </p>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(48px, 7vw, 88px)',
            fontWeight: 900, color: 'white', lineHeight: 1.05,
            marginBottom: 24,
          }}>
            {t('hero_h1_line1')}<br />
            <em>{t('hero_h1_line2')}</em><br />
            {t('hero_h1_line3')}
          </h1>

          <p style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 18,
            color: 'rgba(255,255,255,0.8)', maxWidth: 520, lineHeight: 1.6, marginBottom: 40,
          }}>
            {t('hero_sub')}
          </p>

          {/* Booking form card */}
          <form onSubmit={handleSearch} style={{
            background: 'rgba(255,255,255,0.97)', borderRadius: 20,
            padding: '28px 32px', maxWidth: 680, width: '100%',
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto',
            gap: 16, alignItems: 'end',
            boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          }}
            className="hero-form"
          >
            <div>
              <label style={{
                fontFamily: "'Outfit'", fontSize: 11, fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#6B7280', display: 'block', marginBottom: 6,
              }}>{t('hero_date')}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px',
                  border: '1px solid #E5E7EB', borderRadius: 12,
                  fontFamily: "'Outfit'", fontSize: 14, outline: 'none',
                  color: 'var(--charcoal)',
                }} />
            </div>
            <div>
              <label style={{
                fontFamily: "'Outfit'", fontSize: 11, fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#6B7280', display: 'block', marginBottom: 6,
              }}>Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Masai Mara"
                style={{
                  width: '100%', padding: '12px 16px',
                  border: '1px solid #E5E7EB', borderRadius: 12,
                  fontFamily: "'Outfit'", fontSize: 14, outline: 'none',
                  color: 'var(--charcoal)', background: 'white',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{
                fontFamily: "'Outfit'", fontSize: 11, fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#6B7280', display: 'block', marginBottom: 6,
              }}>{t('hero_travelers')}</label>
              <select value={travelers} onChange={(e) => setTravelers(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px',
                  border: '1px solid #E5E7EB', borderRadius: 12,
                  fontFamily: "'Outfit'", fontSize: 14, outline: 'none',
                  color: 'var(--charcoal)', background: 'white',
                }}>
                <option value="">{t('hero_travelers_default')}</option>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? t('hero_person') : t('hero_people')}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-earth" style={{ height: 48, whiteSpace: 'nowrap' }}>
              <Search size={16} /> {t('hero_search')}
            </button>
          </form>
        </div>
      </section>

      {/* Scrolling image strip */}
      <div style={{
        background: 'var(--night)', padding: '20px 0', overflow: 'hidden',
      }}>
        <div className="strip-track" style={{
          display: 'flex', gap: 12,
          animation: 'scrollLeft 30s linear infinite',
          width: 'max-content',
        }}>
          {[...stripImages, ...stripImages].map((src, i) => (
            <img key={i} src={src} alt="" style={{
              width: 280, height: 160, borderRadius: 16,
              objectFit: 'cover', flexShrink: 0,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
