import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, getInitials } from '../utils/helpers';
import BackButton from '../components/BackButton';

export default function ServiceDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/services/${id}`)
      .then((r) => setService(r.data))
      .catch(() => navigate('/services'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  if (!service) return null;
  const provider = service.providerId;
  const isOwner = user?._id === provider?._id;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton label="Back to Services" to="/services" />

      <div className="card p-7 space-y-6">
        <div>
          <span className="badge bg-blue-100 text-blue-700 mb-3">{service.category}</span>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">{service.title}</h1>
          <p className="text-3xl font-black text-blue-600 mt-2">From {formatPrice(service.price)}</p>
          <p className="text-xs text-slate-400 mt-2">Posted {formatDate(service.createdAt)}</p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5">
          <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">About this service</p>
          <p className="text-gray-700 leading-relaxed">{service.description}</p>
        </div>

        {provider && (
          <div className="card p-4 flex items-center gap-4">
            {provider.profileImage ? (
              <img src={provider.profileImage} alt={provider.name} className="w-14 h-14 rounded-xl object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-black">
                {getInitials(provider.name)}
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Provider</p>
              <p className="font-bold text-gray-900">{provider.name}</p>
              {provider.level && <p className="text-sm text-slate-500">Level {provider.level}</p>}
            </div>
          </div>
        )}

        {!isOwner && (
          <div className="flex gap-3">
            {user ? (
              <Link to={`/messages?to=${provider?._id}&name=${encodeURIComponent(provider?.name || '')}`}
                className="btn-primary flex-1 py-3.5 text-base">
                💬 Contact Provider
              </Link>
            ) : (
              <Link to="/login" className="btn-primary flex-1 py-3.5 text-base">Sign in to Contact</Link>
            )}
            {service.contactNumber && (
              <a href={`tel:${service.contactNumber}`} className="btn-secondary flex-1 py-3.5 text-base">📞 Call</a>
            )}
          </div>
        )}

        {isOwner && (
          <div className="flex gap-3">
            <Link to={`/services/${id}/edit`} className="btn-primary flex-1 py-3 text-center">Edit Service</Link>
            <Link to="/dashboard" className="btn-secondary flex-1 py-3 text-center">My Dashboard</Link>
          </div>
        )}
      </div>
    </div>
  );
}
