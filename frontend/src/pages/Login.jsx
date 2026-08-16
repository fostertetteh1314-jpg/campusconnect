import { useState } from 'react';
import { AlertCircle, ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try { await login(form.email, form.password); navigate(from, { replace: true }); }
    catch (requestError) { setError(requestError.response?.data?.message || 'We couldnâ€™t sign you in. Check your details and try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] md:grid-cols-[.85fr_1.15fr]">
      <section className="hidden bg-lime p-10 md:flex md:flex-col md:justify-between lg:p-16"><Link to="/" className="display-type text-4xl">KOBO</Link><div><h1 className="display-type max-w-lg text-7xl leading-[.86]">Pick up where you left off.</h1><p className="mt-5 max-w-md text-base leading-7 text-ink/65">Return to saved items, messages, listings, and services from one account.</p></div><p className="text-sm font-bold text-muted">Find am. Pay safe.</p></section>
      <main className="flex items-center justify-center bg-paper px-4 py-10 sm:px-8"><div className="w-full max-w-md"><Link to="/" className="display-type mb-10 inline-block text-4xl md:hidden">KOBO</Link><h1 className="display-type text-5xl leading-none">Sign in</h1><p className="mt-3 text-sm text-muted">Use the email and password for your KOBO account.</p>{error && <div role="alert" className="mt-6 flex gap-3 rounded-[14px] bg-coral/10 p-4 text-sm font-semibold text-[#A23328]"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}<form onSubmit={handleSubmit} className="mt-7 space-y-5"><label className="block"><span className="mb-2 block text-sm font-extrabold">Email</span><span className="relative block"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="input-field pl-11" placeholder="name@example.com" /></span></label><label className="block"><span className="mb-2 block text-sm font-extrabold">Password</span><span className="relative block"><LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="input-field pl-11" placeholder="Your password" /></span></label><button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing inâ€¦' : <>Sign in<ArrowRight className="h-4 w-4" /></>}</button></form><p className="mt-6 text-sm text-muted">New to KOBO? <Link to="/register" className="font-extrabold text-cobalt hover:underline">Create an account</Link></p></div></main>
    </div>
  );
}
