import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, LayoutDashboard, LogOut, MapPin, MessageCircle, Plus, ShieldCheck, UserRound } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { disconnectSocket } from '../hooks/useSocket';
import { getInitials } from '../utils/helpers';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const dropRef = useRef(null);
  const dropButtonRef = useRef(null);

  useEffect(() => { if (user) api.get('/messages/unread').then((response) => setUnread(response.data.count)).catch(() => {}); }, [user]);
  useEffect(() => {
    const close = (event) => { if (dropRef.current && !dropRef.current.contains(event.target)) setDropOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  useEffect(() => {
    if (!dropOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') { setDropOpen(false); dropButtonRef.current?.focus(); }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [dropOpen]);

  const handleLogout = () => { disconnectSocket(); logout(); setDropOpen(false); navigate('/'); };
  const navClass = ({ isActive }) => `inline-flex min-h-11 items-center border-b-2 px-1 text-sm font-bold transition-colors ${isActive ? 'border-lime text-paper' : 'border-transparent text-paper/75 hover:text-paper'}`;
  const menuItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile', to: '/profile', icon: UserRound },
    { label: 'Saved', to: '/favorites', icon: Heart },
    { label: 'Messages', to: '/messages', icon: MessageCircle },
  ];

  return (
    <header className="sticky top-0 z-50 h-16 bg-ink text-paper md:h-[72px]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:px-8">
        <Link to="/" className="display-type text-[2.15rem] leading-none" aria-label="KOBO home">KOBO</Link>
        <Link to="/marketplace" className="flex min-h-11 min-w-0 items-center gap-2 rounded-[12px] px-2 text-sm font-bold text-paper/80 hover:bg-white/5 hover:text-paper md:hidden"><MapPin className="h-4 w-4 shrink-0 text-lime" aria-hidden="true" /><span className="truncate">UCC · Cape Coast</span></Link>

        <nav className="hidden h-full items-center gap-7 md:flex" aria-label="Main navigation">
          <NavLink to="/marketplace" className={navClass}>Marketplace</NavLink><NavLink to="/services" className={navClass}>Services</NavLink>
          {user && <NavLink to="/messages" className={navClass}>Messages{unread > 0 && <span className="ml-2 rounded-full bg-coral px-2 py-0.5 text-[10px] text-white">{unread > 99 ? '99+' : unread}</span>}</NavLink>}
        </nav>

        <div className="flex items-center gap-2">
          {user ? <>
            <Link to="/listings/new" className="hidden min-h-11 items-center gap-2 rounded-[14px] bg-lime px-4 text-sm font-extrabold text-ink transition hover:bg-[#d7fa59] md:inline-flex"><Plus className="h-4 w-4" />Sell</Link>
            <div className="relative" ref={dropRef}>
              <button ref={dropButtonRef} type="button" onClick={() => setDropOpen((value) => !value)} aria-expanded={dropOpen} aria-controls="account-disclosure" className="flex min-h-11 items-center gap-2 rounded-[12px] p-1.5 transition hover:bg-white/10">
                {user.profileImage ? <img src={user.profileImage} alt="" className="h-8 w-8 rounded-[10px] object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-cobalt text-xs font-extrabold text-white">{getInitials(user.name)}</span>}
                <span className="hidden max-w-28 truncate text-sm font-bold sm:block">{user.name.split(' ')[0]}</span><ChevronDown className={`hidden h-4 w-4 text-paper/70 transition sm:block ${dropOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropOpen && <div id="account-disclosure" className="absolute right-0 mt-2 w-60 rounded-[14px] bg-paper-bright p-2 text-ink shadow-[0_20px_55px_-24px_rgba(0,0,0,.7)]">
                <div className="px-3 py-2"><p className="truncate text-sm font-extrabold">{user.name}</p><p className="truncate text-xs text-muted">{user.email}</p></div><div className="my-1 h-px bg-ink/10" />
                {menuItems.map(({ label, to, icon: Icon }) => <Link key={to} to={to} onClick={() => setDropOpen(false)} className="flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-semibold hover:bg-ink/5"><Icon className="h-4 w-4 text-muted" />{label}</Link>)}
                {user.role === 'admin' && <Link to="/admin" onClick={() => setDropOpen(false)} className="flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-bold text-cobalt hover:bg-cobalt/5"><ShieldCheck className="h-4 w-4" />Admin</Link>}
                <div className="my-1 h-px bg-ink/10" /><button onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-bold text-coral hover:bg-coral/5"><LogOut className="h-4 w-4" />Sign out</button>
              </div>}
            </div>
          </> : <div className="flex items-center gap-1 sm:gap-2"><Link to="/login" className="btn-ghost text-paper/80 hover:bg-white/10 hover:text-paper">Sign in</Link><Link to="/register" className="hidden min-h-11 items-center rounded-[14px] bg-lime px-4 text-sm font-extrabold text-ink sm:inline-flex">Join KOBO</Link></div>}
        </div>
      </div>
    </header>
  );
}
