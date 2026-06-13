import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, formatRelativeTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const conditionColors = {
  'New': 'bg-emerald-100 text-emerald-700',
  'Like New': 'bg-blue-100 text-blue-700',
  'Good': 'bg-amber-100 text-amber-700',
  'Fair': 'bg-orange-100 text-orange-700',
  'Poor': 'bg-red-100 text-red-700',
};

export default function ProductCard({ listing, onFavoriteChange }) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(listing.favorited || false);
  const [toggling, setToggling] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setToggling(true);
    try {
      const res = await api.post('/favorites', { listingId: listing._id });
      setFavorited(res.data.favorited);
      onFavoriteChange?.();
    } finally {
      setToggling(false);
    }
  };

  return (
    <Link to={`/listings/${listing._id}`} className="card-hover group flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {user && (
          <button onClick={handleFavorite} disabled={toggling}
            className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-sm transition-all duration-200 ${favorited ? 'bg-red-500 text-white shadow-lg' : 'bg-white/90 text-slate-400 hover:text-red-500 shadow'}`}>
            <svg className="w-4 h-4" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        <span className={`absolute top-2.5 left-2.5 badge ${conditionColors[listing.condition] || 'bg-slate-100 text-slate-600'}`}>
          {listing.condition}
        </span>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">{listing.title}</h3>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-blue-600 font-bold text-base">{formatPrice(listing.price)}</p>
            <span className="text-xs text-slate-400">{formatRelativeTime(listing.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
          <span className="badge bg-slate-100 text-slate-600 text-[10px]">{listing.category}</span>
          {listing.sellerId && (
            <div className="flex items-center gap-1.5">
              {listing.sellerId.profileImage ? (
                <img src={listing.sellerId.profileImage} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[9px] font-bold">
                  {listing.sellerId.name?.[0]}
                </div>
              )}
              <span className="text-xs text-slate-500 max-w-[70px] truncate">{listing.sellerId.name?.split(' ')[0]}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
