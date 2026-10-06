export const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '—';
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return dateTimeStr;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '10:00 AM';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

export const getStatusBadgeClass = (status) => {
  switch ((status || '').toUpperCase()) {
    case 'AVAILABLE':
    case 'CONFIRMED':
    case 'SUCCESS':
    case 'ACTIVE':
    case 'COMPLETED':
      return 'bg-success-subtle text-success border border-success-subtle';
    case 'PENDING':
    case 'SCHEDULED':
    case 'IN_PROGRESS':
    case 'MAINTENANCE':
      return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
    case 'CANCELLED':
    case 'FAILED':
    case 'BLOCKED':
    case 'INACTIVE':
      return 'bg-danger-subtle text-danger border border-danger-subtle';
    case 'REFUNDED':
      return 'bg-info-subtle text-info-emphasis border border-info-subtle';
    default:
      return 'bg-secondary-subtle text-secondary';
  }
};

export const getDefaultDateRange = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const returnDay = new Date();
  returnDay.setDate(returnDay.getDate() + 4);
  return {
    pickupDate: tomorrow.toISOString().split('T')[0],
    returnDate: returnDay.toISOString().split('T')[0],
  };
};
