export default function StatCard({ icon: Icon, iconBg, iconColor, label, value, trend, trendUp }) {
  return (
    <div style={{
      background: 'var(--admin-card)',
      border: '1px solid var(--admin-border)',
      borderRadius: 16,
      padding: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon && <Icon size={20} color={iconColor} />}
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: 100,
            background: trendUp ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: trendUp ? 'var(--admin-green)' : 'var(--admin-red)',
          }}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div style={{
        fontSize: 32, fontWeight: 700, color: 'white',
        marginTop: 16, fontFamily: 'Outfit, sans-serif', lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: 'var(--admin-muted)', marginTop: 4, fontFamily: 'Outfit, sans-serif' }}>
        {label}
      </div>
    </div>
  );
}
