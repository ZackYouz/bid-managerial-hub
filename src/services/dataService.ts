import { Bid, Project, FileItem, CostItem, Activity, User, BidStatus, BidType, PurchaseType, Client, ClientStats, OrganizationType, Supplier, SupplierStats, BaseProduct, SupplyProduct, TransportService, ProductCategory } from "../types";

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

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

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : defaultValue;
};

const saveToStorage = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getBids = (): Bid[] => {
  return getFromStorage<Bid[]>('bids', getMockBids());
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
    userId: '1',
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
    userId: '1',
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
    userId: '1',
    userName: 'System',
    action: 'deleted',
    targetType: 'bid',
    targetId: id,
    targetName: bidToDelete.bidName
  });
  
  return true;
};

export const getProjects = (): Project[] => {
  return getFromStorage<Project[]>('projects', getMockProjects());
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
  
  const updatedActivities = [newActivity, ...activities].slice(0, 100);
  saveToStorage('activities', updatedActivities);
  
  return newActivity;
};

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

export const authenticateUser = (email: string, password: string): User | null => {
  const users = getUsers();
  
  const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());
  
  return user || null;
};

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

export function getDashboardStats() {
  const bids = getBids();
  const projects = getProjects();
  
  const completedProjects = projects.filter(project => project.status === 'completed');
  const profitValue = completedProjects.reduce((sum, project) => sum + (project.profit || 0), 0);
  
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
    recentActivity: getMockActivities(),
  };
}

function getMockActivities(): Activity[] {
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
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
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
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
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
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
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
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
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
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
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
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];
}

export const getRemainingDays = (deadline: string): number => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  
  now.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  
  const timeDiff = deadlineDate.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

function getMockBids(): Bid[] {
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
  ] as Bid[];
}

function getMockProjects(): Project[] {
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
  ] as Project[];
}

export const initializeSampleData = () => {
  if (getBids().length === 0) {
    const sampleBids: Omit<Bid, 'id' | 'bidNumber' | 'createdAt'>[] = [
      {
        bidName: 'Office Renovation',
        clientName: 'Acme Corporation',
        bidType: 'private',
        purchaseType: 'works',
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
        purchaseType: 'goods',
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
        purchaseType: 'works',
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
        purchaseType: 'services',
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
        purchaseType: 'services',
        status: 'pending',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Annual maintenance contract for their datacenter',
        estimatedValue: 45000,
        tags: ['maintenance', 'recurring']
      }
    ];
    
    const createdBids = sampleBids.map(bid => createBid(bid));
    
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

let clients: Client[] = [];

export const getClients = (): Client[] => {
  if (clients.length > 0) {
    return [...clients];
  }

  clients = [
    {
      id: "client-001",
      name: "Global Relief NGO",
      code: "GR-2023",
      registrationNumber: "NGO1234567",
      registrationFinancial: "FIN9876543",
      type: "ngo",
      address: "123 Humanitarian Way, Geneva, Switzerland",
      location: { lat: 46.2044, lng: 6.1432 },
      phone: "+41 22 123 4567",
      mobile: "+41 79 987 6543",
      emails: ["contact@globalrelief.org", "info@globalrelief.org"],
      contacts: [
        { id: "contact-001", name: "Jane Smith", jobTitle: "Program Director", email: "jane@globalrelief.org", phone: "+41 22 123 4567" },
        { id: "contact-002", name: "John Doe", jobTitle: "Procurement Officer", email: "john@globalrelief.org", phone: "+41 22 123 4568" }
      ],
      isActive: true,
      hasActiveProjects: true
    },
    {
      id: "client-002",
      name: "TechSolutions Corp",
      code: "TSC-2023",
      registrationNumber: "CORP7654321",
      registrationFinancial: "FIN1234567",
      type: "company",
      address: "456 Innovation Blvd, San Francisco, CA, USA",
      location: { lat: 37.7749, lng: -122.4194 },
      phone: "+1 415 555 1234",
      mobile: "+1 415 555 5678",
      emails: ["info@techsolutions.com", "sales@techsolutions.com"],
      contacts: [
        { id: "contact-003", name: "Sarah Johnson", jobTitle: "CTO", email: "sarah@techsolutions.com", phone: "+1 415 555 2345" },
        { id: "contact-004", name: "Mike Williams", jobTitle: "Purchasing Manager", email: "mike@techsolutions.com", phone: "+1 415 555 3456" }
      ],
      isActive: true,
      hasActiveProjects: false
    },
    {
      id: "client-003",
      name: "Ministry of Education",
      code: "MOE-2023",
      registrationNumber: "GOV9876543",
      registrationFinancial: "FIN5432167",
      type: "government",
      address: "789 Government Plaza, Capital City",
      location: { lat: 51.5074, lng: -0.1278 },
      phone: "+44 20 1234 5678",
      mobile: "+44 7700 900123",
      emails: ["info@education.gov", "procurement@education.gov"],
      contacts: [
        { id: "contact-005", name: "Robert Brown", jobTitle: "Procurement Director", email: "robert@education.gov", phone: "+44 20 1234 5679" },
        { id: "contact-006", name: "Elizabeth Green", jobTitle: "Finance Manager", email: "elizabeth@education.gov", phone: "+44 20 1234 5680" }
      ],
      isActive: true,
      hasActiveProjects: true
    },
    {
      id: "client-004",
      name: "Dr. Alan Wilson",
      code: "AW-2023",
      registrationNumber: "IND5678901",
      type: "individual",
      address: "321 Professional Ave, Melbourne, Australia",
      location: { lat: -37.8136, lng: 144.9631 },
      phone: "+61 3 9876 5432",
      mobile: "+61 4 1234 5678",
      emails: ["dr.wilson@email.com"],
      contacts: [
        { id: "contact-007", name: "Alan Wilson", jobTitle: "Consultant", email: "dr.wilson@email.com", phone: "+61 3 9876 5432" }
      ],
      isActive: false,
      hasActiveProjects: false
    },
    {
      id: "client-005",
      name: "Community Development Association",
      code: "CDA-2023",
      registrationNumber: "NGO9876543",
      type: "ngo",
      address: "567 Community Road, Nairobi, Kenya",
      location: { lat: -1.2921, lng: 36.8219 },
      phone: "+254 20 123 4567",
      mobile: "+254 7XX XXX XXX",
      emails: ["info@cda.org", "projects@cda.org", "admin@cda.org"],
      contacts: [
        { id: "contact-008", name: "Grace Mwangi", jobTitle: "Executive Director", email: "grace@cda.org", phone: "+254 7XX XXX XXX" },
        { id: "contact-009", name: "David Ochieng", jobTitle: "Project Manager", email: "david@cda.org", phone: "+254 7XX XXX XXX" }
      ],
      isActive: true,
      hasActiveProjects: true
    },
    {
      id: "client-006",
      name: "EcoSolutions Ltd",
      code: "ECO-2023",
      registrationNumber: "CORP1234987",
      type: "company",
      address: "890 Green Street, Berlin, Germany",
      location: { lat: 52.5200, lng: 13.4050 },
      phone: "+49 30 123456",
      mobile: "+49 151 12345678",
      emails: ["contact@ecosolutions.de", "info@ecosolutions.de"],
      contacts: [
        { id: "contact-010", name: "Hans Mueller", jobTitle: "CEO", email: "hans@ecosolutions.de", phone: "+49 30 123457" },
        { id: "contact-011", name: "Anna Schmidt", jobTitle: "Sustainability Officer", email: "anna@ecosolutions.de", phone: "+49 30 123458" }
      ],
      isActive: true,
      hasActiveProjects: false
    }
  ];
  
  return [...clients];
};

export const getClientStats = (): ClientStats => {
  const allClients = getClients();
  
  const typeCountMap: Record<OrganizationType, number> = {
    ngo: 0,
    company: 0,
    government: 0,
    individual: 0,
    other: 0
  };
  
  allClients.forEach(client => {
    if (typeCountMap[client.type] !== undefined) {
      typeCountMap[client.type]++;
    }
  });
  
  const byType = Object.entries(typeCountMap)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      type: type as OrganizationType,
      count
    }));
  
  return {
    totalClients: allClients.length,
    activeClients: allClients.filter(client => client.isActive).length,
    byType,
    clientsWithProjects: allClients.filter(client => client.hasActiveProjects).length
  };
};

export const addClient = (client: Omit<Client, "id">): Client => {
  const newClient = {
    ...client,
    id: `client-${String(clients.length + 1).padStart(3, '0')}`
  };
  
  clients.push(newClient);
  return newClient;
};

export const updateClient = (id: string, clientData: Partial<Client>): Client | null => {
  const index = clients.findIndex(client => client.id === id);
  
  if (index === -1) {
    return null;
  }
  
  clients[index] = {
    ...clients[index],
    ...clientData
  };
  
  return clients[index];
};

export const deleteClient = (id: string): boolean => {
  const initialLength = clients.length;
  clients = clients.filter(client => client.id !== id);
  
  return clients.length !== initialLength;
};

export const getClientById = (id: string): Client | undefined => {
  return clients.find(client => client.id === id);
};

let suppliers: Supplier[] = [];

export const getSuppliers = (): Supplier[] => {
  if (suppliers.length > 0) {
    return [...suppliers];
  }

  suppliers = [
    {
      id: "sup-001",
      name: "Quality Building Materials",
      code: "QBM-2023",
      registrationNumber: "SUP1234567",
      type: "company",
      address: "123 Construction Rd, New York, NY",
      emails: ["info@qbm.com"],
      contacts: [
        { id: "contact-001", name: "James Wilson", jobTitle: "Sales Manager", email: "james@qbm.com", phone: "+1 234 567 8901" }
      ],
      isActive: true,
      hasActiveProjects: true
    },
    {
      id: "sup-002",
      name: "Medical Supplies Inc",
      code: "MSI-2023",
      registrationNumber: "SUP7654321",
      type: "company",
      address: "456 Health Ave, Chicago, IL",
      emails: ["sales@medsupplies.com", "info@medsupplies.com"],
      contacts: [
        { id: "contact-002", name: "Emily Brown", jobTitle: "Account Manager", email: "emily@medsupplies.com", phone: "+1 345 678 9012" }
      ],
      isActive: true,
      hasActiveProjects: false
    },
    {
      id: "sup-003",
      name: "Green Earth NGO Supplies",
      code: "GES-2023",
      type: "ngo",
      address: "789 Eco St, Portland, OR",
      emails: ["contact@greenearthsupplies.org"],
      contacts: [
        { id: "contact-003", name: "Michael Green", jobTitle: "Director", email: "michael@greenearthsupplies.org", phone: "+1 456 789 0123" }
      ],
      isActive: false,
      hasActiveProjects: false
    },
    {
      id: "sup-004",
      name: "Government Office Supplies",
      code: "GOS-2023",
      registrationNumber: "GOV9876543",
      type: "government",
      address: "101 Federal Plaza, Washington, DC",
      emails: ["procurement@govsupplies.gov"],
      contacts: [
        { id: "contact-004", name: "Sarah Johnson", jobTitle: "Procurement Officer", email: "sarah@govsupplies.gov", phone: "+1 567 890 1234" }
      ],
      isActive: true,
      hasActiveProjects: true
    },
    {
      id: "sup-005",
      name: "Tech Solutions Providers",
      code: "TSP-2023",
      registrationNumber: "CORP5678901",
      type: "company",
      address: "202 Innovation Way, San Francisco, CA",
      emails: ["sales@techsolutions.com", "support@techsolutions.com"],
      contacts: [
        { id: "contact-005", name: "David Lee", jobTitle: "Sales Director", email: "david@techsolutions.com", phone: "+1 678 901 2345" },
        { id: "contact-006", name: "Lisa Chen", jobTitle: "Account Executive", email: "lisa@techsolutions.com", phone: "+1 789 012 3456" }
      ],
      isActive: true,
      hasActiveProjects: true,
      productCategories: ["IT Equipment", "Software", "Services"]
    }
  ];
  
  return [...suppliers];
};

export const getSupplierStats = (): SupplierStats => {
  const allSuppliers = getSuppliers();
  
  const typeCountMap: Record<OrganizationType, number> = {
    ngo: 0,
    company: 0,
    government: 0,
    individual: 0,
    other: 0
  };
  
  allSuppliers.forEach(supplier => {
    if (typeCountMap[supplier.type] !== undefined) {
      typeCountMap[supplier.type]++;
    }
  });
  
  const byType = Object.entries(typeCountMap)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      type: type as OrganizationType,
      count
    }));
  
  return {
    totalSuppliers: allSuppliers.length,
    activeSuppliers: allSuppliers.filter(supplier => supplier.isActive).length,
    byType,
    suppliersWithProjects: allSuppliers.filter(supplier => supplier.hasActiveProjects).length
  };
};

export const addSupplier = (supplier: Omit<Supplier, "id">): Supplier => {
  const newSupplier = {
    ...supplier,
    id: `sup-${String(suppliers.length + 1).padStart(3, '0')}`
  };
  
  suppliers.push(newSupplier);
  return newSupplier;
};

export const updateSupplier = (id: string, supplierData: Partial<Supplier>): Supplier | null => {
  const index = suppliers.findIndex(supplier => supplier.id === id);
  
  if (index === -1) {
    return null;
  }
  
  suppliers[index] = {
    ...suppliers[index],
    ...supplierData
  };
  
  return suppliers[index];
};

export const deleteSupplier = (id: string): boolean => {
  const initialLength = suppliers.length;
  suppliers = suppliers.filter(supplier => supplier.id !== id);
  
  return suppliers.length !== initialLength;
};

export const getSupplierById = (id: string): Supplier | undefined => {
  return suppliers.find(supplier => supplier.id === id);
};

let products: (SupplyProduct | TransportService)[] = [];

export const getProducts = (): (SupplyProduct | TransportService)[] => {
  if (products.length > 0) {
    return [...products];
  }

  products = [
    {
      id: "prod-001",
      name: "Rice (25kg bag)",
      code: "FOOD-001",
      category: "food",
      unit: "bag",
      isTaxable: true,
      taxRate: 11
    },
    {
      id: "prod-002",
      name: "Cooking Oil (5L)",
      code: "FOOD-002",
      category: "food",
      unit: "bottle",
      isTaxable: true,
      taxRate: 11
    },
    {
      id: "prod-003",
      name: "Sanitizer (1L)",
      code: "HYG-001",
      category: "hygiene",
      unit: "bottle",
      isTaxable: false
    },
    {
      id: "prod-004",
      name: "Face Masks (Box of 50)",
      code: "HYG-002",
      category: "hygiene",
      unit: "box",
      isTaxable: false
    },
    {
      id: "prod-005",
      name: "10 MT Truck Transport",
      code: "TRANS-001",
      category: "transportation",
      vehicleType: "truck",
      capacity: "10MT",
      billingMethod: "per_trip",
      isTaxable: true,
      taxRate: 11
    },
    {
      id: "prod-006",
      name: "20-Seater Bus",
      code: "TRANS-002",
      category: "transportation",
      vehicleType: "bus",
      capacity: "20 passengers",
      billingMethod: "per_day",
      isTaxable: true,
      taxRate: 11
    },
    {
      id: "prod-007",
      name: "Container Shipping (20ft)",
      code: "TRANS-003",
      category: "transportation",
      vehicleType: "container",
      capacity: "20ft",
      billingMethod: "per_km",
      isTaxable: true,
      taxRate: 11
    }
  ];
  
  return [...products];
};

export const getProductCategories = (): ProductCategory[] => {
  const allProducts = getProducts();
  const categories = new Set<ProductCategory>();
  
  allProducts.forEach(product => {
    categories.add(product.category);
  });
  
  return Array.from(categories);
};

export const addProduct = (productData: Omit<SupplyProduct, "id"> | Omit<TransportService, "id">): SupplyProduct | TransportService => {
  const newProduct = {
    ...productData,
    id: `prod-${String(products.length + 1).padStart(3, '0')}`
  };
  
  const isTransportService = 'vehicleType' in newProduct && 'billingMethod' in newProduct;
  
  if (isTransportService) {
    const transportProduct = newProduct as TransportService;
    products.push(transportProduct);
    return transportProduct;
  } else {
    const supplyProduct = newProduct as SupplyProduct;
    products.push(supplyProduct);
    return supplyProduct;
  }
};

export const updateProduct = (id: string, productData: Partial<SupplyProduct | TransportService>): SupplyProduct | TransportService | null => {
  const index = products.findIndex(product => product.id === id);
  
  if (index === -1) {
    return null;
  }
  
  products[index] = {
    ...products[index],
    ...productData
  };
  
  return products[index];
};

export const deleteProduct = (id: string): boolean => {
  const initialLength = products.length;
  products = products.filter(product => product.id !== id);
  
  return products.length !== initialLength;
};

export const getProductById = (id: string): SupplyProduct | TransportService | undefined => {
  return products.find(product => product.id === id);
};
