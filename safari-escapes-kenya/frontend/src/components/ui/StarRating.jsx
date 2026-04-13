export default function StarRating({ rating, onChange, readonly = false, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < rating;
        return (
          <button
            key={i}
            type="button"
            onClick={() => !readonly && onChange?.(i + 1)}
            disabled={readonly}
            className={`text-xl ${filled ? 'text-yellow-400' : 'text-gray-300'} ${!readonly ? 'cursor-pointer hover:text-yellow-300' : 'cursor-default'}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
