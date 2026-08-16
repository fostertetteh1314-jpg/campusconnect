import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, MapPin, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { formatPrice } from '../utils/helpers';

const methods = {
  campus_pickup: { title: 'Campus pickup', description: 'Agree on a campus pickup point in messages.' },
  public_meetup: { title: 'Public meetup', description: 'Meet at a mutually agreed public place.' },
  delivery: { title: 'Delivery', description: 'Arrange delivery details with the seller.' },
  digital: { title: 'Digital fulfilment', description: 'Receive the completed service digitally.' },
};

export default function Checkout() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [method, setMethod] = useState(type === 'service' ? 'digital' : 'campus_pickup');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const allowedMethods = useMemo(() => subject?.fulfilmentMethods?.length ? subject.fulfilmentMethods : (type === 'service' ? ['digital', 'public_meetup'] : ['campus_pickup', 'public_meetup']), [subject, type]);

  useEffect(() => {
    api.get(type === 'service' ? `/services/${id}` : `/listings/${id}`)
      .then((response) => { setSubject(response.data); if (response.data.fulfilmentMethods?.length) setMethod(response.data.fulfilmentMethods[0]); })
      .catch(() => navigate(type === 'service' ? '/services' : '/marketplace', { replace: true }));
  }, [id, type, navigate]);

  const createOrder = async () => {
    setSubmitting(true); setError('');
    try {
      const response = await api.post('/v1/orders', { subjectType: type, subjectId: id, fulfilmentMethod: method });
      navigate(`/orders/${response.data._id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We couldnâ€™t create this order. Try again.');
      setSubmitting(false);
    }
  };

  if (!subject) return <div className="mx-auto max-w-4xl px-4 py-16"><div className="h-80 animate-pulse rounded-[14px] bg-ink/10" /></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:px-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main>
          <h1 className="display-type text-5xl leading-none">Choose how youâ€™ll receive it</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Your order records the agreed item, amount, and next steps before payment starts.</p>
          {error && <div role="alert" className="mt-6 rounded-[14px] bg-coral/10 p-4 text-sm font-bold text-[#A23328]">{error}</div>}
          <div className="mt-8 space-y-3">
            {allowedMethods.map((value) => (
              <button key={value} onClick={() => setMethod(value)} className={`flex min-h-24 w-full items-center gap-4 rounded-[14px] p-4 text-left transition ${method === value ? 'bg-ink text-paper shadow-card-hover' : 'bg-paper-bright text-ink shadow-card'}`}>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${method === value ? 'bg-lime text-ink' : 'bg-ink/5 text-muted'}`}>{method === value ? <Check className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}</span>
                <span><strong className="block text-sm font-extrabold">{methods[value].title}</strong><span className={`mt-1 block text-sm leading-5 ${method === value ? 'text-paper/75' : 'text-muted'}`}>{methods[value].description}</span></span>
              </button>
            ))}
          </div>
        </main>
        <aside className="notice-slip h-fit p-6">
          <p className="text-xs font-extrabold text-muted">ORDER SUMMARY</p>
          <h2 className="mt-3 text-xl font-extrabold leading-snug">{subject.title}</h2>
          <div className="mt-6 space-y-3 border-y border-ink/10 py-5 text-sm"><div className="flex justify-between gap-4"><span className="text-muted">Listed price</span><strong>{formatPrice(subject.price)}</strong></div><div className="flex justify-between gap-4"><span className="text-muted">KOBO fee</span><strong>Shown on your order</strong></div></div>
          <div className="mt-5 flex gap-3 rounded-[12px] bg-lime/35 p-3 text-xs leading-5 text-ink/70"><ShieldCheck className="h-5 w-5 shrink-0 text-ink" /><p>The server calculates the final amount. Payment is confirmed by the provider and released after fulfilment.</p></div>
          <button onClick={createOrder} disabled={submitting} className="btn-primary mt-6 w-full">{submitting ? 'Creating orderâ€¦' : <>Continue to order<ArrowRight className="h-4 w-4" /></>}</button>
        </aside>
      </div>
    </div>
  );
}
