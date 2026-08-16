import { useEffect, useState } from 'react';
import api from '../../api';
import { formatDate, getInitials } from '../../utils/helpers';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { api.get('/admin/users').then((response) => setUsers(response.data)).finally(() => setLoading(false)); }, []);

  const toggleBan = async (id, isBanned) => {
    const response = await api.put(`/admin/users/${id}/${isBanned ? 'unban' : 'ban'}`);
    setUsers((current) => current.map((user) => (user._id === id ? response.data : user)));
  };
  const query = search.toLowerCase();
  const filtered = users.filter((user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-cobalt">Trust operations</p>
      <h1 className="section-title mb-6 text-4xl">People on KOBO <span className="text-cobalt">{users.length}</span></h1>
      <label htmlFor="user-search" className="sr-only">Search users</label>
      <input id="user-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" className="input-field mb-4 max-w-sm" />

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-ink/10 bg-paper">
            <tr>{['User', 'Department', 'Joined', 'Status', 'Actions'].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-muted">{label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {loading ? [...Array(5)].map((_, index) => <tr key={index}><td colSpan={5} className="px-4 py-3"><div className="h-8 animate-pulse rounded-[10px] bg-ink/10" /></td></tr>) : filtered.map((user) => (
              <tr key={user._id} className="hover:bg-paper">
                <td className="px-4 py-3"><div className="flex items-center gap-3">
                  {user.profileImage ? <img src={user.profileImage} alt="" className="h-8 w-8 rounded-full object-cover" /> : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cobalt text-xs font-bold text-white">{getInitials(user.name)}</div>}
                  <div><p className="font-bold">{user.name}</p><p className="text-xs text-muted">{user.email}</p></div>
                </div></td>
                <td className="px-4 py-3 text-muted">{user.department || 'â€”'}</td>
                <td className="px-4 py-3 text-muted">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">{user.role === 'admin' ? <span className="badge bg-cobalt/10 text-cobalt">Admin</span> : user.isBanned ? <span className="badge bg-coral/10 text-coral">Banned</span> : <span className="badge bg-lime/50">Active</span>}</td>
                <td className="px-4 py-3">{user.role !== 'admin' && <button onClick={() => toggleBan(user._id, user.isBanned)} className={`min-h-9 rounded-[10px] px-3 text-xs font-bold ${user.isBanned ? 'bg-lime/50 hover:bg-lime' : 'bg-coral/10 text-coral hover:bg-coral/20'}`}>{user.isBanned ? 'Restore' : 'Suspend'}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
