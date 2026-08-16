import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Check, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatMinor } from '../utils/helpers';

const statusCopy = { pending_payment: 'Waiting for payment', paid: 'Payment confirmed', accepted: 'Seller accepted', fulfilled: 'Fulfilment marked complete', completed: 'Order completed', disputed: 'Dispute under review', cancelled: 'Order cancelled', refund_pending: 'Refund pending', refunded: 'Refunded' };

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [reason, setReason] = useState('');
  const [payment, setPayment] = useState({ network: 'MTN', phone: user?.phone || '', otpCode: '' });
  const [paymentNotice, setPaymentNotice] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/v1/orders/${id}`).then((response) => setOrder(response.data)).catch((requestError) => setError(requestError.response?.data?.message || 'We couldnâ€™t load this order.')).finally(() => setLoading(false));
  }, [id]);
  useEffect(load, [load]);

  const isBuyer = String(order?.buyerId) === String(user?._id);
  const isSeller = String(order?.sellerId) === String(user?._id);
  const changeStatus = async (action) => { setBusy(true); setError(''); try { const response = await api.patch(`/v1/orders/${id}/status`, { action, reason: '' }); setOrder(response.data); } catch (requestError) { setError(requestError.response?.data?.message || 'That action could not be completed.'); } finally { setBusy(false); } };
  const pay = async () => { setBusy(true); setError(''); setPaymentNotice(''); try { const response = await api.post(`/v1/orders/${id}/payment`, { network: payment.network, phone: payment.phone, ...(payment.otpCode ? { otpCode: payment.otpCode } : {}) }); setPaymentNotice(response.data.otpRequired ? 'Enter the code Moolre sent, then submit again.' : 'Approve the mobile money prompt, then check payment status.'); load(); } catch (requestError) { setError(requestError.response?.data?.message || 'Payment could not be started.'); } finally { setBusy(false); } };
  const checkPayment = async () => { setBusy(true); setError(''); try { const response = await api.post(`/v1/orders/${id}/payment/status`); setOrder(response.data.order); setPaymentNotice(response.data.confirmed ? 'Payment confirmed.' : 'Payment is still pending. Approve the prompt and try again.'); } catch (requestError) { setError(requestError.response?.data?.message || 'Payment status could not be checked.'); } finally { setBusy(false); } };
  const submitReview = async (event) => { event.preventDefault(); setBusy(true); try { await api.post('/v1/reviews', { orderId: id, ...review }); setShowReview(false); } catch (requestError) { setError(requestError.response?.data?.message || 'Review could not be submitted.'); } finally { setBusy(false); } };
  const submitDispute = async (event) => { event.preventDefault(); setBusy(true); try { await api.post('/v1/disputes', { orderId: id, reason, evidenceUrls: [] }); setShowDispute(false); load(); } catch (requestError) { setError(requestError.response?.data?.message || 'Dispute could not be opened.'); setBusy(false); } };

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-16"><div className="h-96 animate-pulse rounded-[14px] bg-ink/10" /></div>;
  if (!order) return <div className="mx-auto max-w-4xl px-4 py-16"><div role="alert" className="notice-slip p-7">{error}</div></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:px-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main>
          <p className="text-xs font-extrabold text-muted">{order.orderNumber}</p><h1 className="display-type mt-3 text-5xl leading-none">{order.snapshot.title}</h1><p className="mt-3 text-sm text-muted">Created {formatDate(order.createdAt)}</p>
          {error && <div role="alert" className="mt-6 rounded-[14px] bg-coral/10 p-4 text-sm font-bold text-[#A23328]">{error}</div>}
          <section className="notice-slip mt-8 p-6"><h2 className="text-sm font-extrabold">Order progress</h2><ol className="mt-5 space-y-5">{order.transitions.map((entry, index) => <li key={`${entry.at}-${index}`} className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime text-ink"><Check className="h-4 w-4" /></span><span><strong className="block text-sm">{statusCopy[entry.to] || entry.to.replaceAll('_', ' ')}</strong><span className="mt-1 block text-xs text-muted">{formatDate(entry.at)}</span>{entry.reason && <span className="mt-1 block text-sm text-muted">{entry.reason}</span>}</span></li>)}</ol></section>
          <section className="mt-7"><h2 className="text-sm font-extrabold">Fulfilment</h2><p className="mt-2 text-sm capitalize text-muted">{order.fulfilmentMethod.replaceAll('_', ' ')}</p><p className="mt-4 max-w-2xl text-sm leading-6 text-muted">{order.snapshot.description}</p></section>
        </main>
        <aside className="h-fit rounded-[14px] bg-ink p-6 text-paper shadow-card-hover">
          <div className="flex items-center gap-2 text-lime"><ShieldCheck className="h-5 w-5" /><span className="text-xs font-extrabold">KOBO PROTECTED PAYMENT</span></div><p className="mt-5 text-sm text-paper/75">Current status</p><h2 className="mt-1 text-xl font-extrabold">{statusCopy[order.status] || order.status}</h2>
          <div className="mt-6 space-y-3 border-y border-paper/15 py-5 text-sm"><div className="flex justify-between"><span className="text-paper/75">Item</span><strong>{formatMinor(order.itemAmountMinor)}</strong></div><div className="flex justify-between"><span className="text-paper/75">KOBO fee</span><strong>{formatMinor(order.platformFeeMinor)}</strong></div><div className="flex justify-between text-base"><span className="font-extrabold">Total</span><strong className="text-lime">{formatMinor(order.totalMinor)}</strong></div></div>
          <div className="mt-6 space-y-3">
            {isBuyer && order.status === 'pending_payment' && <div className="space-y-3 rounded-[12px] border border-paper/15 p-3"><label className="block"><span className="mb-1 block text-xs font-bold text-paper/75">Mobile money network</span><select value={payment.network} onChange={(event) => setPayment({ ...payment, network: event.target.value })} className="input-field text-ink"><option value="MTN">MTN MoMo</option><option value="AT">AT Money</option><option value="TELECEL">Telecel Cash</option></select></label><label className="block"><span className="mb-1 block text-xs font-bold text-paper/75">Payment phone</span><input required value={payment.phone} onChange={(event) => setPayment({ ...payment, phone: event.target.value })} placeholder="0240000000" className="input-field text-ink" /></label>{order.payment?.status === 'otp_required' && <label className="block"><span className="mb-1 block text-xs font-bold text-paper/75">Moolre verification code</span><input inputMode="numeric" value={payment.otpCode} onChange={(event) => setPayment({ ...payment, otpCode: event.target.value.replace(/\D/g, '').slice(0, 8) })} className="input-field text-ink" /></label>}<button onClick={pay} disabled={busy || !payment.phone} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-lime px-5 font-extrabold text-ink">{busy ? 'Sending requestâ€¦' : <><Smartphone className="h-4 w-4" />Pay with Moolre</>}</button>{order.payment?.reference && <button onClick={checkPayment} disabled={busy} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-paper/20 px-5 text-sm font-bold"><RefreshCw className="h-4 w-4" />Check payment</button>}{paymentNotice && <p role="status" className="text-xs leading-5 text-lime">{paymentNotice}</p>}</div>}
            {isSeller && order.status === 'paid' && <button onClick={() => changeStatus('accept')} disabled={busy} className="btn-primary w-full">Accept order</button>}{isSeller && order.status === 'accepted' && <button onClick={() => changeStatus('mark_fulfilled')} disabled={busy} className="btn-primary w-full">Mark fulfilled</button>}{isBuyer && order.status === 'fulfilled' && <button onClick={() => changeStatus('confirm_complete')} disabled={busy} className="inline-flex min-h-11 w-full items-center justify-center rounded-[14px] bg-lime px-5 font-extrabold text-ink">Confirm received</button>}{isBuyer && order.status === 'completed' && <button onClick={() => setShowReview(true)} className="btn-secondary w-full">Leave a review</button>}{['paid', 'accepted', 'fulfilled'].includes(order.status) && <button onClick={() => setShowDispute(true)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] text-sm font-bold text-[#FF9B8F] hover:bg-white/5"><AlertTriangle className="h-4 w-4" />Open a dispute</button>}<button onClick={load} className="inline-flex min-h-11 w-full items-center justify-center gap-2 text-sm font-bold text-paper/75 hover:text-paper"><RefreshCw className="h-4 w-4" />Refresh order</button>
          </div>
        </aside>
      </div>
      {showReview && <div className="notice-slip mt-8 p-6"><h2 className="display-type text-3xl">Review this order</h2><form onSubmit={submitReview} className="mt-5 max-w-xl space-y-4"><label className="block"><span className="mb-2 block text-sm font-extrabold">Rating</span><select value={review.rating} onChange={(event) => setReview({ ...review, rating: Number(event.target.value) })} className="input-field">{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} out of 5</option>)}</select></label><label className="block"><span className="mb-2 block text-sm font-extrabold">Comment</span><textarea value={review.comment} onChange={(event) => setReview({ ...review, comment: event.target.value })} className="input-field" rows="4" /></label><div className="flex gap-3"><button className="btn-primary" disabled={busy}>Submit review</button><button type="button" onClick={() => setShowReview(false)} className="btn-secondary">Cancel</button></div></form></div>}
      {showDispute && <div className="notice-slip mt-8 p-6"><h2 className="display-type text-3xl">Open a dispute</h2><p className="mt-2 text-sm text-muted">Explain what happened. KOBO will hold the order funds while an administrator reviews it.</p><form onSubmit={submitDispute} className="mt-5 max-w-xl space-y-4"><label className="block"><span className="mb-2 block text-sm font-extrabold">What went wrong?</span><textarea required minLength="10" value={reason} onChange={(event) => setReason(event.target.value)} className="input-field" rows="5" /></label><div className="flex gap-3"><button className="btn-primary" disabled={busy}>Open dispute</button><button type="button" onClick={() => setShowDispute(false)} className="btn-secondary">Cancel</button></div></form></div>}
    </div>
  );
}
