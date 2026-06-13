export const formatPrice = (price) =>
  `GHS ${Number(price).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatRelativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

export const LISTING_CATEGORIES = [
  'Textbooks', 'Calculators', 'Laptops', 'Phones', 'Hostel Items', 'Furniture', 'Other',
];

export const SERVICE_CATEGORIES = [
  'Typing', 'Graphic Design', 'Printing', 'Assignment Help', 'Programming', 'Tutorials', 'Other',
];

export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

export const LEVELS = ['100', '200', '300', '400', '500', 'Graduate'];
