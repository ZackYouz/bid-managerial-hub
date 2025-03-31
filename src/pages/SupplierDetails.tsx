
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { Supplier } from '@/types';

const SupplierDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const isNewSupplier = id === 'new';

  useEffect(() => {
    if (isNewSupplier) {
      setSupplier(null);
      setLoading(false);
      return;
    }

    // Load supplier data - this would typically come from an API or service
    const loadSupplier = async () => {
      try {
        // Simulating a fetch delay
        setTimeout(() => {
          // Mock supplier data for demonstration
          if (id && id !== 'new') {
            // This would be replaced with actual data fetching
            const mockSupplier: Supplier = {
              id,
              name: "Sample Supplier",
              code: "SS-2023",
              type: "company",
              emails: ["contact@sample.com"],
              contacts: [{ id: "c1", name: "Contact Person" }],
              isActive: true,
              hasActiveProjects: false
            };
            setSupplier(mockSupplier);
            setLoading(false);
          } else {
            navigate('/suppliers');
          }
        }, 500);
      } catch (error) {
        console.error('Error loading supplier:', error);
        setLoading(false);
      }
    };

    loadSupplier();
  }, [id, isNewSupplier, navigate]);

  const handleGoBack = () => {
    navigate('/suppliers');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Suppliers
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Suppliers
        </Button>
        
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Supplier
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNewSupplier ? 'Create New Supplier' : 'Edit Supplier'}</CardTitle>
          <CardDescription>
            {isNewSupplier 
              ? 'Register a new supplier with all necessary information' 
              : `Managing ${supplier?.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <p className="text-muted-foreground">
              Full supplier form implementation coming soon. This page will include all fields for creating/editing suppliers as per your requirements.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierDetails;
