// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  avatar?: string;
}

// Bid status types
export type BidStatus = 'draft' | 'pending' | 'submitted' | 'won' | 'lost' | 'expired';

// Bid type options
export type BidType = 'government' | 'private' | 'nonprofit' | 'other';

// Bid entity
export interface Bid {
  id: string;
  bidNumber: string;
  clientName: string;
  bidName: string;
  bidType: BidType;
  status: BidStatus;
  createdAt: string;
  deadline: string;
  notes?: string;
  estimatedValue?: number;
  assignedTo?: string[];
  tags?: string[];
}

// File structure
export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  createdAt: string;
  updatedAt: string;
}

// Project structure
export interface Project {
  id: string;
  bidId?: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  createdAt: string;
  startDate?: string;
  endDate?: string;
  clientName: string;
  files: FileItem[];
}

// Cost structure
export interface CostItem {
  id: string;
  bidId: string;
  category: string;
  description: string;
  supplierPrice?: number;
  internalCost?: number;
  clientPrice?: number;
  quantity: number;
  unit?: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalBids: number;
  activeBids: number;
  wonBids: number;
  lostBids: number;
  upcomingDeadlines: number;
  recentActivity: Activity[];
}

// Activity for tracking changes
export interface Activity {
  id: string;
  userId: string;
  userAvatar?: string;
  userName: string;
  action: string;
  targetType: 'bid' | 'project' | 'file' | 'cost';
  targetId: string;
  targetName: string;
  timestamp: string;
}

// Chart data structure
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}
