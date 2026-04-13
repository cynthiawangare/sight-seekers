import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-border)',
          borderRadius: 16,
          padding: 32,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: 52, height: 52,
          borderRadius: '50%',
          background: danger ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <AlertTriangle size={24} color={danger ? 'var(--admin-red)' : 'var(--admin-accent)'} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'white', fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.5, marginBottom: 28 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--admin-border)',
              borderRadius: 8, padding: '10px 24px',
              color: 'var(--admin-muted)', fontSize: 14,
              fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            style={{
              background: danger ? 'var(--admin-red)' : 'var(--admin-accent)',
              border: 'none', borderRadius: 8, padding: '10px 24px',
              color: 'white', fontSize: 14, fontWeight: 600,
              fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
