import { useState, useEffect } from 'react';
import api from '../../api';
import { formatDate } from '../../utils/helpers';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-gray-100 text-gray-600',
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    api.get('/admin/reports').then((r) => setReports(r.data)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    const res = await api.put(`/admin/reports/${id}`, { status });
    setReports((prev) => prev.map((r) => (r._id === id ? res.data : r)));
  };

  const filtered = reports.filter((r) => filter === 'all' || r.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>

      <div className="flex gap-2 mb-6">
        {['pending', 'resolved', 'dismissed', 'all'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`text-sm px-3 py-1.5 rounded-lg border capitalize transition-colors ${filter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card p-4 h-20 animate-pulse bg-gray-100" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><p>No {filter} reports</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r._id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[r.status]}`}>{r.status}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full capitalize">{r.targetType}</span>
                  </div>
                  <p className="text-gray-800 text-sm">{r.reason}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Reported by {r.reporterId?.name || 'Unknown'} · {formatDate(r.createdAt)}
                  </p>
                </div>
                {r.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => updateStatus(r._id, 'resolved')} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-semibold transition-colors">Resolve</button>
                    <button onClick={() => updateStatus(r._id, 'dismissed')} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg font-semibold transition-colors">Dismiss</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
