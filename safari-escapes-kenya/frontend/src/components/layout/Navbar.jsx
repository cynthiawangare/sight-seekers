import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, BookOpen, UserCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

function LangToggle() {
  const { lang, toggle } = useLanguage();
  return (
    <button
      onClick={toggle}
      title={lang === 'en' ? 'Switch to Chinese' : '切换为英文'}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: '1.5px solid rgba(0,0,0,0.12)',
        borderRadius: 100, padding: '5px 12px',
        cursor: 'pointer', transition: 'all 0.2s',
        fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
        color: 'var(--charcoal)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--earth)';
        e.currentTarget.style.color = 'var(--earth)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)';
        e.currentTarget.style.color = 'var(--charcoal)';
      }}
    >
      {lang === 'en' ? '🇨🇳 中文' : '🇬🇧 EN'}
    </button>
  );
}

function UserMenu({ user, userProfile, logout }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayName = userProfile
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
    : user?.displayName || user?.email?.split('@')[0] || 'User';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: '1.5px solid rgba(0,0,0,0.1)',
          borderRadius: 100, padding: '6px 14px 6px 6px',
          cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Avatar circle */}
        {userProfile?.avatar_url || user?.photoURL ? (
          <img
            src={userProfile?.avatar_url || user?.photoURL}
            alt={displayName}
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--earth)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
          }}>
            {initials}
          </div>
        )}
        <span style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
          color: 'var(--charcoal)', maxWidth: 120,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {displayName.split(' ')[0]}
        </span>
        <ChevronDown
          size={14}
          color="var(--stone)"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          background: 'white', borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.06)',
          minWidth: 220, overflow: 'hidden', zIndex: 200,
          animation: 'fadeIn 0.15s ease',
        }}>
          {/* User info header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #F0EDE6',
            background: 'var(--cream)',
          }}>
            <p style={{
              fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700,
              color: 'var(--charcoal)', margin: 0,
            }}>{displayName}</p>
            <p style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 12,
              color: 'var(--stone)', margin: '2px 0 0',
            }}>{user?.email}</p>
          </div>

          {/* Menu items */}
          <div style={{ padding: '8px 0' }}>
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 20px', textDecoration: 'none',
                fontFamily: "'Outfit', sans-serif", fontSize: 14,
                color: 'var(--charcoal)', transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--mist)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <BookOpen size={16} color="var(--stone)" />
              {t('nav_mybookings')}
            </Link>

            <Link
              to="/dashboard"
              state={{ tab: 'Profile' }}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 20px', textDecoration: 'none',
                fontFamily: "'Outfit', sans-serif", fontSize: 14,
                color: 'var(--charcoal)', transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--mist)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <UserCircle size={16} color="var(--stone)" />
              {t('nav_myprofile')}
            </Link>
          </div>

          {/* Logout */}
          <div style={{ padding: '8px 0', borderTop: '1px solid #F0EDE6' }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 20px', width: '100%',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif", fontSize: 14,
                color: '#DC2626', transition: 'background 0.15s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <LogOut size={16} color="#DC2626" />
              {t('nav_logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();

  const navLinks = [
    { label: t('nav_home'), to: '/' },
    { label: t('nav_about'), to: '/about' },
    { label: t('nav_packages'), to: '/packages' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  const handleMobileLogout = async () => {
    setOpen(false);
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100, height: 72,
        background: 'rgba(250,248,243,0.92)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}>
        <div className="nav-inner" style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 48px',
          height: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327155559_16_6.png?alt=media&token=fdd3d494-f42e-49aa-8c11-cd7d4929780e" alt="Sight Seekers" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
          </Link>

          {/* Center nav — desktop */}
          <div className="nav-center" style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 14,
                color: location.pathname === link.to ? 'var(--charcoal)' : 'var(--stone)',
                textDecoration: 'none',
                fontWeight: location.pathname === link.to ? 500 : 400,
                transition: 'color 0.2s',
              }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right — desktop */}
          <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <LangToggle />
            {isAuthenticated ? (
              <>
                <UserMenu user={user} userProfile={userProfile} logout={logout} />
                <Link to="/packages" className="btn-dark" style={{ padding: '11px 24px', fontSize: 14 }}>
                  {t('nav_booknow')}
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: 14,
                  color: 'var(--stone)', textDecoration: 'none', transition: 'color 0.2s',
                }}>{t('nav_login')}</Link>
                <Link to="/packages" className="btn-dark" style={{ padding: '11px 24px', fontSize: 14 }}>
                  {t('nav_booknow')}
                </Link>
              </>
            )}
          </div>

          {/* Hamburger — mobile */}
          <button className="nav-hamburger" onClick={() => setOpen(!open)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--charcoal)', display: 'none' }}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: 'fixed', top: 72, left: 0, right: 0,
          background: 'rgba(250,248,243,0.98)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          padding: '28px 24px', zIndex: 99,
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          <div><LangToggle /></div>
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 18,
              color: 'var(--charcoal)', textDecoration: 'none', fontWeight: 500,
            }}>{link.label}</Link>
          ))}

          {isAuthenticated ? (
            <>
              {/* Mobile user info */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0', borderTop: '1px solid rgba(0,0,0,0.06)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--earth)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Outfit'", fontSize: 13, fontWeight: 600,
                }}>
                  {(userProfile?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <p style={{ fontFamily: "'Outfit'", fontSize: 14, fontWeight: 600, color: 'var(--charcoal)', margin: 0 }}>
                    {userProfile ? `${userProfile.first_name} ${userProfile.last_name}`.trim() : user?.email}
                  </p>
                  <p style={{ fontFamily: "'Outfit'", fontSize: 12, color: 'var(--stone)', margin: 0 }}>{user?.email}</p>
                </div>
              </div>
              <Link to="/dashboard" style={{ fontFamily: "'Outfit'", fontSize: 16, color: 'var(--charcoal)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={16} /> {t('nav_mybookings')}
              </Link>
              <Link to="/dashboard" state={{ tab: 'Profile' }} style={{ fontFamily: "'Outfit'", fontSize: 16, color: 'var(--charcoal)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserCircle size={16} /> {t('nav_myprofile')}
              </Link>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={handleMobileLogout} className="btn-outline" style={{ flex: 1, justifyContent: 'center', color: '#DC2626', borderColor: '#DC2626' }}>
                  <LogOut size={14} /> {t('nav_logout')}
                </button>
                <Link to="/packages" className="btn-earth" style={{ flex: 1, justifyContent: 'center' }}>{t('nav_booknow')}</Link>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Link to="/login" className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>{t('nav_login')}</Link>
              <Link to="/packages" className="btn-earth" style={{ flex: 1, justifyContent: 'center' }}>{t('nav_booknow')}</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-center, .nav-right { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-inner { padding: 0 16px !important; }
        }
      `}</style>
    </>
  );
}
