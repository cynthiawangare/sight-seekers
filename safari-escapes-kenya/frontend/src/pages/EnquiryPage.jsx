import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Users, MapPin } from 'lucide-react';
import { getPackageBySlug, getPackageById } from '../services/packageService';
import { createEnquiry } from '../services/enquiryService';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const todayStr = new Date().toISOString().split('T')[0];

const inputStyle = {
  width: '100%',
  border: '1.5px solid #E5E7EB',
  borderRadius: 12,
  padding: '14px 16px',
  fontSize: 14,
  fontFamily: "'Outfit', sans-serif",
  color: 'var(--charcoal)',
  background: 'white',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  appearance: 'none',
};

const labelStyle = {
  display: 'block',
  fontFamily: "'Outfit', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--charcoal)',
  marginBottom: 8,
  letterSpacing: '0.02em',
};

function focusInput(e) {
  e.currentTarget.style.borderColor = 'var(--brown-primary, #6E4B2A)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(110,75,42,0.1)';
}
function blurInput(e) {
  e.currentTarget.style.borderColor = '#E5E7EB';
  e.currentTarget.style.boxShadow = 'none';
}

export default function EnquiryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    wechat: '',
    travel_date: '',
    travelers: 2,
    message: '',
  });

  useEffect(() => {
    if (!slug) return;
    getPackageBySlug(slug)
      .then(data => data ? setPkg(data) : getPackageById(slug).then(setPkg))
      .catch(() => {});
  }, [slug]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createEnquiry({
        ...form,
        travelers: Number(form.travelers),
        package_id: pkg?.id || '',
        package_name: pkg?.name || '',
        package_slug: slug || '',
      });
      setSubmitted(true);
    } catch (err) {
      toast.error('Failed to send enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory, #faf8f4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'white', borderRadius: 24, padding: 56, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 72, height: 72, background: '#D1FAE5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check size={32} color="#065F46" strokeWidth={3} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'var(--charcoal, #1c1917)', marginBottom: 12 }}>
            {t('enq_success_title')}
          </h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: 'var(--stone, #78716c)', lineHeight: 1.6, marginBottom: 8 }}>
            {t('enq_success_body')}
          </p>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--stone, #78716c)', marginBottom: 32 }}>
            {t('enq_success_check')} <strong>{form.email}</strong> {t('enq_success_confirm')}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/packages')}
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, padding: '12px 24px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'white', cursor: 'pointer', color: 'var(--charcoal, #1c1917)' }}
            >
              {t('enq_browse')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-earth"
              style={{ fontSize: 14, padding: '12px 24px' }}
            >
              {t('enq_home')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory, #faf8f4)', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--stone, #78716c)', fontSize: 14, cursor: 'pointer', border: 'none', background: 'none', padding: 0, marginBottom: 32, transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--charcoal, #1c1917)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--stone, #78716c)')}
        >
          <ArrowLeft size={16} />
          {t('enq_back')}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40, alignItems: 'start' }} className="enquiry-grid">

          {/* ── LEFT — Form ── */}
          <div style={{ background: 'white', borderRadius: 24, border: '1px solid #F0EDE6', padding: 40, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'var(--charcoal, #1c1917)', margin: 0 }}>
              {t('enq_title')}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--stone, #78716c)', marginTop: 6, marginBottom: 0 }}>
              {t('enq_sub')}
            </p>
            <div style={{ height: 1, background: '#F0EDE6', margin: '24px 0' }} />

            <form onSubmit={handleSubmit}>
              {/* Full name */}
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>{t('enq_name')}</label>
                <input
                  name="name" type="text" required
                  value={form.name} onChange={handleChange}
                  placeholder={t('enq_name_ph')}
                  style={inputStyle} onFocus={focusInput} onBlur={blurInput}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>{t('enq_email')}</label>
                <input
                  name="email" type="email" required
                  value={form.email} onChange={handleChange}
                  placeholder={t('enq_email_ph')}
                  style={inputStyle} onFocus={focusInput} onBlur={blurInput}
                />
              </div>

              {/* Phone + WeChat (2-col) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }} className="contact-grid">
                <div>
                  <label style={labelStyle}>
                    {t('enq_phone')} <span style={{ fontWeight: 400, color: 'var(--stone, #78716c)' }}>{t('enq_optional')}</span>
                  </label>
                  <input
                    name="phone" type="tel"
                    value={form.phone} onChange={handleChange}
                    placeholder={t('enq_phone_ph')}
                    style={inputStyle} onFocus={focusInput} onBlur={blurInput}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    {t('enq_wechat')} <span style={{ fontWeight: 400, color: 'var(--stone, #78716c)' }}>{t('enq_optional')}</span>
                  </label>
                  <input
                    name="wechat" type="text"
                    value={form.wechat} onChange={handleChange}
                    placeholder={t('enq_wechat_ph')}
                    style={inputStyle} onFocus={focusInput} onBlur={blurInput}
                  />
                </div>
              </div>

              {/* Travel date + travelers (2-col) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }} className="date-travelers-grid">
                <div>
                  <label style={labelStyle}>{t('enq_date')}</label>
                  <input
                    name="travel_date" type="date"
                    min={todayStr}
                    value={form.travel_date} onChange={handleChange}
                    style={inputStyle} onFocus={focusInput} onBlur={blurInput}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t('enq_travelers')}</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, travelers: Math.max(1, form.travelers - 1) })}
                      style={{ width: 48, height: 52, background: '#F9F9F9', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--charcoal, #1c1917)', flexShrink: 0 }}
                    >−</button>
                    <div style={{ flex: 1, textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 600, borderLeft: '1.5px solid #E5E7EB', borderRight: '1.5px solid #E5E7EB' }}>
                      {form.travelers}
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, travelers: Math.min(20, form.travelers + 1) })}
                      style={{ width: 48, height: 52, background: '#F9F9F9', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--charcoal, #1c1917)', flexShrink: 0 }}
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div style={{ marginBottom: 32 }}>
                <label style={labelStyle}>
                  {t('enq_message')} <span style={{ fontWeight: 400, color: 'var(--stone, #78716c)' }}>{t('enq_optional')}</span>
                </label>
                <textarea
                  name="message"
                  value={form.message} onChange={handleChange}
                  rows={4}
                  placeholder={t('enq_message_ph')}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={focusInput} onBlur={blurInput}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-earth"
                style={{ width: '100%', justifyContent: 'center', height: 52, fontSize: 15, fontWeight: 600, opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? t('enq_submitting') : t('enq_submit')}
              </button>

              <p style={{ fontSize: 12, color: 'var(--stone, #78716c)', textAlign: 'center', marginTop: 12 }}>
                {t('enq_no_payment')}
              </p>
            </form>
          </div>

          {/* ── RIGHT — Package Summary ── */}
          <div style={{ position: 'sticky', top: 100 }}>
            {pkg ? (
              <div style={{ background: 'white', borderRadius: 24, border: '1px solid #F0EDE6', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                {pkg.images?.[0] && (
                  <img
                    src={pkg.images[0]}
                    alt={pkg.name}
                    style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop'; e.target.onerror = null; }}
                  />
                )}
                <div style={{ padding: 24 }}>
                  <span style={{ background: 'var(--blue-primary, #1A5276)', color: 'white', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, display: 'inline-block', marginBottom: 10 }}>
                    {pkg.tour_type}
                  </span>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: 'var(--charcoal, #1c1917)', marginBottom: 12 }}>
                    {pkg.name}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--stone, #78716c)' }}>
                      <MapPin size={14} color="var(--blue-primary, #1A5276)" />
                      {pkg.country}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--stone, #78716c)' }}>
                      <Clock size={14} color="var(--blue-primary, #1A5276)" />
                      {pkg.duration_days} Days · {pkg.duration_days - 1} Nights
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--stone, #78716c)' }}>
                      <Users size={14} color="var(--blue-primary, #1A5276)" />
                      Max {pkg.max_travelers} travelers
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #F0EDE6', paddingTop: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--stone, #78716c)', marginBottom: 4 }}>{t('enq_starting')}</p>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: 'var(--brown-primary, #6E4B2A)' }}>
                      ${pkg.price_per_person}
                      <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--stone, #78716c)' }}> /person</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 24, border: '1px solid #F0EDE6', padding: 32, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🦁</div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: 'var(--charcoal, #1c1917)', marginBottom: 8 }}>
                  {t('enq_general_title')}
                </p>
                <p style={{ fontSize: 13, color: 'var(--stone, #78716c)', lineHeight: 1.6 }}>
                  {t('enq_general_body')}
                </p>
              </div>
            )}

            {/* Trust badge */}
            <div style={{ marginTop: 16, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 16, padding: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#15803D', marginBottom: 4 }}>{t('enq_trust_title')}</p>
              <p style={{ fontSize: 12, color: '#16A34A', lineHeight: 1.5 }}>
                {t('enq_trust_body')}
              </p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .enquiry-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .date-travelers-grid { grid-template-columns: 1fr !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
