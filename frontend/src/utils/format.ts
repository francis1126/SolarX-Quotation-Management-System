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
    Draft: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
    Sent: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
    Accepted: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
    Rejected: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
    Expired: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
    inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
  };
  return colors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
};
