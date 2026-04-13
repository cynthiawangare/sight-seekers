import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Eye, Pencil, Trash2, UserPlus, Shield, ShieldOff, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import AdminModal from '../../components/admin/shared/AdminModal';
import AdminDrawer from '../../components/admin/shared/AdminDrawer';
import ConfirmDialog from '../../components/admin/shared/ConfirmDialog';

const AVATAR_COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
function avatarColor(name = '') {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function avatarInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

const FLAG_MAP = {
  kenya: '🇰🇪', china: '🇨🇳', uk: '🇬🇧', 'united kingdom': '🇬🇧',
  usa: '🇺🇸', 'united states': '🇺🇸', germany: '🇩🇪', france: '🇫🇷',
  india: '🇮🇳', australia: '🇦🇺',
};
function flagEmoji(nationality = '') {
  return FLAG_MAP[nationality.toLowerCase()] || '🌍';
}

const PAGE_SIZE = 10;

const INPUT_STYLE = {
  width: '100%',
  background: 'var(--admin-bg)',
  border: '1px solid var(--admin-border)',
  borderRadius: 10,
  padding: '12px 16px',
  color: 'white',
  fontFamily: 'Outfit, sans-serif',
  fontSize: 14,
  outline: 'none',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);

  const [userBookings, setUserBookings] = useState({});
  const [userSpend, setUserSpend] = useState({});

  // New user form
  const [newUser, setNewUser] = useState({ first_name: '', last_name: '', email: '', phone: '', nationality: '', role: 'user' });

  async function loadUsers() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(list);

      // Load booking counts
      const bookSnap = await getDocs(collection(db, 'bookings'));
      const bookMap = {};
      const spendMap = {};
      bookSnap.docs.forEach(d => {
        const b = d.data();
        if (b.user_id) {
          bookMap[b.user_id] = (bookMap[b.user_id] || 0) + 1;
          if (b.payment_status === 'completed') spendMap[b.user_id] = (spendMap[b.user_id] || 0) + (b.total_price || 0);
        }
      });
      setUserBookings(bookMap);
      setUserSpend(spendMap);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter(u => {
    const name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleToggleAdmin(user) {
    const makeAdmin = user.role !== 'admin';
    try {
      await api.post('/admin/set-admin-claim', { uid: user.id, admin: makeAdmin });
      toast.success(makeAdmin ? 'Admin granted' : 'Admin removed');
      loadUsers();
    } catch {
      toast.error('Failed to update role');
    }
  }

  async function handleDelete(user) {
    try {
      await deleteDoc(doc(db, 'users', user.id));
      toast.success('User deleted');
      loadUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  }

  async function handleAddUser(e) {
    e.preventDefault();
    try {
      // Create via backend or Firestore direct (for demo: Firestore only)
      const uid = `manual_${Date.now()}`;
      await setDoc(doc(db, 'users', uid), {
        ...newUser,
        created_at: serverTimestamp(),
      });
      toast.success('User added');
      setAddDrawerOpen(false);
      setNewUser({ first_name: '', last_name: '', email: '', phone: '', nationality: '', role: 'user' });
      loadUsers();
    } catch {
      toast.error('Failed to add user');
    }
  }

  function userName(u) {
    return `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'Unknown';
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif', margin: 0 }}>Users</h1>
          <p style={{ color: 'var(--admin-muted)', fontSize: 14, fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>Manage all registered users</p>
        </div>
        <button
          onClick={() => setAddDrawerOpen(true)}
          style={{ background: 'var(--admin-accent)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            style={{ ...INPUT_STYLE, paddingLeft: 36 }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          style={{ ...INPUT_STYLE, width: 'auto', cursor: 'pointer' }}
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <span style={{ color: 'var(--admin-muted)', fontSize: 13, fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
          Showing {filtered.length} user{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--admin-border)' }}>
                {['User', 'Role', 'Nationality', 'Joined', 'Bookings', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((u, i) => {
                const name = userName(u);
                return (
                  <tr
                    key={u.id}
                    style={{ borderBottom: i < paginated.length - 1 ? '1px solid rgba(42,45,62,0.5)' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: avatarColor(name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>
                          {avatarInitials(name)}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, color: 'var(--admin-text)', fontWeight: 500, fontFamily: 'Outfit, sans-serif' }}>{name}</div>
                          <div style={{ fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <StatusBadge status={u.role || 'user'} />
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif' }}>
                      {u.nationality ? `${flagEmoji(u.nationality)} ${u.nationality}` : <span style={{ color: 'var(--admin-muted)' }}>—</span>}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
                      {u.created_at?.toDate?.()
                        ? u.created_at.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif' }}>
                      {userBookings[u.id] || 0}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[
                          { icon: Eye, action: () => setViewUser(u), title: 'View' },
                          { icon: Pencil, action: () => setEditUser(u), title: 'Edit' },
                          { icon: Trash2, action: () => setDeleteUser(u), title: 'Delete', danger: true },
                        ].map(({ icon: Icon, action, title, danger }) => (
                          <button
                            key={title}
                            onClick={action}
                            title={title}
                            style={{
                              width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                              background: 'transparent', color: danger ? 'var(--admin-red)' : 'var(--admin-muted)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <Icon size={15} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && !loading && (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--admin-muted)', fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--admin-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ background: p === page ? 'var(--admin-accent)' : 'var(--admin-card)', border: `1px solid ${p === page ? 'transparent' : 'var(--admin-border)'}`, borderRadius: 8, padding: '8px 14px', color: p === page ? 'white' : 'var(--admin-muted)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 13 }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--admin-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* View user modal */}
      <AdminModal open={!!viewUser} onClose={() => setViewUser(null)} title="User Details" maxWidth={560}>
        {viewUser && (() => {
          const name = userName(viewUser);
          return (
            <>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: avatarColor(name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white', margin: '0 auto 12px' }}>
                  {avatarInitials(name)}
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, color: 'white', fontFamily: 'Outfit, sans-serif' }}>{name}</div>
                <div style={{ fontSize: 14, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>{viewUser.email}</div>
                <div style={{ marginTop: 8 }}><StatusBadge status={viewUser.role || 'user'} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
                {[
                  { label: 'Bookings', value: userBookings[viewUser.id] || 0 },
                  { label: 'Total Spent', value: `$${((userSpend[viewUser.id] || 0) / 100).toFixed(0)}` },
                  { label: 'Nationality', value: viewUser.nationality || '—' },
                  { label: 'Phone', value: viewUser.phone || '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: 'center', background: 'var(--admin-bg)', borderRadius: 12, padding: '12px 8px' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--admin-accent)', fontFamily: 'Outfit, sans-serif' }}>{value}</div>
                    <div style={{ fontSize: 11, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => { handleToggleAdmin(viewUser); setViewUser(null); }}
                  style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--admin-accent)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '10px 20px', fontFamily: 'Outfit, sans-serif', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {viewUser.role === 'admin' ? <><ShieldOff size={15} /> Remove Admin</> : <><Shield size={15} /> Make Admin</>}
                </button>
                <button
                  onClick={() => { setDeleteUser(viewUser); setViewUser(null); }}
                  style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--admin-red)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 20px', fontFamily: 'Outfit, sans-serif', fontSize: 14, cursor: 'pointer' }}
                >
                  Deactivate Account
                </button>
              </div>
            </>
          );
        })()}
      </AdminModal>

      {/* Add user drawer */}
      <AdminDrawer open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)} title="Add New User">
        <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', display: 'block', marginBottom: 6 }}>First Name</label>
              <input value={newUser.first_name} onChange={e => setNewUser(p => ({ ...p, first_name: e.target.value }))} style={INPUT_STYLE} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', display: 'block', marginBottom: 6 }}>Last Name</label>
              <input value={newUser.last_name} onChange={e => setNewUser(p => ({ ...p, last_name: e.target.value }))} style={INPUT_STYLE} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} style={INPUT_STYLE} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', display: 'block', marginBottom: 6 }}>Phone</label>
              <input value={newUser.phone} onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))} style={INPUT_STYLE} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', display: 'block', marginBottom: 6 }}>Nationality</label>
              <input value={newUser.nationality} onChange={e => setNewUser(p => ({ ...p, nationality: e.target.value }))} style={INPUT_STYLE} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', display: 'block', marginBottom: 8 }}>Role</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['user', 'admin'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setNewUser(p => ({ ...p, role: r }))}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8,
                    border: `1px solid ${newUser.role === r ? 'var(--admin-accent)' : 'var(--admin-border)'}`,
                    background: newUser.role === r ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: newUser.role === r ? 'var(--admin-accent)' : 'var(--admin-muted)',
                    fontFamily: 'Outfit, sans-serif', fontSize: 14, cursor: 'pointer', textTransform: 'capitalize',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" onClick={() => setAddDrawerOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: 8, border: '1px solid var(--admin-border)', background: 'transparent', color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: 'var(--admin-accent)', color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Add User
            </button>
          </div>
        </form>
      </AdminDrawer>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={() => handleDelete(deleteUser)}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteUser ? userName(deleteUser) : ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
