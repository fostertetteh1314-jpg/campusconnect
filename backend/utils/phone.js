const normalizeGhanaPhone = (value = '') => {
  const compact = String(value).replace(/[\s()-]/g, '');
  if (compact.startsWith('0')) return `+233${compact.slice(1)}`;
  return compact;
};

module.exports = { normalizeGhanaPhone };
