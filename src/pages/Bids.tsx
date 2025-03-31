
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBids, createBid } from "@/services/dataService";
import { Bid, BidStatus, BidType } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import refactored components
import BidsStatCards from "@/components/bids/BidsStatCards";
import BidsFilters from "@/components/bids/BidsFilters";
import BidsTable from "@/components/bids/BidsTable";
import BidsPagination from "@/components/bids/BidsPagination";
import CreateBidDialog from "@/components/bids/CreateBidDialog";
import BidsReport from "@/components/bids/BidsReport";

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
  const handleCreateBid = (bidData: any) => {
    // Call the data service to create a new bid
    const createdBid = createBid(bidData);
    
    // Update the local state
    setBids(prevBids => [...prevBids, createdBid]);
    
    // Close dialog
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

  // Handle filter reset
  const handleFilterReset = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setBidTypeFilter("all");
  };
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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
        
        <CreateBidDialog 
          isOpen={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleCreateBid}
        />
      </div>
      
      {/* Bid Statistics */}
      <BidsStatCards bids={bids} />

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Bid List</TabsTrigger>
          <TabsTrigger value="report">Bid Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {/* Filters and Search */}
          <BidsFilters 
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            bidTypeFilter={bidTypeFilter}
            sortField={sortField}
            sortDirection={sortDirection}
            onSearchChange={setSearchQuery}
            onStatusFilterChange={setStatusFilter}
            onBidTypeFilterChange={setBidTypeFilter}
            onSortChange={handleSort}
          />
          
          {/* Bids Table */}
          <BidsTable 
            bids={bids}
            currentItems={currentItems}
            onRowClick={handleRowClick}
            onCreateBidClick={() => setDialogOpen(true)}
            onFilterReset={handleFilterReset}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
          />
          
          {/* Pagination */}
          <BidsPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
            totalItems={filteredBids.length}
            onPageChange={handlePageChange}
          />
        </TabsContent>
        
        <TabsContent value="report" className="space-y-4">
          <BidsReport bids={bids} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Bids;
