import { useState } from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LEVELS } from '../utils/helpers';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', department: '', level: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const field = (name) => ({ value: form[name], onChange: (event) => setForm({ ...form, [name]: event.target.value }) });

  const handleSubmit = async (event) => {
    event.preventDefault(); setError('');
    if (form.password !== form.confirm) { setError('The passwords do not match. Re-enter both passwords.'); return; }
    if (form.password.length < 8) { setError('Use at least 8 characters for your password.'); return; }
    setLoading(true);
    try { await register({ name: form.name, email: form.email, password: form.password, department: form.department, level: form.level, phone: form.phone }); navigate('/dashboard'); }
    catch (requestError) { setError(requestError.response?.data?.message || 'We couldnâ€™t create your account. Check the form and try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[.72fr_1.28fr]">
      <section className="hidden bg-cobalt p-12 text-white lg:flex lg:flex-col lg:justify-between"><Link to="/" className="display-type text-4xl">KOBO</Link><div><h1 className="display-type text-7xl leading-[.86]">Join the campus market.</h1><p className="mt-5 max-w-md leading-7 text-white/70">Create one account to browse, post, save items, and message people on KOBO.</p></div><p className="text-sm font-bold text-white/60">Launching as a controlled UCC pilot.</p></section>
      <main className="flex justify-center bg-paper px-4 py-10 sm:px-8 lg:items-center"><div className="w-full max-w-xl"><Link to="/" className="display-type mb-8 inline-block text-4xl lg:hidden">KOBO</Link><h1 className="display-type text-5xl leading-none">Create your account</h1><p className="mt-3 text-sm text-muted">Use details you can verify and keep access to.</p>{error && <div role="alert" className="mt-6 flex gap-3 rounded-[14px] bg-coral/10 p-4 text-sm font-semibold text-[#A23328]"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}<form onSubmit={handleSubmit} className="mt-7 grid gap-5 sm:grid-cols-2"><label className="block sm:col-span-2"><span className="mb-2 block text-sm font-extrabold">Full name</span><input type="text" required autoComplete="name" className="input-field" placeholder="Your full name" {...field('name')} /></label><label className="block sm:col-span-2"><span className="mb-2 block text-sm font-extrabold">Email</span><input type="email" required autoComplete="email" className="input-field" placeholder="name@example.com" {...field('email')} /></label><label className="block"><span className="mb-2 block text-sm font-extrabold">Department <span className="font-medium text-muted">(optional)</span></span><input type="text" className="input-field" placeholder="Your department" {...field('department')} /></label><label className="block"><span className="mb-2 block text-sm font-extrabold">Level <span className="font-medium text-muted">(optional)</span></span><select className="input-field" {...field('level')}><option value="">Select level</option>{LEVELS.map((level) => <option key={level} value={level}>Level {level}</option>)}</select></label><label className="block sm:col-span-2"><span className="mb-2 block text-sm font-extrabold">Phone</span><input type="tel" inputMode="tel" autoComplete="tel" required className="input-field" placeholder="Ghana mobile number" {...field('phone')} /></label><label className="block"><span className="mb-2 block text-sm font-extrabold">Password</span><input type="password" autoComplete="new-password" required minLength={8} className="input-field" placeholder="At least 8 characters" {...field('password')} /></label><label className="block"><span className="mb-2 block text-sm font-extrabold">Confirm password</span><input type="password" autoComplete="new-password" required className="input-field" placeholder="Re-enter password" {...field('confirm')} /></label><button type="submit" disabled={loading} className="btn-primary sm:col-span-2">{loading ? 'Creating accountâ€¦' : <>Create account<ArrowRight className="h-4 w-4" /></>}</button></form><p className="mt-6 text-sm text-muted">Already have an account? <Link to="/login" className="font-extrabold text-cobalt hover:underline">Sign in</Link></p></div></main>
    </div>
  );
}
