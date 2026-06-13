import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { LISTING_CATEGORIES, CONDITIONS } from '../utils/helpers';
import BackButton from '../components/BackButton';

export default function CreateListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', condition: '', contactNumber: '' });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/listings/${id}`).then((r) => {
        const l = r.data;
        setForm({ title: l.title, description: l.description, price: l.price, category: l.category, condition: l.condition, contactNumber: l.contactNumber });
        setPreviews(l.images || []);
      });
    }
  }, [id, isEdit]);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      images.forEach((img) => data.append('images', img));
      if (isEdit) {
        await api.put(`/listings/${id}`, data);
      } else {
        await api.post('/listings', data);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save listing');
    } finally { setLoading(false); }
  };

  const f = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <BackButton label="Back to Dashboard" to="/dashboard" />
      <h1 className="section-title mb-6">{isEdit ? 'Edit Listing' : '📦 Post a Listing'}</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
          <input required className="input-field" placeholder="e.g. Data Structures Textbook" {...f('title')} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
          <textarea required rows={4} className="input-field resize-none" placeholder="Describe your item in detail..." {...f('description')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (GHS) *</label>
            <input required type="number" min="0" className="input-field" placeholder="0.00" {...f('price')} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Number *</label>
            <input required className="input-field" placeholder="0xx xxx xxxx" {...f('contactNumber')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
            <select required className="input-field" {...f('category')}>
              <option value="">Select category</option>
              {LISTING_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Condition *</label>
            <select required className="input-field" {...f('condition')}>
              <option value="">Select condition</option>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Images <span className="text-slate-400 font-normal">(up to 5)</span></label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50">
            <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm text-slate-500">Click to upload images</span>
            <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
          </label>
          {previews.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {previews.map((src, i) => (
                <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-xl border-2 border-slate-200" />
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
            {loading ? 'Saving...' : isEdit ? 'Update Listing' : 'Post Listing 🚀'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">Cancel</button>
        </div>
      </form>
    </div>
  );
}
