import { MapPin, Users, CreditCard, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function ValueProposition() {
  const { t } = useLanguage();

  const FEATURES = [
    { icon: MapPin, iconBg: '#D1FAE5', iconColor: '#059669', title: t('vp_choose_title'), body: t('vp_choose_body') },
    { icon: Users, iconBg: '#DBEAFE', iconColor: '#2563EB', title: t('vp_account_title'), body: t('vp_account_body') },
    { icon: CreditCard, iconBg: '#FEF3C7', iconColor: '#D97706', title: t('vp_pay_title'), body: t('vp_pay_body') },
    { icon: Plane, iconBg: '#FCE7F3', iconColor: '#DB2777', title: t('vp_adventure_title'), body: t('vp_adventure_body') },
  ];

  return (
    <section className="section" style={{ background: 'var(--ivory)', paddingTop: 32 }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p className="eyebrow" style={{ color: 'var(--stone)', marginBottom: 16 }}>{t('vp_eyebrow')}</p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700,
            color: 'var(--charcoal)', lineHeight: 1.1, marginBottom: 20,
          }}>
            {t('vp_h2_line1')}<br />{t('vp_h2_line2')}
          </h2>
          <p style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 18,
            color: 'var(--stone)', maxWidth: 560, margin: '0 auto', lineHeight: 1.6,
          }}>
            {t('vp_sub')}
          </p>
        </div>

        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 56 }}
            className="value-grid">
            {FEATURES.map(({ icon: Icon, iconBg, iconColor, title, body }) => (
              <div key={title} style={{
                background: 'white', borderRadius: 24,
                border: '1px solid #F0EDE6', padding: 36,
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', background: iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={22} color={iconColor} />
                </div>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif", fontSize: 20,
                  color: 'var(--charcoal)', marginTop: 16, marginBottom: 8,
                }}>{title}</h3>
                <p style={{ fontFamily: "'Outfit'", fontSize: 14, color: 'var(--stone)', lineHeight: 1.6 }}>{body}</p>
              </div>
            ))}
          </div>

          {/* Mock booking card */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div className="sticky-note" style={{
                position: 'absolute', top: -16, right: -20,
                padding: '10px 14px', transform: 'rotate(-4deg)', zIndex: 2,
                fontSize: 15, fontWeight: 600,
              }}>
                Just booked! 🦁
              </div>
              <div style={{
                background: 'white', borderRadius: 24, padding: 28, maxWidth: 400,
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                  <img
                    src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=100&h=100&fit=crop"
                    alt="Masai Mara"
                    style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700 }}>
                      Masai Mara Adventure
                    </div>
                    <div style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)' }}>7 Days · 6 Nights</div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #F0EDE6', borderBottom: '1px solid #F0EDE6', padding: '16px 0', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)' }}>Travelers</span>
                    <span style={{ fontFamily: "'Outfit'", fontSize: 13, fontWeight: 600 }}>2 people</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)' }}>Total</span>
                    <span style={{ fontFamily: "'Outfit'", fontSize: 16, fontWeight: 700, color: 'var(--earth)' }}>$1,870</span>
                  </div>
                </div>
                <span style={{
                  display: 'inline-block', background: '#D1FAE5', color: '#059669',
                  borderRadius: 100, padding: '4px 12px',
                  fontFamily: "'Outfit'", fontSize: 12, fontWeight: 500, marginBottom: 16,
                }}>✅ Booking Confirmed</span>
                <Link to="/dashboard" className="btn-dark" style={{ width: '100%', justifyContent: 'center' }}>
                  View Itinerary →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .value-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
