import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Youtube } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getPackages } from '../../services/packageService';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [packages, setPackages] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    getPackages({}).then(setPackages).catch(() => {});
  }, []);

  const companyLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Packages', to: '/packages' },
  ];
  const supportLinks = [
    { label: 'FAQs', to: '/faqs' },
    { label: 'Cancellation', to: '/cancellation' },
  ];

  return (
    <footer style={{ background: 'var(--charcoal)', color: 'white', padding: '52px 0 28px' }}>
      <div className="container">
        {/* Top row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 36,
          paddingBottom: 36,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
          className="footer-grid"
        >
          {/* Col 1 — Brand */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <img src="https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327155559_16_6.png?alt=media&token=fdd3d494-f42e-49aa-8c11-cd7d4929780e" alt="Sight Seekers" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
            </div>
            <p style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 14,
              color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 260, marginBottom: 24,
            }}>
              {t('footer_tagline')}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { icon: <Instagram size={16} />, href: '#' },
                { icon: <Facebook size={16} />, href: '#' },
                { icon: <Mail size={16} />, href: 'mailto:hello@sightseekers.com' },
                { icon: <Youtube size={16} />, href: '#' },
              ].map((s, i) => (
                <a key={i} href={s.href} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
                  transition: 'background 0.2s, color 0.2s',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--gold)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  }}
                >{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Packages column — dynamic from Firestore */}
          <div>
            <div style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 12,
              fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)', marginBottom: 20,
            }}>{t('footer_packages')}</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {packages.slice(0, 6).map((pkg) => (
                <li key={pkg.id}>
                  <Link to={`/packages/${pkg.slug || pkg.id}`} style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 14,
                    color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={(e) => (e.target.style.color = 'white')}
                    onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.6)')}
                  >{pkg.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <div style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 12,
              fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)', marginBottom: 20,
            }}>{t('footer_company')}</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 14,
                    color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={(e) => (e.target.style.color = 'white')}
                    onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.6)')}
                  >{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support column */}
          <div>
            <div style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 12,
              fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)', marginBottom: 20,
            }}>{t('footer_support')}</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 14,
                    color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={(e) => (e.target.style.color = 'white')}
                    onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.6)')}
                  >{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div style={{ textAlign: 'center', padding: '32px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 13,
            color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em',
            textTransform: 'uppercase', marginBottom: 12,
          }}>{t('footer_newsletter_label')}</p>
          <h3 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 24,
            color: 'white', marginBottom: 24,
          }}>{t('footer_newsletter_h')}</h3>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', maxWidth: 480, margin: '0 auto' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('footer_newsletter_ph')}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 100, padding: '12px 20px',
                fontFamily: "'Outfit', sans-serif", fontSize: 14,
                color: 'white', outline: 'none',
              }}
            />
            <button className="btn-earth" style={{ whiteSpace: 'nowrap' }}>{t('footer_subscribe')}</button>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 24, flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 13,
            color: 'rgba(255,255,255,0.4)',
          }}>{t('footer_copyright')}</p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {['Visa', 'UnionPay', 'M-Pesa'].map((p) => (
              <span key={p} style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 11,
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
                padding: '4px 10px', borderRadius: 4,
              }}>{p}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
