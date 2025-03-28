
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBids, createBid } from "@/services/dataService";
import { Bid, BidStatus, BidType } from "@/types";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bids</h1>
          <p className="text-muted-foreground">
            Create and manage all your bids in one place
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
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
      
      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search bids..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>Filter Bids</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-gray-500 pt-2">
                  Status
                </DropdownMenuLabel>
                <div className="p-2">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as BidStatus | "all")}
                  >
                    <SelectTrigger>
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
                </div>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-gray-500 pt-2">
                  Bid Type
                </DropdownMenuLabel>
                <div className="p-2">
                  <Select
                    value={bidTypeFilter}
                    onValueChange={(value) => setBidTypeFilter(value as BidType | "all")}
                  >
                    <SelectTrigger>
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
                </div>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <div className="p-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setStatusFilter("all");
                    setBidTypeFilter("all");
                    setSearchQuery("");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
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
      </div>
      
      {/* Bids Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bid Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((bid) => {
                  const daysLeft = getRemainingDays(bid.deadline);
                  return (
                    <TableRow 
                      key={bid.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRowClick(bid.id)}
                    >
                      <TableCell className="font-medium">{bid.bidName}</TableCell>
                      <TableCell>{bid.clientName}</TableCell>
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
                      <TableCell>
                        {bid.bidType.charAt(0).toUpperCase() + bid.bidType.slice(1)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
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
        </CardContent>
        
        {/* Pagination */}
        {filteredBids.length > itemsPerPage && (
          <CardFooter className="flex items-center justify-between border-t px-6 py-4">
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
          </CardFooter>
        )}
      </Card>
      
      {/* Quick Status Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-2 rounded-full mb-2">
                <FileCheck className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold">
                {bids.filter(bid => bid.status === 'pending').length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="bg-purple-100 p-2 rounded-full mb-2">
                <Clock3 className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-sm font-medium">Submitted</p>
              <p className="text-2xl font-bold">
                {bids.filter(bid => bid.status === 'submitted').length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-2 rounded-full mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm font-medium">Won</p>
              <p className="text-2xl font-bold">
                {bids.filter(bid => bid.status === 'won').length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="bg-red-100 p-2 rounded-full mb-2">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-sm font-medium">Lost</p>
              <p className="text-2xl font-bold">
                {bids.filter(bid => bid.status === 'lost').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Bids;
