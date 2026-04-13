import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUserBookings } from '../services/bookingService';
import { createReview } from '../services/reviewService';
import { useAuth } from '../hooks/useAuth';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase/config';
import {
  Star, Calendar, Users, Camera, Plane, User, MapPin,
  CheckCircle, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Helpers ────────────────────────────────────────── */
const STATUS_STYLE = {
  pending:   { bg: '#FEF3C7', color: '#92400E' },
  confirmed: { bg: '#D1FAE5', color: '#065F46' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B' },
  completed: { bg: '#F3F4F6', color: '#374151' },
};

const NATIONALITIES = [
  'Kenyan', 'Chinese', 'British', 'American', 'Japanese', 'German',
  'French', 'Australian', 'Canadian', 'Indian', 'South African', 'Other',
];

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=200&h=200&fit=crop',
];

const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const colors = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, color: colors[score] || '#EF4444', label: labels[score] || '' };
};

/* ─── Sub-components ─────────────────────────────────── */
function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
          <Star size={22}
            style={{ fill: s <= value ? '#D97706' : '#E5E7EB', color: s <= value ? '#D97706' : '#E5E7EB' }} />
        </button>
      ))}
    </div>
  );
}

const fieldStyle = {
  width: '100%', padding: '14px 16px',
  border: '1.5px solid #E5E7EB', borderRadius: 12,
  fontFamily: "'Outfit', sans-serif", fontSize: 14,
  color: 'var(--charcoal)', background: 'white',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};
const focusIn  = (e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.1)'; };
const focusOut = (e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; };

const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: 'var(--stone)', marginBottom: 20,
  }}>{children}</p>
);

const FieldLabel = ({ children }) => (
  <label style={{
    fontFamily: "'Outfit', sans-serif", fontSize: 12,
    fontWeight: 600, color: 'var(--charcoal)',
    display: 'block', marginBottom: 8,
  }}>{children}</label>
);

/* ─── Main component ─────────────────────────────────── */
export default function UserDashboard() {
  const { user, userProfile } = useAuth();
  const location = useLocation();

  // Map old 'Profile' key from navbar link → new 'Profile Settings'
  const initTab = location.state?.tab === 'Profile'
    ? 'Profile Settings'
    : (location.state?.tab || 'My Trips');

  const [activeTab, setActiveTab] = useState(initTab);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [reviewForms, setReviewForms] = useState({});
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved
  const [profileForm, setProfileForm] = useState({
    first_name: userProfile?.first_name || '',
    last_name:  userProfile?.last_name  || '',
    phone:      userProfile?.phone      || '',
    nationality: userProfile?.nationality || '',
    newPassword: '',
    confirmPassword: '',
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    getUserBookings(user.uid)
      .then(setBookings)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      setProfileForm((prev) => ({
        ...prev,
        first_name:  userProfile.first_name  || '',
        last_name:   userProfile.last_name   || '',
        phone:       userProfile.phone       || '',
        nationality: userProfile.nationality || '',
      }));
    }
  }, [userProfile]);

  const displayName = userProfile
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
    : user?.displayName || user?.email?.split('@')[0] || 'User';

  const initials = displayName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const avatarSrc = userProfile?.avatar_url || user?.photoURL;

  /* handlers */
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.uid), { avatar_url: url });
      toast.success('Photo updated!');
    } catch {
      toast.error('Failed to upload photo');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaveState('saving');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        first_name:  profileForm.first_name,
        last_name:   profileForm.last_name,
        phone:       profileForm.phone,
        nationality: profileForm.nationality,
      });
      if (profileForm.newPassword) {
        await updatePassword(auth.currentUser, profileForm.newPassword);
      }
      toast.success('Profile updated!');
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
      setProfileForm((p) => ({ ...p, newPassword: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.message || 'Update failed');
      setSaveState('idle');
    }
  };

  const handleReviewSubmit = async (booking, data) => {
    try {
      await createReview({
        user_id:      user.uid,
        user_name:    displayName || user.email,
        package_id:   booking.package_id,
        package_name: booking.package_name,
        rating:       data.rating,
        title:        data.title,
        body:         data.body,
        travel_date:  booking.travel_date,
      });
      toast.success('Review submitted!');
      setReviewForms((prev) => ({ ...prev, [booking.id]: null }));
    } catch {
      toast.error('Failed to submit review');
    }
  };

  const pwStrength = getPasswordStrength(profileForm.newPassword);

  /* ─── Sidebar nav items ─── */
  const NAV_ITEMS = [
    { key: 'My Trips',          icon: Plane, label: 'My Trips' },
    { key: 'My Reviews',        icon: Star,  label: 'My Reviews' },
    { key: 'Profile Settings',  icon: User,  label: 'Profile Settings' },
  ];

  /* ─── Panel card wrapper ─── */
  const Panel = ({ children }) => (
    <div style={{
      background: 'white', borderRadius: 24, padding: '40px 48px',
      border: '1px solid #F0EDE6', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}
      className="dashboard-panel"
    >{children}</div>
  );

  const PanelHeader = ({ title, subtitle }) => (
    <>
      <h2 style={{
        fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700,
        color: 'var(--charcoal)', margin: 0,
      }}>{title}</h2>
      {subtitle && (
        <p style={{ fontFamily: "'Outfit'", fontSize: 14, color: 'var(--stone)', marginTop: 4 }}>
          {subtitle}
        </p>
      )}
      <div style={{ borderTop: '1px solid #F0EDE6', marginTop: 24, marginBottom: 32 }} />
    </>
  );

  /* ════════════════════════════════════════════════════ */
  return (
    <div style={{ background: 'var(--ivory)', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '48px 48px 0',
        display: 'flex', gap: 28, alignItems: 'flex-start',
      }}
        className="dashboard-layout"
      >

        {/* ── LEFT SIDEBAR ────────────────────────── */}
        <aside style={{
          width: 280, flexShrink: 0,
          background: 'white', borderRadius: 24,
          padding: '32px 24px',
          border: '1px solid #F0EDE6',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          position: 'sticky', top: 100,
        }}
          className="dashboard-sidebar"
        >
          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {avatarSrc ? (
                <img src={avatarSrc} alt={displayName}
                  style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover',
                    border: '3px solid var(--gold)' }} />
              ) : (
                <div style={{
                  width: 88, height: 88, borderRadius: '50%',
                  background: 'var(--earth)', border: '3px solid var(--gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Playfair Display', serif", fontSize: 32, color: 'white', fontWeight: 700,
                }}>{initials}</div>
              )}

              {/* Camera overlay */}
              <label style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--earth)', border: '2px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 0.2s',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dusk)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--earth)')}
              >
                <Camera size={13} color="white" />
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  ref={fileInputRef} onChange={handleAvatarUpload} />
              </label>
            </div>

            <h3 style={{
              fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700,
              color: 'var(--charcoal)', marginTop: 16, marginBottom: 4,
            }}>{displayName}</h3>
            <p style={{
              fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)',
              margin: 0, wordBreak: 'break-all',
            }}>{user?.email}</p>

            <div style={{
              display: 'inline-block', marginTop: 12,
              background: '#FEF3C7', borderRadius: 100,
              padding: '4px 14px',
              fontFamily: "'Outfit'", fontSize: 11, fontWeight: 600, color: 'var(--earth)',
            }}>
              🌍 Safari Member
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #F0EDE6', margin: '24px 0' }} />

          {/* Nav items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_ITEMS.map(({ key, icon: Icon, label }) => {
              const isActive = activeTab === key;
              return (
                <button key={key} onClick={() => setActiveTab(key)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 12,
                  background: isActive ? 'var(--mist)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--earth)' : '3px solid transparent',
                  color: isActive ? 'var(--charcoal)' : 'var(--stone)',
                  fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', border: 'none',
                  width: '100%', textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#FAF8F3'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon size={18} style={{ color: isActive ? 'var(--earth)' : 'var(--stone)', flexShrink: 0 }} />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Divider + quick link */}
          <div style={{ borderTop: '1px solid #F0EDE6', marginTop: 24, paddingTop: 20 }}>
            <Link to="/packages" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: "'Outfit'", fontSize: 13, color: 'var(--earth)',
              textDecoration: 'none', fontWeight: 500,
            }}>
              <MapPin size={15} /> Browse Packages
            </Link>
          </div>
        </aside>

        {/* ── RIGHT CONTENT ────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── MY TRIPS ── */}
          {activeTab === 'My Trips' && (
            <Panel>
              <PanelHeader title="My Trips" subtitle="Your safari booking history" />

              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      border: '1px solid #F0EDE6', borderRadius: 20, padding: 24,
                      display: 'flex', gap: 20, alignItems: 'center',
                    }}>
                      <div style={{ width: 80, height: 80, borderRadius: 12, background: '#E5E7EB', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 18, background: '#E5E7EB', borderRadius: 6, width: '55%', marginBottom: 10 }} />
                        <div style={{ height: 13, background: '#E5E7EB', borderRadius: 6, width: '40%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>🌍</div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif", fontSize: 24,
                    color: 'var(--charcoal)', marginBottom: 8,
                  }}>No trips yet</h3>
                  <p style={{
                    fontFamily: "'Outfit'", fontSize: 14, color: 'var(--stone)',
                    marginBottom: 28, lineHeight: 1.6,
                  }}>Your upcoming safari adventures will appear here</p>
                  <Link to="/packages" className="btn-earth">Browse Packages →</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {bookings.map((booking, idx) => {
                    const statusStyle = STATUS_STYLE[booking.status] || STATUS_STYLE.pending;
                    const imgSrc = booking.image_url || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
                    const isExpanded = expandedBooking === booking.id;
                    return (
                      <div key={booking.id} style={{
                        border: '1px solid #F0EDE6', borderRadius: 20, overflow: 'hidden',
                        transition: 'box-shadow 0.2s',
                      }}>
                        <div style={{ display: 'flex', gap: 20, alignItems: 'center', padding: 24 }}>
                          {/* Thumbnail */}
                          <img src={imgSrc} alt={booking.package_name}
                            style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{
                              fontFamily: "'Playfair Display', serif", fontSize: 18,
                              color: 'var(--charcoal)', margin: '0 0 6px',
                            }}>{booking.package_name}</h4>
                            <p style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)', margin: '0 0 4px' }}>
                              {booking.duration_days ? `${booking.duration_days} Days · ` : ''}
                              {booking.num_travelers ? `${booking.num_travelers} Traveler${booking.num_travelers > 1 ? 's' : ''} · ` : ''}
                              {booking.travel_date || ''}
                            </p>
                            {booking.booking_reference && (
                              <p style={{ fontFamily: "'Outfit'", fontSize: 12, color: 'var(--stone)', margin: 0 }}>
                                REF: <span style={{ fontWeight: 600 }}>{booking.booking_reference}</span>
                              </p>
                            )}
                          </div>

                          {/* Status + price + link */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                            <span style={{
                              background: statusStyle.bg, color: statusStyle.color,
                              borderRadius: 100, padding: '6px 16px',
                              fontFamily: "'Outfit'", fontSize: 12, fontWeight: 600,
                              textTransform: 'capitalize',
                            }}>{booking.status || 'pending'}</span>

                            {booking.total_price != null && (
                              <span style={{
                                fontFamily: "'Outfit'", fontSize: 16, fontWeight: 700, color: 'var(--charcoal)',
                              }}>
                                ${(booking.total_price / 100).toFixed(2)}
                              </span>
                            )}

                            <button onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontFamily: "'Outfit'", fontSize: 13, color: 'var(--earth)',
                                fontWeight: 500, padding: 0,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                            >
                              {isExpanded ? 'Hide details ↑' : 'View Itinerary →'}
                            </button>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div style={{
                            borderTop: '1px solid #F0EDE6',
                            background: 'var(--mist)', padding: '20px 24px',
                          }}>
                            {booking.accommodation_type && (
                              <p style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)', marginBottom: 8 }}>
                                <span style={{ fontWeight: 600 }}>Accommodation:</span> {booking.accommodation_type}
                              </p>
                            )}
                            {booking.special_requests && (
                              <p style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)', marginBottom: 12 }}>
                                <span style={{ fontWeight: 600 }}>Special requests:</span> {booking.special_requests}
                              </p>
                            )}

                            {/* Review prompt for completed trips */}
                            {booking.status === 'completed' && (
                              <div style={{ marginTop: 8 }}>
                                {reviewForms[booking.id] === undefined ? (
                                  <button
                                    onClick={() => setReviewForms({ ...reviewForms, [booking.id]: { rating: 5, title: '', body: '' } })}
                                    style={{
                                      background: 'none', border: '1.5px dashed var(--gold)',
                                      borderRadius: 12, padding: '10px 20px',
                                      fontFamily: "'Outfit'", fontSize: 13, color: 'var(--earth)',
                                      fontWeight: 500, cursor: 'pointer',
                                    }}>
                                    ✍️ Leave a Review
                                  </button>
                                ) : reviewForms[booking.id] !== null ? (
                                  <form onSubmit={(e) => { e.preventDefault(); handleReviewSubmit(booking, reviewForms[booking.id]); }}
                                    style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
                                    <StarPicker
                                      value={reviewForms[booking.id]?.rating || 5}
                                      onChange={(r) => setReviewForms({ ...reviewForms, [booking.id]: { ...reviewForms[booking.id], rating: r } })}
                                    />
                                    <input type="text" placeholder="Review title" required
                                      value={reviewForms[booking.id]?.title || ''}
                                      onChange={(e) => setReviewForms({ ...reviewForms, [booking.id]: { ...reviewForms[booking.id], title: e.target.value } })}
                                      style={{ ...fieldStyle, padding: '11px 14px' }}
                                      onFocus={focusIn} onBlur={focusOut} />
                                    <textarea placeholder="Describe your experience..." required rows={3}
                                      value={reviewForms[booking.id]?.body || ''}
                                      onChange={(e) => setReviewForms({ ...reviewForms, [booking.id]: { ...reviewForms[booking.id], body: e.target.value } })}
                                      style={{ ...fieldStyle, padding: '11px 14px', resize: 'none' }}
                                      onFocus={focusIn} onBlur={focusOut} />
                                    <div style={{ display: 'flex', gap: 10 }}>
                                      <button type="submit" className="btn-earth" style={{ padding: '10px 24px', fontSize: 13 }}>
                                        Submit Review
                                      </button>
                                      <button type="button" className="btn-outline"
                                        style={{ padding: '10px 24px', fontSize: 13 }}
                                        onClick={() => setReviewForms({ ...reviewForms, [booking.id]: null })}>
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                ) : null}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          )}

          {/* ── MY REVIEWS ── */}
          {activeTab === 'My Reviews' && (
            <Panel>
              <PanelHeader title="My Reviews" subtitle="Feedback you've shared with the community" />

              <div style={{
                textAlign: 'center', padding: '40px 0',
                border: '1.5px dashed #E5E7EB', borderRadius: 16,
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                <p style={{ fontFamily: "'Outfit'", fontSize: 14, color: 'var(--stone)', lineHeight: 1.6 }}>
                  Your submitted reviews appear here.{' '}
                  For completed trips without a review, go to{' '}
                  <button onClick={() => setActiveTab('My Trips')} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--earth)', fontWeight: 600,
                    fontFamily: "'Outfit'", fontSize: 14, padding: 0,
                    textDecoration: 'underline',
                  }}>My Trips</button>{' '}
                  to leave one.
                </p>
              </div>
            </Panel>
          )}

          {/* ── PROFILE SETTINGS ── */}
          {activeTab === 'Profile Settings' && (
            <Panel>
              <PanelHeader title="Profile Settings" subtitle="Update your personal information" />

              <form onSubmit={handleProfileSave}>
                {/* Section 1 — Personal Information */}
                <SectionLabel>Personal Information</SectionLabel>

                {/* Name row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}
                  className="profile-name-grid">
                  <div>
                    <FieldLabel>First Name</FieldLabel>
                    <input type="text" value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      placeholder="First name" style={fieldStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                  <div>
                    <FieldLabel>Last Name</FieldLabel>
                    <input type="text" value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      placeholder="Last name" style={fieldStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                </div>

                {/* Phone */}
                <div style={{ marginBottom: 20 }}>
                  <FieldLabel>Phone Number</FieldLabel>
                  <input type="tel" value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+254 7XX XXX XXX" style={fieldStyle} onFocus={focusIn} onBlur={focusOut} />
                </div>

                {/* Nationality */}
                <div style={{ marginBottom: 0 }}>
                  <FieldLabel>Nationality</FieldLabel>
                  <div style={{ position: 'relative' }}>
                    <select value={profileForm.nationality}
                      onChange={(e) => setProfileForm({ ...profileForm, nationality: e.target.value })}
                      style={{
                        ...fieldStyle,
                        appearance: 'none', WebkitAppearance: 'none',
                        paddingRight: 40, cursor: 'pointer',
                      }}
                      onFocus={focusIn} onBlur={focusOut}>
                      <option value="">Select nationality...</option>
                      {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    {/* Chevron */}
                    <svg style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      pointerEvents: 'none', color: 'var(--stone)',
                    }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Section 2 — Security */}
                <div style={{ marginTop: 36 }}>
                  <SectionLabel>Security</SectionLabel>

                  <div style={{ marginBottom: 20 }}>
                    <FieldLabel>
                      New Password{' '}
                      <span style={{ color: 'var(--stone)', fontWeight: 400 }}>(leave blank to keep current)</span>
                    </FieldLabel>
                    <input type="password" value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                      placeholder="Enter new password..." style={fieldStyle} onFocus={focusIn} onBlur={focusOut} />

                    {/* Strength bar */}
                    {profileForm.newPassword && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} style={{
                              flex: 1, height: 4, borderRadius: 2,
                              background: i <= pwStrength.score ? pwStrength.color : '#E5E7EB',
                              transition: 'background 0.3s',
                            }} />
                          ))}
                        </div>
                        {pwStrength.label && (
                          <p style={{
                            fontFamily: "'Outfit'", fontSize: 11, marginTop: 4,
                            color: pwStrength.color, fontWeight: 500,
                          }}>
                            Strength: {pwStrength.label}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confirm password — only shown when new password has a value */}
                  {profileForm.newPassword && (
                    <div>
                      <FieldLabel>Confirm New Password</FieldLabel>
                      <input type="password" value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        placeholder="Repeat new password..." style={fieldStyle} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                  )}
                </div>

                {/* Save button */}
                <div style={{ marginTop: 36, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button type="submit" disabled={saveState === 'saving'}
                    style={{
                      background: saveState === 'saved' ? '#22C55E' : 'var(--earth)',
                      color: 'white', border: 'none', borderRadius: 100,
                      padding: '14px 40px', fontFamily: "'Outfit'", fontSize: 15, fontWeight: 500,
                      cursor: saveState === 'saving' ? 'not-allowed' : 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      opacity: saveState === 'saving' ? 0.8 : 1,
                      transition: 'background 0.3s, opacity 0.2s',
                    }}>
                    {saveState === 'saving' ? (
                      <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                    ) : saveState === 'saved' ? (
                      <><CheckCircle size={16} /> Saved!</>
                    ) : (
                      'Save Changes'
                    )}
                  </button>

                  <button type="button"
                    onClick={() => {
                      setProfileForm({
                        first_name:  userProfile?.first_name  || '',
                        last_name:   userProfile?.last_name   || '',
                        phone:       userProfile?.phone       || '',
                        nationality: userProfile?.nationality || '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    style={{
                      background: 'transparent', color: 'var(--charcoal)',
                      border: '1.5px solid var(--charcoal)', borderRadius: 100,
                      padding: '13px 32px', fontFamily: "'Outfit'", fontSize: 14, fontWeight: 500,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--charcoal)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--charcoal)'; }}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </Panel>
          )}
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .dashboard-layout {
            flex-direction: column !important;
            padding: 24px 20px 0 !important;
            gap: 16px !important;
          }
          .dashboard-sidebar {
            width: 100% !important;
            position: static !important;
            padding: 20px 16px !important;
            border-radius: 20px !important;
          }
          .dashboard-sidebar aside > div:first-child { display: none !important; }
          .dashboard-sidebar nav {
            flex-direction: row !important;
            gap: 8px !important;
          }
          .dashboard-sidebar nav button {
            flex: 1 !important;
            justify-content: center !important;
            border-left: none !important;
            border-radius: 12px !important;
            padding: 10px 8px !important;
            font-size: 12px !important;
          }
          .dashboard-panel {
            padding: 24px 20px !important;
            border-radius: 20px !important;
          }
          .profile-name-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
