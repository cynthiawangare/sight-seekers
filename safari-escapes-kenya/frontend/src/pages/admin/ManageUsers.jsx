import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import api from '../../services/api';
import { Search, Shield, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setIsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSetAdmin = async (user, makeAdmin) => {
    try {
      await api.post('/api/v1/admin/set-admin-claim', { uid: user.id, isAdmin: makeAdmin });
      toast.success(makeAdmin ? `${user.first_name} is now an admin` : 'Admin removed');
      await fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update admin status');
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || (u.first_name + ' ' + u.last_name + ' ' + u.email).toLowerCase().includes(q);
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-playfair text-gray-900">Manage Users</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-primary/30 w-56" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-light">
              <tr>
                {['Name', 'Email', 'Role', 'Nationality', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-light/50">
                  <td className="px-4 py-3 font-medium">{user.first_name} {user.last_name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.nationality || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {user.created_at?.seconds ? new Date(user.created_at.seconds * 1000).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {user.role === 'admin' ? (
                      <button onClick={() => handleSetAdmin(user, false)} className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1">
                        <ShieldOff size={13} /> Remove Admin
                      </button>
                    ) : (
                      <button onClick={() => handleSetAdmin(user, true)} className="text-purple-600 hover:text-purple-800 text-xs font-medium flex items-center gap-1">
                        <Shield size={13} /> Make Admin
                      </button>
                    )}
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
