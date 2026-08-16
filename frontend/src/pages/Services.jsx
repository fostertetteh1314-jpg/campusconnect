import { useCallback, useEffect, useState } from 'react';
import { Search, Wrench } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import ServiceCard from '../components/ServiceCard';
import { SERVICE_CATEGORIES } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function Services() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const [localSearch, setLocalSearch] = useState(search);

  const setParam = (key, value) => { const next = new URLSearchParams(searchParams); if (value) next.set(key, value); else next.delete(key); if (key !== 'page') next.delete('page'); setSearchParams(next); };
  const fetchServices = useCallback(async () => {
    setLoading(true); setError(false);
    try { const response = await api.get('/services', { params: { page, limit: 12, ...(search && { search }), ...(category && { category }) } }); setServices(response.data.services || []); setTotal(response.data.total || 0); setPages(response.data.pages || 1); }
    catch { setError(true); }
    finally { setLoading(false); }
  }, [search, category, page]);
  useEffect(() => { fetchServices(); }, [fetchServices]);

  return (
    <div className="min-h-screen">
      <section className="bg-mango text-ink"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-8 md:py-14"><div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"><div><h1 className="display-type text-5xl leading-none md:text-7xl">Campus services</h1><p className="mt-3 max-w-xl text-sm leading-6 text-ink/65 sm:text-base">Find practical help nearby, or let the campus know what you can do.</p></div>{user && <Link to="/services/new" className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-ink px-5 font-extrabold text-paper"><Wrench className="h-4 w-4" />Offer a service</Link>}</div></div></section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8 md:py-12">
        <form onSubmit={(event) => { event.preventDefault(); setParam('search', localSearch.trim()); }} role="search" className="flex max-w-2xl items-center rounded-[14px] bg-paper-bright p-2 shadow-card"><Search className="ml-2 h-5 w-5 text-muted" /><label htmlFor="service-search" className="sr-only">Search services</label><input id="service-search" value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder="Search services" className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold placeholder:text-muted focus:outline-none" /><button className="btn-primary px-4">Search</button></form>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2"><button onClick={() => setParam('category', '')} className={`min-h-11 shrink-0 rounded-[12px] px-4 text-sm font-extrabold ${!category ? 'bg-ink text-paper' : 'bg-paper-bright text-ink/65 shadow-card'}`}>All services</button>{SERVICE_CATEGORIES.map((value) => <button key={value} onClick={() => setParam('category', value)} className={`min-h-11 shrink-0 rounded-[12px] px-4 text-sm font-extrabold ${category === value ? 'bg-ink text-paper' : 'bg-paper-bright text-ink/65 shadow-card'}`}>{value}</button>)}</div>
        <p className="mt-8 text-sm font-semibold text-muted" aria-live="polite">{loading ? 'Loading servicesâ€¦' : `${total} service${total === 1 ? '' : 's'}`}</p>
        {error ? <div className="notice-slip mt-5 p-8"><h2 className="text-lg font-extrabold">We couldnâ€™t load services.</h2><p className="mt-2 text-sm text-muted">Check your connection and try again.</p><button onClick={fetchServices} className="btn-primary mt-5">Try again</button></div> : loading ? <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-[14px] bg-ink/10" />)}</div> : services.length === 0 ? <div className="notice-slip mt-5 flex min-h-80 flex-col items-center justify-center p-8 text-center"><Wrench className="h-10 w-10 text-ink/35" /><h2 className="display-type mt-5 text-3xl">No services found</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted">Try another search or offer the first service in this category.</p>{user && <Link to="/services/new" className="btn-primary mt-5">Offer a service</Link>}</div> : <><div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">{services.map((service) => <ServiceCard key={service._id} service={service} />)}</div>{pages > 1 && <nav aria-label="Pagination" className="mt-9 flex justify-center gap-2">{Array.from({ length: pages }).map((_, index) => <button key={index} onClick={() => setParam('page', String(index + 1))} aria-current={page === index + 1 ? 'page' : undefined} className={`h-11 min-w-11 rounded-[12px] text-sm font-extrabold ${page === index + 1 ? 'bg-ink text-paper' : 'bg-paper-bright text-ink shadow-card'}`}>{index + 1}</button>)}</nav>}</>}
      </div>
    </div>
  );
}
