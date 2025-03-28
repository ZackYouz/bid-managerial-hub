
import { BidStatus } from "../types";

// Format currency values
export const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return "N/A";
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format dates to a readable format
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format timestamps to include time
export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "N/A";
  
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get color for bid status
export const getStatusColor = (status: BidStatus): string => {
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

// Get deadline status color based on remaining days
export const getDeadlineColor = (deadline: string): string => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const timeDiff = deadlineDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  if (daysRemaining < 0) return 'text-red-500'; // Overdue
  if (daysRemaining === 0) return 'text-yellow-500'; // Due today
  if (daysRemaining <= 3) return 'text-orange-400'; // Approaching soon
  if (daysRemaining <= 7) return 'text-blue-500'; // Coming up
  return 'text-green-500'; // Plenty of time
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file type icon class based on file extension
export const getFileIconClass = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'pdf':
      return 'text-red-500';
    case 'doc':
    case 'docx':
      return 'text-blue-500';
    case 'xls':
    case 'xlsx':
      return 'text-green-500';
    case 'ppt':
    case 'pptx':
      return 'text-orange-500';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'text-purple-500';
    case 'zip':
    case 'rar':
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
};

// Calculate profit margin percentage
export const calculateProfitMargin = (cost?: number, price?: number): string => {
  if (!cost || !price || cost === 0) return 'N/A';
  
  const profit = price - cost;
  const margin = (profit / price) * 100;
  
  return `${margin.toFixed(2)}%`;
};

// Download JSON data as a file
export const downloadJsonData = (data: any, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Convert array to CSV and download
export const downloadCsv = (data: any[], filename: string): void => {
  if (data.length === 0) return;
  
  // Extract headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content with headers
  let csvContent = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      // Handle values that might contain commas or quotes
      const value = item[header] !== undefined ? item[header] : '';
      const valueStr = String(value);
      
      if (valueStr.includes(',') || valueStr.includes('"') || valueStr.includes('\n')) {
        return `"${valueStr.replace(/"/g, '""')}"`;
      }
      
      return valueStr;
    }).join(',');
    
    csvContent += row + '\n';
  });
  
  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Safely truncate text to a specific length
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

// Create a simple hash for demo purposes
export const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};
