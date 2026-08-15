export const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatShortDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800',
    Sent: 'bg-blue-100 text-blue-800',
    Accepted: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
    Expired: 'bg-gray-200 text-gray-700',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
