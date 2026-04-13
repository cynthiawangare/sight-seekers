import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import clsx from 'clsx';

const METHOD_COLORS = {
  stripe: 'bg-purple-100 text-purple-700',
  mpesa: 'bg-green-100 text-green-700',
};
const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
};

export default function ManagePayments() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({ method: '', status: '' });

  useEffect(() => {
    getDocs(collection(db, 'payments'))
      .then((snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
        setPayments(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = payments.filter((p) => {
    if (filter.method && p.payment_method !== filter.method) return false;
    if (filter.status && p.status !== filter.status) return false;
    return true;
  });

  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0) / 100;
  const stripeRevenue = payments
    .filter((p) => p.status === 'completed' && p.payment_method === 'stripe')
    .reduce((sum, p) => sum + (p.amount || 0), 0) / 100;
  const mpesaRevenue = payments
    .filter((p) => p.status === 'completed' && p.payment_method === 'mpesa')
    .reduce((sum, p) => sum + (p.amount || 0), 0) / 100;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold font-playfair text-gray-900 mb-6">Manage Payments</h1>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, color: 'bg-green-600' },
          { label: 'Stripe', value: `$${stripeRevenue.toFixed(2)}`, color: 'bg-purple-600' },
          { label: 'M-Pesa (KES)', value: `KES ${Math.round(mpesaRevenue * 130).toLocaleString()}`, color: 'bg-green-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className={`w-8 h-1.5 ${color} rounded-full mb-2`} />
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={filter.method}
          onChange={(e) => setFilter({ ...filter, method: e.target.value })}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
        >
          <option value="">All Methods</option>
          <option value="stripe">Card (Stripe)</option>
          <option value="mpesa">M-Pesa</option>
        </select>
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-light">
              <tr>
                {['Booking ID', 'Amount', 'Method', 'Status', 'Transaction ID', 'Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-light/50">
                      <td className="px-4 py-3 font-mono text-xs text-blue-primary">{p.booking_id?.slice(0, 8) || '—'}</td>
                      <td className="px-4 py-3 font-medium">${((p.amount || 0) / 100).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${METHOD_COLORS[p.payment_method] || 'bg-gray-100 text-gray-600'}`}>
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-28 truncate">
                        {p.transaction_id || p.payment_intent_id || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {p.created_at?.seconds
                          ? new Date(p.created_at.seconds * 1000).toLocaleDateString()
                          : '—'}
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
