

// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  avatar?: string;
}

// Bid status types
export type BidStatus = 'draft' | 'pending' | 'submitted' | 'won' | 'lost' | 'expired' | 'cancelled';

// Bid type options
export type BidType = 'government' | 'private' | 'nonprofit' | 'other';

// Purchase types
export type PurchaseType = 'goods' | 'services' | 'works' | 'consultancy';

// Bid entity
export interface Bid {
  id: string;
  bidNumber: string;
  clientName: string;
  bidName: string;
  bidType: BidType;
  purchaseType: PurchaseType;
  status: BidStatus;
  createdAt: string;
  deadline: string;
  notes?: string;
  estimatedValue?: number;
  costValue?: number;
  quotedValue?: number;
  profit?: number;
  additionalCosts?: number;
  duration?: string;
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
  status: 'active' | 'completed' | 'on-hold' | 'cancelled' | 'closing';
  createdAt: string;
  startDate?: string;
  endDate?: string;
  clientName: string;
  purchaseValue?: number;
  salesValue?: number;
  profit?: number;
  files: FileItem[];
}

// Contact information for clients and suppliers
export interface Contact {
  id: string;
  name: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
}

// Client/Organization categories
export type OrganizationType = 'ngo' | 'company' | 'government' | 'individual' | 'other';

// Client entity with active status
export interface Client {
  id: string;
  name: string;
  code: string;
  registrationNumber?: string;
  registrationFinancial?: string;
  type: OrganizationType;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  phone?: string;
  mobile?: string;
  emails: string[];
  contacts: Contact[];
  isActive: boolean;
  hasActiveProjects: boolean;
}

// Client stats
export interface ClientStats {
  totalClients: number;
  activeClients: number;
  byType: {
    type: OrganizationType;
    count: number;
  }[];
  clientsWithProjects: number;
}

// Supplier interface (similar to Client)
export interface Supplier {
  id: string;
  name: string;
  code: string;
  registrationNumber?: string;
  registrationFinancial?: string;
  type: OrganizationType;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  phone?: string;
  mobile?: string;
  emails: string[];
  contacts: Contact[];
  isActive: boolean;
  hasActiveProjects: boolean;
  productCategories?: string[];
}

// Supplier stats
export interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  byType: {
    type: OrganizationType;
    count: number;
  }[];
  suppliersWithProjects: number;
}

// Product category types
export type ProductCategory = 'food' | 'hygiene' | 'services' | 'transportation' | string;

// Product base interface
export interface BaseProduct {
  id: string;
  name: string;
  code: string;
  category: ProductCategory;
  isTaxable: boolean;
  taxRate?: number;
}

// Supply product
export interface SupplyProduct extends BaseProduct {
  unit: string;
}

// Service product
export interface ServiceProduct extends BaseProduct {
  description?: string;
  rateType?: string;
}

// Transport service
export interface TransportService extends BaseProduct {
  vehicleType: 'bus' | 'truck' | 'container' | 'van' | 'car';
  capacity?: string;
  billingMethod: 'per_trip' | 'per_km' | 'per_day';
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
  pendingBids: number;
  totalProjects: number;
  currentProjects: number;
  completedProjects: number;
  profitValue: number;
  estimatedProfits: number;
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
  targetType: 'bid' | 'project' | 'client' | 'supplier' | 'product' | 'file' | 'cost';
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

