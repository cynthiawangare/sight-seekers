import { useLanguage } from '../../context/LanguageContext';

export default function HowItWorks() {
  const { t } = useLanguage();

  const CARDS = [
    { num: '01', title: t('hiw_guides_title'), body: t('hiw_guides_body') },
    { num: '02', title: t('hiw_groups_title'), body: t('hiw_groups_body') },
    { num: '03', title: t('hiw_inclusive_title'), body: t('hiw_inclusive_body') },
    { num: '04', title: t('hiw_payment_title'), body: t('hiw_payment_body') },
  ];

  return (
    <section className="section" style={{ background: 'var(--night)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>{t('hiw_eyebrow')}</p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700,
            color: 'white', marginBottom: 16, lineHeight: 1.15,
          }}>{t('hiw_h2')}</h2>
          <p style={{ fontFamily: "'Outfit'", fontSize: 18, color: 'rgba(255,255,255,0.6)', maxWidth: 520, margin: '0 auto' }}>
            {t('hiw_sub')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}
          className="how-grid">
          {CARDS.map((card) => (
            <div key={card.num} style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, padding: 32,
              transition: 'background 0.2s, border-color 0.2s',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <div style={{
                fontFamily: "'Playfair Display', serif", fontSize: 48,
                fontWeight: 700, color: 'var(--gold)', opacity: 0.4,
                lineHeight: 1, marginBottom: 24,
              }}>{card.num}</div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif", fontSize: 20,
                color: 'white', marginBottom: 12,
              }}>{card.title}</h3>
              <p style={{
                fontFamily: "'Outfit'", fontSize: 14,
                color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
              }}>{card.body}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .how-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .how-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
