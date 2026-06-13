import { useState, useEffect } from 'react';
import api from '../../api';
import { formatPrice, formatDate } from '../../utils/helpers';

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/listings').then((r) => setListings(r.data)).finally(() => setLoading(false));
  }, []);

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing permanently?')) return;
    await api.delete(`/admin/listings/${id}`);
    setListings((prev) => prev.filter((l) => l._id !== id));
  };

  const filtered = listings.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.sellerId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Listings ({listings.length})</h1>

      <div className="mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search listings..." className="input-field max-w-sm" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Listing</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Seller</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(6)].map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-8 bg-gray-100 animate-pulse rounded" /></td></tr>)
            ) : filtered.map((l) => (
              <tr key={l._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 max-w-[200px] truncate">{l.title}</p>
                      <p className="text-xs text-gray-400">{l.category} · {l.condition}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{l.sellerId?.name || '—'}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(l.price)}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(l.createdAt)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteListing(l._id)} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-semibold transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
