import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const inputStyle = {
  width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 12,
  padding: '14px 16px', fontSize: 14, fontFamily: "'Outfit', sans-serif",
  color: 'var(--charcoal)', background: 'white', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
};

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const from = location.state?.from || '/';
  const travelers = location.state?.travelers;
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email, password }) => {
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      // Force-refresh token to get latest custom claims
      const token = await user.getIdTokenResult(true);
      if (token.claims.admin === true) {
        navigate('/admin', { replace: true });
        return;
      }
      toast.success('Welcome back!');
      const dest = from && from !== '/login' ? from : '/';
      navigate(dest, { replace: true, state: travelers ? { travelers } : undefined });
    } catch (err) {
      toast.error('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      const token = await user.getIdTokenResult(true);
      if (token.claims.admin === true) {
        navigate('/admin', { replace: true });
        return;
      }
      toast.success('Welcome!');
      const dest = from && from !== '/login' ? from : '/';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* Left panel — image */}
      <div className="login-image-panel" style={{
        width: '45%', position: 'relative', overflow: 'hidden',
        backgroundImage: "url('https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=900&h=1080&fit=crop')",
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
          <p style={{
            fontFamily: "'Playfair Display', serif", fontSize: 18, fontStyle: 'italic',
            color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, marginBottom: 20,
          }}>
            {t('login_quote')}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop"
              alt="Li Wei"
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <p style={{ fontFamily: "'Outfit'", fontSize: 13, fontWeight: 600, color: 'white', margin: 0 }}>Li Wei 🇨🇳</p>
              <p style={{ fontFamily: "'Outfit'", fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{t('login_quote_author')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, background: 'var(--ivory)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px',
      }} className="login-form-panel">
        <div style={{ maxWidth: 440, width: '100%' }}>

          <Link to="/" style={{
            fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40,
          }}>{t('login_back')}</Link>

          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 44,
            fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8, lineHeight: 1.1,
          }}>{t('login_title')}</h2>
          <p style={{ fontFamily: "'Outfit'", fontSize: 15, color: 'var(--stone)', marginBottom: 36 }}>
            {t('login_subtitle')}
          </p>

          {/* Google */}
          <button onClick={handleGoogle} disabled={isGoogleLoading} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '14px',
            background: 'white', cursor: 'pointer', fontFamily: "'Outfit'", fontSize: 14, fontWeight: 500,
            color: 'var(--charcoal)', transition: 'border-color 0.15s', marginBottom: 28,
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
            {isGoogleLoading ? t('login_google_loading') : t('login_google')}
          </button>

          {/* Divider */}
          <div style={{ position: 'relative', marginBottom: 28 }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', borderTop: '1px solid #E5E7EB' }} />
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <span style={{ padding: '0 16px', background: 'var(--ivory)', fontFamily: "'Outfit'", fontSize: 13, color: '#9CA3AF' }}>
                {t('login_or')}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: "'Outfit'", fontSize: 13, fontWeight: 500, color: 'var(--charcoal)', display: 'block', marginBottom: 8 }}>
                {t('login_email')}
              </label>
              <input type="email" {...register('email', { required: 'Email is required' })}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.1)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              {errors.email && <p style={{ color: '#ef4444', fontFamily: "'Outfit'", fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ fontFamily: "'Outfit'", fontSize: 13, fontWeight: 500, color: 'var(--charcoal)', display: 'block', marginBottom: 8 }}>
                {t('login_password')}
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  placeholder="Enter your password"
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
                }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#ef4444', fontFamily: "'Outfit'", fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            <div style={{ textAlign: 'right', marginBottom: 28 }}>
              <Link to="/forgot-password" style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)', textDecoration: 'none' }}>
                {t('login_forgot')}
              </Link>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-dark" style={{
              width: '100%', justifyContent: 'center', height: 52, fontSize: 16,
              opacity: isSubmitting ? 0.7 : 1,
            }}>
              {isSubmitting ? t('login_submitting') : t('login_submit')}
            </button>
          </form>

          <p style={{ fontFamily: "'Outfit'", marginTop: 28, textAlign: 'center', fontSize: 14, color: 'var(--stone)' }}>
            {t('login_no_account')}{' '}
            <Link to="/signup" style={{ color: 'var(--earth)', fontWeight: 600, textDecoration: 'none' }}>{t('login_signup')}</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-image-panel { display: none !important; }
          .login-form-panel { padding: 40px 24px !important; }
        }
      `}</style>
    </div>
  );
}
