import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 16 }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          style={{
            background: 'none', border: 'none', padding: 0,
            cursor: readOnly ? 'default' : 'pointer',
            display: 'flex',
          }}
        >
          <Star
            size={size}
            fill={star <= display ? '#F59E0B' : 'transparent'}
            color={star <= display ? '#F59E0B' : '#4B5563'}
          />
        </button>
      ))}
    </div>
  );
}
