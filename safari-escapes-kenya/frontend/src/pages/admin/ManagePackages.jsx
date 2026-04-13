import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, Edit, Power, ChevronDown, ChevronUp, X } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const EMPTY_PACKAGE = {
  name: '', slug: '', country: 'Kenya', tour_type: 'Wildlife Safari', description: '',
  short_description: '', price_per_person: 0, duration_days: 1, max_travelers: 12,
  includes: [], excludes: [], highlights: [], is_featured: false, discount_percent: 0,
  is_active: true, images: ['', '', ''],
};

function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('');
  const add = () => {
    if (input.trim()) { onChange([...value, input.trim()]); setInput(''); }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, i) => (
          <span key={i} className="bg-blue-primary/10 text-blue-primary text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
        <button type="button" onClick={add} className="bg-blue-primary text-white px-3 py-2 rounded-xl text-xs font-medium">Add</button>
      </div>
    </div>
  );
}

export default function ManagePackages() {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPkg, setEditPkg] = useState(null);
  const [form, setForm] = useState(EMPTY_PACKAGE);
  const [saving, setSaving] = useState(false);

  const fetchPackages = async () => {
    const snap = await getDocs(collection(db, 'packages'));
    setPackages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setIsLoading(false);
  };

  useEffect(() => { fetchPackages(); }, []);

  const autoSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const openAdd = () => { setForm(EMPTY_PACKAGE); setEditPkg(null); setShowForm(true); };
  const openEdit = (pkg) => { setForm({ ...pkg, images: pkg.images || ['','',''] }); setEditPkg(pkg); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, slug: form.slug || autoSlug(form.name), price_per_person: Number(form.price_per_person), duration_days: Number(form.duration_days), max_travelers: Number(form.max_travelers), discount_percent: Number(form.discount_percent) };
      if (editPkg) {
        await updateDoc(doc(db, 'packages', editPkg.id), { ...data, updated_at: serverTimestamp() });
        toast.success('Package updated!');
      } else {
        await addDoc(collection(db, 'packages'), { ...data, created_at: serverTimestamp() });
        toast.success('Package created!');
      }
      await fetchPackages();
      setShowForm(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (pkg) => {
    await updateDoc(doc(db, 'packages', pkg.id), { is_active: !pkg.is_active });
    await fetchPackages();
    toast.success(pkg.is_active ? 'Package deactivated' : 'Package activated');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-playfair text-gray-900">Manage Packages</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-primary hover:bg-blue-light text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> Add Package
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-light">
              <tr>
                {['Name', 'Type', 'Price', 'Duration', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-light/50">
                  <td className="px-4 py-3 font-medium">{pkg.name}</td>
                  <td className="px-4 py-3 text-gray-500">{pkg.tour_type}</td>
                  <td className="px-4 py-3">${pkg.price_per_person}</td>
                  <td className="px-4 py-3">{pkg.duration_days}d</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(pkg)} className="text-blue-primary hover:underline text-xs font-medium flex items-center gap-1"><Edit size={13} /> Edit</button>
                      <button onClick={() => handleDeactivate(pkg)} className="text-gray-500 hover:text-gray-700 text-xs font-medium flex items-center gap-1"><Power size={13} /> {pkg.is_active ? 'Deactivate' : 'Activate'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold font-playfair">{editPkg ? 'Edit Package' : 'Add Package'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })}
                    required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tour Type</label>
                  <select value={form.tour_type} onChange={(e) => setForm({ ...form, tour_type: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
                    {['Wildlife Safari', 'Cultural', 'Photography', 'Mara Special'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price/Person ($)</label>
                  <input type="number" value={form.price_per_person} onChange={(e) => setForm({ ...form, price_per_person: e.target.value })}
                    required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Duration (days)</label>
                  <input type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
                    required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Short Description</label>
                <input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Includes</label>
                <TagInput value={form.includes} onChange={(v) => setForm({ ...form, includes: v })} placeholder="Add item..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Excludes</label>
                <TagInput value={form.excludes} onChange={(v) => setForm({ ...form, excludes: v })} placeholder="Add item..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Highlights</label>
                <TagInput value={form.highlights} onChange={(v) => setForm({ ...form, highlights: v })} placeholder="Add highlight..." />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
                  Active
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-600">Discount %</label>
                  <input type="number" min={0} max={100} value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="bg-blue-primary hover:bg-blue-light text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : (editPkg ? 'Update' : 'Create')}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
