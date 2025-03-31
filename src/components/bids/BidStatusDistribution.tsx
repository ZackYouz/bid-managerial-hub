
import React from 'react';
import { getStatusColor } from "@/utils/helpers";
import { BidStatus } from "@/types";
import { Bid } from "@/types";

interface BidStatusDistributionProps {
  bids: Bid[];
}

const BidStatusDistribution = ({ bids }: BidStatusDistributionProps) => {
  const statusTypes: BidStatus[] = ['draft', 'pending', 'submitted', 'won', 'lost', 'expired', 'cancelled'];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Bid Status Distribution</h3>
      {statusTypes.map((status) => {
        const count = bids.filter(bid => bid.status === status).length;
        const percentage = bids.length > 0 ? (count / bids.length) * 100 : 0;
        
        return (
          <div key={status} className="flex items-center">
            <div className="w-1/4 font-medium text-sm">
              {status ? (status.charAt(0).toUpperCase() + status.slice(1)) : 'N/A'}
            </div>
            <div className="w-3/4">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getStatusColor(status).replace('text-', 'bg-')}`}
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
  );
};

export default BidStatusDistribution;
