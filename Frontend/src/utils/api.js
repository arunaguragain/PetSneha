export const unwrapData = (response) => response?.data ?? response ?? null;

export const unwrapItems = (response) => {
  const data = unwrapData(response);
  return data?.items || data?.data?.items || data?.list || data || [];
};

export const unwrapItem = (response, key) => {
  const data = unwrapData(response);
  if (key && data?.[key]) {
    return data[key];
  }

  if (data?.data && key && data.data[key]) {
    return data.data[key];
  }

  return data?.item || data?.data?.item || data || null;
};

export const getErrorMessage = (error, fallback = 'Could not connect to server. Please try again.') => {
  if (typeof error === 'string') {
    return error;
  }

  return error?.response?.data?.message || error?.message || fallback;
};

export const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `Rs ${amount.toLocaleString('en-IN')}`;
};

export const formatDate = (value, options = {}) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
};

export const formatDateTime = (value) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${formatDate(date)} · ${new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit' }).format(date)}`;
};

export const getPetEmoji = (species = '') => {
  const map = {
    dog: '🐶',
    cat: '🐱',
    rabbit: '🐰',
    mouse: '🐭',
    fish: '🐟',
    parrot: '🦜',
  };

  return map[String(species).toLowerCase()] || '🐾';
};

export const getStatusTone = (status = '') => {
  const normalized = String(status).toLowerCase();

  if (['done', 'completed', 'confirmed', 'active', 'approved', 'published'].includes(normalized)) {
    return 'success';
  }

  if (['upcoming', 'pending', 'draft', 'scheduled'].includes(normalized)) {
    return 'warning';
  }

  if (['overdue', 'cancelled', 'rejected', 'inactive', 'reported'].includes(normalized)) {
    return 'danger';
  }

  return 'neutral';
};

export const safeArray = (value) => (Array.isArray(value) ? value : []);