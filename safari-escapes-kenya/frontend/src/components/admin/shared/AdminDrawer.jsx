import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function AdminDrawer({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }}
      />
      {/* Panel */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: 480,
        background: 'var(--admin-sidebar)',
        borderLeft: '1px solid var(--admin-border)',
        padding: 40,
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'white', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none', borderRadius: 8,
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--admin-muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
