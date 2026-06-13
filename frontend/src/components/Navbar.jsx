import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { disconnectSocket } from '../hooks/useSocket';
import api from '../api';
import { getInitials } from '../utils/helpers';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) api.get('/messages/unread').then((r) => setUnread(r.data.count)).catch(() => {});
  }, [user]);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { disconnectSocket(); logout(); navigate('/'); setDropOpen(false); };

  const activeClass = 'text-blue-600 font-semibold';
  const inactiveClass = 'text-gray-500 hover:text-gray-900 font-medium';
  const navLinkClass = ({ isActive }) => `text-sm transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`;

  return (
    <nav className={`bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-md border-b border-slate-100' : 'border-b border-slate-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-black text-sm">CC</span>
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block tracking-tight">
              Campus<span className="text-blue-600">Connect</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            <NavLink to="/marketplace" className={navLinkClass}>Marketplace</NavLink>
            <NavLink to="/services" className={navLinkClass}>Services</NavLink>
            {user && (
              <NavLink to="/messages" className={({ isActive }) => `relative text-sm transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`}>
                Messages
                {unread > 0 && (
                  <span className="absolute -top-1.5 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </NavLink>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/listings/new" className="hidden md:inline-flex btn-primary text-sm py-2 px-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Post
                </Link>
                <div className="relative" ref={dropRef}>
                  <button onClick={() => setDropOpen(!dropOpen)} className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-semibold text-gray-700 pr-1">{user.name.split(' ')[0]}</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      {[
                        { label: 'Dashboard', to: '/dashboard', icon: '🏠' },
                        { label: 'Profile', to: '/profile', icon: '👤' },
                        { label: 'Favorites', to: '/favorites', icon: '❤️' },
                        { label: 'Messages', to: '/messages', icon: '💬' },
                      ].map((item) => (
                        <Link key={item.to} to={item.to} onClick={() => setDropOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors">
                          <span>{item.icon}</span>{item.label}
                        </Link>
                      ))}
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setDropOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50 transition-colors">
                          <span>⚙️</span>Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <span>🚪</span>Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Join Free</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-0.5">
            {[
              { to: '/marketplace', label: 'Marketplace' },
              { to: '/services', label: 'Services' },
              ...(user ? [
                { to: '/messages', label: `Messages${unread > 0 ? ` (${unread})` : ''}` },
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/listings/new', label: '+ Post Listing' },
              ] : []),
            ].map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `block px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-slate-100'}`}>
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
