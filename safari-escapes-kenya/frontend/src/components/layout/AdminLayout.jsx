import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Users, Package, CalendarDays,
  CreditCard, Star, LogOut, Bell, Search, Menu, X, MessageSquare, XCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const NAV_SECTIONS = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'MANAGE',
    items: [
      { to: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
      { to: '/admin/cancellations', label: 'Cancellations', icon: XCircle },
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/packages', label: 'Packages', icon: Package },
      { to: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
      { to: '/admin/payments', label: 'Payments', icon: CreditCard },
      { to: '/admin/reviews', label: 'Reviews', icon: Star },
    ],
  },
];

const PAGE_TITLES = {
  '/admin': { title: 'Dashboard', breadcrumb: 'Home / Dashboard' },
  '/admin/analytics': { title: 'Analytics', breadcrumb: 'Home / Analytics' },
  '/admin/users': { title: 'Users', breadcrumb: 'Home / Manage / Users' },
  '/admin/packages': { title: 'Packages', breadcrumb: 'Home / Manage / Packages' },
  '/admin/packages/new': { title: 'New Package', breadcrumb: 'Home / Packages / New' },
  '/admin/enquiries': { title: 'Enquiries', breadcrumb: 'Home / Manage / Enquiries' },
  '/admin/cancellations': { title: 'Cancellations', breadcrumb: 'Home / Manage / Cancellations' },
  '/admin/bookings': { title: 'Bookings', breadcrumb: 'Home / Manage / Bookings' },
  '/admin/payments': { title: 'Payments', breadcrumb: 'Home / Manage / Payments' },
  '/admin/reviews': { title: 'Reviews', breadcrumb: 'Home / Manage / Reviews' },
};

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A';
}

function Sidebar({ onClose }) {
  const { logout, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  const displayName = userProfile
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || userProfile.email
    : 'Admin';

  return (
    <aside style={{
      width: 260,
      background: 'var(--admin-sidebar)',
      borderRight: '1px solid var(--admin-border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--admin-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div>
            <img src="https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327155559_16_6.png?alt=media&token=fdd3d494-f42e-49aa-8c11-cd7d4929780e" alt="Sight Seekers" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          </div>
          <div style={{
            color: 'var(--admin-muted)',
            fontSize: 11,
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginTop: 2,
          }}>
            Admin Panel
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ color: 'var(--admin-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <div style={{
              color: 'var(--admin-muted)',
              fontSize: 10,
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '16px 20px 8px',
            }}>
              {section.label}
            </div>
            {section.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 20px',
                  margin: '2px 12px',
                  borderRadius: 10,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                  color: isActive ? 'var(--admin-accent)' : 'var(--admin-muted)',
                  background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--admin-accent)' : '3px solid transparent',
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} color={isActive ? 'var(--admin-accent)' : 'var(--admin-muted)'} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div style={{
        borderTop: '1px solid var(--admin-border)',
        padding: '16px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: '50%',
            background: 'var(--admin-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'white',
            flexShrink: 0,
          }}>
            {getInitials(displayName)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'var(--admin-text)', fontSize: 13, fontWeight: 600, fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </div>
            <div style={{ color: 'var(--admin-muted)', fontSize: 11, fontFamily: 'Outfit, sans-serif' }}>
              Administrator
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', cursor: 'pointer', border: 'none',
            background: 'rgba(239,68,68,0.1)', color: '#EF4444',
            borderRadius: 10, padding: '10px 16px',
            fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 500,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const matchedKey = Object.keys(PAGE_TITLES).find(k => {
    if (k.includes(':')) return false;
    if (k === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(k);
  });
  const pageInfo = PAGE_TITLES[matchedKey] || { title: 'Admin', breadcrumb: 'Home / Admin' };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--admin-bg)',
      color: 'var(--admin-text)',
      fontFamily: 'Outfit, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Desktop sidebar */}
      <div style={{ display: 'flex' }} className="admin-sidebar-desktop">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
          }}
          onClick={() => setSidebarOpen(false)}
        >
          <div onClick={e => e.stopPropagation()}>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 64,
          padding: '0 32px',
          borderBottom: '1px solid var(--admin-border)',
          background: 'var(--admin-sidebar)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile hamburger */}
            <button
              className="admin-hamburger"
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)', display: 'none' }}
            >
              <Menu size={20} />
            </button>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'white', lineHeight: 1 }}>{pageInfo.title}</div>
              <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 2 }}>{pageInfo.breadcrumb}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, color: 'var(--admin-muted)' }} />
              <input
                placeholder="Search..."
                style={{
                  background: 'var(--admin-card)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 8,
                  padding: '8px 16px 8px 34px',
                  color: 'white',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 13,
                  width: 220,
                  outline: 'none',
                }}
              />
            </div>

            {/* Bell */}
            <div style={{ position: 'relative' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)', display: 'flex' }}>
                <Bell size={18} />
              </button>
              <span style={{
                position: 'absolute', top: -2, right: -2,
                width: 8, height: 8,
                background: 'var(--admin-red)',
                borderRadius: '50%',
              }} />
            </div>

            {/* Date */}
            <span style={{ fontSize: 12, color: 'var(--admin-muted)', whiteSpace: 'nowrap' }}>{today}</span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--admin-bg)' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-hamburger { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
