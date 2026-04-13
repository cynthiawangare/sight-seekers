import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const NATIONALITIES = [
  'Kenyan', 'Chinese', 'British', 'American', 'Japanese', 'German',
  'French', 'Australian', 'Canadian', 'Indian', 'South African', 'Other',
];

const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#EF4444' };
  if (score === 2) return { score, label: 'Fair', color: '#F59E0B' };
  if (score === 3) return { score, label: 'Good', color: '#3B82F6' };
  return { score, label: 'Strong', color: '#10B981' };
};

const inputStyle = {
  width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 12,
  padding: '12px 16px', fontSize: 14, fontFamily: "'Outfit', sans-serif",
  color: 'var(--charcoal)', background: 'white', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
};

const labelStyle = {
  fontFamily: "'Outfit'", fontSize: 13, fontWeight: 500,
  color: 'var(--charcoal)', display: 'block', marginBottom: 6,
};

export default function Signup() {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const watchPassword = watch('password', '');
  const strength = getPasswordStrength(watchPassword);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) return toast.error('Passwords do not match');
    setIsSubmitting(true);
    try {
      await signup(data.email, data.password, {
        firstName: data.firstName, lastName: data.lastName,
        phone: data.phone, nationality: data.nationality,
      });
      toast.success('Account created! Welcome to Sight Seekers 🦁');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome to Sight Seekers!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const focusInput = (e) => {
    e.currentTarget.style.borderColor = 'var(--gold)';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.1)';
  };
  const blurInput = (e) => {
    e.currentTarget.style.borderColor = '#E5E7EB';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* Left panel — image */}
      <div className="signup-image-panel" style={{
        width: '45%', position: 'relative', overflow: 'hidden',
        backgroundImage: "url('https://images.unsplash.com/photo-1549366021-9f761d040a1f?w=900&h=1080&fit=crop')",
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(12,26,18,0.85) 0%, rgba(12,26,18,0.2) 60%, transparent 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '48px 40px' }}>
          <Link to="/" style={{ display: 'block', marginBottom: 32, textDecoration: 'none' }}>
            <img src="https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327155559_16_6.png?alt=media&token=fdd3d494-f42e-49aa-8c11-cd7d4929780e" alt="Sight Seekers" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
          </Link>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700,
            color: 'white', lineHeight: 1.2, marginBottom: 16,
          }}>{t('signup_hero_title')}</h2>
          <p style={{ fontFamily: "'Outfit'", fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
            {t('signup_hero_sub')}
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, background: 'var(--ivory)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 72px', overflowY: 'auto',
      }} className="signup-form-panel">
        <div style={{ maxWidth: 480, width: '100%' }}>

          <Link to="/" style={{
            fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40,
          }}>{t('signup_back')}</Link>

          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 40,
            fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8, lineHeight: 1.1,
          }}>{t('signup_title')}</h2>
          <p style={{ fontFamily: "'Outfit'", fontSize: 15, color: 'var(--stone)', marginBottom: 32 }}>
            {t('signup_subtitle')}
          </p>

          {/* Google */}
          <button onClick={handleGoogle} disabled={isGoogleLoading} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '14px',
            background: 'white', cursor: 'pointer', fontFamily: "'Outfit'", fontSize: 14, fontWeight: 500,
            color: 'var(--charcoal)', transition: 'border-color 0.15s', marginBottom: 24,
          }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#000')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isGoogleLoading ? t('signup_google_loading') : t('signup_google')}
          </button>

          {/* Divider */}
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', borderTop: '1px solid #E5E7EB' }} />
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <span style={{ padding: '0 16px', background: 'var(--ivory)', fontFamily: "'Outfit'", fontSize: 13, color: '#9CA3AF' }}>
                {t('signup_or')}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>{t('signup_first_name')}</label>
                <input type="text" {...register('firstName', { required: 'Required' })}
                  placeholder="John" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                {errors.firstName && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 3 }}>{errors.firstName.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>{t('signup_last_name')}</label>
                <input type="text" {...register('lastName', { required: 'Required' })}
                  placeholder="Doe" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                {errors.lastName && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 3 }}>{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t('signup_email')}</label>
              <input type="email" {...register('email', { required: 'Email required' })}
                placeholder="you@example.com" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
              {errors.email && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 3 }}>{errors.email.message}</p>}
            </div>

            {/* Phone + Nationality */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>{t('signup_phone')}</label>
                <input type="tel" {...register('phone')}
                  placeholder="+254..." style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
              </div>
              <div>
                <label style={labelStyle}>{t('signup_nationality')}</label>
                <select {...register('nationality')} style={{ ...inputStyle, cursor: 'pointer' }} onFocus={focusInput} onBlur={blurInput}>
                  <option value="">Select...</option>
                  {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t('signup_password')}</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password required', minLength: { value: 8, message: 'At least 8 characters' } })}
                  placeholder="Min. 8 characters"
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={focusInput} onBlur={blurInput}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
                }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {watchPassword && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, height: 6 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{
                        flex: 1, borderRadius: 100,
                        background: i <= strength.score ? strength.color : '#E5E7EB',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                  <p style={{ fontFamily: "'Outfit'", fontSize: 11, color: 'var(--stone)', marginTop: 4 }}>
                    {t('signup_strength')} <span style={{ color: strength.color, fontWeight: 600 }}>{t(`pw_${strength.label.toLowerCase()}`) || strength.label}</span>
                  </p>
                </div>
              )}
              {errors.password && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 3 }}>{errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>{t('signup_confirm_password')}</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirm ? 'text' : 'password'}
                  {...register('confirmPassword', { required: 'Please confirm password' })}
                  placeholder="Repeat your password"
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={focusInput} onBlur={blurInput}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
                }}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 3 }}>{errors.confirmPassword.message}</p>}
            </div>

            {/* Terms */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 24, cursor: 'pointer' }}>
              <input type="checkbox" {...register('terms', { required: 'You must accept the terms' })}
                style={{ marginTop: 2, accentColor: 'var(--earth)' }} />
              <span style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)', lineHeight: 1.5 }}>
                {t('signup_terms')}{' '}
                <a href="#" style={{ color: 'var(--earth)', textDecoration: 'underline' }}>{t('signup_terms_of_service')}</a>{' '}
                {t('signup_terms_and')}{' '}
                <a href="#" style={{ color: 'var(--earth)', textDecoration: 'underline' }}>{t('signup_privacy')}</a>
              </span>
            </label>
            {errors.terms && <p style={{ color: '#EF4444', fontSize: 11, marginBottom: 12 }}>{errors.terms.message}</p>}

            <button type="submit" disabled={isSubmitting} className="btn-earth" style={{
              width: '100%', justifyContent: 'center', height: 52, fontSize: 16,
              opacity: isSubmitting ? 0.7 : 1,
            }}>
              {isSubmitting ? t('signup_submitting') : t('signup_submit')}
            </button>
          </form>

          <p style={{ fontFamily: "'Outfit'", marginTop: 28, textAlign: 'center', fontSize: 14, color: 'var(--stone)' }}>
            {t('signup_have_account')}{' '}
            <Link to="/login" style={{ color: 'var(--earth)', fontWeight: 600, textDecoration: 'none' }}>{t('signup_signin')}</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .signup-image-panel { display: none !important; }
          .signup-form-panel { padding: 40px 24px !important; }
        }
      `}</style>
    </div>
  );
}
