import { Home, MessageCircle, Plus, Search, UserRound } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { user } = useAuth();
  const items = [
    { label: 'Home', to: '/', icon: Home },
    { label: 'Browse', to: '/marketplace', icon: Search },
    { label: 'Messages', to: user ? '/messages' : '/login', icon: MessageCircle },
    { label: 'Account', to: user ? '/dashboard' : '/login', icon: UserRound },
  ];

  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-paper-bright/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-5 items-end">
        {items.slice(0, 2).map(({ label, to, icon: Icon }) => <NavLink key={label} to={to} className={({ isActive }) => `flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-bold ${isActive ? 'text-cobalt' : 'text-muted'}`}><Icon className="h-5 w-5" strokeWidth={2} /><span>{label}</span></NavLink>)}
        <Link to={user ? '/listings/new' : '/login'} className="flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-extrabold text-ink"><span className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-lime shadow-[0_10px_24px_-12px_rgba(30,33,28,.7)]"><Plus className="h-7 w-7" /></span><span>Sell</span></Link>
        {items.slice(2).map(({ label, to, icon: Icon }) => <NavLink key={label} to={to} className={({ isActive }) => `flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-bold ${isActive ? 'text-cobalt' : 'text-muted'}`}><Icon className="h-5 w-5" strokeWidth={2} /><span>{label}</span></NavLink>)}
      </div>
    </nav>
  );
}
