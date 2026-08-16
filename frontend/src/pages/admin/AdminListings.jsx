import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import api from '../../api';
import { formatDate, formatPrice } from '../../utils/helpers';

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { api.get('/admin/listings').then((response) => setListings(response.data)).finally(() => setLoading(false)); }, []);
  const deleteListing = async (id) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    await api.delete(`/admin/listings/${id}`);
    setListings((current) => current.filter((listing) => listing._id !== id));
  };
  const query = search.toLowerCase();
  const filtered = listings.filter((listing) => listing.title.toLowerCase().includes(query) || listing.sellerId?.name?.toLowerCase().includes(query));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-cobalt">Marketplace operations</p>
      <h1 className="section-title mb-6 text-4xl">Live listings <span className="text-cobalt">{listings.length}</span></h1>
      <label htmlFor="listing-search" className="sr-only">Search listings</label>
      <input id="listing-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search listing or seller" className="input-field mb-4 max-w-sm" />

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-ink/10 bg-paper"><tr>{['Listing', 'Seller', 'Price', 'Date', 'Actions'].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-muted">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-ink/10">
            {loading ? [...Array(6)].map((_, index) => <tr key={index}><td colSpan={5} className="px-4 py-3"><div className="h-10 animate-pulse rounded-[10px] bg-ink/10" /></td></tr>) : filtered.map((listing) => (
              <tr key={listing._id} className="hover:bg-paper">
                <td className="px-4 py-3"><div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-ink/5">{listing.images?.[0] ? <img src={listing.images[0]} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-ink/35" />}</div>
                  <div><p className="max-w-[220px] truncate font-bold">{listing.title}</p><p className="text-xs text-muted">{listing.category} Â· {listing.condition}</p></div>
                </div></td>
                <td className="px-4 py-3 text-muted">{listing.sellerId?.name || 'â€”'}</td>
                <td className="px-4 py-3 font-bold">{formatPrice(listing.price)}</td>
                <td className="px-4 py-3 text-muted">{formatDate(listing.createdAt)}</td>
                <td className="px-4 py-3"><button onClick={() => deleteListing(listing._id)} className="min-h-9 rounded-[10px] bg-coral/10 px-3 text-xs font-bold text-coral hover:bg-coral/20">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
