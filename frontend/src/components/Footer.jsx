import { Link } from 'react-router-dom';

export default function Footer() {
  const linkClass = 'hover:text-lime';
  return (
    <footer className="hidden bg-ink text-paper md:block">
      <div className="mx-auto max-w-7xl px-8 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div><Link to="/" className="display-type text-4xl">KOBO</Link><p className="mt-4 max-w-xs text-sm leading-6 text-paper/75">Find products and services nearby, talk in-app, and keep the next step clear.</p></div>
          <div><h2 className="text-sm font-extrabold">Browse</h2><ul className="mt-4 space-y-3 text-sm text-paper/75"><li><Link to="/marketplace" className={linkClass}>Marketplace</Link></li><li><Link to="/services" className={linkClass}>Services</Link></li><li><Link to="/favorites" className={linkClass}>Saved items</Link></li></ul></div>
          <div><h2 className="text-sm font-extrabold">Sell</h2><ul className="mt-4 space-y-3 text-sm text-paper/75"><li><Link to="/listings/new" className={linkClass}>Post a listing</Link></li><li><Link to="/services/new" className={linkClass}>Offer a service</Link></li><li><Link to="/dashboard" className={linkClass}>Dashboard</Link></li></ul></div>
          <div><h2 className="text-sm font-extrabold">Pilot</h2><p className="mt-4 text-sm leading-6 text-paper/75">Launching at UCC, Cape Coast.</p><p className="mt-3 inline-flex rounded-full bg-lime px-3 py-1 text-xs font-extrabold text-ink">Find am. Pay safe.</p></div>
        </div>
        <div className="mt-12 flex items-center justify-between border-t border-paper/15 pt-6 text-xs text-paper/70"><p>© {new Date().getFullYear()} KOBO</p><p>Built for local campus trade.</p></div>
      </div>
    </footer>
  );
}
