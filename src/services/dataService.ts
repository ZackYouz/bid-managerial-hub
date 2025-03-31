import { Bid, Project, FileItem, CostItem, Activity, User, BidStatus, BidType } from "../types";

// Helper function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Generate a bid number based on date, client name, and bid name
const generateBidNumber = (clientName: string, bidName: string): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const formattedDate = `${year}${month}${day}`;
  const formattedClient = clientName.replace(/\s+/g, '-').substring(0, 15);
  const formattedBid = bidName.replace(/\s+/g, '-').substring(0, 15);
  
  return `${formattedDate}-${formattedClient}-${formattedBid}`;
};

// Get data from localStorage or return default value
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : defaultValue;
};

// Save data to localStorage
const saveToStorage = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Bid related operations
export const getBids = (): Bid[] => {
  return getFromStorage<Bid[]>('bids', []);
};

export const getBidById = (id: string): Bid | undefined => {
  const bids = getBids();
  return bids.find(bid => bid.id === id);
};

export const createBid = (bidData: Omit<Bid, 'id' | 'bidNumber' | 'createdAt'>): Bid => {
  const bids = getBids();
  const newBid: Bid = {
    id: generateId(),
    bidNumber: generateBidNumber(bidData.clientName, bidData.bidName),
    createdAt: new Date().toISOString(),
    ...bidData
  };
  
  saveToStorage('bids', [...bids, newBid]);
  addActivity({
    userId: '1', // This would be the logged-in user in a real app
    userName: 'System',
    action: 'created',
    targetType: 'bid',
    targetId: newBid.id,
    targetName: newBid.bidName
  });
  
  return newBid;
};

export const updateBid = (id: string, bidData: Partial<Bid>): Bid | null => {
  const bids = getBids();
  const bidIndex = bids.findIndex(bid => bid.id === id);
  
  if (bidIndex === -1) return null;
  
  const updatedBid = { ...bids[bidIndex], ...bidData };
  bids[bidIndex] = updatedBid;
  
  saveToStorage('bids', bids);
  addActivity({
    userId: '1', // This would be the logged-in user in a real app
    userName: 'System',
    action: 'updated',
    targetType: 'bid',
    targetId: updatedBid.id,
    targetName: updatedBid.bidName
  });
  
  return updatedBid;
};

export const deleteBid = (id: string): boolean => {
  const bids = getBids();
  const bidToDelete = bids.find(bid => bid.id === id);
  
  if (!bidToDelete) return false;
  
  const filteredBids = bids.filter(bid => bid.id !== id);
  saveToStorage('bids', filteredBids);
  
  addActivity({
    userId: '1', // This would be the logged-in user in a real app
    userName: 'System',
    action: 'deleted',
    targetType: 'bid',
    targetId: id,
    targetName: bidToDelete.bidName
  });
  
  return true;
};

// Project related operations
export const getProjects = (): Project[] => {
  return getFromStorage<Project[]>('projects', []);
};

export const getProjectById = (id: string): Project | undefined => {
  const projects = getProjects();
  return projects.find(project => project.id === id);
};

export const getProjectsByBidId = (bidId: string): Project[] => {
  const projects = getProjects();
  return projects.filter(project => project.bidId === bidId);
};

export const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'files'>): Project => {
  const projects = getProjects();
  const newProject: Project = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    files: [],
    ...projectData
  };
  
  saveToStorage('projects', [...projects, newProject]);
  addActivity({
    userId: '1',
    userName: 'System',
    action: 'created',
    targetType: 'project',
    targetId: newProject.id,
    targetName: newProject.name
  });
  
  return newProject;
};

export const updateProject = (id: string, projectData: Partial<Project>): Project | null => {
  const projects = getProjects();
  const projectIndex = projects.findIndex(project => project.id === id);
  
  if (projectIndex === -1) return null;
  
  const updatedProject = { ...projects[projectIndex], ...projectData };
  projects[projectIndex] = updatedProject;
  
  saveToStorage('projects', projects);
  addActivity({
    userId: '1',
    userName: 'System',
    action: 'updated',
    targetType: 'project',
    targetId: updatedProject.id,
    targetName: updatedProject.name
  });
  
  return updatedProject;
};

export const deleteProject = (id: string): boolean => {
  const projects = getProjects();
  const projectToDelete = projects.find(project => project.id === id);
  
  if (!projectToDelete) return false;
  
  const filteredProjects = projects.filter(project => project.id !== id);
  saveToStorage('projects', filteredProjects);
  
  addActivity({
    userId: '1',
    userName: 'System',
    action: 'deleted',
    targetType: 'project',
    targetId: id,
    targetName: projectToDelete.name
  });
  
  return true;
};

// File related operations
export const addFileToProject = (projectId: string, fileData: Omit<FileItem, 'id' | 'createdAt' | 'updatedAt'>): FileItem | null => {
  const projects = getProjects();
  const projectIndex = projects.findIndex(project => project.id === projectId);
  
  if (projectIndex === -1) return null;
  
  const newFile: FileItem = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...fileData
  };
  
  projects[projectIndex].files.push(newFile);
  saveToStorage('projects', projects);
  
  addActivity({
    userId: '1',
    userName: 'System',
    action: 'added',
    targetType: 'file',
    targetId: newFile.id,
    targetName: newFile.name
  });
  
  return newFile;
};

export const removeFileFromProject = (projectId: string, fileId: string): boolean => {
  const projects = getProjects();
  const projectIndex = projects.findIndex(project => project.id === projectId);
  
  if (projectIndex === -1) return false;
  
  const fileToRemove = projects[projectIndex].files.find(file => file.id === fileId);
  
  if (!fileToRemove) return false;
  
  projects[projectIndex].files = projects[projectIndex].files.filter(file => file.id !== fileId);
  saveToStorage('projects', projects);
  
  addActivity({
    userId: '1',
    userName: 'System',
    action: 'removed',
    targetType: 'file',
    targetId: fileId,
    targetName: fileToRemove.name
  });
  
  return true;
};

// Cost related operations
export const getCosts = (): CostItem[] => {
  return getFromStorage<CostItem[]>('costs', []);
};

export const getCostsByBidId = (bidId: string): CostItem[] => {
  const costs = getCosts();
  return costs.filter(cost => cost.bidId === bidId);
};

export const createCostItem = (costData: Omit<CostItem, 'id'>): CostItem => {
  const costs = getCosts();
  const newCost: CostItem = {
    id: generateId(),
    ...costData
  };
  
  saveToStorage('costs', [...costs, newCost]);
  return newCost;
};

export const updateCostItem = (id: string, costData: Partial<CostItem>): CostItem | null => {
  const costs = getCosts();
  const costIndex = costs.findIndex(cost => cost.id === id);
  
  if (costIndex === -1) return null;
  
  const updatedCost = { ...costs[costIndex], ...costData };
  costs[costIndex] = updatedCost;
  
  saveToStorage('costs', costs);
  return updatedCost;
};

export const deleteCostItem = (id: string): boolean => {
  const costs = getCosts();
  const filteredCosts = costs.filter(cost => cost.id !== id);
  
  if (filteredCosts.length === costs.length) return false;
  
  saveToStorage('costs', filteredCosts);
  return true;
};

// Activity tracking
export const getActivities = (): Activity[] => {
  return getFromStorage<Activity[]>('activities', []);
};

export const addActivity = (activityData: Omit<Activity, 'id' | 'timestamp'>): Activity => {
  const activities = getActivities();
  
  const newActivity: Activity = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    ...activityData
  };
  
  const updatedActivities = [newActivity, ...activities].slice(0, 100); // Keep only the last 100 activities
  saveToStorage('activities', updatedActivities);
  
  return newActivity;
};

// User related operations (basic implementation for demo)
export const getUsers = (): User[] => {
  return getFromStorage<User[]>('users', [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@bidflowpro.com',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    },
    {
      id: '2',
      name: 'Manager User',
      email: 'manager@bidflowpro.com',
      role: 'manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager'
    },
    {
      id: '3',
      name: 'Viewer User',
      email: 'viewer@bidflowpro.com',
      role: 'viewer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer'
    }
  ]);
};

// User authentication (simplified for demo)
export const authenticateUser = (email: string, password: string): User | null => {
  const users = getUsers();
  
  // In a real application, we would verify the password hash
  // Here we're just checking if the email exists and returning that user
  const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());
  
  return user || null;
};

// Calendar/deadline related utilities
export const getUpcomingDeadlines = (daysAhead: number = 7): Bid[] => {
  const bids = getBids();
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + daysAhead);
  
  return bids.filter(bid => {
    if (bid.status === 'won' || bid.status === 'lost') return false;
    
    const bidDeadline = new Date(bid.deadline);
    return bidDeadline >= now && bidDeadline <= futureDate;
  });
};

// Update expired bids
export const updateExpiredBids = (): void => {
  const bids = getBids();
  const now = new Date();
  let hasUpdates = false;
  
  bids.forEach(bid => {
    if (bid.status !== 'pending' && bid.status !== 'submitted') return;
    
    const bidDeadline = new Date(bid.deadline);
    if (bidDeadline < now) {
      bid.status = 'expired';
      hasUpdates = true;
      
      addActivity({
        userId: '1',
        userName: 'System',
        action: 'marked as expired',
        targetType: 'bid',
        targetId: bid.id,
        targetName: bid.bidName
      });
    }
  });
  
  if (hasUpdates) {
    saveToStorage('bids', bids);
  }
};

// Dashboard statistics
export function getDashboardStats() {
  const bids = getBids();
  const projects = getProjects();
  
  // Calculate profit values
  const completedProjects = projects.filter(project => project.status === 'completed');
  const profitValue = completedProjects.reduce((sum, project) => sum + (project.profit || 0), 0);
  
  // Calculate estimated profits from bids
  const estimatedProfits = bids.reduce((sum, bid) => {
    if (bid.quotedValue && bid.costValue) {
      return sum + (bid.quotedValue - bid.costValue);
    }
    return sum;
  }, 0);

  return {
    totalBids: bids.length,
    activeBids: bids.filter(bid => bid.status === 'draft' || bid.status === 'pending' || bid.status === 'submitted').length,
    wonBids: bids.filter(bid => bid.status === 'won').length,
    lostBids: bids.filter(bid => bid.status === 'lost').length,
    pendingBids: bids.filter(bid => bid.status === 'pending').length,
    totalProjects: projects.length,
    currentProjects: projects.filter(project => project.status === 'active').length,
    completedProjects: projects.filter(project => project.status === 'completed').length,
    profitValue,
    estimatedProfits,
    upcomingDeadlines: getUpcomingDeadlines().length,
    recentActivity: generateMockActivities(),
  };
}

// Generate some mock activities
function generateMockActivities() {
  return [
    {
      id: "act1",
      userId: "user1",
      userName: "John Smith",
      userAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
      action: "updated",
      targetType: "bid",
      targetId: "bid1",
      targetName: "City Hospital RFP",
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
    },
    {
      id: "act2",
      userId: "user2",
      userName: "Lisa Johnson",
      userAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
      action: "created",
      targetType: "project",
      targetId: "proj1",
      targetName: "School Renovation",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    },
    {
      id: "act3",
      userId: "user1",
      userName: "John Smith",
      userAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
      action: "marked as won",
      targetType: "bid",
      targetId: "bid3",
      targetName: "Municipal Water Supply",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    },
    {
      id: "act4",
      userId: "user3",
      userName: "Robert Chen",
      userAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
      action: "added",
      targetType: "client",
      targetId: "client2",
      targetName: "GlobalTech Inc.",
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    },
    {
      id: "act5",
      userId: "user2",
      userName: "Lisa Johnson",
      userAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
      action: "updated",
      targetType: "supplier",
      targetId: "supp1",
      targetName: "Quality Builders Co.",
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    },
    {
      id: "act6",
      userId: "user3",
      userName: "Robert Chen",
      userAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
      action: "marked as completed",
      targetType: "project",
      targetId: "proj2",
      targetName: "Office Remodeling",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
  ];
}

// Get upcoming deadlines
export function getUpcomingDeadlines() {
  const bids = getBids();
  const today = new Date();
  const twoWeeksFromNow = new Date(today);
  twoWeeksFromNow.setDate(today.getDate() + 14);
  
  return bids.filter(bid => {
    if (bid.status === 'draft' || bid.status === 'pending') {
      const deadline = new Date(bid.deadline);
      return deadline >= today && deadline <= twoWeeksFromNow;
    }
    return false;
  });
}

// Get bids
export function getBids() {
  // Mock bid data
  return [
    {
      id: "bid1",
      bidNumber: "20231001-MTC-SRV",
      bidName: "IT Services RFP",
      clientName: "MediTech Corp",
      bidType: "private",
      purchaseType: "services",
      status: "pending",
      createdAt: "2023-10-01T09:00:00Z",
      deadline: "2023-11-15T17:00:00Z",
      estimatedValue: 85000,
      costValue: 65000,
      quotedValue: 89500,
      profit: 24500,
      duration: "1 year",
      assignedTo: ["user1", "user2"],
      tags: ["IT", "Services"]
    },
    {
      id: "bid2",
      bidNumber: "20231005-GEG-GDS",
      bidName: "Medical Equipment Supply",
      clientName: "General Eastern Group",
      bidType: "government",
      purchaseType: "goods",
      status: "submitted",
      createdAt: "2023-10-05T11:30:00Z",
      deadline: "2023-10-20T17:00:00Z",
      estimatedValue: 250000,
      costValue: 190000,
      quotedValue: 245000,
      profit: 55000,
      duration: "6 months",
      assignedTo: ["user2"],
      tags: ["Medical", "Equipment"]
    },
    {
      id: "bid3",
      bidNumber: "20231010-MSC-SRV",
      bidName: "Consulting Services",
      clientName: "Municipal Services Commission",
      bidType: "government",
      purchaseType: "services",
      status: "won",
      createdAt: "2023-10-10T14:15:00Z",
      deadline: "2023-10-31T17:00:00Z",
      estimatedValue: 120000,
      costValue: 75000,
      quotedValue: 115000,
      profit: 40000,
      duration: "8 months",
      assignedTo: ["user1", "user3"],
      tags: ["Consulting", "Government"]
    },
    {
      id: "bid4",
      bidNumber: "20231015-UNP-GDS",
      bidName: "Office Supplies",
      clientName: "United Nonprofit",
      bidType: "nonprofit",
      purchaseType: "goods",
      status: "lost",
      createdAt: "2023-10-15T10:00:00Z",
      deadline: "2023-11-05T17:00:00Z",
      estimatedValue: 30000,
      costValue: 22000,
      quotedValue: 28500,
      profit: 6500,
      notes: "Lost due to higher pricing than competitor",
      assignedTo: ["user2"],
      tags: ["Office", "Supplies"]
    },
    {
      id: "bid5",
      bidNumber: "20231020-FTS-SRV",
      bidName: "Technical Training Services",
      clientName: "FastTrack Solutions",
      bidType: "private",
      purchaseType: "services",
      status: "draft",
      createdAt: "2023-10-20T15:45:00Z",
      deadline: "2023-12-10T17:00:00Z",
      estimatedValue: 45000,
      assignedTo: ["user1"],
      tags: ["Training", "Technical"]
    }
  ];
}

// Get projects
export function getProjects() {
  // Mock project data
  return [
    {
      id: "proj1",
      bidId: "bid3",
      name: "Municipal Services Consulting",
      description: "Strategic consulting services for the Municipal Services Commission",
      status: "active",
      createdAt: "2023-10-31T09:00:00Z",
      startDate: "2023-11-15T09:00:00Z",
      endDate: "2024-07-15T17:00:00Z",
      clientName: "Municipal Services Commission",
      purchaseValue: 75000,
      salesValue: 115000,
      profit: 40000,
      files: []
    },
    {
      id: "proj2",
      name: "Office Remodeling Project",
      description: "Complete remodeling of the headquarters office space",
      status: "completed",
      createdAt: "2023-09-01T09:00:00Z",
      startDate: "2023-09-15T09:00:00Z",
      endDate: "2023-10-30T17:00:00Z",
      clientName: "Internal",
      purchaseValue: 120000,
      salesValue: 0,
      profit: -120000,
      files: []
    },
    {
      id: "proj3",
      bidId: "bid2",
      name: "Medical Equipment Procurement",
      description: "Supply of medical equipment to General Eastern Group hospitals",
      status: "on-hold",
      createdAt: "2023-10-25T14:30:00Z",
      startDate: "2023-11-01T09:00:00Z",
      clientName: "General Eastern Group",
      purchaseValue: 190000,
      salesValue: 245000,
      profit: 55000,
      files: []
    },
    {
      id: "proj4",
      name: "Software Implementation",
      description: "Implementation of new ERP system",
      status: "active",
      createdAt: "2023-10-01T10:15:00Z",
      startDate: "2023-10-15T09:00:00Z",
      endDate: "2024-02-15T17:00:00Z",
      clientName: "TechAdvance Inc",
      purchaseValue: 85000,
      salesValue: 150000,
      profit: 65000,
      files: []
    },
    {
      id: "proj5",
      name: "Annual Maintenance Contract",
      description: "Yearly maintenance services for client facilities",
      status: "active",
      createdAt: "2023-09-15T11:00:00Z",
      startDate: "2023-10-01T09:00:00Z",
      endDate: "2024-09-30T17:00:00Z",
      clientName: "GlobalTech Industries",
      purchaseValue: 120000,
      salesValue: 180000,
      profit: 60000,
      files: []
    }
  ];
}

// Calculate remaining days until deadline
export const getRemainingDays = (deadline: string): number => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  
  // Reset time component for accurate day calculation
  now.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  
  const timeDiff = deadlineDate.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

// Add sample data for demo purposes
export const initializeSampleData = () => {
  // Only initialize if no data exists yet
  if (getBids().length === 0) {
    // Sample bid data
    const sampleBids: Omit<Bid, 'id' | 'bidNumber' | 'createdAt'>[] = [
      {
        bidName: 'Office Renovation',
        clientName: 'Acme Corporation',
        bidType: 'private',
        status: 'pending',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Complete renovation of their headquarters office space',
        estimatedValue: 250000,
        tags: ['renovation', 'large']
      },
      {
        bidName: 'IT Infrastructure Upgrade',
        clientName: 'City Government',
        bidType: 'government',
        status: 'submitted',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Complete overhaul of network and server infrastructure',
        estimatedValue: 150000,
        tags: ['it', 'servers', 'government']
      },
      {
        bidName: 'Community Center Construction',
        clientName: 'Local Nonprofit',
        bidType: 'nonprofit',
        status: 'won',
        deadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'New construction for community outreach center',
        estimatedValue: 500000,
        tags: ['construction', 'community', 'large']
      },
      {
        bidName: 'Software Implementation',
        clientName: 'Global Industries',
        bidType: 'private',
        status: 'lost',
        deadline: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'ERP software implementation project',
        estimatedValue: 75000,
        tags: ['software', 'implementation']
      },
      {
        bidName: 'Annual Maintenance Contract',
        clientName: 'TechSolutions Inc',
        bidType: 'private',
        status: 'pending',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Annual maintenance contract for their datacenter',
        estimatedValue: 45000,
        tags: ['maintenance', 'recurring']
      }
    ];
    
    // Create the sample bids
    const createdBids = sampleBids.map(bid => createBid(bid));
    
    // Create sample projects for the won bid
    const wonBid = createdBids.find(bid => bid.status === 'won');
    if (wonBid) {
      createProject({
        bidId: wonBid.id,
        name: 'Community Center Project',
        description: 'Implementation of the community center construction project',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        clientName: wonBid.clientName
      });
      
      // Add sample cost items for the won bid
      createCostItem({
        bidId: wonBid.id,
        category: 'Materials',
        description: 'Construction materials',
        supplierPrice: 200000,
        internalCost: 220000,
        clientPrice: 275000,
        quantity: 1,
        unit: 'lot'
      });
      
      createCostItem({
        bidId: wonBid.id,
        category: 'Labor',
        description: 'Construction labor',
        supplierPrice: 150000,
        internalCost: 150000,
        clientPrice: 187500,
        quantity: 1,
        unit: 'lot'
      });
      
      createCostItem({
        bidId: wonBid.id,
        category: 'Equipment',
        description: 'Heavy machinery rental',
        supplierPrice: 25000,
        internalCost: 25000,
        clientPrice: 37500,
        quantity: 3,
        unit: 'months'
      });
    }
  }
};
