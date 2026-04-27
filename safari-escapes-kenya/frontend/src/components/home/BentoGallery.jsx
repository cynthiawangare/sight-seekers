import { useStorageImages } from '../../hooks/useStorageImages';
import { useLanguage } from '../../context/LanguageContext';

const GALLERY_FALLBACKS = [
  'https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327182443_83_6.jpg?alt=media&token=a446a7c4-ec53-4a24-9361-7fb738e4240c',
  'https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327183847_102_6.jpg?alt=media&token=6d2e4967-7730-4c63-83fa-4c8ab64d61c3',
  'https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327173850_37_6.jpg?alt=media&token=c00ba950-09dd-41e7-83fc-c02d7f3fb785',
  'https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327191502_127_6.jpg?alt=media&token=42f1522e-c11b-4abd-a20c-2b7018484154',
  'https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327182420_76_6.jpg?alt=media&token=dfa7f0c2-ced6-4255-91c5-e44ae672c117',
];

const CELL_KEYS = [
  { key: 'gallery_lion',      style: { gridRow: 'span 2' } },
  { key: 'gallery_elephant',  style: {} },
  { key: 'gallery_giraffe',   style: {} },
  { key: 'gallery_cheetah',   style: {} },
  { key: 'gallery_migration', style: {} },
];

export default function BentoGallery() {
  const { images } = useStorageImages('gallery', GALLERY_FALLBACKS);
  const { t } = useLanguage();
  const cells = CELL_KEYS.map((meta, i) => ({
    ...meta,
    label: t(meta.key),
    src: images[i] || GALLERY_FALLBACKS[i],
  }));

  return (
    <section className="section" style={{ background: 'var(--ivory)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p className="eyebrow" style={{ color: 'var(--stone)', marginBottom: 16 }}>{t('gallery_eyebrow')}</p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: 'var(--charcoal)',
          }}>{t('gallery_title')}</h2>
          <p style={{ fontFamily: "'Outfit'", fontSize: 16, color: 'var(--stone)', marginTop: 12 }}>
            {t('gallery_sub')}
          </p>
        </div>

        {/* Desktop bento grid */}
        <div className="bento-desktop" style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gridTemplateRows: '280px 280px',
          gap: 16,
        }}>
          {cells.map(({ src, label, style }) => (
            <div key={label} style={{
              position: 'relative', borderRadius: 20, overflow: 'hidden', ...style,
            }}>
              <img src={src} alt={label} style={{
                width: '100%', height: '100%', objectFit: 'cover',
                display: 'block', transition: 'transform 0.4s ease',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
              <div style={{
                position: 'absolute', bottom: 12, left: 12,
                background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)',
                borderRadius: 100, padding: '4px 14px',
                fontFamily: "'Outfit'", fontSize: 12, fontWeight: 500, color: 'var(--charcoal)',
              }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Mobile grid */}
        <div className="bento-mobile" style={{ display: 'none', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {cells.map(({ src, label }) => (
            <div key={label} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 160 }}>
              <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center' }} />
              <div style={{
                position: 'absolute', bottom: 8, left: 8,
                background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(6px)',
                borderRadius: 100, padding: '2px 10px',
                fontFamily: "'Outfit'", fontSize: 11, fontWeight: 500, color: 'var(--charcoal)',
              }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .bento-desktop { display: none !important; }
          .bento-mobile  { display: grid !important; }
        }
      `}</style>
    </section>
  );
}
