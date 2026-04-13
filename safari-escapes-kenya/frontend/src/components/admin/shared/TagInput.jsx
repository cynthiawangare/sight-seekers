import { useState } from 'react';
import { X } from 'lucide-react';

const VARIANTS = {
  green:  { bg: 'rgba(16,185,129,0.15)',  color: '#10B981' },
  red:    { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
  accent: { bg: 'rgba(99,102,241,0.15)',  color: '#6366F1' },
  gold:   { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
};

export default function TagInput({ tags = [], onChange, placeholder = 'Type and press Enter', variant = 'accent' }) {
  const [input, setInput] = useState('');
  const style = VARIANTS[variant] || VARIANTS.accent;

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInput('');
  };

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div style={{
      background: 'var(--admin-bg)',
      border: '1px solid var(--admin-border)',
      borderRadius: 10,
      padding: '8px 12px',
      display: 'flex', flexWrap: 'wrap', gap: 6,
      minHeight: 44,
      cursor: 'text',
    }}>
      {tags.map(tag => (
        <span key={tag} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 10px 3px 10px',
          borderRadius: 100, fontSize: 12, fontWeight: 500,
          fontFamily: 'Outfit, sans-serif',
          background: style.bg, color: style.color,
        }}>
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: style.color, padding: 0, display: 'flex' }}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length ? '' : placeholder}
        style={{
          background: 'none', border: 'none', outline: 'none',
          color: 'var(--admin-text)', fontSize: 13,
          fontFamily: 'Outfit, sans-serif',
          flex: 1, minWidth: 120, padding: '2px 0',
        }}
      />
    </div>
  );
}
