import { useState } from 'react';
import { Heart, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, formatRelativeTime, getInitials } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const conditionColors = {
  New: 'bg-lime text-ink',
  'Like New': 'bg-cobalt text-white',
  Good: 'bg-mango text-ink',
  Fair: 'bg-[#F5D7A6] text-ink',
  Poor: 'bg-coral text-white',
};

export default function ProductCard({ listing, onFavoriteChange }) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(Boolean(listing.favorited));
  const [toggling, setToggling] = useState(false);

  const handleFavorite = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user || toggling) return;
    setToggling(true);
    try {
      const response = await api.post('/favorites', { listingId: listing._id });
      setFavorited(response.data.favorited);
      onFavoriteChange?.();
    } finally { setToggling(false); }
  };

  return (
    <Link to={`/listings/${listing._id}`} className="card-hover group flex min-w-0 flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-ink/30"><ImageIcon className="h-8 w-8" strokeWidth={1.6} /><span className="text-xs font-semibold">No image</span></div>
        )}
        {listing.condition && <span className={`badge absolute left-2.5 top-2.5 ${conditionColors[listing.condition] || 'bg-paper-bright text-ink'}`}>{listing.condition}</span>}
        {user && <button type="button" onClick={handleFavorite} disabled={toggling} aria-label={favorited ? `Remove ${listing.title} from saved items` : `Save ${listing.title}`} className={`absolute right-2.5 top-2.5 flex h-11 w-11 items-center justify-center rounded-full shadow-card transition ${favorited ? 'bg-coral text-white' : 'bg-paper-bright text-muted hover:text-coral'}`}><Heart className="h-5 w-5" fill={favorited ? 'currentColor' : 'none'} /></button>}
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-ink sm:text-base">{listing.title}</h3>
        <p className="mt-2 text-base font-extrabold text-cobalt sm:text-lg">{formatPrice(listing.price)}</p>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-ink/10 pt-3 text-[11px] text-muted">
          <span className="truncate font-semibold">{listing.category}</span>
          <span className="shrink-0">{formatRelativeTime(listing.createdAt)}</span>
        </div>
        {listing.sellerId && <div className="mt-3 flex items-center gap-2"><span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-[9px] font-extrabold text-paper">{listing.sellerId.profileImage ? <img src={listing.sellerId.profileImage} alt="" className="h-full w-full object-cover" /> : getInitials(listing.sellerId.name)}</span><span className="truncate text-xs font-semibold text-muted">{listing.sellerId.name}</span></div>}
      </div>
    </Link>
  );
}
