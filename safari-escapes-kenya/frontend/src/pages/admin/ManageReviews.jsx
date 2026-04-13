import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { updateReviewVisibility, deleteReview } from '../../services/reviewService';
import { Eye, EyeOff, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchReviews = async () => {
    // Admin fetches ALL reviews including hidden ones directly from Firestore
    const snap = await getDocs(collection(db, 'reviews'));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
    setReviews(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleToggleVisible = async (review) => {
    try {
      await updateReviewVisibility(review.id, !review.is_visible);
      await fetchReviews();
      toast.success(review.is_visible ? 'Review hidden' : 'Review now visible');
    } catch {
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async (review) => {
    if (!window.confirm(`Delete review by ${review.user_name}?`)) return;
    try {
      await deleteReview(review.id);
      await fetchReviews();
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const filtered =
    filter === 'visible' ? reviews.filter((r) => r.is_visible)
    : filter === 'hidden' ? reviews.filter((r) => !r.is_visible)
    : reviews;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-playfair text-gray-900">Manage Reviews</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
        >
          <option value="all">All Reviews</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-light">
              <tr>
                {['Reviewer', 'Package', 'Rating', 'Excerpt', 'Visible', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-light/50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{r.user_name}</p>
                        <p className="text-xs text-gray-500">{r.nationality}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-28 truncate">{r.package_name}</td>
                      <td className="px-4 py-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-48">
                        <p className="truncate text-xs italic">"{r.body}"</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {r.is_visible ? 'Visible' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {r.created_at?.seconds
                          ? new Date(r.created_at.seconds * 1000).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleVisible(r)}
                            className="text-gray-400 hover:text-blue-primary transition-colors"
                            title={r.is_visible ? 'Hide' : 'Show'}
                          >
                            {r.is_visible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => handleDelete(r)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
