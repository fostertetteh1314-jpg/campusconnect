import { ArrowUpRight, Code2, GraduationCap, Palette, Printer, Type, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, formatRelativeTime, getInitials } from '../utils/helpers';

const categoryConfig = {
  Typing: { color: 'bg-cobalt text-white', icon: Type },
  'Graphic Design': { color: 'bg-coral text-white', icon: Palette },
  Printing: { color: 'bg-mango text-ink', icon: Printer },
  'Academic Support': { color: 'bg-lime text-ink', icon: GraduationCap },
  'Assignment Help': { color: 'bg-lime text-ink', icon: GraduationCap },
  Programming: { color: 'bg-cobalt text-white', icon: Code2 },
  Tutorials: { color: 'bg-lime text-ink', icon: GraduationCap },
  Other: { color: 'bg-ink text-paper', icon: Wrench },
};

export default function ServiceCard({ service }) {
  const config = categoryConfig[service.category] || categoryConfig.Other;
  const Icon = config.icon;
  const category = service.category === 'Assignment Help' ? 'Academic Support' : service.category;

  return (
    <Link to={`/services/${service._id}`} className="notice-slip group flex min-h-64 flex-col overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3"><span className={`flex h-11 w-11 items-center justify-center rounded-[12px] ${config.color}`}><Icon className="h-5 w-5" aria-hidden="true" /></span><ArrowUpRight className="h-5 w-5 text-ink/35 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cobalt" /></div>
      <div className="mt-6 flex-1"><p className="text-xs font-extrabold text-muted">{category}</p><h3 className="mt-2 line-clamp-2 text-lg font-extrabold leading-snug text-ink">{service.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{service.description}</p></div>
      <div className="mt-5 flex items-end justify-between gap-3 border-t border-ink/10 pt-4"><div><p className="text-xs font-semibold text-muted">From</p><p className="font-extrabold text-cobalt">{formatPrice(service.price)}</p></div><div className="text-right"><p className="text-[11px] text-muted">{formatRelativeTime(service.createdAt)}</p>{service.providerId && <p className="mt-1 max-w-28 truncate text-xs font-semibold text-muted">{service.providerId.name || getInitials(service.providerId.name)}</p>}</div></div>
    </Link>
  );
}
