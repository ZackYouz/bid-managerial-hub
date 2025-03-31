
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

import { BaseProduct } from '@/types';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<BaseProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const isNewProduct = id === 'new';

  useEffect(() => {
    if (isNewProduct) {
      setProduct(null);
      setLoading(false);
      return;
    }

    // Load product data - this would typically come from an API or service
    const loadProduct = async () => {
      try {
        // Simulating a fetch delay
        setTimeout(() => {
          // Mock product data for demonstration
          if (id && id !== 'new') {
            // This would be replaced with actual data fetching
            const mockProduct: BaseProduct = {
              id,
              name: "Sample Product",
              code: "SPD-001",
              category: "food",
              isTaxable: true,
              taxRate: 11
            };
            setProduct(mockProduct);
            setLoading(false);
          } else {
            navigate('/products');
          }
        }, 500);
      } catch (error) {
        console.error('Error loading product:', error);
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, isNewProduct, navigate]);

  const handleGoBack = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
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
          Back to Products
        </Button>
        
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNewProduct ? 'Create New Product' : 'Edit Product'}</CardTitle>
          <CardDescription>
            {isNewProduct 
              ? 'Add a new product to your inventory' 
              : `Managing ${product?.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <p className="text-muted-foreground">
              Full product form implementation coming soon. This page will include all fields for creating/editing products as per your requirements.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetails;
