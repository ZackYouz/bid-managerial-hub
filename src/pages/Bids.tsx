
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBids, createBid } from "@/services/dataService";
import { Bid, BidStatus, BidType, PurchaseType } from "@/types";
import { formatDate, getStatusColor, getDeadlineColor, getRemainingDays } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Search, ArrowUpDown, Calendar, Clock, FileCheck, CheckCircle, XCircle, Clock3, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Bids = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [filteredBids, setFilteredBids] = useState<Bid[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BidStatus | "all">("all");
  const [bidTypeFilter, setBidTypeFilter] = useState<BidType | "all">("all");
  const [sortField, setSortField] = useState<keyof Bid>("deadline");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // New bid form state
  const [newBid, setNewBid] = useState({
    bidName: "",
    clientName: "",
    bidType: "private" as BidType,
    purchaseType: "goods" as PurchaseType,
    status: "draft" as BidStatus,
    deadline: "",
    notes: "",
    estimatedValue: ""
  });
  
  const navigate = useNavigate();
  
  // Load bids from storage
  useEffect(() => {
    const loadedBids = getBids();
    setBids(loadedBids);
    setFilteredBids(loadedBids);
  }, []);
  
  // Filter and sort bids when any filter changes
  useEffect(() => {
    let result = [...bids];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        bid =>
          bid.bidName.toLowerCase().includes(query) ||
          bid.clientName.toLowerCase().includes(query) ||
          bid.bidNumber.toLowerCase().includes(query) ||
          bid.notes?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(bid => bid.status === statusFilter);
    }
    
    // Apply bid type filter
    if (bidTypeFilter !== "all") {
      result = result.filter(bid => bid.bidType === bidTypeFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc'
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      return 0;
    });
    
    setFilteredBids(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [bids, searchQuery, statusFilter, bidTypeFilter, sortField, sortDirection]);
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBids.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBids.length / itemsPerPage);
  
  // Handle bid creation
  const handleCreateBid = () => {
    if (!newBid.bidName || !newBid.clientName || !newBid.deadline) {
      // Show error - for a real app we'd use proper form validation
      return;
    }
    
    const bidData = {
      ...newBid,
      estimatedValue: newBid.estimatedValue ? parseFloat(newBid.estimatedValue) : undefined,
    };
    
    // Call the data service to create a new bid
    const createdBid = createBid(bidData);
    
    // Update the local state
    setBids(prevBids => [...prevBids, createdBid]);
    
    // Reset form and close dialog
    setNewBid({
      bidName: "",
      clientName: "",
      bidType: "private",
      purchaseType: "goods",
      status: "draft",
      deadline: "",
      notes: "",
      estimatedValue: ""
    });
    
    setDialogOpen(false);
  };
  
  // Handle sorting change
  const handleSort = (field: keyof Bid) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle row click to navigate to bid details
  const handleRowClick = (id: string) => {
    navigate(`/bids/${id}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bids</h1>
          <p className="text-muted-foreground">
            Create and manage all your bids in one place
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Bid
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Bid</DialogTitle>
              <DialogDescription>
                Enter the details for your new bid. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bidName" className="text-right">
                  Bid Name *
                </Label>
                <Input
                  id="bidName"
                  placeholder="Project name or description"
                  className="col-span-3"
                  value={newBid.bidName}
                  onChange={(e) => setNewBid({ ...newBid, bidName: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="clientName" className="text-right">
                  Client Name *
                </Label>
                <Input
                  id="clientName"
                  placeholder="Client or company name"
                  className="col-span-3"
                  value={newBid.clientName}
                  onChange={(e) => setNewBid({ ...newBid, clientName: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bidType" className="text-right">
                  Bid Type *
                </Label>
                <Select
                  value={newBid.bidType}
                  onValueChange={(value) => setNewBid({ ...newBid, bidType: value as BidType })}
                >
                  <SelectTrigger id="bidType" className="col-span-3">
                    <SelectValue placeholder="Select bid type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="nonprofit">Nonprofit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="purchaseType" className="text-right">
                  Purchase Type *
                </Label>
                <Select
                  value={newBid.purchaseType}
                  onValueChange={(value) => setNewBid({ ...newBid, purchaseType: value as PurchaseType })}
                >
                  <SelectTrigger id="purchaseType" className="col-span-3">
                    <SelectValue placeholder="Select purchase type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goods">Goods</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="works">Works</SelectItem>
                    <SelectItem value="consultancy">Consultancy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status *
                </Label>
                <Select
                  value={newBid.status}
                  onValueChange={(value) => setNewBid({ ...newBid, status: value as BidStatus })}
                >
                  <SelectTrigger id="status" className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deadline" className="text-right">
                  Deadline *
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  className="col-span-3"
                  value={newBid.deadline}
                  onChange={(e) => setNewBid({ ...newBid, deadline: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estimatedValue" className="text-right">
                  Est. Value
                </Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  placeholder="Estimated value in $"
                  className="col-span-3"
                  value={newBid.estimatedValue}
                  onChange={(e) => setNewBid({ ...newBid, estimatedValue: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  placeholder="Additional information"
                  className="col-span-3"
                  value={newBid.notes}
                  onChange={(e) => setNewBid({ ...newBid, notes: e.target.value })}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBid}>Create Bid</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Bid Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bids.length}</div>
            <p className="text-xs text-muted-foreground">
              All registered bids
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bids.filter(bid => ['draft', 'pending', 'submitted'].includes(bid.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active bids
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won Bids</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bids.filter(bid => bid.status === 'won').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully won bids
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bids.filter(bid => 
                ['draft', 'pending'].includes(bid.status) && 
                getRemainingDays(bid.deadline) <= 7 && 
                getRemainingDays(bid.deadline) >= 0
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Bids due within 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Bid List</TabsTrigger>
          <TabsTrigger value="report">Bid Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bids..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as BidStatus | "all")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={bidTypeFilter}
              onValueChange={(value) => setBidTypeFilter(value as BidType | "all")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="nonprofit">Nonprofit</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSort('bidName')}>
                  Bid Name {sortField === 'bidName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('clientName')}>
                  Client Name {sortField === 'clientName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('deadline')}>
                  Deadline {sortField === 'deadline' && (sortDirection === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('status')}>
                  Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('createdAt')}>
                  Created Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Bids Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort('bidName')}
                  >
                    <div className="flex items-center">
                      Bid Name
                      {sortField === 'bidName' && (
                        sortDirection === 'asc' 
                          ? <ArrowUpDown className="ml-2 h-4 w-4" /> 
                          : <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Purchase Type</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((bid) => {
                    const daysLeft = getRemainingDays(bid.deadline);
                    return (
                      <TableRow 
                        key={bid.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(bid.id)}
                      >
                        <TableCell className="font-medium">{bid.bidName}</TableCell>
                        <TableCell>{bid.clientName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {bid.bidType.charAt(0).toUpperCase() + bid.bidType.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{bid.purchaseType.charAt(0).toUpperCase() + bid.purchaseType.slice(1)}</TableCell>
                        <TableCell>{formatDate(bid.deadline)}</TableCell>
                        <TableCell>
                          <span className={getDeadlineColor(bid.deadline)}>
                            {daysLeft > 0 ? daysLeft : daysLeft === 0 ? 'Today' : 'Overdue'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(bid.status)}>
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <span onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(bid.id);
                            }}>View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {bids.length === 0 ? (
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="h-10 w-10 text-gray-300 mb-2" />
                          <p className="text-muted-foreground">No bids found. Create your first bid!</p>
                          <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Bid
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Search className="h-10 w-10 text-gray-300 mb-2" />
                          <p className="text-muted-foreground">No matching bids found</p>
                          <Button variant="outline" className="mt-4" onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("all");
                            setBidTypeFilter("all");
                          }}>
                            Reset Filters
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {filteredBids.length > itemsPerPage && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBids.length)} of {filteredBids.length} bids
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bid Statistics</CardTitle>
              <CardDescription>
                Overview of your bid performance and status distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="space-y-4">
                {/* Status Distribution */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Bid Status Distribution</h3>
                  {['draft', 'pending', 'submitted', 'won', 'lost', 'expired', 'cancelled'].map((status) => {
                    const count = bids.filter(bid => bid.status === status).length;
                    const percentage = bids.length > 0 ? (count / bids.length) * 100 : 0;
                    
                    return (
                      <div key={status} className="flex items-center">
                        <div className="w-1/4 font-medium text-sm">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </div>
                        <div className="w-3/4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${getStatusColor(status as BidStatus).replace('text-', 'bg-')}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground w-12">{count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Bid Type Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {['government', 'private', 'nonprofit', 'other'].map((type) => {
                          const count = bids.filter(bid => bid.bidType === type).length;
                          const percentage = bids.length > 0 ? (count / bids.length) * 100 : 0;
                          
                          return (
                            <div key={type} className="flex items-center">
                              <div className="w-1/3 font-medium text-sm">
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </div>
                              <div className="w-2/3">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                                    <div 
                                      className="h-full rounded-full bg-primary"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-muted-foreground w-12">{count}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Purchase Type Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {['goods', 'services', 'works', 'consultancy'].map((type) => {
                          const count = bids.filter(bid => bid.purchaseType === type).length;
                          const percentage = bids.length > 0 ? (count / bids.length) * 100 : 0;
                          
                          return (
                            <div key={type} className="flex items-center">
                              <div className="w-1/3 font-medium text-sm">
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </div>
                              <div className="w-2/3">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                                    <div 
                                      className="h-full rounded-full bg-primary"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-muted-foreground w-12">{count}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Bids;
