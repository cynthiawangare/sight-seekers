const STYLES = {
  // Booking statuses
  pending:   { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B' },
  confirmed: { bg: 'rgba(16,185,129,0.15)',  color: '#10B981' },
  completed: { bg: 'rgba(100,116,139,0.15)', color: '#94A3B8' },
  cancelled: { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
  // Payment statuses
  failed:    { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
  refunded:  { bg: 'rgba(59,130,246,0.15)',  color: '#3B82F6' },
  // Roles
  admin:     { bg: 'rgba(99,102,241,0.2)',   color: 'var(--admin-accent)' },
  user:      { bg: 'rgba(100,116,139,0.2)',  color: 'var(--admin-muted)' },
  // Visibility
  visible:   { bg: 'rgba(16,185,129,0.15)',  color: '#10B981' },
  hidden:    { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
  // Active
  active:    { bg: 'rgba(16,185,129,0.15)',  color: '#10B981' },
  inactive:  { bg: 'rgba(100,116,139,0.15)', color: '#94A3B8' },
};

export default function StatusBadge({ status, label }) {
  const key = (status || '').toLowerCase();
  const style = STYLES[key] || { bg: 'rgba(100,116,139,0.15)', color: '#94A3B8' };
  const text = label || status || '';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 12px',
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: 'Outfit, sans-serif',
      textTransform: 'capitalize',
      background: style.bg,
      color: style.color,
      whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
  );
}
