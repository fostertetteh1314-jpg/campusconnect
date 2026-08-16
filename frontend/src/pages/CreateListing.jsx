import { useEffect, useState } from 'react';
import { ImagePlus, MapPin, PackageCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import BackButton from '../components/BackButton';
import { CONDITIONS, LISTING_CATEGORIES } from '../utils/helpers';

const methodOptions = [
  { value: 'campus_pickup', label: 'Campus pickup', hint: 'Meet at a familiar campus spot' },
  { value: 'public_meetup', label: 'Public meetup', hint: 'Agree on a safe public location' },
  { value: 'delivery', label: 'Delivery', hint: 'Arrange delivery directly with the buyer' },
];

const initialForm = {
  title: '', description: '', price: '', category: '', condition: '', contactNumber: '',
  quantity: 1, campus: 'University of Cape Coast', location: '',
  fulfilmentMethods: ['campus_pickup', 'public_meetup'],
};

export default function CreateListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/listings/${id}`).then(({ data }) => {
      setForm({ ...initialForm, ...data, fulfilmentMethods: data.fulfilmentMethods || initialForm.fulfilmentMethods });
      setPreviews(data.images || []);
    }).catch(() => setError('We could not load this listing. Try again.'));
  }, [id, isEdit]);

  useEffect(() => () => previews.forEach((src) => {
    if (src.startsWith('blob:')) URL.revokeObjectURL(src);
  }), [previews]);

  const field = (name) => ({
    value: form[name],
    onChange: (event) => setForm((current) => ({ ...current, [name]: event.target.value })),
  });

  const toggleMethod = (value) => {
    setForm((current) => ({
      ...current,
      fulfilmentMethods: current.fulfilmentMethods.includes(value)
        ? current.fulfilmentMethods.filter((method) => method !== value)
        : [...current.fulfilmentMethods, value],
    }));
  };

  const handleImages = (event) => {
    const files = Array.from(event.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.fulfilmentMethods.length) {
      setError('Choose at least one handover option.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        data.append(key, key === 'fulfilmentMethods' ? JSON.stringify(value) : value);
      });
      images.forEach((image) => data.append('images', image));
      if (isEdit) await api.put(`/listings/${id}`, data);
      else await api.post('/listings', data);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not save your listing. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <BackButton label="Back to dashboard" to="/dashboard" />
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-cobalt">Sell on campus</p>
          <h1 className="section-title text-4xl sm:text-5xl">{isEdit ? 'Tune up your listing' : 'Post it. Move it.'}</h1>
        </div>
        <PackageCheck aria-hidden="true" className="hidden h-11 w-11 text-mango sm:block" strokeWidth={2.25} />
      </div>

      {error && <div role="alert" className="mb-5 rounded-[14px] bg-coral/10 px-4 py-3 text-sm font-semibold text-coral">{error}</div>}

      <form onSubmit={handleSubmit} className="card space-y-7 p-5 sm:p-8">
        <fieldset className="space-y-5">
          <legend className="font-display text-2xl font-extrabold uppercase">What are you selling?</legend>
          <div>
            <label htmlFor="listing-title" className="mb-1.5 block text-sm font-bold">Item title</label>
            <input id="listing-title" required className="input-field" placeholder="Data Structures textbook" {...field('title')} />
          </div>
          <div>
            <label htmlFor="listing-description" className="mb-1.5 block text-sm font-bold">Description</label>
            <textarea id="listing-description" required rows={5} className="input-field resize-y" placeholder="Condition, edition, what is includedâ€¦" {...field('description')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="listing-category" className="mb-1.5 block text-sm font-bold">Category</label>
              <select id="listing-category" required className="input-field" {...field('category')}>
                <option value="">Choose a category</option>
                {LISTING_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="listing-condition" className="mb-1.5 block text-sm font-bold">Condition</label>
              <select id="listing-condition" required className="input-field" {...field('condition')}>
                <option value="">Choose condition</option>
                {CONDITIONS.map((condition) => <option key={condition}>{condition}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="listing-price" className="mb-1.5 block text-sm font-bold">Price (GHâ‚µ)</label>
              <input id="listing-price" required type="number" min="0.01" step="0.01" inputMode="decimal" className="input-field" placeholder="0.00" {...field('price')} />
            </div>
            <div>
              <label htmlFor="listing-quantity" className="mb-1.5 block text-sm font-bold">Quantity</label>
              <input id="listing-quantity" required type="number" min="1" max="100" inputMode="numeric" className="input-field" {...field('quantity')} />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-5 border-t border-ink/10 pt-7">
          <legend className="font-display text-2xl font-extrabold uppercase">Where should buyers meet you?</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="listing-campus" className="mb-1.5 block text-sm font-bold">Campus</label>
              <input id="listing-campus" required className="input-field" {...field('campus')} />
            </div>
            <div>
              <label htmlFor="listing-location" className="mb-1.5 block text-sm font-bold">Preferred spot</label>
              <div className="relative">
                <MapPin aria-hidden="true" className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
                <input id="listing-location" className="input-field pl-10" placeholder="Science market, old siteâ€¦" {...field('location')} />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="listing-phone" className="mb-1.5 block text-sm font-bold">Contact number</label>
            <input id="listing-phone" required type="tel" className="input-field" placeholder="024 000 0000" {...field('contactNumber')} />
            <p className="mt-2 text-xs text-muted">Buyers still pay through KOBO. This number helps coordinate handover.</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">Handover options</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {methodOptions.map((option) => {
                const checked = form.fulfilmentMethods.includes(option.value);
                return (
                  <label key={option.value} className={`cursor-pointer rounded-[14px] p-4 shadow-[inset_0_0_0_1px_rgba(30,33,28,.14)] transition ${checked ? 'bg-lime shadow-[inset_0_0_0_2px_#1E211C]' : 'bg-paper hover:bg-white'}`}>
                    <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleMethod(option.value)} />
                    <span className="block text-sm font-extrabold">{option.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-ink/65">{option.hint}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </fieldset>

        <fieldset className="border-t border-ink/10 pt-7">
          <legend className="font-display text-2xl font-extrabold uppercase">Show the real thing</legend>
          <label className="mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-ink/20 bg-paper p-6 text-center transition hover:border-cobalt hover:bg-cobalt/5">
            <ImagePlus aria-hidden="true" className="mb-2 h-8 w-8 text-cobalt" />
            <span className="text-sm font-extrabold">Add up to five clear photos</span>
            <span className="mt-1 text-xs text-muted">JPG, PNG or WebP</span>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImages} className="sr-only" />
          </label>
          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {previews.map((src, index) => <img key={src} src={src} alt={`Listing preview ${index + 1}`} className="aspect-square w-full rounded-[12px] object-cover" />)}
            </div>
          )}
        </fieldset>

        <div className="flex flex-col-reverse gap-3 border-t border-ink/10 pt-7 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary sm:min-w-44">{loading ? 'Savingâ€¦' : isEdit ? 'Update listing' : 'Post listing'}</button>
        </div>
      </form>
    </main>
  );
}
