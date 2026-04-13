import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useLanguage } from '../../context/LanguageContext';

const AVATAR_COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
function avatarColor(name = '') {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function avatarInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function StarRow({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: 14, color: i <= Math.round(rating) ? '#F59E0B' : 'rgba(255,255,255,0.2)' }}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, 'reviews'));
        const visible = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(r => r.is_visible !== false)
          .sort((a, b) => {
            const ta = a.created_at?.seconds || 0;
            const tb = b.created_at?.seconds || 0;
            return tb - ta;
          });
        setReviews(visible);
      } catch {
        // Silently fail — reviews are non-critical
      }
    }
    load();
  }, []);

  // Auto-scroll every 4s
  useEffect(() => {
    if (reviews.length < 2) return;
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [reviews.length]);

  const goTo = (i) => {
    clearInterval(intervalRef.current);
    setCurrent(i);
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % reviews.length);
    }, 4000);
  };

  const r = reviews[current];

  return (
    <section className="section" style={{ background: 'var(--night)', padding: '44px 40px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>

        {/* Section label */}
        <p style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)', marginBottom: 12,
        }}>
          TRAVELER REVIEWS
        </p>

        {r ? (
          <>
            {/* Review card */}
            <div style={{
              background: 'white', borderRadius: 28, padding: '44px 48px',
              position: 'relative', textAlign: 'left',
              boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
              transition: 'opacity 0.4s ease',
              minHeight: 200,
            }}>
              {/* Sticky-style rating badge */}
              <div className="sticky-note" style={{
                position: 'absolute', top: -18, right: -16,
                padding: '10px 16px', transform: 'rotate(8deg)',
                fontFamily: "'Caveat', cursive", fontSize: 17, fontWeight: 600,
                color: '#78350F', zIndex: 2,
              }}>
                {'★'.repeat(Math.round(r.rating || 5))} {(r.rating || 5).toFixed(1)}
              </div>

              {/* Package name */}
              {r.package_name && (
                <p style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--earth)', marginBottom: 12,
                }}>
                  {r.package_name}
                </p>
              )}

              {/* Title */}
              {r.title && (
                <h4 style={{
                  fontFamily: "'Playfair Display', serif", fontSize: 18,
                  color: 'var(--charcoal)', marginBottom: 10, fontStyle: 'italic',
                }}>
                  "{r.title}"
                </h4>
              )}

              {/* Body */}
              <p style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 15, lineHeight: 1.8,
                color: 'var(--stone)', marginBottom: 28,
              }}>
                {(r.body || r.comment || r.text || '').slice(0, 320)}
                {(r.body || r.comment || r.text || '').length > 320 ? '…' : ''}
              </p>

              {/* Reviewer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: avatarColor(r.user_name || r.reviewer || ''),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
                }}>
                  {avatarInitials(r.user_name || r.reviewer || 'G')}
                </div>
                <div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--charcoal)' }}>
                    {r.user_name || r.reviewer || 'Guest'} {r.nationality || ''}
                  </div>
                  <StarRow rating={r.rating || 5} />
                </div>
              </div>
            </div>

            {/* Dots */}
            {reviews.length > 1 && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 28 }}>
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    style={{
                      width: i === current ? 24 : 8,
                      height: 8, borderRadius: 4,
                      background: i === current ? 'var(--gold)' : 'rgba(255,255,255,0.25)',
                      border: 'none', cursor: 'pointer',
                      transition: 'all 0.3s ease', padding: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Fallback if no reviews yet */
          <div style={{
            background: 'white', borderRadius: 28, padding: '44px 48px',
            position: 'relative', textAlign: 'left',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          }}>
            <div className="sticky-note" style={{
              position: 'absolute', top: -18, right: -16,
              padding: '10px 16px', transform: 'rotate(8deg)',
              fontFamily: "'Caveat', cursive", fontSize: 17, fontWeight: 600,
              color: '#78350F', zIndex: 2,
            }}>
              5 stars! ⭐⭐⭐⭐⭐
            </div>
            <p style={{ fontFamily: "'Outfit'", fontSize: 15, lineHeight: 1.8, color: 'var(--stone)', marginBottom: 28, whiteSpace: 'pre-line' }}>
              {t('review_detail')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" alt="Li Wei" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontFamily: "'Outfit'", fontSize: 15, fontWeight: 600, color: 'var(--charcoal)' }}>Li Wei 🇨🇳</div>
                <div style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)' }}>{t('review_author_trip')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Below card quote + CTA */}
        <div style={{ marginTop: 28 }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(20px, 3vw, 30px)',
            fontStyle: 'italic', color: 'white', lineHeight: 1.4,
            maxWidth: 520, margin: '0 auto 28px',
          }}>
            {t('review_quote')}
          </h3>
          <Link to="/packages" className="btn-earth">
            {t('review_cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
