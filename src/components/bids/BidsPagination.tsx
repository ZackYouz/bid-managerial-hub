
import React from 'react';
import { Button } from "@/components/ui/button";

interface BidsPaginationProps {
  currentPage: number;
  totalPages: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  totalItems: number;
  onPageChange: (pageNumber: number) => void;
}

const BidsPagination = ({ 
  currentPage, 
  totalPages, 
  indexOfFirstItem, 
  indexOfLastItem, 
  totalItems, 
  onPageChange 
}: BidsPaginationProps) => {
  if (totalItems <= indexOfLastItem - indexOfFirstItem) {
    return null;
  }
  
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} bids
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default BidsPagination;
