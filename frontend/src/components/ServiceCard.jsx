import { Link } from 'react-router-dom';
import { formatPrice, formatRelativeTime, getInitials } from '../utils/helpers';

const categoryConfig = {
  'Typing':         { color: 'bg-purple-100 text-purple-700', icon: '⌨️' },
  'Graphic Design': { color: 'bg-pink-100 text-pink-700',     icon: '🎨' },
  'Printing':       { color: 'bg-orange-100 text-orange-700', icon: '🖨️' },
  'Assignment Help':{ color: 'bg-yellow-100 text-yellow-700', icon: '📝' },
  'Programming':    { color: 'bg-blue-100 text-blue-700',     icon: '💻' },
  'Tutorials':      { color: 'bg-green-100 text-green-700',   icon: '📚' },
  'Other':          { color: 'bg-slate-100 text-slate-600',   icon: '🛠️' },
};

export default function ServiceCard({ service }) {
  const config = categoryConfig[service.category] || categoryConfig['Other'];

  return (
    <Link to={`/services/${service._id}`} className="card-hover p-5 flex flex-col gap-4 group">
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${config.color}`}>
          {config.icon}
        </div>
        <span className="text-xs text-slate-400 mt-1">{formatRelativeTime(service.createdAt)}</span>
      </div>

      <div className="flex-1">
        <span className={`badge ${config.color} mb-2`}>{service.category}</span>
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">{service.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">{service.description}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <p className="text-blue-600 font-bold">From {formatPrice(service.price)}</p>
        {service.providerId && (
          <div className="flex items-center gap-1.5">
            {service.providerId.profileImage ? (
              <img src={service.providerId.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                {getInitials(service.providerId.name)}
              </div>
            )}
            <span className="text-xs text-slate-500 max-w-[90px] truncate">{service.providerId.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
