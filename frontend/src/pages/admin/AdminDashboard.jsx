import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data));
  }, []);

  const cards = stats ? [
    { label: 'Total Users', value: stats.users, icon: '👥', link: '/admin/users', color: 'bg-blue-50 text-blue-700' },
    { label: 'Listings', value: stats.listings, icon: '📦', link: '/admin/listings', color: 'bg-green-50 text-green-700' },
    { label: 'Services', value: stats.services, icon: '🛠️', link: '/admin/listings', color: 'bg-purple-50 text-purple-700' },
    { label: 'Pending Reports', value: stats.pendingReports, icon: '🚨', link: '/admin/reports', color: 'bg-red-50 text-red-700' },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage CampusConnect</p>

      {!stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card p-6 h-28 animate-pulse bg-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {cards.map((c) => (
            <Link key={c.label} to={c.link} className="card p-5 hover:shadow-md transition-shadow">
              <p className="text-3xl mb-2">{c.icon}</p>
              <p className={`text-2xl font-bold ${c.color.split(' ')[1]}`}>{c.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{c.label}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Manage Users', desc: 'View, ban, and manage student accounts', link: '/admin/users', icon: '👥' },
          { label: 'Manage Listings', desc: 'Review and remove inappropriate listings', link: '/admin/listings', icon: '📦' },
          { label: 'Reports', desc: 'Review pending reports from students', link: '/admin/reports', icon: '🚨' },
        ].map((item) => (
          <Link key={item.label} to={item.link} className="card p-5 hover:shadow-md transition-shadow group">
            <p className="text-2xl mb-2">{item.icon}</p>
            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{item.label}</p>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
