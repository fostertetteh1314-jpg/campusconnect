import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, getInitials } from '../utils/helpers';
import BackButton from '../components/BackButton';

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then((r) => setListing(r.data))
      .catch(() => navigate('/marketplace'))
      .finally(() => setLoading(false));
    if (user) api.get(`/favorites/${id}`).then((r) => setFavorited(r.data.favorited)).catch(() => {});
  }, [id, user, navigate]);

  const handleFavorite = async () => {
    if (!user) return navigate('/login');
    setToggling(true);
    try {
      const res = await api.post('/favorites', { listingId: id });
      setFavorited(res.data.favorited);
    } finally { setToggling(false); }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    await api.post('/admin/reports', { targetType: 'listing', targetId: id, reason: reportReason });
    setReporting(false);
    setReportReason('');
    alert('Report submitted. Thank you.');
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  if (!listing) return null;
  const seller = listing.sellerId;
  const isOwner = user?._id === seller?._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton label="Back to Marketplace" to="/marketplace" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden mb-3 shadow-sm">
            {listing.images?.length > 0 ? (
              <img src={listing.images[imgIdx]} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">No image available</span>
              </div>
            )}
          </div>
          {listing.images?.length > 1 && (
            <div className="flex gap-2">
              {listing.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${imgIdx === i ? 'border-blue-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">{listing.title}</h1>
              <button onClick={handleFavorite} disabled={toggling}
                className={`shrink-0 p-2.5 rounded-xl border-2 transition-all duration-200 ${favorited ? 'bg-red-500 border-red-500 text-white shadow-md' : 'border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-400'}`}>
                <svg className="w-5 h-5" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            <p className="text-3xl font-black text-blue-600 mt-3">{formatPrice(listing.price)}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="badge bg-slate-100 text-slate-700">{listing.category}</span>
            <span className="badge bg-emerald-100 text-emerald-700">{listing.condition}</span>
            <span className="badge bg-slate-100 text-slate-500 text-xs">Listed {formatDate(listing.createdAt)}</span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Description</p>
            <p className="text-gray-700 leading-relaxed">{listing.description}</p>
          </div>

          {/* Seller card */}
          {seller && (
            <div className="card p-4 flex items-center gap-4">
              {seller.profileImage ? (
                <img src={seller.profileImage} alt={seller.name} className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-black">
                  {getInitials(seller.name)}
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Seller</p>
                <p className="font-bold text-gray-900">{seller.name}</p>
                {seller.level && <p className="text-sm text-slate-500">Level {seller.level}</p>}
              </div>
            </div>
          )}

          {/* Actions */}
          {!isOwner && (
            <div className="flex gap-3">
              {user ? (
                <Link to={`/messages?to=${seller?._id}&name=${encodeURIComponent(seller?.name || '')}`}
                  className="btn-primary flex-1 py-3.5 text-base">
                  💬 Chat Seller
                </Link>
              ) : (
                <Link to="/login" className="btn-primary flex-1 py-3.5 text-base">Sign in to Chat</Link>
              )}
              {listing.contactNumber && (
                <a href={`tel:${listing.contactNumber}`} className="btn-secondary flex-1 py-3.5 text-base">
                  📞 Call
                </a>
              )}
            </div>
          )}

          {isOwner && (
            <div className="flex gap-3">
              <Link to={`/listings/${id}/edit`} className="btn-primary flex-1 py-3 text-center">Edit Listing</Link>
              <Link to="/dashboard" className="btn-secondary flex-1 py-3 text-center">My Dashboard</Link>
            </div>
          )}

          {user && !isOwner && (
            <button onClick={() => setReporting(true)} className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.193 2.5 1.732 2.5z" />
              </svg>
              Report this listing
            </button>
          )}
        </div>
      </div>

      {/* Report modal */}
      {reporting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-1">Report Listing</h3>
            <p className="text-sm text-slate-500 mb-4">Help keep CampusConnect safe</p>
            <form onSubmit={handleReport} className="space-y-3">
              <textarea required value={reportReason} onChange={(e) => setReportReason(e.target.value)}
                className="input-field" rows={3} placeholder="Describe the issue..." />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Submit Report</button>
                <button type="button" onClick={() => setReporting(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
