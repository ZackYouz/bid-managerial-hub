
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";
import { BidStatus, BidType } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BidsFiltersProps {
  searchQuery: string;
  statusFilter: BidStatus | "all";
  bidTypeFilter: BidType | "all";
  sortField: string;
  sortDirection: "asc" | "desc";
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: BidStatus | "all") => void;
  onBidTypeFilterChange: (type: BidType | "all") => void;
  onSortChange: (field: any) => void;
}

const BidsFilters = ({
  searchQuery,
  statusFilter,
  bidTypeFilter,
  sortField,
  sortDirection,
  onSearchChange,
  onStatusFilterChange,
  onBidTypeFilterChange,
  onSortChange
}: BidsFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-grow">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bids..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Select
        value={statusFilter}
        onValueChange={(value) => onStatusFilterChange(value as BidStatus | "all")}
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
        onValueChange={(value) => onBidTypeFilterChange(value as BidType | "all")}
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
          <DropdownMenuItem onClick={() => onSortChange('bidName')}>
            Bid Name {sortField === 'bidName' && (sortDirection === 'asc' ? '↑' : '↓')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('clientName')}>
            Client Name {sortField === 'clientName' && (sortDirection === 'asc' ? '↑' : '↓')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('deadline')}>
            Deadline {sortField === 'deadline' && (sortDirection === 'asc' ? '↑' : '↓')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('status')}>
            Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('createdAt')}>
            Created Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BidsFilters;
