
import { BidStatus } from "../types";

// Format a string with capitalized first letter
export const capitalizeFirstLetter = (text?: string): string => {
  if (!text) return 'N/A';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Format a status badge class
export const getStatusBadgeClass = (status: BidStatus): string => {
  switch (status) {
    case 'draft':
      return 'bg-gray-200 text-gray-800';
    case 'pending':
      return 'bg-blue-100 text-blue-800';
    case 'submitted':
      return 'bg-purple-100 text-purple-800';
    case 'won':
      return 'bg-green-100 text-green-800';
    case 'lost':
      return 'bg-red-100 text-red-800';
    case 'expired':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Format days remaining display
export const formatDaysRemaining = (daysLeft: number): string => {
  if (daysLeft > 0) return `${daysLeft} days`;
  if (daysLeft === 0) return 'Today';
  return 'Overdue';
};

// Format empty value with fallback
export const formatEmptyValue = (value: any, fallback: string = 'N/A'): string => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return String(value);
};
