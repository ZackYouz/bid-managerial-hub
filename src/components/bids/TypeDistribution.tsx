
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bid } from "@/types";

interface TypeDistributionProps {
  title: string;
  bids: Bid[];
  types: string[];
  typeProperty: "bidType" | "purchaseType";
}

const TypeDistribution = ({ title, bids, types, typeProperty }: TypeDistributionProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {types.map((type) => {
            const count = bids.filter(bid => bid[typeProperty] === type).length;
            const percentage = bids.length > 0 ? (count / bids.length) * 100 : 0;
            
            return (
              <div key={type} className="flex items-center">
                <div className="w-1/3 font-medium text-sm">
                  {type ? (type.charAt(0).toUpperCase() + type.slice(1)) : 'N/A'}
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
  );
};

export default TypeDistribution;
