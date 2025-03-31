
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bid } from "@/types";
import BidStatusDistribution from './BidStatusDistribution';
import TypeDistribution from './TypeDistribution';

interface BidsReportProps {
  bids: Bid[];
}

const BidsReport = ({ bids }: BidsReportProps) => {
  const bidTypes = ['government', 'private', 'nonprofit', 'other'];
  const purchaseTypes = ['goods', 'services', 'works', 'consultancy'];

  return (
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
          <BidStatusDistribution bids={bids} />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <TypeDistribution 
              title="Bid Type Distribution" 
              bids={bids} 
              types={bidTypes}
              typeProperty="bidType"
            />
            
            <TypeDistribution 
              title="Purchase Type Distribution" 
              bids={bids} 
              types={purchaseTypes}
              typeProperty="purchaseType" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BidsReport;
