import { useEffect, useState } from 'react';
import { Flag } from 'lucide-react';
import api from '../../api';
import { formatDate } from '../../utils/helpers';

const statusStyles = { pending: 'bg-mango/20 text-ink', resolved: 'bg-lime/50 text-ink', dismissed: 'bg-ink/10 text-muted' };

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => { api.get('/admin/reports').then((response) => setReports(response.data)).finally(() => setLoading(false)); }, []);
  const updateStatus = async (id, status) => {
    const response = await api.put(`/admin/reports/${id}`, { status });
    setReports((current) => current.map((report) => (report._id === id ? response.data : report)));
  };
  const filtered = reports.filter((report) => filter === 'all' || report.status === filter);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-cobalt">Safety queue</p>
      <h1 className="section-title mb-6 text-4xl">Community reports</h1>
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        {['pending', 'resolved', 'dismissed', 'all'].map((status) => <button key={status} onClick={() => setFilter(status)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-bold capitalize transition ${filter === status ? 'bg-ink text-paper-bright' : 'bg-paper-bright text-ink/65 shadow-card hover:text-ink'}`}>{status}</button>)}
      </div>

      {loading ? <div className="space-y-3">{[...Array(4)].map((_, index) => <div key={index} className="card h-24 animate-pulse bg-ink/10" />)}</div> : filtered.length === 0 ? (
        <div className="notice-slip py-14 text-center"><Flag className="mx-auto mb-3 h-9 w-9 text-cobalt" /><p className="font-display text-2xl font-extrabold uppercase">No {filter} reports</p></div>
      ) : (
        <div className="space-y-3">{filtered.map((report) => (
          <article key={report._id} className="card p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="mb-2 flex items-center gap-2"><span className={`badge ${statusStyles[report.status]}`}>{report.status}</span><span className="badge bg-ink/5 capitalize text-muted">{report.targetType}</span></div>
                <p className="text-sm font-semibold leading-relaxed">{report.reason}</p>
                <p className="mt-2 text-xs text-muted">Reported by {report.reporterId?.name || 'Unknown'} Â· {formatDate(report.createdAt)}</p>
              </div>
              {report.status === 'pending' && <div className="flex shrink-0 gap-2"><button onClick={() => updateStatus(report._id, 'resolved')} className="min-h-9 rounded-[10px] bg-lime/50 px-3 text-xs font-bold hover:bg-lime">Resolve</button><button onClick={() => updateStatus(report._id, 'dismissed')} className="min-h-9 rounded-[10px] bg-ink/5 px-3 text-xs font-bold text-ink/65 hover:bg-ink/10">Dismiss</button></div>}
            </div>
          </article>
        ))}</div>
      )}
    </main>
  );
}
