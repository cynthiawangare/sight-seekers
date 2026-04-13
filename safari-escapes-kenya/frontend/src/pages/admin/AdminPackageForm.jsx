import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';
import { Plus, Trash2, GripVertical, ChevronLeft } from 'lucide-react';
import TagInput from '../../components/admin/shared/TagInput';
import { uploadPackageImage } from '../../firebase/storage';

const TOUR_TYPES = ['Safari', 'Beach', 'Cultural', 'Mountain', 'Wildlife', 'Adventure', 'Luxury'];

const INPUT = {
  width: '100%',
  background: 'var(--admin-bg)',
  border: '1px solid var(--admin-border)',
  borderRadius: 10,
  padding: '12px 16px',
  color: 'white',
  fontFamily: 'Outfit, sans-serif',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};
const TEXTAREA = { ...INPUT, resize: 'vertical' };
const LABEL = { fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', display: 'block', marginBottom: 6 };
const SECTION_TITLE = { fontSize: 15, fontWeight: 600, color: 'white', fontFamily: 'Outfit, sans-serif', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--admin-border)' };

function slugify(str = '') {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const emptyDay = () => ({ title: '', description: '', activities: [], accommodation: '', meals: { breakfast: false, lunch: false, dinner: false } });

export default function AdminPackageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [slugManual, setSlugManual] = useState(false);
  const [imageFiles, setImageFiles] = useState([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState(['', '', '']);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    country: 'Kenya',
    tour_type: 'Safari',
    short_description: '',
    description: '',
    price_per_person: '',
    duration_days: '',
    max_travelers: '',
    discount_percent: '',
    is_featured: false,
    is_active: true,
    includes: [],
    excludes: [],
    highlights: [],
    images: ['', '', ''],
  });
  const [itinerary, setItinerary] = useState([emptyDay()]);

  useEffect(() => {
    if (!isEdit) return;
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'packages', id));
        if (snap.exists()) {
          const d = snap.data();
          setForm({
            name: d.name || '',
            slug: d.slug || '',
            country: d.country || 'Kenya',
            tour_type: d.tour_type || 'Safari',
            short_description: d.short_description || '',
            description: d.description || '',
            price_per_person: d.price_per_person ? String(d.price_per_person / 100) : '',
            duration_days: d.duration_days ? String(d.duration_days) : '',
            max_travelers: d.max_travelers ? String(d.max_travelers) : '',
            discount_percent: d.discount_percent ? String(d.discount_percent) : '',
            is_featured: d.is_featured || false,
            is_active: d.is_active !== false,
            includes: d.includes || [],
            excludes: d.excludes || [],
            highlights: d.highlights || [],
            images: d.images?.length ? [...d.images, '', '', ''].slice(0, 3) : ['', '', ''],
          });
          // Load itinerary
          const itin = d.itinerary || [];
          if (itin.length) setItinerary(itin);
        }
      } catch (err) {
        toast.error('Failed to load package');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isEdit]);

  function setField(key, value) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && !slugManual) next.slug = slugify(value);
      return next;
    });
  }

  function setImageUrl(idx, val) {
    setForm(prev => {
      const imgs = [...prev.images];
      imgs[idx] = val;
      return { ...prev, images: imgs };
    });
    // Clear local preview so URL takes over
    setImagePreviews(prev => { const p = [...prev]; p[idx] = ''; return p; });
  }

  function handleImageSelect(index, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviews(prev => { const p = [...prev]; p[index] = e.target.result; return p; });
    };
    reader.readAsDataURL(file);
    setImageFiles(prev => { const f = [...prev]; f[index] = file; return f; });
  }

  function removeImage(index) {
    setImagePreviews(prev => { const p = [...prev]; p[index] = ''; return p; });
    setImageFiles(prev => { const f = [...prev]; f[index] = null; return f; });
    setForm(prev => { const imgs = [...prev.images]; imgs[index] = ''; return { ...prev, images: imgs }; });
  }

  function addDay() { setItinerary(prev => [...prev, emptyDay()]); }
  function removeDay(i) { setItinerary(prev => prev.filter((_, idx) => idx !== i)); }
  function setDay(i, key, val) {
    setItinerary(prev => prev.map((d, idx) => idx === i ? { ...d, [key]: val } : d));
  }
  function setMeal(i, meal, val) {
    setItinerary(prev => prev.map((d, idx) => idx === i ? { ...d, meals: { ...d.meals, [meal]: val } } : d));
  }

  async function handleSave(status = 'published') {
    if (!form.name) { toast.error('Package name is required'); return; }
    setSaving(true);
    try {
      // Pre-generate ref so storage path matches the Firestore doc ID
      const packageRef = isEdit ? doc(db, 'packages', id) : doc(collection(db, 'packages'));

      // Upload any pending image files to Firebase Storage
      const finalImages = [...form.images];
      for (let i = 0; i < imageFiles.length; i++) {
        if (imageFiles[i]) {
          const url = await uploadPackageImage(imageFiles[i], `${packageRef.id}_img${i}`);
          finalImages[i] = url;
        }
      }

      const data = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        country: form.country,
        tour_type: form.tour_type,
        short_description: form.short_description,
        description: form.description,
        price_per_person: Math.round(parseFloat(form.price_per_person || 0) * 100),
        duration_days: parseInt(form.duration_days || 0),
        max_travelers: parseInt(form.max_travelers || 0),
        discount_percent: parseFloat(form.discount_percent || 0),
        is_featured: form.is_featured,
        is_active: status === 'published',
        includes: form.includes,
        excludes: form.excludes,
        highlights: form.highlights,
        images: finalImages.filter(Boolean),
        itinerary: itinerary.map((d, idx) => ({ ...d, day: idx + 1 })),
        updated_at: serverTimestamp(),
      };

      if (isEdit) {
        await updateDoc(packageRef, data);
        toast.success('Package updated');
      } else {
        await setDoc(packageRef, { ...data, created_at: serverTimestamp() });
        toast.success('Package created');
      }
      navigate('/admin/packages');
    } catch (err) {
      toast.error('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>Loading…</div>;

  const previewPrice = parseFloat(form.price_per_person || 0);
  const previewDiscount = parseFloat(form.discount_percent || 0);
  const finalPrice = previewDiscount > 0 ? previewPrice * (1 - previewDiscount / 100) : previewPrice;

  return (
    <div style={{ padding: 32, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={() => navigate('/admin/packages')} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--admin-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
            {isEdit ? 'Edit Package' : 'New Package'}
          </h1>
          <p style={{ color: 'var(--admin-muted)', fontSize: 14, fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>
            {isEdit ? `Editing: ${form.name}` : 'Create a new tour package'}
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 28, alignItems: 'start' }}>
        {/* Left: form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Basic Info */}
          <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, padding: 24 }}>
            <div style={SECTION_TITLE}>Basic Info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={LABEL}>Package Name *</label>
                <input value={form.name} onChange={e => setField('name', e.target.value)} style={INPUT} placeholder="e.g. Maasai Mara Safari Adventure" />
              </div>
              <div>
                <label style={LABEL}>Slug</label>
                <input
                  value={form.slug}
                  onChange={e => { setSlugManual(true); setField('slug', slugify(e.target.value)); }}
                  style={INPUT}
                  placeholder="auto-generated from name"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LABEL}>Country</label>
                  <input value={form.country} onChange={e => setField('country', e.target.value)} style={INPUT} />
                </div>
                <div>
                  <label style={LABEL}>Tour Type</label>
                  <select value={form.tour_type} onChange={e => setField('tour_type', e.target.value)} style={INPUT}>
                    {TOUR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={LABEL}>Short Description</label>
                <textarea value={form.short_description} onChange={e => setField('short_description', e.target.value)} rows={2} style={TEXTAREA} placeholder="Brief one-liner for cards and listings" />
              </div>
              <div>
                <label style={LABEL}>Full Description</label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={5} style={TEXTAREA} placeholder="Detailed description of the package" />
              </div>
            </div>
          </div>

          {/* Pricing & Details */}
          <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, padding: 24 }}>
            <div style={SECTION_TITLE}>Pricing & Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LABEL}>Price Per Person (USD)</label>
                  <input type="number" value={form.price_per_person} onChange={e => setField('price_per_person', e.target.value)} style={INPUT} placeholder="e.g. 1500" min="0" />
                </div>
                <div>
                  <label style={LABEL}>Duration (Days)</label>
                  <input type="number" value={form.duration_days} onChange={e => setField('duration_days', e.target.value)} style={INPUT} placeholder="e.g. 7" min="1" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LABEL}>Max Travelers</label>
                  <input type="number" value={form.max_travelers} onChange={e => setField('max_travelers', e.target.value)} style={INPUT} placeholder="e.g. 12" min="1" />
                </div>
                <div>
                  <label style={LABEL}>Discount %</label>
                  <input type="number" value={form.discount_percent} onChange={e => setField('discount_percent', e.target.value)} style={INPUT} placeholder="e.g. 10" min="0" max="100" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                {[
                  { key: 'is_featured', label: 'Featured Package' },
                  { key: 'is_active', label: 'Active / Published' },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <div
                      onClick={() => setField(key, !form[key])}
                      style={{
                        width: 44, height: 24, borderRadius: 12,
                        background: form[key] ? 'var(--admin-accent)' : 'var(--admin-border)',
                        position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: form[key] ? 22 : 3, transition: 'left 0.2s' }} />
                    </div>
                    <span style={{ fontSize: 14, color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif' }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Includes / Excludes / Highlights */}
          <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, padding: 24 }}>
            <div style={SECTION_TITLE}>What's Included</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={LABEL}>Includes (type + Enter)</label>
                <TagInput tags={form.includes} onChange={v => setField('includes', v)} variant="green" placeholder="Add included item…" />
              </div>
              <div>
                <label style={LABEL}>Excludes</label>
                <TagInput tags={form.excludes} onChange={v => setField('excludes', v)} variant="red" placeholder="Add excluded item…" />
              </div>
              <div>
                <label style={LABEL}>Highlights</label>
                <TagInput tags={form.highlights} onChange={v => setField('highlights', v)} variant="accent" placeholder="Add highlight…" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, padding: 24 }}>
            <div style={SECTION_TITLE}>Images</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[0, 1, 2].map((index) => {
                const preview = imagePreviews[index];
                const url = form.images[index];
                const displaySrc = preview || url;
                return (
                  <div key={index}>
                    <label style={LABEL}>Image {index + 1}{index === 0 ? ' (Main)' : ' (Optional)'}</label>
                    <div style={{ border: '2px dashed var(--admin-border)', borderRadius: 12, overflow: 'hidden', background: 'var(--admin-bg)', cursor: 'pointer' }}>
                      {displaySrc ? (
                        <div style={{ position: 'relative' }}>
                          <img
                            src={displaySrc}
                            alt={`Package image ${index + 1}`}
                            style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 8 }}>
                            <label style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', color: '#374151' }}>
                              Change
                              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => handleImageSelect(index, e.target.files[0])} />
                            </label>
                            <button type="button" onClick={() => removeImage(index)} style={{ background: '#FEE2E2', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#DC2626', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, cursor: 'pointer', gap: 12 }}>
                          <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📷</div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--admin-text)' }}>
                              Image {index + 1}{index === 0 ? ' (Main)' : ' (Optional)'}
                            </div>
                            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: 'var(--admin-muted)', marginTop: 4 }}>
                              Click to upload · JPG, PNG, WebP · Max 5MB
                            </div>
                          </div>
                          <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => handleImageSelect(index, e.target.files[0])} />
                        </label>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Or paste image URL..."
                      value={url}
                      onChange={(e) => setImageUrl(index, e.target.value)}
                      style={{ ...INPUT, marginTop: 8, fontSize: 13 }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Itinerary */}
          <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, padding: 24 }}>
            <div style={{ ...SECTION_TITLE, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Itinerary</span>
              <button onClick={addDay} style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--admin-accent)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '6px 14px', fontFamily: 'Outfit, sans-serif', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> Add Day
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {itinerary.map((day, i) => (
                <div key={i} style={{ background: 'var(--admin-bg)', borderRadius: 12, padding: 20, borderLeft: '3px solid var(--admin-accent)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <GripVertical size={16} color="var(--admin-muted)" style={{ cursor: 'grab' }} />
                    <span style={{ background: 'rgba(99,102,241,0.2)', color: 'var(--admin-accent)', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 700, fontFamily: 'Outfit, sans-serif', flexShrink: 0 }}>Day {i + 1}</span>
                    <input
                      value={day.title}
                      onChange={e => setDay(i, 'title', e.target.value)}
                      placeholder="Day title e.g. Arrival in Nairobi"
                      style={{ ...INPUT, flex: 1 }}
                    />
                    {itinerary.length > 1 && (
                      <button onClick={() => removeDay(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-red)', display: 'flex', flexShrink: 0 }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={day.description}
                    onChange={e => setDay(i, 'description', e.target.value)}
                    placeholder="Describe the day's activities..."
                    rows={3}
                    style={{ ...TEXTAREA, marginBottom: 12 }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={LABEL}>Accommodation</label>
                      <input value={day.accommodation || ''} onChange={e => setDay(i, 'accommodation', e.target.value)} style={INPUT} placeholder="Hotel / Camp name" />
                    </div>
                    <div>
                      <label style={LABEL}>Meals included</label>
                      <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                        {['breakfast', 'lunch', 'dinner'].map(meal => (
                          <label key={meal} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={day.meals?.[meal] || false}
                              onChange={e => setMeal(i, meal, e.target.checked)}
                              style={{ accentColor: 'var(--admin-accent)' }}
                            />
                            <span style={{ fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', textTransform: 'capitalize' }}>{meal[0].toUpperCase()}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={LABEL}>Activities</label>
                    <TagInput tags={day.activities || []} onChange={v => setDay(i, 'activities', v)} variant="accent" placeholder="Add activity…" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: preview */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ background: 'rgba(99,102,241,0.1)', padding: '10px 16px', borderBottom: '1px solid var(--admin-border)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Outfit, sans-serif' }}>Live Preview</span>
            </div>
            {form.images[0]
              ? <img src={form.images[0]} alt="Preview" style={{ width: '100%', height: 200, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
              : <div style={{ width: '100%', height: 200, background: 'linear-gradient(135deg, #1E2130, #2A2D3E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🦁</div>
            }
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 10, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>
                {form.tour_type || 'Tour Type'}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>
                {form.name || 'Package Name'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', marginBottom: 16, lineHeight: 1.5 }}>
                {form.short_description || 'Short description will appear here...'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--admin-green)', fontFamily: 'Outfit, sans-serif' }}>
                    ${finalPrice.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>/person</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif' }}>
                  📅 {form.duration_days || '?'} days
                </div>
              </div>
              {form.highlights.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--admin-border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>Highlights</div>
                  {form.highlights.slice(0, 3).map(h => (
                    <div key={h} style={{ fontSize: 12, color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>✓ {h}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--admin-sidebar)',
        borderTop: '1px solid var(--admin-border)',
        padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12,
      }}>
        <button onClick={() => navigate('/admin/packages')} style={{ background: 'transparent', border: '1px solid var(--admin-border)', borderRadius: 8, padding: '10px 24px', color: 'var(--admin-muted)', fontFamily: 'Outfit, sans-serif', fontSize: 14, cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={() => handleSave('draft')} disabled={saving} style={{ background: 'rgba(100,116,139,0.2)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: '10px 24px', color: 'var(--admin-text)', fontFamily: 'Outfit, sans-serif', fontSize: 14, cursor: 'pointer' }}>
          Save as Draft
        </button>
        <button onClick={() => handleSave('published')} disabled={saving} style={{ background: 'var(--admin-accent)', border: 'none', borderRadius: 8, padding: '10px 24px', color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          {saving ? 'Saving…' : isEdit ? 'Update Package' : 'Publish Package'}
        </button>
      </div>
    </div>
  );
}
