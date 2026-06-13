import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-black text-sm">CC</span>
              </div>
              <span className="text-white font-bold text-lg">Campus<span className="text-blue-400">Connect</span></span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              The marketplace built exclusively for UCC students. Buy, sell, and offer services on campus.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Marketplace</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/marketplace" className="hover:text-white transition-colors">Browse Items</Link></li>
              <li><Link to="/listings/new" className="hover:text-white transition-colors">Sell an Item</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Student Services</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Account</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/register" className="hover:text-white transition-colors">Join Free</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/favorites" className="hover:text-white transition-colors">Saved Items</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Info</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-1 rounded-full">UCC Students Only</span></li>
              <li><span className="text-gray-600 text-xs">Version 1.0 MVP</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} CampusConnect. Built for UCC students.</p>
          <p className="text-xs text-gray-700">Made with ❤️ for campus life</p>
        </div>
      </div>
    </footer>
  );
}
