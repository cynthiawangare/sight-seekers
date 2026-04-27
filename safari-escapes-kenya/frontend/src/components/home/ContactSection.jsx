import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const CONTACTS = [
  {
    platform: 'Instagram', handle: '@jimmySS47', color: '#E1306C',
    url: 'https://www.instagram.com/jimmyss47?igsh=cWQ2MDM2aDZwb2g=', emoji: '📸',
  },
  {
    platform: 'Facebook', name: 'James Watta', handle: '@JamesWatta', color: '#1877F2',
    url: 'https://facebook.com', emoji: '📘',
  },
  {
    platform: 'WeChat', handle: 'SightSeekers', color: '#07C160', url: null, emoji: '💬',
  },
  {
    platform: 'Email', handle: 'sightseekers007@gmail.com', color: '#D97706',
    url: 'mailto:sightseekers007@gmail.com', emoji: '📧',
  },
  {
    platform: 'Weibo', handle: '@sightseekers', color: '#E6162D',
    url: 'https://weibo.com', emoji: '🐉',
  },
  {
    platform: 'Douyin', handle: '@sightseekers', color: '#000000', url: '#', emoji: '📱',
  },
  {
    platform: 'TikTok', handle: '@JimmySS', color: '#000000',
    url: 'https://www.tiktok.com/@JimmySS',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/>
      </svg>
    ),
  },
];

export default function ContactSection() {
  const [wechatModal, setWechatModal] = useState(false);
  const { t } = useLanguage();

  const handleClick = (c) => {
    if (c.platform === 'WeChat') return setWechatModal(true);
    if (c.url) window.open(c.url, '_blank', 'noopener noreferrer');
  };

  return (
    <section className="section" style={{ background: 'var(--ivory)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p className="eyebrow" style={{ color: 'var(--stone)', marginBottom: 16 }}>{t('contact_eyebrow')}</p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--charcoal)',
          }}>{t('contact_h2')}</h2>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
          gap: 16, maxWidth: 1100, margin: '0 auto',
        }} className="contact-grid">
          {CONTACTS.map((c) => (
            <button key={c.platform} onClick={() => handleClick(c)} style={{
              background: 'white', borderRadius: 20, padding: '28px 20px',
              border: '1px solid #F0EDE6', textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.25s ease',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = c.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#F0EDE6';
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                {c.svgIcon || c.emoji}
              </div>
              <div style={{ fontFamily: "'Outfit'", fontSize: 13, fontWeight: 600, color: 'var(--charcoal)' }}>
                {c.platform}
              </div>
              {c.name && (
                <div style={{ fontFamily: "'Outfit'", fontSize: 11, color: 'var(--charcoal)', fontWeight: 500, lineHeight: 1.2 }}>
                  {c.name}
                </div>
              )}
              <div style={{
                fontFamily: "'Outfit'", fontSize: 11, color: 'var(--stone)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%',
              }}>
                {c.handle}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* WeChat modal */}
      {wechatModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 24,
        }} onClick={() => setWechatModal(false)}>
          <div style={{
            background: 'white', borderRadius: 24, padding: 40,
            maxWidth: 360, width: '100%', textAlign: 'center',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 12 }}>WeChat</h3>
            <p style={{ fontFamily: "'Outfit'", fontSize: 14, color: 'var(--stone)', marginBottom: 24 }}>
              Add us on WeChat to connect with our team directly.
            </p>
            <div style={{
              background: '#F0FDF4', border: '1px solid #BBF7D0',
              borderRadius: 16, padding: '16px', marginBottom: 24,
            }}>
              <p style={{ fontFamily: "'Outfit'", fontSize: 18, fontWeight: 700, color: '#15803D', margin: 0 }}>SightSeekers</p>
              <p style={{ fontFamily: "'Outfit'", fontSize: 12, color: '#16A34A', margin: '4px 0 0' }}>WeChat ID</p>
            </div>
            <button onClick={() => setWechatModal(false)} className="btn-dark" style={{ width: '100%', justifyContent: 'center' }}>
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1000px) {
          .contact-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 700px) {
          .contact-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .contact-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
