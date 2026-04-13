import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Check } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const LOGO = 'https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327155559_16_6.png?alt=media&token=fdd3d494-f42e-49aa-8c11-cd7d4929780e';

const INPUT = {
  width: '100%', padding: '14px 16px', borderRadius: 12,
  border: '1.5px solid #E5E7EB', fontFamily: "'Outfit', sans-serif",
  fontSize: 14, outline: 'none', color: 'var(--charcoal)',
  background: 'white', boxSizing: 'border-box',
};
const LABEL = {
  fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
  color: 'var(--stone)', display: 'block', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.06em',
};

export default function CancellationPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    booking_ref: '',
    package_name: '',
    travel_date: '',
    reason: '',
    additional_info: '',
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/v1/cancellations/request', form);
      setSubmitted(true);
    } catch {
      toast.error('Failed to submit. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'white', borderRadius: 28, padding: 56, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 16px 64px rgba(0,0,0,0.10)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check size={36} color="#065F46" />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: 'var(--charcoal)', marginBottom: 12 }}>{t('cancel_success_title')}</h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: 'var(--stone)', lineHeight: 1.7, marginBottom: 8 }}>
            {t('cancel_success_body')}
          </p>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--stone)', lineHeight: 1.7, marginBottom: 40 }}>
            {t('cancel_success_detail')}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-earth" onClick={() => navigate('/')}>{t('cancel_back_home')}</button>
            <button className="btn-outline" onClick={() => navigate('/packages')}>{t('cancel_view_packages')}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--ivory)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--night)', padding: '40px 0 48px' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="#F87171" />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F87171' }}>
              {t('cancel_badge')}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'white', margin: '0 0 12px' }}>
            {t('cancel_title')}
          </h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0, maxWidth: 520 }}>
            {t('cancel_sub')}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container" style={{ maxWidth: 720, padding: '48px 24px' }}>
        {/* Policy note */}
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 14, padding: 20, marginBottom: 32, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <AlertTriangle size={18} color="#92400E" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: '#92400E', margin: '0 0 4px' }}>{t('cancel_policy_title')}</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#78350F', lineHeight: 1.6, margin: 0 }}>
              {t('cancel_policy')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: 'white', borderRadius: 20, padding: 36, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 24 }}>

            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--charcoal)', margin: 0 }}>{t('cancel_your_details')}</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="cancel-grid">
              <div>
                <label style={LABEL}>{t('cancel_full_name')} *</label>
                <input style={INPUT} placeholder="James Kimani" value={form.full_name} onChange={set('full_name')} required />
              </div>
              <div>
                <label style={LABEL}>{t('cancel_email')} *</label>
                <input style={INPUT} type="email" placeholder="james@email.com" value={form.email} onChange={set('email')} required />
              </div>
              <div>
                <label style={LABEL}>{t('cancel_phone')}</label>
                <input style={INPUT} placeholder="+254 7XX XXX XXX" value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <label style={LABEL}>{t('cancel_booking_ref')} *</label>
                <input style={INPUT} placeholder="SS-123456" value={form.booking_ref} onChange={set('booking_ref')} required />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 24 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--charcoal)', margin: '0 0 20px' }}>{t('cancel_booking_details')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={LABEL}>{t('cancel_package_name')} *</label>
                  <input style={INPUT} placeholder="e.g. Low Budget Safari — High Season" value={form.package_name} onChange={set('package_name')} required />
                </div>
                <div>
                  <label style={LABEL}>{t('cancel_travel_date')} *</label>
                  <input style={INPUT} type="date" value={form.travel_date} onChange={set('travel_date')} required />
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 24 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--charcoal)', margin: '0 0 20px' }}>{t('cancel_reason_title')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={LABEL}>{t('cancel_reason_label')} *</label>
                  <select style={{ ...INPUT, appearance: 'none', cursor: 'pointer' }} value={form.reason} onChange={set('reason')} required>
                    <option value="">{t('cancel_reason_placeholder')}</option>
                    <option value="Change of plans">{t('cancel_reason_plans')}</option>
                    <option value="Medical / health issue">{t('cancel_reason_medical')}</option>
                    <option value="Financial reasons">{t('cancel_reason_financial')}</option>
                    <option value="Travel restrictions">{t('cancel_reason_travel')}</option>
                    <option value="Family emergency">{t('cancel_reason_family')}</option>
                    <option value="Booked alternative">{t('cancel_reason_alternative')}</option>
                    <option value="Other">{t('cancel_reason_other')}</option>
                  </select>
                </div>
                <div>
                  <label style={LABEL}>{t('cancel_additional')}</label>
                  <textarea
                    style={{ ...INPUT, minHeight: 120, resize: 'vertical' }}
                    placeholder={t('cancel_additional_ph')}
                    value={form.additional_info}
                    onChange={set('additional_info')}
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-earth"
              style={{ width: '100%', justifyContent: 'center', padding: '18px 24px', fontSize: 16, opacity: loading ? 0.7 : 1, background: '#DC2626' }}>
              {loading ? t('cancel_submitting') : t('cancel_submit')}
            </button>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: 'var(--stone)', textAlign: 'center', margin: 0 }}>
              {t('cancel_note')}
            </p>
          </div>
        </form>
      </div>

      <style>{`
        @media (max-width: 560px) {
          .cancel-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
