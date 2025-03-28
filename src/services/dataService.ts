
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
export const getDashboardStats = () => {
  const bids = getBids();
  const activities = getActivities();
  
  // Update expired bids first
  updateExpiredBids();
  
  return {
    totalBids: bids.length,
    activeBids: bids.filter(bid => ['draft', 'pending', 'submitted'].includes(bid.status)).length,
    wonBids: bids.filter(bid => bid.status === 'won').length,
    lostBids: bids.filter(bid => bid.status === 'lost').length,
    upcomingDeadlines: getUpcomingDeadlines(7).length,
    recentActivity: activities.slice(0, 10)
  };
};

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
