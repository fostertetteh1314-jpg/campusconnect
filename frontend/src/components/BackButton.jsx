import { useNavigate } from 'react-router-dom';

export default function BackButton({ label = 'Back', to }) {
  const navigate = useNavigate();
  const handleClick = () => (to ? navigate(to) : navigate(-1));

  return (
    <button onClick={handleClick} className="back-btn mb-6">
      <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}
