
import React from 'react';
import { Bid } from "@/types";
import { FileText, Clock, CheckCircle, Calendar } from "lucide-react";
import { getRemainingDays } from "@/utils/helpers";
import BidStatsCard from './BidStatsCard';

interface BidsStatCardsProps {
  bids: Bid[];
}

const BidsStatCards = ({ bids }: BidsStatCardsProps) => {
  const activeBidsCount = bids.filter(bid => 
    ['draft', 'pending', 'submitted'].includes(bid.status)
  ).length;
  
  const wonBidsCount = bids.filter(bid => bid.status === 'won').length;
  
  const upcomingDeadlinesCount = bids.filter(bid => 
    ['draft', 'pending'].includes(bid.status) && 
    getRemainingDays(bid.deadline) <= 7 && 
    getRemainingDays(bid.deadline) >= 0
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <BidStatsCard
        title="Total Bids"
        value={bids.length}
        description="All registered bids"
        icon={FileText}
      />
      
      <BidStatsCard
        title="Active Bids"
        value={activeBidsCount}
        description="Currently active bids"
        icon={Clock}
      />
      
      <BidStatsCard
        title="Won Bids"
        value={wonBidsCount}
        description="Successfully won bids"
        icon={CheckCircle}
      />
      
      <BidStatsCard
        title="Upcoming Deadlines"
        value={upcomingDeadlinesCount}
        description="Bids due within 7 days"
        icon={Calendar}
      />
    </div>
  );
};

export default BidsStatCards;
