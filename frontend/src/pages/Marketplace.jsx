import { useCallback, useEffect, useState } from 'react';
import { PackageOpen, Search, SlidersHorizontal, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { CONDITIONS, LISTING_CATEGORIES } from '../utils/helpers';

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const condition = searchParams.get('condition') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const [localSearch, setLocalSearch] = useState(search);
  const hasFilters = Boolean(search || category || condition || minPrice || maxPrice);

  const fetchListings = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const params = { page, limit: 12, ...(search && { search }), ...(category && { category }), ...(condition && { condition }), ...(minPrice && { minPrice }), ...(maxPrice && { maxPrice }) };
      const response = await api.get('/listings', { params });
      setListings(response.data.listings || []); setTotal(response.data.total || 0); setPages(response.data.pages || 1);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [search, category, condition, minPrice, maxPrice, page]);

  useEffect(() => { fetchListings(); }, [fetchListings]);
  useEffect(() => { setLocalSearch(search); }, [search]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };
  const clearFilters = () => { setLocalSearch(''); setSearchParams({}); };

  const Filters = () => (
    <div className="space-y-7">
      <div><h2 className="text-sm font-extrabold">Category</h2><div className="mt-3 flex flex-wrap gap-2 lg:flex-col">
        <button onClick={() => setParam('category', '')} className={`min-h-11 rounded-[12px] px-3 text-left text-sm font-bold ${!category ? 'bg-ink text-paper' : 'bg-paper-bright text-ink/65 hover:text-ink'}`}>All categories</button>
        {LISTING_CATEGORIES.map((value) => <button key={value} onClick={() => setParam('category', value)} className={`min-h-11 rounded-[12px] px-3 text-left text-sm font-bold ${category === value ? 'bg-ink text-paper' : 'bg-paper-bright text-ink/65 hover:text-ink'}`}>{value}</button>)}
      </div></div>
      <div><h2 className="text-sm font-extrabold">Condition</h2><div className="mt-3 flex flex-wrap gap-2 lg:flex-col">
        <button onClick={() => setParam('condition', '')} className={`min-h-11 rounded-[12px] px-3 text-left text-sm font-bold ${!condition ? 'bg-lime text-ink' : 'bg-paper-bright text-ink/65'}`}>Any condition</button>
        {CONDITIONS.map((value) => <button key={value} onClick={() => setParam('condition', value)} className={`min-h-11 rounded-[12px] px-3 text-left text-sm font-bold ${condition === value ? 'bg-lime text-ink' : 'bg-paper-bright text-ink/65'}`}>{value}</button>)}
      </div></div>
      <div><h2 className="text-sm font-extrabold">Price in GHâ‚µ</h2><div className="mt-3 grid grid-cols-2 gap-2"><label><span className="sr-only">Minimum price</span><input type="number" min="0" inputMode="decimal" placeholder="Min" value={minPrice} onChange={(event) => setParam('minPrice', event.target.value)} className="input-field" /></label><label><span className="sr-only">Maximum price</span><input type="number" min="0" inputMode="decimal" placeholder="Max" value={maxPrice} onChange={(event) => setParam('maxPrice', event.target.value)} className="input-field" /></label></div></div>
      {hasFilters && <button onClick={clearFilters} className="inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-coral"><X className="h-4 w-4" />Clear filters</button>}
    </div>
  );

  return (
    <div className="min-h-screen">
      <section className="bg-ink text-paper"><div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 md:px-8 md:py-12"><h1 className="display-type text-5xl leading-none md:text-7xl">Marketplace</h1><p className="mt-3 max-w-xl text-sm leading-6 text-paper/65 sm:text-base">Browse items around campus. Use search and filters to narrow the board.</p><form onSubmit={(event) => { event.preventDefault(); setParam('search', localSearch.trim()); }} role="search" className="mt-6 flex max-w-2xl items-center rounded-[14px] bg-paper-bright p-2"><Search className="ml-2 h-5 w-5 text-muted" /><label htmlFor="market-search" className="sr-only">Search marketplace</label><input id="market-search" value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder="Search items" className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-ink placeholder:text-muted focus:outline-none" /><button className="btn-primary px-4">Search</button></form></div></section>
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 md:px-8 md:py-10">
        <div className="mb-6 flex items-center justify-between gap-4"><p aria-live="polite" className="text-sm font-semibold text-muted">{loading ? 'Loading itemsâ€¦' : `${total} item${total === 1 ? '' : 's'}`}</p><button onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen} className="btn-secondary px-4 lg:hidden"><SlidersHorizontal className="h-4 w-4" />Filters</button></div>
        {filtersOpen && <aside className="notice-slip mb-6 p-5 lg:hidden"><Filters /></aside>}
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]"><aside className="hidden lg:block"><Filters /></aside><main>
          {error ? <div className="notice-slip p-8"><h2 className="text-lg font-extrabold">We couldnâ€™t load the marketplace.</h2><p className="mt-2 text-sm text-muted">Check your connection and try again.</p><button onClick={fetchListings} className="btn-primary mt-5">Try again</button></div> : loading ? <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-[14px] bg-ink/10" />)}</div> : listings.length === 0 ? <div className="notice-slip flex min-h-80 flex-col items-center justify-center p-8 text-center"><PackageOpen className="h-10 w-10 text-ink/35" /><h2 className="display-type mt-5 text-3xl">No items found</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted">Try a different search or clear the filters. You can also post the first matching listing.</p><div className="mt-5 flex flex-wrap justify-center gap-3">{hasFilters && <button onClick={clearFilters} className="btn-secondary">Clear filters</button>}<Link to="/listings/new" className="btn-primary">Post a listing</Link></div></div> : <><div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">{listings.map((listing) => <ProductCard key={listing._id} listing={listing} onFavoriteChange={fetchListings} />)}</div>{pages > 1 && <nav aria-label="Pagination" className="mt-9 flex flex-wrap justify-center gap-2">{Array.from({ length: pages }).map((_, index) => <button key={index} onClick={() => setParam('page', String(index + 1))} aria-current={page === index + 1 ? 'page' : undefined} className={`h-11 min-w-11 rounded-[12px] text-sm font-extrabold ${page === index + 1 ? 'bg-ink text-paper' : 'bg-paper-bright text-ink shadow-card'}`}>{index + 1}</button>)}</nav>}</>}
        </main></div>
      </div>
    </div>
  );
}
