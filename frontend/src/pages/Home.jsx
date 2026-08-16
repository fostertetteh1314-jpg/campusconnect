import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BedDouble, BookOpen, Box, Calculator, ChevronRight, MapPin, Search, Smartphone, Wrench } from 'lucide-react';
import api from '../api';
import ProductCard from '../components/ProductCard';
import ServiceCard from '../components/ServiceCard';

const categories = [
  { name: 'Products', description: 'Electronics, furniture and everyday items', icon: Box, to: '/marketplace', tone: 'bg-cobalt text-white' },
  { name: 'Services', description: 'Repairs, design, delivery and more', icon: Wrench, to: '/services', tone: 'bg-lime text-ink' },
  { name: 'Textbooks', description: 'Course books, notes and study guides', icon: BookOpen, to: '/marketplace?category=Textbooks', tone: 'bg-cobalt text-white' },
  { name: 'Calculators', description: 'Scientific and graphing calculators', icon: Calculator, to: '/marketplace?category=Calculators', tone: 'bg-mango text-ink' },
  { name: 'Phones', description: 'Phones and accessories', icon: Smartphone, to: '/marketplace?category=Phones', tone: 'bg-cobalt text-white' },
  { name: 'Hostel items', description: 'Furniture and room essentials', icon: BedDouble, to: '/marketplace?category=Hostel%20Items', tone: 'bg-lime text-ink' },
];

const emptyFeed = { items: [], loading: true, error: false };
const LoadingSlip = ({ compact = false }) => <div className={`${compact ? 'h-24' : 'h-64'} animate-pulse rounded-[14px] bg-ink/10`} aria-hidden="true" />;

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [listingFeed, setListingFeed] = useState(emptyFeed);
  const [serviceFeed, setServiceFeed] = useState(emptyFeed);

  const loadListings = () => {
    setListingFeed((current) => ({ ...current, loading: true, error: false }));
    api.get('/listings?limit=4')
      .then((response) => setListingFeed({ items: response.data.listings || [], loading: false, error: false }))
      .catch(() => setListingFeed((current) => ({ ...current, loading: false, error: true })));
  };
  const loadServices = () => {
    setServiceFeed((current) => ({ ...current, loading: true, error: false }));
    api.get('/services?limit=4')
      .then((response) => setServiceFeed({ items: response.data.services || [], loading: false, error: false }))
      .catch(() => setServiceFeed((current) => ({ ...current, loading: false, error: true })));
  };

  useEffect(() => { loadListings(); loadServices(); }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/marketplace?search=${encodeURIComponent(value)}` : '/marketplace');
  };

  return (
    <div className="pb-8 md:pb-0">
      <section className="bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-7 sm:px-6 sm:py-10 md:min-h-[500px] md:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] md:items-center md:px-8 md:py-14">
          <div className="min-w-0">
            <p className="mb-3 inline-flex rounded-full bg-lime px-3 py-1 text-xs font-extrabold text-ink md:hidden">Find am. Pay safe.</p>
            <h1 className="display-type max-w-3xl text-[3.15rem] leading-[.82] sm:text-7xl lg:text-[5.5rem]">Find what<br />campus has.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-paper/80 sm:mt-5 sm:text-lg sm:leading-7">Search products and services around UCC, talk in-app, and keep every next step clear.</p>
            <form onSubmit={handleSearch} role="search" className="mt-5 flex max-w-2xl items-center rounded-[14px] bg-paper-bright p-2 shadow-[0_18px_40px_-24px_rgba(0,0,0,.8)] sm:mt-7">
              <Search className="ml-2 h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
              <label htmlFor="home-search" className="sr-only">Search products and services</label>
              <input id="home-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products and services" className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-ink placeholder:text-muted focus:outline-none" />
              <button type="submit" className="btn-primary shrink-0 px-4" aria-label="Search"><span className="hidden sm:inline">Search</span><ArrowRight className="h-4 w-4" /></button>
            </form>
            <div className="mt-4 flex gap-3 sm:mt-5"><Link to="/marketplace" className="btn-secondary">Browse marketplace</Link><Link to="/listings/new" className="hidden min-h-11 items-center justify-center rounded-[14px] bg-lime px-5 font-extrabold text-ink transition hover:bg-[#d7fa59] sm:inline-flex">Post a listing</Link></div>
          </div>

          <div className="hidden md:grid md:grid-cols-2 md:gap-3" aria-label="Ways to use KOBO">
            {categories.slice(0, 4).map(({ name, description, icon: Icon, to, tone }, index) => (
              <Link key={name} to={to} className={`group min-h-44 rounded-[14px] p-5 shadow-card transition hover:-translate-y-1 ${tone} ${index === 0 ? 'md:translate-y-7' : ''}`}>
                <Icon className="h-7 w-7" strokeWidth={1.8} aria-hidden="true" /><h2 className="display-type mt-8 text-3xl leading-none">{name}</h2><p className="mt-2 text-sm leading-5 opacity-80">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div aria-label="KOBO currently serves the UCC campus area" className="sticky top-16 z-30 bg-lime text-ink shadow-[0_8px_20px_-14px_rgba(30,33,28,.7)] md:top-[72px]">
        <div className="no-scrollbar mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-3 sm:px-6 md:px-8">
          <span className="flex shrink-0 items-center gap-2 font-extrabold"><MapPin className="h-5 w-5" aria-hidden="true" />Around UCC</span><span className="h-6 w-px shrink-0 bg-ink/25" />
          {['Main campus', 'Amamoma', 'Oguaa', 'Adisadel', 'Valco'].map((place) => <span key={place} className="shrink-0 text-sm font-semibold text-ink/75">{place}</span>)}
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 md:px-8 md:py-14 lg:grid-cols-[minmax(260px,.72fr)_minmax(0,1.28fr)] lg:items-start">
        <aside>
          <h2 className="section-title mb-4">Pick a lane</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {categories.map(({ name, description, icon: Icon, to, tone }) => (
              <Link key={name} to={to} className="notice-slip group flex min-h-24 items-stretch overflow-hidden transition hover:-translate-y-0.5 hover:shadow-card-hover">
                <span className={`flex w-20 shrink-0 items-center justify-center ${tone}`}><Icon className="h-7 w-7" strokeWidth={1.8} aria-hidden="true" /></span>
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2 px-4 py-3 pr-6"><span><strong className="display-type block text-2xl leading-none">{name}</strong><span className="mt-1 block text-xs leading-5 text-muted">{description}</span></span><ChevronRight className="h-5 w-5 shrink-0 text-cobalt transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </aside>

        <div className="min-w-0 space-y-12">
          <section>
            <div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="section-title">Recent near you</h2><p className="mt-2 text-sm text-muted">New product listings around campus.</p></div><Link to="/marketplace" className="btn-ghost hidden sm:inline-flex">View all<ArrowRight className="h-4 w-4" /></Link></div>
            {listingFeed.error ? <FeedError label="nearby listings" onRetry={loadListings} /> : listingFeed.loading ? <div className="grid grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, index) => <LoadingSlip key={index} />)}</div> : listingFeed.items.length === 0 ? (
              <div className="notice-slip flex flex-col items-start justify-between gap-5 p-7 sm:flex-row sm:items-center"><div><h3 className="display-type text-3xl">No listings yet</h3><p className="mt-2 text-sm text-muted">Post the first item for students nearby to find.</p></div><Link to="/listings/new" className="btn-primary shrink-0">Post a listing</Link></div>
            ) : <div className="grid grid-cols-2 gap-3">{listingFeed.items.map((listing) => <ProductCard key={listing._id} listing={listing} />)}</div>}
          </section>

          <section>
            <div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="section-title">Services on campus</h2><p className="mt-2 text-sm text-muted">Find practical help or offer what you can do.</p></div><Link to="/services" className="btn-ghost hidden sm:inline-flex">View all<ArrowRight className="h-4 w-4" /></Link></div>
            {serviceFeed.error ? <FeedError label="campus services" onRetry={loadServices} /> : serviceFeed.loading ? <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <LoadingSlip key={index} compact />)}</div> : serviceFeed.items.length === 0 ? (
              <div className="notice-slip flex flex-col items-start justify-between gap-5 bg-mango p-7 sm:flex-row sm:items-center"><div><h3 className="display-type text-3xl">Offer a service</h3><p className="mt-2 text-sm text-ink/75">Let others know what you can do.</p></div><Link to="/services/new" className="inline-flex min-h-11 items-center justify-center rounded-[14px] bg-ink px-5 font-bold text-paper">Create a service</Link></div>
            ) : <div className="grid gap-3 sm:grid-cols-2">{serviceFeed.items.map((service) => <ServiceCard key={service._id} service={service} />)}</div>}
          </section>
        </div>
      </section>
    </div>
  );
}

function FeedError({ label, onRetry }) {
  return <div className="notice-slip p-7"><h3 className="font-bold">We couldn’t load {label}.</h3><p className="mt-1 text-sm text-muted">Check your connection and try again.</p><button onClick={onRetry} className="btn-primary mt-4">Try again</button></div>;
}
