import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import ServiceCard from '../components/ServiceCard';

const categories = [
  { name: 'Textbooks', emoji: '📚', color: 'from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400' },
  { name: 'Calculators', emoji: '🔢', color: 'from-purple-50 to-purple-100 border-purple-200 hover:border-purple-400' },
  { name: 'Laptops', emoji: '💻', color: 'from-indigo-50 to-indigo-100 border-indigo-200 hover:border-indigo-400' },
  { name: 'Phones', emoji: '📱', color: 'from-pink-50 to-pink-100 border-pink-200 hover:border-pink-400' },
  { name: 'Hostel Items', emoji: '🛏️', color: 'from-amber-50 to-amber-100 border-amber-200 hover:border-amber-400' },
  { name: 'Furniture', emoji: '🪑', color: 'from-green-50 to-green-100 border-green-200 hover:border-green-400' },
  { name: 'Other', emoji: '📦', color: 'from-slate-50 to-slate-100 border-slate-200 hover:border-slate-400' },
];

export default function Home() {
  const [listings, setListings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/listings?limit=4'), api.get('/services?limit=4')])
      .then(([l, s]) => { setListings(l.data.listings); setServices(s.data.services); })
      .finally(() => setLoading(false));
  }, []);

  const Skeleton = ({ className }) => <div className={`animate-pulse bg-slate-200 rounded-2xl ${className}`} />;

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-blue-100 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/20">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              UCC Students Marketplace
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">
              Buy, sell &<br />
              <span className="text-blue-200">hustle</span> on campus
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-8 leading-relaxed">
              The marketplace built for UCC students. Get textbooks, hostel items, and find skilled classmates for your projects.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/marketplace" className="bg-white text-blue-700 font-bold py-3.5 px-7 rounded-2xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Browse Marketplace
              </Link>
              <Link to="/register" className="border-2 border-white/30 backdrop-blur-sm text-white font-bold py-3.5 px-7 rounded-2xl hover:bg-white/10 transition-all duration-200">
                Join Free →
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 0C480 0 240 60 0 30L0 60Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Items Listed', value: '500+', icon: '📦' },
              { label: 'Active Students', value: '200+', icon: '🎓' },
              { label: 'Services Offered', value: '50+', icon: '🛠️' },
            ].map((s) => (
              <div key={s.label} className="card p-5 text-center hover:shadow-md transition-shadow">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-2xl md:text-3xl font-black text-blue-600">{s.value}</p>
                <p className="text-sm text-slate-500 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Browse by Category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((cat) => (
            <Link key={cat.name} to={`/marketplace?category=${encodeURIComponent(cat.name)}`}
              className={`bg-gradient-to-b ${cat.color} border rounded-2xl p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md group`}>
              <span className="text-3xl">{cat.emoji}</span>
              <p className="text-xs font-semibold text-gray-700 mt-2 group-hover:text-blue-700 transition-colors leading-tight">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Recent Listings</h2>
          <Link to="/marketplace" className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
            View all <span>→</span>
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-slate-400">No listings yet. Be the first to sell!</p>
            <Link to="/listings/new" className="btn-primary mt-4 text-sm">Post a Listing</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {listings.map((l) => <ProductCard key={l._id} listing={l} />)}
          </div>
        )}
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Student Services</h2>
          <Link to="/services" className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
            View all <span>→</span>
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-52" />)}
          </div>
        ) : services.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">🛠️</p>
            <p className="text-slate-400">No services yet. Offer yours!</p>
            <Link to="/services/new" className="btn-primary mt-4 text-sm">Offer a Service</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((s) => <ServiceCard key={s._id} service={s} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-blue-200 text-sm font-semibold mb-2 tracking-widest uppercase">Start Today</p>
          <h2 className="text-3xl md:text-4xl font-black mb-3">Ready to start selling?</h2>
          <p className="text-blue-100 mb-8 text-lg">Post your first listing in under 2 minutes.</p>
          <Link to="/listings/new" className="bg-white text-blue-700 font-bold py-4 px-10 rounded-2xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-block">
            Post a Listing 🚀
          </Link>
        </div>
      </section>
    </div>
  );
}
