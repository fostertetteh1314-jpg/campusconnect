import { useEffect, useState } from 'react';
import { MessageCircle, ShieldCheck, Wrench } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatPrice, getInitials } from '../utils/helpers';
import BackButton from '../components/BackButton';

export default function ServiceDetails() {
  const { id } = useParams(); const { user } = useAuth(); const navigate = useNavigate(); const [service, setService] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get(`/services/${id}`).then((response) => setService(response.data)).catch(() => navigate('/services')).finally(() => setLoading(false)); }, [id, navigate]);
  if (loading) return <div className="mx-auto max-w-4xl px-4 py-16"><div className="h-96 animate-pulse rounded-[14px] bg-ink/10" /></div>;
  if (!service) return null;
  const provider = service.providerId; const isOwner = String(user?._id) === String(provider?._id);
  return <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8 md:py-12"><BackButton label="Back to services" to="/services" /><article className="notice-slip mt-4 overflow-hidden"><header className="bg-mango p-6 md:p-9"><span className="badge bg-ink text-paper">{service.category}</span><h1 className="mt-5 text-3xl font-extrabold leading-tight md:text-5xl">{service.title}</h1><p className="mt-4 text-3xl font-extrabold text-ink">From {formatPrice(service.price)}</p><p className="mt-3 text-xs text-muted">Posted {formatDate(service.createdAt)}</p></header><div className="p-6 md:p-9"><h2 className="text-sm font-extrabold">About this service</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink/65">{service.description}</p>{provider && <section className="mt-8 flex items-center gap-4 border-t border-ink/10 pt-6"><span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[13px] bg-ink text-sm font-extrabold text-paper">{provider.profileImage ? <img src={provider.profileImage} alt="" className="h-full w-full object-cover" /> : getInitials(provider.name)}</span><div><p className="text-xs font-bold text-muted">PROVIDER</p><p className="mt-1 font-extrabold">{provider.name}</p><div className="mt-1 flex items-center gap-1.5 text-xs text-muted">{provider.phoneVerifiedAt && <ShieldCheck className="h-3.5 w-3.5 text-cobalt" />}{provider.phoneVerifiedAt ? 'Phone verified' : 'Verification pending'}</div></div></section>}{!isOwner ? <div className="mt-8 grid gap-3 sm:grid-cols-2">{user ? <Link to={`/checkout/service/${id}`} className="btn-primary"><Wrench className="h-4 w-4" />Book with KOBO</Link> : <Link to="/login" className="btn-primary">Sign in to book</Link>}{user && <Link to={`/messages?to=${provider?._id}&contextType=service&contextId=${id}`} className="btn-secondary"><MessageCircle className="h-4 w-4" />Message provider</Link>}</div> : <div className="mt-8 grid gap-3 sm:grid-cols-2"><Link to={`/services/${id}/edit`} className="btn-primary">Edit service</Link><Link to="/dashboard" className="btn-secondary">Dashboard</Link></div>}</div></article></div>;
}
