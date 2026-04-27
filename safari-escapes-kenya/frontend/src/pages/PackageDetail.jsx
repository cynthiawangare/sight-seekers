import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Users, Check, X, MapPin, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { getPackageBySlug, getPackageItinerary } from '../services/packageService';
import { getPackageReviews, createReview } from '../services/reviewService';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1400&h=600&fit=crop';

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
          <Star size={22} style={{ fill: s <= value ? '#F59E0B' : '#D1D5DB', color: s <= value ? '#F59E0B' : '#D1D5DB' }} />
        </button>
      ))}
    </div>
  );
}

function MealBadge({ label, included }) {
  if (!included) return null;
  return (
    <span style={{
      background: '#D1FAE5', color: '#065F46',
      fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
      padding: '3px 10px', borderRadius: 100,
    }}>{label}</span>
  );
}

export default function PackageDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const TABS = [t('detail_overview'), t('detail_itinerary'), t('detail_includes'), t('detail_reviews')];

  const [pkg, setPkg] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [travelers, setTravelers] = useState(2);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const packageData = await getPackageBySlug(slug);
        if (!packageData) { navigate('/packages'); return; }
        setPkg(packageData);
        const itin = await getPackageItinerary(packageData.id).catch(() => []);
        setItinerary(itin.sort((a, b) => a.day_number - b.day_number));
        // Reviews are best-effort — don't fail the page if they can't load
        getPackageReviews(packageData.id).then(setReviews).catch(() => {});
      } catch {
        toast.error('Failed to load package');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [slug]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setSubmittingReview(true);
    try {
      await createReview({ ...reviewForm, package_id: pkg.id, package_name: pkg.name, user_id: user.uid, user_name: user.displayName || user.email });
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, title: '', body: '' });
      const updated = await getPackageReviews(pkg.id);
      setReviews(updated);
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const priceInDollars = pkg ? Math.round((pkg.price_per_person || 0) / 100) : 0;
  const discountedPrice = pkg ? (pkg.discount_percent > 0
    ? Math.round(priceInDollars * (1 - pkg.discount_percent / 100))
    : priceInDollars) : 0;
  const totalPrice = discountedPrice * travelers;

  // ── Loading skeleton ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ background: 'var(--ivory)', minHeight: '100vh' }}>
        <div style={{ height: 480, background: 'var(--night)', marginBottom: 48 }} />
        <div className="container" style={{ maxWidth: 1100 }}>
          <div style={{ height: 32, background: '#E5E7EB', borderRadius: 8, width: '40%', marginBottom: 16 }} />
          <div style={{ height: 16, background: '#E5E7EB', borderRadius: 8, width: '70%' }} />
        </div>
      </div>
    );
  }

  if (!pkg) return null;

  const heroImg = pkg.images?.[0] || FALLBACK_IMG;

  return (
    <div style={{ background: 'var(--ivory)', minHeight: '100vh' }}>

      {/* ── Hero banner ─────────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
        <img
          src={heroImg}
          alt={pkg.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center' }}
          onError={(e) => { e.target.src = FALLBACK_IMG; e.target.onerror = null; }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(12,26,18,0.2) 0%, rgba(12,26,18,0.75) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end', padding: '0 0 48px',
        }}>
          <div className="container" style={{ maxWidth: 1100 }}>
            <span style={{
              background: 'var(--gold)', color: 'var(--night)',
              fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '4px 14px', borderRadius: 100, display: 'inline-block', marginBottom: 16,
            }}>{pkg.tour_type}</span>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900,
              color: 'white', lineHeight: 1.1, marginBottom: 20,
            }}>{pkg.name}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
              {[
                { icon: MapPin, label: pkg.country },
                { icon: Clock, label: `${pkg.duration_days} Days` },
                { icon: Users, label: `Max ${pkg.max_travelers} travelers` },
                { icon: Calendar, label: 'All year round' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: 'rgba(255,255,255,0.85)',
                  fontFamily: "'Outfit', sans-serif", fontSize: 14,
                }}>
                  <Icon size={15} style={{ opacity: 0.7 }} /> {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="container" style={{ maxWidth: 1100, padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}
          className="detail-grid">

          {/* Left — tabs */}
          <div>
            {/* Tab bar */}
            <div style={{
              background: 'white', borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: 8,
            }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #F3F4F6' }}>
                {TABS.map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    flex: 1, padding: '18px 8px',
                    fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: activeTab === tab ? 'var(--charcoal)' : 'var(--stone)',
                    borderBottom: activeTab === tab ? '2px solid var(--gold)' : '2px solid transparent',
                    transition: 'all 0.2s',
                  }}>{tab}</button>
                ))}
              </div>

              <div style={{ padding: 32 }}>

                {/* Overview */}
                {activeTab === TABS[0] && (
                  <div>
                    <p style={{
                      fontFamily: "'Outfit', sans-serif", fontSize: 16,
                      color: 'var(--stone)', lineHeight: 1.8, marginBottom: 32,
                    }}>{pkg.description}</p>

                    {pkg.highlights?.length > 0 && (
                      <>
                        <h3 style={{
                          fontFamily: "'Playfair Display', serif", fontSize: 22,
                          color: 'var(--charcoal)', marginBottom: 20,
                        }}>{t('detail_highlights')}</h3>
                        <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, listStyle: 'none', padding: 0 }}
                          className="highlights-grid">
                          {pkg.highlights.map((h) => (
                            <li key={h} style={{
                              display: 'flex', alignItems: 'flex-start', gap: 10,
                              fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--charcoal)',
                              background: 'var(--ivory)', borderRadius: 12, padding: '12px 16px',
                            }}>
                              <span style={{ color: 'var(--gold)', fontSize: 16, flexShrink: 0 }}>★</span>
                              {h}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}

                {/* Itinerary */}
                {activeTab === TABS[1] && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {itinerary.length === 0 && (
                      <p style={{ fontFamily: "'Outfit'", color: 'var(--stone)', fontSize: 14 }}>No itinerary added yet.</p>
                    )}
                    {itinerary.map((day) => (
                      <div key={day.id} style={{
                        border: '1px solid #F3F4F6', borderRadius: 16, overflow: 'hidden',
                        background: activeDay === day.day_number ? '#FAFAFA' : 'white',
                      }}>
                        <button
                          onClick={() => setActiveDay(activeDay === day.day_number ? null : day.day_number)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                            padding: '18px 20px', background: 'none', border: 'none',
                            cursor: 'pointer', textAlign: 'left',
                          }}
                        >
                          <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: activeDay === day.day_number ? 'var(--gold)' : 'var(--night)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, flexShrink: 0,
                            transition: 'background 0.2s',
                          }}>{day.day_number}</div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 15, color: 'var(--charcoal)', margin: 0 }}>{day.title}</p>
                            {day.accommodation && (
                              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: 'var(--stone)', margin: '2px 0 0' }}>
                                🏕 {day.accommodation}
                              </p>
                            )}
                          </div>
                          {activeDay === day.day_number
                            ? <ChevronUp size={16} color="var(--stone)" />
                            : <ChevronDown size={16} color="var(--stone)" />}
                        </button>

                        {activeDay === day.day_number && (
                          <div style={{ padding: '0 20px 20px', borderTop: '1px solid #F3F4F6' }}>
                            <p style={{
                              fontFamily: "'Outfit', sans-serif", fontSize: 14,
                              color: 'var(--stone)', lineHeight: 1.75, margin: '16px 0',
                            }}>{day.description}</p>

                            {day.activities?.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                {day.activities.map((a) => (
                                  <span key={a} style={{
                                    background: 'rgba(26,82,118,0.08)', color: 'var(--blue-primary)',
                                    fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 500,
                                    padding: '4px 12px', borderRadius: 100,
                                  }}>{a}</span>
                                ))}
                              </div>
                            )}

                            {day.meals && (
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <MealBadge label="Breakfast" included={day.meals.breakfast} />
                                <MealBadge label="Lunch" included={day.meals.lunch} />
                                <MealBadge label="Dinner" included={day.meals.dinner} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Includes */}
                {activeTab === TABS[2] && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}
                    className="includes-grid">
                    <div>
                      <h3 style={{
                        fontFamily: "'Playfair Display', serif", fontSize: 20,
                        color: '#065F46', marginBottom: 20,
                      }}>{t('detail_whats_included')}</h3>
                      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {pkg.includes?.map((item) => (
                          <li key={item} style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                            fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--charcoal)',
                          }}>
                            <span style={{
                              width: 20, height: 20, borderRadius: '50%', background: '#D1FAE5',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                            }}>
                              <Check size={11} color="#065F46" />
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 style={{
                        fontFamily: "'Playfair Display', serif", fontSize: 20,
                        color: '#991B1B', marginBottom: 20,
                      }}>{t('detail_not_included')}</h3>
                      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {pkg.excludes?.map((item) => (
                          <li key={item} style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                            fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--charcoal)',
                          }}>
                            <span style={{
                              width: 20, height: 20, borderRadius: '50%', background: '#FEE2E2',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                            }}>
                              <X size={11} color="#991B1B" />
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Reviews */}
                {activeTab === TABS[3] && (
                  <div>
                    {reviews.length === 0 && (
                      <p style={{ fontFamily: "'Outfit'", color: 'var(--stone)', fontSize: 14, marginBottom: 32 }}>
                        {t('detail_reviews_none')}
                      </p>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
                      {reviews.map((review) => (
                        <div key={review.id} style={{
                          background: 'var(--ivory)', borderRadius: 16, padding: 20,
                          border: '1px solid #F3F4F6',
                        }}>
                          <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} size={14} style={{
                                fill: s <= review.rating ? '#F59E0B' : '#D1D5DB',
                                color: s <= review.rating ? '#F59E0B' : '#D1D5DB',
                              }} />
                            ))}
                          </div>
                          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14, color: 'var(--charcoal)', marginBottom: 6 }}>{review.title}</p>
                          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--stone)', fontStyle: 'italic', lineHeight: 1.6 }}>"{review.body}"</p>
                          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: 'var(--stone)', marginTop: 10 }}>
                            — {review.user_name} {review.nationality && `· ${review.nationality}`}
                          </p>
                        </div>
                      ))}
                    </div>

                    {isAuthenticated && (
                      <form onSubmit={handleReviewSubmit} style={{
                        border: '1px solid #E5E7EB', borderRadius: 20, padding: 28,
                        background: 'white',
                      }}>
                        <h4 style={{
                          fontFamily: "'Playfair Display', serif", fontSize: 20,
                          color: 'var(--charcoal)', marginBottom: 20,
                        }}>{t('detail_leave_review')}</h4>

                        <div style={{ marginBottom: 16 }}>
                          <label style={{ fontFamily: "'Outfit'", fontSize: 12, color: 'var(--stone)', display: 'block', marginBottom: 8 }}>{t('detail_rating')}</label>
                          <StarPicker value={reviewForm.rating} onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                        </div>
                        <input
                          type="text" placeholder={t('detail_review_title')}
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          required
                          style={{
                            width: '100%', padding: '12px 16px', borderRadius: 12,
                            border: '1px solid #E5E7EB', fontFamily: "'Outfit', sans-serif", fontSize: 14,
                            outline: 'none', marginBottom: 12, boxSizing: 'border-box', color: 'var(--charcoal)',
                          }}
                        />
                        <textarea
                          placeholder={t('detail_review_body')}
                          value={reviewForm.body}
                          onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                          rows={4} required
                          style={{
                            width: '100%', padding: '12px 16px', borderRadius: 12,
                            border: '1px solid #E5E7EB', fontFamily: "'Outfit', sans-serif", fontSize: 14,
                            outline: 'none', resize: 'vertical', marginBottom: 16,
                            boxSizing: 'border-box', color: 'var(--charcoal)',
                          }}
                        />
                        <button type="submit" disabled={submittingReview} className="btn-earth"
                          style={{ opacity: submittingReview ? 0.6 : 1 }}>
                          {submittingReview ? t('detail_submitting') : t('detail_submit_review')}
                        </button>
                      </form>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* ── Sticky sidebar ───────────────────────────────────────── */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{
              background: 'white', borderRadius: 24,
              boxShadow: '0 8px 40px rgba(0,0,0,0.10)', overflow: 'hidden',
            }}>
              {/* Price header */}
              <div style={{ background: 'var(--night)', padding: '28px 28px 24px' }}>
                {pkg.discount_percent > 0 && (
                  <p style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through', marginBottom: 4 }}>
                    ${priceInDollars} /person
                  </p>
                )}
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: 'white', margin: 0 }}>
                  ${discountedPrice}
                  <span style={{ fontFamily: "'Outfit'", fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}> /person</span>
                </p>
                {pkg.discount_percent > 0 && (
                  <span style={{
                    background: 'var(--gold)', color: 'var(--night)',
                    fontFamily: "'Outfit'", fontSize: 11, fontWeight: 700,
                    padding: '3px 10px', borderRadius: 100, display: 'inline-block', marginTop: 8,
                  }}>{pkg.discount_percent}% OFF</span>
                )}
              </div>

              <div style={{ padding: 28 }}>
                {/* Travelers */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontFamily: "'Outfit'", fontSize: 12, color: 'var(--stone)', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                    {t('detail_travelers')}
                  </label>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden',
                  }}>
                    <button type="button"
                      onClick={() => setTravelers(Math.max(1, travelers - 1))}
                      style={{
                        padding: '12px 18px', background: 'none', border: 'none',
                        cursor: 'pointer', fontFamily: "'Outfit'", fontSize: 18, color: 'var(--charcoal)',
                      }}>−</button>
                    <span style={{
                      flex: 1, textAlign: 'center',
                      fontFamily: "'Outfit'", fontWeight: 600, fontSize: 15, color: 'var(--charcoal)',
                    }}>{travelers}</span>
                    <button type="button"
                      onClick={() => setTravelers(Math.min(pkg.max_travelers || 12, travelers + 1))}
                      style={{
                        padding: '12px 18px', background: 'none', border: 'none',
                        cursor: 'pointer', fontFamily: "'Outfit'", fontSize: 18, color: 'var(--charcoal)',
                      }}>+</button>
                  </div>
                </div>

                {/* Price breakdown */}
                <div style={{
                  background: 'var(--ivory)', borderRadius: 14, padding: 16, marginBottom: 20,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)' }}>
                      ${discountedPrice} × {travelers} {travelers === 1 ? 'person' : 'people'}
                    </span>
                    <span style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)' }}>${discountedPrice * travelers}</span>
                  </div>
                  <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Outfit'", fontWeight: 700, fontSize: 14, color: 'var(--charcoal)' }}>{t('detail_total')}</span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: 'var(--charcoal)' }}>${totalPrice}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login', { state: { from: `/pay/${pkg.slug}`, travelers } });
                    } else {
                      navigate(`/pay/${pkg.slug}`, { state: { travelers } });
                    }
                  }}
                  className="btn-earth"
                  style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '16px 24px' }}
                >
                  Book Now
                </button>
                <p style={{
                  fontFamily: "'Outfit'", fontSize: 11, color: 'var(--stone)',
                  textAlign: 'center', marginTop: 10,
                }}>Login required to complete booking</p>

                {/* Quick facts */}
                <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 24, paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { icon: Clock, label: 'Duration', value: `${pkg.duration_days} days` },
                    { icon: Users, label: 'Group size', value: `Max ${pkg.max_travelers} people` },
                    { icon: MapPin, label: 'Destination', value: pkg.country },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', background: 'var(--ivory)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Icon size={15} color="var(--stone)" />
                      </div>
                      <div>
                        <p style={{ fontFamily: "'Outfit'", fontSize: 11, color: 'var(--stone)', margin: 0 }}>{label}</p>
                        <p style={{ fontFamily: "'Outfit'", fontSize: 13, fontWeight: 600, color: 'var(--charcoal)', margin: 0 }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .highlights-grid { grid-template-columns: 1fr !important; }
          .includes-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
