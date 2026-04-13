import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled', 'completed'];
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchBookings = async () => {
    const snap = await getDocs(collection(db, 'bookings'));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
    setBookings(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus });
      await fetchBookings();
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const exportCSV = () => {
    const header = ['Reference', 'Package', 'Travelers', 'Total', 'Status', 'Payment Status', 'Travel Date'];
    const rows = filtered.map((b) => [
      b.booking_reference,
      b.package_name,
      b.num_travelers,
      ((b.total_price || 0) / 100).toFixed(2),
      b.status,
      b.payment_status,
      b.travel_date,
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = filter ? bookings.filter((b) => b.status === filter) : bookings;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-playfair text-gray-900">Manage Bookings</h1>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-light">
              <tr>
                {['Reference', 'Package', 'Travelers', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-light/50">
                      <td className="px-4 py-3 font-mono text-xs text-blue-primary">{b.booking_reference}</td>
                      <td className="px-4 py-3 font-medium max-w-32 truncate">{b.package_name}</td>
                      <td className="px-4 py-3 text-gray-600">{b.num_travelers}</td>
                      <td className="px-4 py-3">${((b.total_price || 0) / 100).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          b.payment_status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {b.payment_status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{b.travel_date}</td>
                      <td className="px-4 py-3">
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none"
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
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
