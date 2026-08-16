import { useEffect, useState } from 'react';
import { Camera, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../api';
import BackButton from '../components/BackButton';
import { useAuth } from '../context/AuthContext';
import { getInitials, LEVELS } from '../utils/helpers';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '', level: user?.level || '', phone: user?.phone || '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(user?.profileImage || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  const handleImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (image) data.append('profileImage', image);
      const response = await api.put('/auth/profile', data);
      updateUser(response.data);
      setSuccess('Profile saved.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not update your profile.');
    } finally { setLoading(false); }
  };

  const field = (name) => ({ value: form[name], onChange: (event) => setForm((current) => ({ ...current, [name]: event.target.value })) });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <BackButton label="Back to dashboard" to="/dashboard" />
      <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-cobalt">Your KOBO identity</p>
      <h1 className="section-title mb-7 text-4xl sm:text-5xl">Make your profile feel real</h1>

      {success && <div role="status" className="mb-5 flex items-center gap-2 rounded-[14px] bg-lime/50 px-4 py-3 text-sm font-bold"><CheckCircle2 className="h-4 w-4" />{success}</div>}
      {error && <div role="alert" className="mb-5 rounded-[14px] bg-coral/10 px-4 py-3 text-sm font-semibold text-coral">{error}</div>}

      <form onSubmit={handleSubmit} className="card space-y-6 p-5 sm:p-8">
        <div className="flex items-center gap-5 border-b border-ink/10 pb-6">
          {preview ? <img src={preview} alt="Profile preview" className="h-20 w-20 rounded-[18px] object-cover shadow-card" /> : (
            <div className="flex h-20 w-20 items-center justify-center rounded-[18px] bg-cobalt font-display text-3xl font-extrabold text-white shadow-card">{getInitials(form.name)}</div>
          )}
          <div>
            <label className="btn-secondary cursor-pointer text-sm">
              <Camera aria-hidden="true" className="h-4 w-4" /> Change photo
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="sr-only" />
            </label>
            <p className="mt-2 text-xs text-muted">JPG, PNG or WebP, up to 5 MB</p>
          </div>
        </div>
        <div>
          <label htmlFor="profile-name" className="mb-1.5 block text-sm font-bold">Full name</label>
          <input id="profile-name" required className="input-field" {...field('name')} />
        </div>
        <div>
          <label htmlFor="profile-email" className="mb-1.5 block text-sm font-bold">Email</label>
          <input id="profile-email" value={user?.email || ''} disabled className="input-field cursor-not-allowed bg-ink/5 text-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-department" className="mb-1.5 block text-sm font-bold">Department</label>
            <input id="profile-department" className="input-field" placeholder="Computer Science" {...field('department')} />
          </div>
          <div>
            <label htmlFor="profile-level" className="mb-1.5 block text-sm font-bold">Level</label>
            <select id="profile-level" className="input-field" {...field('level')}>
              <option value="">Choose level</option>
              {LEVELS.map((level) => <option key={level} value={level}>Level {level}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="profile-phone" className="mb-1.5 block text-sm font-bold">Phone</label>
          <input id="profile-phone" required type="tel" className="input-field" placeholder="024 000 0000" {...field('phone')} />
          <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />Changing your number clears verification until you confirm the new one.</p>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Savingâ€¦' : 'Save changes'}</button>
      </form>
    </main>
  );
}
