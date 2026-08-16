import { useEffect, useState } from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import BackButton from '../components/BackButton';
import { SERVICE_CATEGORIES } from '../utils/helpers';

const methodOptions = [
  { value: 'digital', label: 'Digital delivery', hint: 'Send the completed work online' },
  { value: 'public_meetup', label: 'Public meetup', hint: 'Meet at a safe, agreed location' },
  { value: 'campus_pickup', label: 'Campus pickup', hint: 'Buyer collects on campus' },
  { value: 'delivery', label: 'Delivery', hint: 'Arrange physical delivery' },
];

const initialForm = {
  title: '', description: '', price: '', category: '', contactNumber: '',
  campus: 'University of Cape Coast', location: '', fulfilmentMethods: ['digital', 'public_meetup'],
};

export default function CreateService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/services/${id}`).then(({ data }) => {
      setForm({ ...initialForm, ...data, fulfilmentMethods: data.fulfilmentMethods || initialForm.fulfilmentMethods });
    }).catch(() => setError('We could not load this service. Try again.'));
  }, [id, isEdit]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.fulfilmentMethods.length) {
      setError('Choose at least one delivery option.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isEdit) await api.put(`/services/${id}`, form);
      else await api.post('/services', form);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not save your service. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <BackButton label="Back to dashboard" to="/dashboard" />
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-cobalt">Earn with your skills</p>
          <h1 className="section-title text-4xl sm:text-5xl">{isEdit ? 'Refine your offer' : 'Put your skills to work'}</h1>
        </div>
        <Sparkles aria-hidden="true" className="hidden h-11 w-11 text-mango sm:block" strokeWidth={2.25} />
      </div>

      {error && <div role="alert" className="mb-5 rounded-[14px] bg-coral/10 px-4 py-3 text-sm font-semibold text-coral">{error}</div>}

      <form onSubmit={handleSubmit} className="card space-y-7 p-5 sm:p-8">
        <fieldset className="space-y-5">
          <legend className="font-display text-2xl font-extrabold uppercase">What can you do?</legend>
          <div>
            <label htmlFor="service-title" className="mb-1.5 block text-sm font-bold">Service title</label>
            <input id="service-title" required className="input-field" placeholder="Same-day poster design" {...field('title')} />
          </div>
          <div>
            <label htmlFor="service-description" className="mb-1.5 block text-sm font-bold">Description</label>
            <textarea id="service-description" required rows={5} className="input-field resize-y" placeholder="Explain what is included, turnaround time and what you need from the buyerâ€¦" {...field('description')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="service-category" className="mb-1.5 block text-sm font-bold">Category</label>
              <select id="service-category" required className="input-field" {...field('category')}>
                <option value="">Choose a category</option>
                {SERVICE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="service-price" className="mb-1.5 block text-sm font-bold">Starting price (GHâ‚µ)</label>
              <input id="service-price" required type="number" min="0.01" step="0.01" inputMode="decimal" className="input-field" placeholder="0.00" {...field('price')} />
            </div>
          </div>
          {form.category === 'Academic Support' && (
            <div className="rounded-[14px] bg-mango/15 px-4 py-3 text-sm leading-relaxed">
              <strong>Keep it honest.</strong> Tutoring, proofreading, formatting and concept guidance are welcome. Completing exams or graded work for someone else is not.
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-5 border-t border-ink/10 pt-7">
          <legend className="font-display text-2xl font-extrabold uppercase">How will you deliver?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="service-campus" className="mb-1.5 block text-sm font-bold">Campus</label>
              <input id="service-campus" required className="input-field" {...field('campus')} />
            </div>
            <div>
              <label htmlFor="service-location" className="mb-1.5 block text-sm font-bold">Preferred meetup spot</label>
              <div className="relative">
                <MapPin aria-hidden="true" className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
                <input id="service-location" className="input-field pl-10" placeholder="Optional" {...field('location')} />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="service-phone" className="mb-1.5 block text-sm font-bold">Contact number</label>
            <input id="service-phone" required type="tel" className="input-field" placeholder="024 000 0000" {...field('contactNumber')} />
          </div>
        </fieldset>

        <div className="flex flex-col-reverse gap-3 border-t border-ink/10 pt-7 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary sm:min-w-44">{loading ? 'Savingâ€¦' : isEdit ? 'Update service' : 'Post service'}</button>
        </div>
      </form>
    </main>
  );
}
