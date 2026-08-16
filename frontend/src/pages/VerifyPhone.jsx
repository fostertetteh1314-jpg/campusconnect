import { useState } from 'react';
import { CheckCircle2, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function VerifyPhone() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const requestCode = async () => { setBusy(true); setError(''); try { await api.post('/v1/verifications/phone/request'); setSent(true); } catch (requestError) { setError(requestError.response?.data?.message || 'We couldnâ€™t send a verification code.'); } finally { setBusy(false); } };
  const confirm = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { await api.post('/v1/verifications/phone/confirm', { code }); updateUser({ ...user, phoneVerifiedAt: new Date().toISOString() }); navigate('/dashboard'); } catch (requestError) { setError(requestError.response?.data?.message || 'We couldnâ€™t verify that code.'); } finally { setBusy(false); } };
  if (user?.phoneVerifiedAt) return <div className="mx-auto max-w-lg px-4 py-16 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-cobalt" /><h1 className="display-type mt-5 text-4xl">Phone verified</h1><p className="mt-3 text-sm text-muted">Your phone number is already verified.</p></div>;
  return <div className="mx-auto max-w-lg px-4 py-12"><div className="notice-slip p-7"><span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-lime"><Phone className="h-5 w-5" /></span><h1 className="display-type mt-7 text-4xl">Verify your phone</h1><p className="mt-3 text-sm leading-6 text-muted">Weâ€™ll send a six-digit code to the phone number on your profile.</p>{error && <div role="alert" className="mt-5 rounded-[12px] bg-coral/10 p-3 text-sm font-bold text-[#A23328]">{error}</div>}{!sent ? <button onClick={requestCode} disabled={busy} className="btn-primary mt-6 w-full">{busy ? 'Sendingâ€¦' : 'Send verification code'}</button> : <form onSubmit={confirm} className="mt-6 space-y-4"><label className="block"><span className="mb-2 block text-sm font-extrabold">Verification code</span><input required inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} className="input-field text-center text-xl tracking-[.35em]" /></label><button disabled={busy || code.length !== 6} className="btn-primary w-full">{busy ? 'Verifyingâ€¦' : 'Verify phone'}</button><button type="button" onClick={requestCode} className="btn-ghost w-full">Send another code</button></form>}</div></div>;
}
