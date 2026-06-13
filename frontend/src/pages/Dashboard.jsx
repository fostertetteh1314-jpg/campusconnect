import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatRelativeTime, getInitials } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('listings');

  useEffect(() => {
    Promise.all([api.get('/listings/my'), api.get('/services/my')])
      .then(([l, s]) => { setListings(l.data); setServices(s.data); })
      .finally(() => setLoading(false));
  }, []);

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing?')) return;
    await api.delete(`/listings/${id}`);
    setListings((prev) => prev.filter((l) => l._id !== id));
  };

  const deleteService = async (id) => {
    if (!confirm('Delete this service?')) return;
    await api.delete(`/services/${id}`);
    setServices((prev) => prev.filter((s) => s._id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="card p-6 mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-black">
                {getInitials(user?.name)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-black">{user?.name}</h1>
              <p className="text-blue-200 text-sm mt-0.5">
                {user?.department}{user?.level ? ` · Level ${user.level}` : ''}
              </p>
              <p className="text-blue-100 text-xs mt-1">{user?.email}</p>
            </div>
          </div>
          <Link to="/profile" className="bg-white/20 hover:bg-white/30 backdrop-blur text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-white/20">
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Listings', value: listings.length, icon: '📦', color: 'text-blue-600' },
          { label: 'Services', value: services.length, icon: '🛠️', color: 'text-purple-600' },
          { label: 'Favorites', value: null, icon: '❤️', link: '/favorites' },
          { label: 'Messages', value: null, icon: '💬', link: '/messages' },
        ].map((s) => (
          <div key={s.label} className="card p-4 hover:shadow-md transition-shadow">
            {s.link ? (
              <Link to={s.link} className="block">
                <span className="text-2xl">{s.icon}</span>
                <p className="text-sm font-semibold text-slate-500 mt-1">{s.label} →</p>
              </Link>
            ) : (
              <>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-sm text-slate-500 mt-0.5">{s.icon} {s.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-6">
        <Link to="/listings/new" className="btn-primary text-sm">+ Post Listing</Link>
        <Link to="/services/new" className="btn-secondary text-sm">+ Offer Service</Link>
        <Link to="/marketplace" className="btn-ghost text-sm">Browse Market →</Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5 w-fit">
        {['listings', 'services'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-slate-500 hover:text-gray-700'}`}>
            {t} ({t === 'listings' ? listings.length : services.length})
          </button>
        ))}
      </div>

      {/* Listings tab */}
      {tab === 'listings' && (
        loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card p-4 h-20 animate-pulse bg-slate-100" />)}</div>
        ) : listings.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-5xl mb-3">📦</p>
            <p className="text-slate-500 font-medium">No listings yet</p>
            <Link to="/listings/new" className="btn-primary mt-4 text-sm">Post your first listing</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((l) => (
              <div key={l._id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{l.title}</p>
                  <p className="text-blue-600 font-bold text-sm">{formatPrice(l.price)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{l.category} · {formatRelativeTime(l.createdAt)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to={`/listings/${l._id}`} className="btn-ghost text-xs py-1.5 px-3">View</Link>
                  <Link to={`/listings/${l._id}/edit`} className="btn-secondary text-xs py-1.5 px-3">Edit</Link>
                  <button onClick={() => deleteListing(l._id)} className="text-xs py-1.5 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Services tab */}
      {tab === 'services' && (
        loading ? (
          <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="card p-4 h-20 animate-pulse bg-slate-100" />)}</div>
        ) : services.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-5xl mb-3">🛠️</p>
            <p className="text-slate-500 font-medium">No services yet</p>
            <Link to="/services/new" className="btn-primary mt-4 text-sm">Offer your first service</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((s) => (
              <div key={s._id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl shrink-0">🛠️</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{s.title}</p>
                  <p className="text-blue-600 font-bold text-sm">From {formatPrice(s.price)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.category} · {formatRelativeTime(s.createdAt)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to={`/services/${s._id}`} className="btn-ghost text-xs py-1.5 px-3">View</Link>
                  <Link to={`/services/${s._id}/edit`} className="btn-secondary text-xs py-1.5 px-3">Edit</Link>
                  <button onClick={() => deleteService(s._id)} className="text-xs py-1.5 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
