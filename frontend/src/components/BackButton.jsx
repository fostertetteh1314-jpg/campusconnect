import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ label = 'Back', to }) {
  const navigate = useNavigate();
  const handleClick = () => (to ? navigate(to) : navigate(-1));

  return (
    <button onClick={handleClick} className="back-btn mb-6">
      <ArrowLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
      {label}
    </button>
  );
}
