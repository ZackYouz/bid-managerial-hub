
import React from 'react';
import { formatDate, getStatusColor, getDeadlineColor, getRemainingDays } from "@/utils/helpers";
import { Bid } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Search, ArrowUpDown } from "lucide-react";

interface BidsTableProps {
  bids: Bid[];
  currentItems: Bid[];
  onRowClick: (id: string) => void;
  onCreateBidClick: () => void;
  onFilterReset: () => void;
  onSort: (field: keyof Bid) => void;
  sortField: keyof Bid;
  sortDirection: "asc" | "desc";
}

const BidsTable = ({ 
  bids,
  currentItems,
  onRowClick,
  onCreateBidClick,
  onFilterReset,
  onSort,
  sortField,
  sortDirection
}: BidsTableProps) => {
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer" 
              onClick={() => onSort('bidName')}
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
                  onClick={() => onRowClick(bid.id)}
                >
                  <TableCell className="font-medium">{bid.bidName}</TableCell>
                  <TableCell>{bid.clientName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {bid.bidType ? (bid.bidType.charAt(0).toUpperCase() + bid.bidType.slice(1)) : 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {bid.purchaseType ? (bid.purchaseType.charAt(0).toUpperCase() + bid.purchaseType.slice(1)) : 'N/A'}
                  </TableCell>
                  <TableCell>{formatDate(bid.deadline)}</TableCell>
                  <TableCell>
                    <span className={getDeadlineColor(bid.deadline)}>
                      {daysLeft > 0 ? daysLeft : daysLeft === 0 ? 'Today' : 'Overdue'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(bid.status)}>
                      {bid.status ? (bid.status.charAt(0).toUpperCase() + bid.status.slice(1)) : 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <span onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(bid.id);
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
                    <Button variant="outline" className="mt-4" onClick={onCreateBidClick}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Bid
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Search className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-muted-foreground">No matching bids found</p>
                    <Button variant="outline" className="mt-4" onClick={onFilterReset}>
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
  );
};

export default BidsTable;
