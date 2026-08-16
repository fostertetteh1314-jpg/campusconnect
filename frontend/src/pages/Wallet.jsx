import { useEffect, useState } from 'react';
import { ArrowDownToLine, Clock3, WalletCards } from 'lucide-react';
import api from '../api';
import { formatDate, formatMinor } from '../utils/helpers';

export default function Wallet() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ amount: '', provider: 'MTN', accountName: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = () => api.get('/v1/wallet').then((response) => setData(response.data)).catch(() => setError('We couldnâ€™t load your wallet.'));
  useEffect(load, []);

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await api.post('/v1/wallet/withdrawals', { amountMinor: Math.round(Number(form.amount) * 100), provider: form.provider, accountName: form.accountName, idempotencyKey: `web-${Date.now()}-${crypto.randomUUID()}` });
      setForm({ ...form, amount: '' }); load();
    } catch (requestError) { setError(requestError.response?.data?.message || 'We couldnâ€™t request this withdrawal.'); }
    finally { setBusy(false); }
  };

  if (!data) return <div className="mx-auto max-w-5xl px-4 py-16"><div className="h-72 animate-pulse rounded-[14px] bg-ink/10" /></div>;
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:px-8 md:py-12">
      <h1 className="display-type text-5xl leading-none md:text-6xl">Seller wallet</h1><p className="mt-3 text-sm text-muted">Only completed orders become available to withdraw.</p>
      {error && <div role="alert" className="mt-6 rounded-[14px] bg-coral/10 p-4 text-sm font-bold text-[#A23328]">{error}</div>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2"><div className="rounded-[14px] bg-ink p-6 text-paper"><WalletCards className="h-6 w-6 text-lime" /><p className="mt-8 text-sm text-paper/75">Available</p><p className="mt-1 text-4xl font-extrabold text-lime">{formatMinor(data.wallet.availableMinor)}</p></div><div className="notice-slip p-6"><Clock3 className="h-6 w-6 text-cobalt" /><p className="mt-8 text-sm text-muted">Pending withdrawal</p><p className="mt-1 text-4xl font-extrabold text-ink">{formatMinor(data.wallet.pendingWithdrawalMinor)}</p></div></div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"><section><h2 className="section-title">Withdrawals</h2>{data.withdrawals.length === 0 ? <p className="mt-5 text-sm text-muted">No withdrawal requests yet.</p> : <div className="mt-5 space-y-3">{data.withdrawals.map((withdrawal) => <div key={withdrawal._id} className="notice-slip flex items-center justify-between gap-4 p-4"><div><strong className="block">{formatMinor(withdrawal.amountMinor)}</strong><span className="mt-1 block text-xs capitalize text-muted">{withdrawal.status} Â· {formatDate(withdrawal.createdAt)}</span></div><span className="text-xs font-bold text-muted">{withdrawal.destination.provider} Â· {withdrawal.destination.accountMask}</span></div>)}</div>}</section>
        <aside className="notice-slip p-6"><h2 className="text-lg font-extrabold">Request withdrawal</h2><p className="mt-2 text-xs leading-5 text-muted">Funds go to your verified phone number. An administrator reviews each request before Moolre sends it.</p><form onSubmit={submit} className="mt-5 space-y-4"><label className="block"><span className="mb-2 block text-sm font-extrabold">Amount in GHâ‚µ</span><input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className="input-field" /></label><label className="block"><span className="mb-2 block text-sm font-extrabold">Mobile money network</span><select value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })} className="input-field"><option value="MTN">MTN MoMo</option><option value="AT">AT Money</option><option value="TELECEL">Telecel Cash</option></select></label><label className="block"><span className="mb-2 block text-sm font-extrabold">Account name</span><input required value={form.accountName} onChange={(event) => setForm({ ...form, accountName: event.target.value })} className="input-field" /></label><button disabled={busy} className="btn-primary w-full"><ArrowDownToLine className="h-4 w-4" />{busy ? 'Requestingâ€¦' : 'Request withdrawal'}</button></form></aside></div>
    </div>
  );
}
