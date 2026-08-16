import { useEffect, useState } from 'react';
import { ArrowRight, PackageCheck, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import { formatDate, formatMinor } from '../utils/helpers';

const statusCopy = { pending_payment: 'Payment needed', paid: 'Paid', accepted: 'Accepted', fulfilled: 'Ready to confirm', completed: 'Completed', disputed: 'In dispute', cancelled: 'Cancelled', refund_pending: 'Refund pending', refunded: 'Refunded' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = () => { setLoading(true); setError(false); api.get('/v1/orders').then((response) => setOrders(response.data.orders || [])).catch(() => setError(true)).finally(() => setLoading(false)); };
  useEffect(load, []);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 md:px-8 md:py-12"><div className="flex items-end justify-between gap-5"><div><h1 className="display-type text-5xl leading-none md:text-6xl">Orders</h1><p className="mt-3 text-sm text-muted">Track payments, fulfilment, and the next action for every order.</p></div><Link to="/marketplace" className="btn-secondary hidden sm:inline-flex">Browse items</Link></div>{error ? <div className="notice-slip mt-8 p-7"><h2 className="font-extrabold">We couldnâ€™t load your orders.</h2><button onClick={load} className="btn-primary mt-4">Try again</button></div> : loading ? <div className="mt-8 space-y-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-[14px] bg-ink/10" />)}</div> : orders.length === 0 ? <div className="notice-slip mt-8 flex min-h-80 flex-col items-center justify-center p-8 text-center"><ShoppingBag className="h-10 w-10 text-ink/35" /><h2 className="display-type mt-5 text-3xl">No orders yet</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted">When you buy or sell through KOBO, the order and its next step will appear here.</p><Link to="/marketplace" className="btn-primary mt-5">Browse marketplace</Link></div> : <div className="mt-8 space-y-3">{orders.map((order) => <Link key={order._id} to={`/orders/${order._id}`} className="notice-slip group flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-card-hover"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] bg-lime"><PackageCheck className="h-6 w-6" /></span><span className="min-w-0 flex-1"><span className="block truncate font-extrabold">{order.snapshot.title}</span><span className="mt-1 block text-xs text-muted">{order.orderNumber} Â· {formatDate(order.createdAt)}</span><span className="mt-2 inline-flex rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-extrabold text-ink/65">{statusCopy[order.status] || order.status}</span></span><span className="text-right"><strong className="block text-cobalt">{formatMinor(order.totalMinor)}</strong><ArrowRight className="ml-auto mt-3 h-4 w-4 text-ink/35 transition group-hover:translate-x-1" /></span></Link>)}</div>}</div>
  );
}
