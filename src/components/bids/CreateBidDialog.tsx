
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BidStatus, BidType, PurchaseType } from "@/types";
import { Plus } from "lucide-react";

interface CreateBidDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (bidData: any) => void;
}

const CreateBidDialog = ({ isOpen, onOpenChange, onSubmit }: CreateBidDialogProps) => {
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
  
  const handleCreateBid = () => {
    if (!newBid.bidName || !newBid.clientName || !newBid.deadline) {
      // Show error - for a real app we'd use proper form validation
      return;
    }
    
    const bidData = {
      ...newBid,
      estimatedValue: newBid.estimatedValue ? parseFloat(newBid.estimatedValue) : undefined,
    };
    
    // Call the onSubmit callback
    onSubmit(bidData);
    
    // Reset form
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateBid}>Create Bid</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBidDialog;
