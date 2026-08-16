import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = () => {
    setLoading(true);
    api.get('/favorites').then((response) => setFavorites(response.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchFavorites(); }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-cobalt">Your shortlist</p>
      <h1 className="section-title mb-7 text-4xl sm:text-5xl">Saved for later</h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-label="Loading saved listings">
          {[...Array(4)].map((_, index) => <div key={index} className="card h-64 animate-pulse bg-ink/10" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="notice-slip mx-auto max-w-xl px-6 py-14 text-center">
          <Heart aria-hidden="true" className="mx-auto mb-4 h-10 w-10 text-coral" />
          <h2 className="font-display text-2xl font-extrabold uppercase">Nothing tucked away yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">Save interesting listings while you compare prices, then come back when you are ready.</p>
          <Link to="/marketplace" className="btn-primary mt-6">Browse the market</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {favorites.map((favorite) => favorite.listingId && <ProductCard key={favorite._id} listing={{ ...favorite.listingId, favorited: true }} onFavoriteChange={fetchFavorites} />)}
        </div>
      )}
    </main>
  );
}
