import { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { LEVELS, getInitials } from '../utils/helpers';
import BackButton from '../components/BackButton';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '', level: user?.level || '', phone: user?.phone || '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(user?.profileImage || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('profileImage', image);
      const res = await api.put('/auth/profile', data);
      updateUser(res.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const f = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <BackButton label="Back to Dashboard" to="/dashboard" />
      <h1 className="section-title mb-6">Edit Profile</h1>

      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">✅ {success}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5 shadow-sm">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          {preview ? (
            <img src={preview} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-md" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md">
              {getInitials(form.name)}
            </div>
          )}
          <div>
            <label className="cursor-pointer btn-secondary text-sm py-2 px-4">
              📷 Change Photo
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
            <p className="text-xs text-slate-400 mt-2">JPG, PNG — max 5MB</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
          <input required className="input-field" {...f('name')} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
          <input value={user?.email} disabled className="input-field bg-slate-50 text-slate-400 cursor-not-allowed" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
            <input className="input-field" placeholder="Computer Science" {...f('department')} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Level</label>
            <select className="input-field" {...f('level')}>
              <option value="">Select</option>
              {LEVELS.map((l) => <option key={l} value={l}>Level {l}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
          <input className="input-field" placeholder="0xx xxx xxxx" {...f('phone')} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
