import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Smartphone, Globe, Clock, Users, MapPin, Check, ChevronLeft } from 'lucide-react';
import { getPackageBySlug } from '../services/packageService';
import { createStripeIntent, initiateMpesa, sendConfirmationEmail } from '../services/paymentService';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const LOGO = 'https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327155559_16_6.png?alt=media&token=fdd3d494-f42e-49aa-8c11-cd7d4929780e';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop';

const METHODS = [
  { id: 'card',    label: 'Card',      icon: CreditCard,  color: '#1A5276' },
  { id: 'mpesa',   label: 'M-Pesa',    icon: Smartphone,  color: '#2ECC71' },
  { id: 'paypal',  label: 'PayPal',    icon: Globe,       color: '#003087' },
  { id: 'wechat',  label: 'WeChat Pay',icon: Globe,       color: '#07C160' },
];

const INPUT = {
  width: '100%', padding: '14px 16px', borderRadius: 12,
  border: '1.5px solid #E5E7EB', fontFamily: "'Outfit', sans-serif",
  fontSize: 14, outline: 'none', color: 'var(--charcoal)',
  background: 'white', boxSizing: 'border-box',
};
const LABEL = {
  fontFamily: "'Outfit', sans-serif", fontSize: 12,
  fontWeight: 600, color: 'var(--stone)', display: 'block', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.06em',
};

export default function PaymentPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const travelers = location.state?.travelers || 1;

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  // Card form state
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });
  // M-Pesa form state
  const [mpesaPhone, setMpesaPhone] = useState('');

  useEffect(() => {
    getPackageBySlug(slug)
      .then((data) => { if (!data) navigate('/packages'); else setPkg(data); })
      .catch(() => navigate('/packages'))
      .finally(() => setLoading(false));
  }, [slug]);

  const priceInDollars = pkg ? Math.round((pkg.price_per_person || 0) / 100) : 0;
  const discountedPrice = pkg
    ? (pkg.discount_percent > 0
        ? Math.round(priceInDollars * (1 - pkg.discount_percent / 100))
        : priceInDollars)
    : 0;
  const total = discountedPrice * travelers;

  // ── Format card number with spaces ──────────────────────────────────
  const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry    = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    const bookingRef = `SS-${Date.now()}`;
    const confirmEmail = () => sendConfirmationEmail({
      packageName: pkg?.name,
      bookingRef,
      travelers,
      total,
      method,
    }).catch(() => {}); // best-effort

    try {
      if (method === 'card') {
        await createStripeIntent(bookingRef, total * 100);
        await confirmEmail();
        toast.success('Payment processed successfully!');
        setPaid(true);
      } else if (method === 'mpesa') {
        await initiateMpesa(mpesaPhone, total, bookingRef, bookingRef);
        await confirmEmail();
        toast.success('M-Pesa STK push sent! Check your phone.');
        setPaid(true);
      } else if (method === 'paypal') {
        toast.success('Redirecting to PayPal…');
        setTimeout(async () => { await confirmEmail(); setPaid(true); }, 1500);
      } else if (method === 'wechat') {
        await confirmEmail();
        toast.success('WeChat Pay initiated!');
        setPaid(true);
      }
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────
  if (paid) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'white', borderRadius: 28, padding: 56, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 16px 64px rgba(0,0,0,0.10)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check size={36} color="#065F46" />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 800, color: 'var(--charcoal)', marginBottom: 12 }}>{t('pay_success_title')}</h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: 'var(--stone)', lineHeight: 1.7, marginBottom: 8 }}>
            {t('pay_success_body')} <strong style={{ color: 'var(--charcoal)' }}>{pkg?.name}</strong> {t('pay_success_body2')}
          </p>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--stone)', marginBottom: 40 }}>
            {t('pay_success_email')} <strong>{user?.email}</strong>
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-earth" onClick={() => navigate('/dashboard')}>{t('pay_view_dashboard')}</button>
            <button className="btn-outline" onClick={() => navigate('/packages')}>{t('pay_more_packages')}</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !pkg) {
    return <div style={{ minHeight: '100vh', background: 'var(--ivory)' }} />;
  }

  return (
    <div style={{ background: 'var(--ivory)', minHeight: '100vh' }}>

      {/* ── Top bar ────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--night)', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        <img src={LOGO} alt="Sight Seekers" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: "'Outfit', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)',
        }}>
          <ChevronLeft size={16} /> {t('pay_back')}
        </button>
      </div>

      {/* ── Page heading ────────────────────────────────────────────── */}
      <div style={{ background: 'var(--night)', paddingBottom: 40 }}>
        <div className="container" style={{ maxWidth: 1000, paddingTop: 32 }}>
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{t('pay_secure')}</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'white', margin: 0 }}>
            {t('pay_title')}
          </h1>
        </div>
      </div>

      {/* ── Two-column layout ───────────────────────────────────────── */}
      <div className="container" style={{ maxWidth: 1000, padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}
          className="pay-grid">

          {/* ── Left — payment form ────────────────────────────────── */}
          <div>
            {/* Method selector */}
            <div style={{ background: 'white', borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--charcoal)', marginBottom: 20 }}>
                {t('pay_method_title')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }} className="method-grid">
                {METHODS.map((m) => {
                  const Icon = m.icon;
                  const active = method === m.id;
                  return (
                    <button key={m.id} onClick={() => setMethod(m.id)} style={{
                      padding: '16px 8px', borderRadius: 14, cursor: 'pointer',
                      border: active ? `2px solid ${m.color}` : '2px solid #E5E7EB',
                      background: active ? `${m.color}10` : 'white',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      transition: 'all 0.2s',
                    }}>
                      <Icon size={22} color={active ? m.color : 'var(--stone)'} />
                      <span style={{
                        fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
                        color: active ? m.color : 'var(--stone)',
                      }}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment form */}
            <form onSubmit={handleSubmit}>
              <div style={{ background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>

                {/* ── Card ──────────────────────────────────────────── */}
                {method === 'card' && (
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--charcoal)', marginBottom: 24 }}>{t('pay_card_title')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label style={LABEL}>{t('pay_card_name')}</label>
                        <input style={INPUT} placeholder="James Kimani" value={card.name}
                          onChange={(e) => setCard({ ...card, name: e.target.value })} required />
                      </div>
                      <div>
                        <label style={LABEL}>{t('pay_card_number')}</label>
                        <input style={INPUT} placeholder="1234 5678 9012 3456"
                          value={card.number}
                          onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                          maxLength={19} required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <label style={LABEL}>{t('pay_card_expiry')}</label>
                          <input style={INPUT} placeholder="MM/YY"
                            value={card.expiry}
                            onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                            maxLength={5} required />
                        </div>
                        <div>
                          <label style={LABEL}>{t('pay_card_cvv')}</label>
                          <input style={INPUT} placeholder="123" type="password"
                            value={card.cvv}
                            onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                            maxLength={4} required />
                        </div>
                      </div>
                    </div>

                    {/* Card icons */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 20, alignItems: 'center' }}>
                      <span style={{ fontFamily: "'Outfit'", fontSize: 11, color: 'var(--stone)', marginRight: 4 }}>{t('pay_accepted')}</span>
                      {['VISA', 'MC', 'UnionPay', 'Amex'].map((c) => (
                        <span key={c} style={{
                          background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6,
                          padding: '3px 8px', fontFamily: "'Outfit'", fontSize: 10, fontWeight: 700,
                          color: 'var(--stone)',
                        }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── M-Pesa ────────────────────────────────────────── */}
                {method === 'mpesa' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Smartphone size={22} color="#2ECC71" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--charcoal)', margin: 0 }}>M-Pesa</h3>
                        <p style={{ fontFamily: "'Outfit'", fontSize: 12, color: 'var(--stone)', margin: 0 }}>{t('pay_mpesa_sub')}</p>
                      </div>
                    </div>
                    <div style={{ background: '#F0FDF4', borderRadius: 14, padding: 16, marginBottom: 20, border: '1px solid #BBF7D0' }}>
                      <p style={{ fontFamily: "'Outfit'", fontSize: 13, color: '#065F46', lineHeight: 1.6, margin: 0 }}>
                        Enter your Safaricom number below. You will receive an STK push to enter your M-Pesa PIN and confirm payment of <strong>KES {(total * 130).toLocaleString()}</strong>.
                      </p>
                    </div>
                    <label style={LABEL}>Safaricom phone number</label>
                    <input style={INPUT} placeholder="07XX XXX XXX or 2547XX XXX XXX"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      required />
                  </div>
                )}

                {/* ── PayPal ────────────────────────────────────────── */}
                {method === 'paypal' && (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#E8F4FD', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <Globe size={32} color="#003087" />
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: 'var(--charcoal)', marginBottom: 12 }}>{t('pay_paypal_title')}</h3>
                    <p style={{ fontFamily: "'Outfit'", fontSize: 14, color: 'var(--stone)', lineHeight: 1.7, maxWidth: 360, margin: '0 auto 28px' }}>
                      {t('pay_paypal_sub')} <strong style={{ color: 'var(--charcoal)' }}>${total.toLocaleString()}</strong>.
                    </p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                      {['PayPal', 'Visa', 'Mastercard', 'Venmo'].map((c) => (
                        <span key={c} style={{
                          background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6,
                          padding: '4px 10px', fontFamily: "'Outfit'", fontSize: 11, fontWeight: 600, color: 'var(--stone)',
                        }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── WeChat Pay ────────────────────────────────────── */}
                {method === 'wechat' && (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <Globe size={32} color="#07C160" />
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: 'var(--charcoal)', marginBottom: 12 }}>{t('pay_wechat_title')}</h3>
                    <p style={{ fontFamily: "'Outfit'", fontSize: 14, color: 'var(--stone)', lineHeight: 1.7, maxWidth: 360, margin: '0 auto 24px' }}>
                      {t('pay_wechat_sub')} <strong style={{ color: 'var(--charcoal)' }}>${total.toLocaleString()}</strong>.
                    </p>
                    {/* QR placeholder */}
                    <div style={{
                      width: 180, height: 180, margin: '0 auto 20px',
                      border: '3px solid #07C160', borderRadius: 16,
                      background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', gap: 8,
                    }}>
                      <div style={{ fontSize: 48 }}>微</div>
                      <span style={{ fontFamily: "'Outfit'", fontSize: 11, color: 'var(--stone)' }}>QR code loads at checkout</span>
                    </div>
                    <p style={{ fontFamily: "'Outfit'", fontSize: 12, color: 'var(--stone)' }}>点击下方按钮生成支付二维码</p>
                  </div>
                )}

                {/* ── Submit button ──────────────────────────────────── */}
                <div style={{ marginTop: 28, borderTop: '1px solid #F3F4F6', paddingTop: 24 }}>
                  <button type="submit" disabled={processing} className="btn-earth"
                    style={{ width: '100%', justifyContent: 'center', padding: '18px 24px', fontSize: 16, opacity: processing ? 0.7 : 1 }}>
                    {processing ? 'Processing…' : method === 'paypal' ? `Pay with PayPal — $${total.toLocaleString()}` : method === 'wechat' ? `Generate QR — $${total.toLocaleString()}` : method === 'mpesa' ? `Send STK Push — KES ${(total * 130).toLocaleString()}` : `Pay $${total.toLocaleString()}`}
                  </button>
                  <p style={{ fontFamily: "'Outfit'", fontSize: 11, color: 'var(--stone)', textAlign: 'center', marginTop: 12 }}>
                    {t('pay_secure_note')}
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* ── Right — order summary ────────────────────────────────── */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{ background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
              {/* Package image */}
              <div style={{ height: 180, overflow: 'hidden' }}>
                <img
                  src={pkg.images?.[0] || FALLBACK_IMG}
                  alt={pkg.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = FALLBACK_IMG; e.target.onerror = null; }}
                />
              </div>

              <div style={{ padding: 24 }}>
                <span style={{
                  background: 'var(--gold)', color: 'var(--night)',
                  fontFamily: "'Outfit'", fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '3px 10px', borderRadius: 100, display: 'inline-block', marginBottom: 10,
                }}>{pkg.tour_type}</span>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--charcoal)', marginBottom: 16, lineHeight: 1.3 }}>{pkg.name}</h3>

                {/* Facts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[
                    { icon: Clock, label: `${pkg.duration_days} days` },
                    { icon: Users, label: `${travelers} ${t('pay_travelers')}` },
                    { icon: MapPin, label: pkg.country },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon size={14} color="var(--stone)" />
                      <span style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)' }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Price breakdown */}
                <div style={{ background: 'var(--ivory)', borderRadius: 14, padding: 16, marginBottom: 8 }}>
                  {pkg.discount_percent > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Outfit'", fontSize: 12, color: 'var(--stone)', textDecoration: 'line-through' }}>
                        ${pkg.price_per_person} × {travelers}
                      </span>
                      <span style={{ fontFamily: "'Outfit'", fontSize: 11, background: '#FEF3C7', color: '#92400E', borderRadius: 100, padding: '1px 8px', fontWeight: 600 }}>
                        -{pkg.discount_percent}%
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)' }}>${discountedPrice} × {travelers} {t('pay_travelers')}</span>
                    <span style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)' }}>${discountedPrice * travelers}</span>
                  </div>
                  <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Outfit'", fontWeight: 700, fontSize: 14, color: 'var(--charcoal)' }}>{t('pay_total')}</span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 22, color: 'var(--charcoal)' }}>${total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Includes highlights */}
                {pkg.includes?.slice(0, 4).map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 8 }}>
                    <Check size={12} color="#065F46" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontFamily: "'Outfit'", fontSize: 12, color: 'var(--stone)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .pay-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .method-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
