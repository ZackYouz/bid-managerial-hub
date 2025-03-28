import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  getBidById, 
  updateBid, 
  deleteBid, 
  createProject, 
  getProjectsByBidId,
  getCostsByBidId,
  createCostItem,
  updateCostItem,
  deleteCostItem
} from "@/services/dataService";
import { Bid, BidStatus, BidType, Project, CostItem } from "@/types";
import { formatDate, getStatusColor, formatCurrency, calculateProfitMargin } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsContent as TabContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  Pencil, 
  Calendar, 
  Trash2, 
  Save, 
  FolderPlus,
  FileText,
  DollarSign,
  Archive, 
  Clock,
  Plus,
  FileCheck,
  FileMinus,
  CheckCircle,
  XCircle,
  ClipboardList
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BidDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [bid, setBid] = useState<Bid | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBid, setEditedBid] = useState<Partial<Bid>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "active" as const
  });
  const [newCost, setNewCost] = useState({
    category: "",
    description: "",
    supplierPrice: "",
    internalCost: "",
    clientPrice: "",
    quantity: "1",
    unit: ""
  });
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!id) return;
    
    const bidData = getBidById(id);
    if (bidData) {
      setBid(bidData);
      setEditedBid(bidData);
    } else {
      navigate('/bids');
    }
    
    setProjects(getProjectsByBidId(id));
    setCosts(getCostsByBidId(id));
  }, [id, navigate]);
  
  if (!bid) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading bid details...</p>
      </div>
    );
  }
  
  const handleEditToggle = () => {
    if (isEditing) {
      setEditedBid(bid);
    }
    setIsEditing(!isEditing);
  };
  
  const handleSave = () => {
    if (!id) return;
    
    const updatedBid = updateBid(id, editedBid);
    if (updatedBid) {
      setBid(updatedBid);
      setIsEditing(false);
      
      toast({
        title: "Bid Updated",
        description: "Bid details have been saved successfully.",
      });
    }
  };
  
  const handleDelete = () => {
    if (!id) return;
    
    const deleted = deleteBid(id);
    
    if (deleted) {
      toast({
        title: "Bid Deleted",
        description: "The bid has been deleted successfully.",
      });
      
      navigate('/bids');
    }
  };
  
  const handleStatusChange = (status: BidStatus) => {
    if (!id) return;
    
    const updatedBid = updateBid(id, { status });
    if (updatedBid) {
      setBid(updatedBid);
      
      toast({
        title: "Status Updated",
        description: `Bid status changed to ${status}.`,
      });
    }
  };
  
  const handleCreateProject = () => {
    if (!id) return;
    
    if (!newProject.name) {
      toast({
        title: "Validation Error",
        description: "Project name is required.",
        variant: "destructive"
      });
      return;
    }
    
    const createdProject = createProject({
      ...newProject,
      bidId: id,
      clientName: bid.clientName,
    });
    
    if (createdProject) {
      setProjects([...projects, createdProject]);
      setNewProject({
        name: "",
        description: "",
        status: "active"
      });
      
      setProjectDialogOpen(false);
      
      toast({
        title: "Project Created",
        description: "New project has been created successfully.",
      });
    }
  };
  
  const handleCreateCost = () => {
    if (!id) return;
    
    if (!newCost.category || !newCost.description) {
      toast({
        title: "Validation Error",
        description: "Category and description are required.",
        variant: "destructive"
      });
      return;
    }
    
    const costData = {
      bidId: id,
      category: newCost.category,
      description: newCost.description,
      supplierPrice: newCost.supplierPrice ? parseFloat(newCost.supplierPrice) : undefined,
      internalCost: newCost.internalCost ? parseFloat(newCost.internalCost) : undefined,
      clientPrice: newCost.clientPrice ? parseFloat(newCost.clientPrice) : undefined,
      quantity: parseInt(newCost.quantity) || 1,
      unit: newCost.unit
    };
    
    const createdCost = createCostItem(costData);
    
    if (createdCost) {
      setCosts([...costs, createdCost]);
      setNewCost({
        category: "",
        description: "",
        supplierPrice: "",
        internalCost: "",
        clientPrice: "",
        quantity: "1",
        unit: ""
      });
      
      setCostDialogOpen(false);
      
      toast({
        title: "Cost Item Added",
        description: "New cost item has been added successfully.",
      });
    }
  };
  
  const handleDeleteCost = (costId: string) => {
    if (deleteCostItem(costId)) {
      setCosts(costs.filter(cost => cost.id !== costId));
      
      toast({
        title: "Cost Item Deleted",
        description: "The cost item has been removed.",
      });
    }
  };
  
  const handleConvertToProject = () => {
    const projectStatus: 'active' | 'completed' | 'on-hold' | 'cancelled' = 'active';
    
    const projectData = {
      bidId: bid.id,
      name: bid.bidName,
      description: bid.notes,
      status: projectStatus,
      clientName: bid.clientName,
      files: []
    };
    
    const createdProject = createProject(projectData);
    
    if (createdProject) {
      setProjects([...projects, createdProject]);
      setNewProject({
        name: "",
        description: "",
        status: "active"
      });
      
      setProjectDialogOpen(false);
      
      toast({
        title: "Project Created",
        description: "New project has been created successfully.",
      });
    }
  };
  
  const financialSummary = (() => {
    const totalSupplierPrice = costs.reduce((sum, cost) => {
      return sum + (cost.supplierPrice || 0) * cost.quantity;
    }, 0);
    
    const totalInternalCost = costs.reduce((sum, cost) => {
      return sum + (cost.internalCost || 0) * cost.quantity;
    }, 0);
    
    const totalClientPrice = costs.reduce((sum, cost) => {
      return sum + (cost.clientPrice || 0) * cost.quantity;
    }, 0);
    
    const grossProfit = totalClientPrice - totalSupplierPrice;
    const netProfit = totalClientPrice - totalInternalCost;
    
    return {
      totalSupplierPrice,
      totalInternalCost,
      totalClientPrice,
      grossProfit,
      netProfit,
      grossMargin: calculateProfitMargin(totalSupplierPrice, totalClientPrice),
      netMargin: calculateProfitMargin(totalInternalCost, totalClientPrice)
    };
  })();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button variant="outline" onClick={() => navigate('/bids')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bids
        </Button>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={handleEditToggle}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Bid</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this bid? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleEditToggle}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? (
                <Input
                  value={editedBid.bidName || ""}
                  onChange={(e) => setEditedBid({ ...editedBid, bidName: e.target.value })}
                  className="text-2xl font-bold h-10 px-1"
                />
              ) : (
                bid.bidName
              )}
            </h1>
            <p className="text-muted-foreground">
              Bid Number: {bid.bidNumber}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(bid.status)}>
              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
            </Badge>
            
            <Badge variant="outline">
              {bid.bidType.charAt(0).toUpperCase() + bid.bidType.slice(1)}
            </Badge>
            
            <div className="flex items-center text-sm gap-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{formatDate(bid.createdAt)}</span>
            </div>
          </div>
        </div>
        
        {!isEditing && bid.status !== 'won' && bid.status !== 'lost' && (
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm"
              className="gap-2 bg-green-500 hover:bg-green-600"
              onClick={() => handleStatusChange('won')}
            >
              <CheckCircle className="h-4 w-4" />
              Mark as Won
            </Button>
            
            <Button 
              size="sm"
              variant="destructive"
              className="gap-2"
              onClick={() => handleStatusChange('lost')}
            >
              <XCircle className="h-4 w-4" />
              Mark as Lost
            </Button>
            
            {bid.status === 'draft' && (
              <Button 
                size="sm"
                variant="secondary"
                className="gap-2"
                onClick={() => handleStatusChange('pending')}
              >
                <FileCheck className="h-4 w-4" />
                Mark as Pending
              </Button>
            )}
            
            {bid.status === 'pending' && (
              <Button 
                size="sm"
                variant="secondary"
                className="gap-2"
                onClick={() => handleStatusChange('submitted')}
              >
                <FileText className="h-4 w-4" />
                Mark as Submitted
              </Button>
            )}
          </div>
        )}
      </div>
      
      <Separator />
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b mb-4 rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none bg-transparent px-4 py-2"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="projects" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none bg-transparent px-4 py-2"
          >
            Projects
          </TabsTrigger>
          <TabsTrigger 
            value="costing" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none bg-transparent px-4 py-2"
          >
            Costing
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Bid Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Client Name</Label>
                      {isEditing ? (
                        <Input
                          value={editedBid.clientName || ""}
                          onChange={(e) => setEditedBid({ ...editedBid, clientName: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm mt-1">{bid.clientName}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label>Bid Type</Label>
                      {isEditing ? (
                        <Select
                          value={editedBid.bidType || "private"}
                          onValueChange={(value) => setEditedBid({ ...editedBid, bidType: value as BidType })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select bid type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="government">Government</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="nonprofit">Nonprofit</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm mt-1">
                          {bid.bidType.charAt(0).toUpperCase() + bid.bidType.slice(1)}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label>Status</Label>
                      {isEditing ? (
                        <Select
                          value={editedBid.status || "draft"}
                          onValueChange={(value) => setEditedBid({ ...editedBid, status: value as BidStatus })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="won">Won</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm mt-1">
                          <Badge className={getStatusColor(bid.status)}>
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </Badge>
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label>Deadline</Label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editedBid.deadline ? new Date(editedBid.deadline).toISOString().split('T')[0] : ""}
                          onChange={(e) => setEditedBid({ ...editedBid, deadline: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm mt-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {formatDate(bid.deadline)}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label>Estimated Value</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editedBid.estimatedValue || ""}
                          onChange={(e) => setEditedBid({ ...editedBid, estimatedValue: parseFloat(e.target.value) })}
                        />
                      ) : (
                        <p className="text-sm mt-1">{formatCurrency(bid.estimatedValue)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Notes</Label>
                    {isEditing ? (
                      <Textarea
                        value={editedBid.notes || ""}
                        onChange={(e) => setEditedBid({ ...editedBid, notes: e.target.value })}
                        rows={4}
                      />
                    ) : (
                      <p className="text-sm mt-1 whitespace-pre-line">
                        {bid.notes || "No notes available."}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">Projects</p>
                    <p className="text-sm font-medium">{projects.length}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">Cost Items</p>
                    <p className="text-sm font-medium">{costs.length}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">Estimated Revenue</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(financialSummary.totalClientPrice)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">Estimated Cost</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(financialSummary.totalInternalCost)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between text-green-600">
                    <p className="text-sm font-medium">Estimated Profit</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(financialSummary.netProfit)}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">Created Date</p>
                    <p className="text-sm font-medium">{formatDate(bid.createdAt)}</p>
                  </div>
                  
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">Bid Number</p>
                    <p className="text-sm font-medium">{bid.bidNumber}</p>
                  </div>
                </div>
                
                {bid.status === 'won' && projects.length === 0 && (
                  <Alert className="bg-green-50 text-green-800 border-green-200 mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Bid Won</AlertTitle>
                    <AlertDescription>
                      Congratulations! Create a project to track the implementation.
                    </AlertDescription>
                  </Alert>
                )}
                
                {costs.length === 0 && (
                  <Alert className="bg-blue-50 text-blue-800 border-blue-200 mt-4">
                    <ClipboardList className="h-4 w-4" />
                    <AlertTitle>Add Cost Items</AlertTitle>
                    <AlertDescription>
                      Add cost details to track pricing and profitability.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-center gap-2">
                {bid.status === 'won' && (
                  <Button variant="outline" onClick={() => setActiveTab("projects")}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Manage Projects
                  </Button>
                )}
                
                <Button variant="outline" onClick={() => setActiveTab("costing")}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Manage Costs
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Projects</h2>
            
            <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add a new project for this bid.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="Enter project name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="projectDescription">Description</Label>
                    <Textarea
                      id="projectDescription"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="projectStatus">Status</Label>
                    <Select
                      value={newProject.status}
                      onValueChange={(value: "active" | "completed" | "on-hold" | "cancelled") => 
                        setNewProject({ ...newProject, status: value })
                      }
                    >
                      <SelectTrigger id="projectStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject}>
                    Create Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {projects.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="flex justify-between items-center">
                      <span>Created {formatDate(project.createdAt)}</span>
                      <Badge variant="outline" className="ml-2">
                        {project.status.replace('-', ' ').replace(
                          /\w\S*/g,
                          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1)
                        )}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-gray-600 my-2">
                      {project.description || "No description available"}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm mt-4">
                      <div className="flex items-center">
                        <Archive className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{project.files.length} files</span>
                      </div>
                      <Button 
                        variant="link" 
                        size="sm"
                        className="text-primary"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        View Details →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <FolderPlus className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium">No Projects Yet</h3>
                <p className="text-muted-foreground text-center mt-2 mb-4">
                  Create your first project to manage files and track progress.
                </p>
                <Button onClick={() => setProjectDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="costing" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Cost Breakdown</h2>
            
            <Dialog open={costDialogOpen} onOpenChange={setCostDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Cost Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Cost Item</DialogTitle>
                  <DialogDescription>
                    Add a new cost item for this bid.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costCategory">Category *</Label>
                      <Input
                        id="costCategory"
                        value={newCost.category}
                        onChange={(e) => setNewCost({ ...newCost, category: e.target.value })}
                        placeholder="e.g. Materials, Labor"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="costQuantity">Quantity</Label>
                      <Input
                        id="costQuantity"
                        type="number"
                        min="1"
                        value={newCost.quantity}
                        onChange={(e) => setNewCost({ ...newCost, quantity: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="costDescription">Description *</Label>
                    <Input
                      id="costDescription"
                      value={newCost.description}
                      onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                      placeholder="Brief description of the cost item"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplierPrice">Supplier Price ($)</Label>
                      <Input
                        id="supplierPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newCost.supplierPrice}
                        onChange={(e) => setNewCost({ ...newCost, supplierPrice: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="internalCost">Internal Cost ($)</Label>
                      <Input
                        id="internalCost"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newCost.internalCost}
                        onChange={(e) => setNewCost({ ...newCost, internalCost: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clientPrice">Client Price ($)</Label>
                      <Input
                        id="clientPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newCost.clientPrice}
                        onChange={(e) => setNewCost({ ...newCost, clientPrice: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="costUnit">Unit (optional)</Label>
                    <Input
                      id="costUnit"
                      value={newCost.unit}
                      onChange={(e) => setNewCost({ ...newCost, unit: e.target.value })}
                      placeholder="e.g. hours, pieces, lots"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCostDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCost}>
                    Add Cost Item
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {costs.length > 0 ? (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Supplier Price</TableHead>
                        <TableHead className="text-right">Internal Cost</TableHead>
                        <TableHead className="text-right">Client Price</TableHead>
                        <TableHead className="text-right">Profit</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costs.map((cost) => {
                        const supplierTotal = (cost.supplierPrice || 0) * cost.quantity;
                        const internalTotal = (cost.internalCost || 0) * cost.quantity;
                        const clientTotal = (cost.clientPrice || 0) * cost.quantity;
                        const profit = clientTotal - internalTotal;
                        
                        return (
                          <TableRow key={cost.id}>
                            <TableCell className="font-medium">{cost.category}</TableCell>
                            <TableCell>{cost.description}</TableCell>
                            <TableCell className="text-right">
                              {cost.quantity} {cost.unit && <span className="text-gray-500">{cost.unit}</span>}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(supplierTotal)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(internalTotal)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(clientTotal)}</TableCell>
                            <TableCell className={`text-right ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(profit)}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteCost(cost.id)}
                              >
                                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">Total Supplier Cost</p>
                          <p className="font-medium">{formatCurrency(financialSummary.totalSupplierPrice)}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">Total Internal Cost</p>
                          <p className="font-medium">{formatCurrency(financialSummary.totalInternalCost)}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">Total Client Price</p>
                          <p className="font-medium">{formatCurrency(financialSummary.totalClientPrice)}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">Gross Profit (vs Supplier)</p>
                          <p className={`font-medium ${financialSummary.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(financialSummary.grossProfit)}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">Net Profit (vs Internal)</p>
                          <p className={`font-medium ${financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(financialSummary.netProfit)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">Gross Profit Margin</p>
                          <p className="font-medium">{financialSummary.grossMargin}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">Net Profit Margin</p>
                          <p className="font-medium">{financialSummary.netMargin}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">Total Cost Items</p>
                          <p className="font-medium">{costs.length}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">Markup (Client vs Supplier)</p>
                          <p className="font-medium">
                            {financialSummary.totalSupplierPrice > 0 
                              ? `${((financialSummary.totalClientPrice / financialSummary.totalSupplierPrice - 1) * 100).toFixed(1)}%`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <DollarSign className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium">No Cost Items Yet</h3>
                <p className="text-muted-foreground text-center mt-2 mb-4">
                  Add cost items to track supplier costs, internal costs, and client pricing.
                </p>
                <Button onClick={() => setCostDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Cost Item
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BidDetails;
