
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { BaseProduct, SupplyProduct, TransportService, ProductCategory } from '@/types';
import { getProductById } from '@/services/dataService';
import { toast } from '@/components/ui/use-toast';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<SupplyProduct | TransportService | null>(null);
  const [loading, setLoading] = useState(true);
  const isNewProduct = id === 'new';
  const [productType, setProductType] = useState<'supply' | 'transport'>('supply');

  // Vehicle types for transportation services
  const vehicleTypes = [
    { value: "bus", label: "Bus" },
    { value: "truck", label: "Truck" },
    { value: "container", label: "Container" },
    { value: "van", label: "Van" },
    { value: "car", label: "Car" }
  ];

  // Billing methods
  const billingMethods = [
    { value: "per_trip", label: "Per Trip" },
    { value: "per_km", label: "Per KM" },
    { value: "per_day", label: "Per Day" }
  ];

  // Product categories
  const categories = ['food', 'hygiene', 'services', 'transportation'];

  useEffect(() => {
    if (isNewProduct) {
      setProduct(null);
      setLoading(false);
      return;
    }

    // Load product data
    const loadProduct = async () => {
      try {
        // In a real app, this would be an API call
        setLoading(true);
        
        setTimeout(() => {
          if (id) {
            const fetchedProduct = getProductById(id);
            
            if (fetchedProduct) {
              setProduct(fetchedProduct);
              // Set product type based on fetched data
              if ('vehicleType' in fetchedProduct && 'billingMethod' in fetchedProduct) {
                setProductType('transport');
              } else {
                setProductType('supply');
              }
            } else {
              toast({
                title: "Product not found",
                description: "The requested product could not be found.",
                variant: "destructive"
              });
              navigate('/products');
            }
          }
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading product:', error);
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to load product details.",
          variant: "destructive"
        });
      }
    };

    loadProduct();
  }, [id, isNewProduct, navigate]);

  const handleGoBack = () => {
    navigate('/products');
  };

  const handleSave = () => {
    // Save product implementation would go here
    toast({
      title: "Not Implemented",
      description: "Saving product functionality will be implemented soon.",
    });
  };

  const handleProductTypeChange = (type: 'supply' | 'transport') => {
    setProductType(type);
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
        
        <Button onClick={handleSave}>
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
        <CardContent className="space-y-6">
          {isNewProduct && (
            <div className="flex space-x-4 mb-6">
              <Button 
                variant={productType === 'supply' ? "default" : "outline"}
                onClick={() => handleProductTypeChange('supply')}
              >
                Supply Product
              </Button>
              <Button 
                variant={productType === 'transport' ? "default" : "outline"}
                onClick={() => handleProductTypeChange('transport')}
              >
                Transportation Service
              </Button>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="Product name" 
                defaultValue={product?.name || ''}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="code">Code</Label>
              <Input 
                id="code" 
                placeholder="Product code" 
                defaultValue={product?.code || ''}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="category">Category</Label>
              <Select defaultValue={product?.category}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {productType === 'supply' && (
              <div className="grid gap-3">
                <Label htmlFor="unit">Unit</Label>
                <Input 
                  id="unit" 
                  placeholder="e.g., kg, box, piece" 
                  defaultValue={(product as SupplyProduct)?.unit || ''}
                />
              </div>
            )}

            {productType === 'transport' && (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select defaultValue={(product as TransportService)?.vehicleType}>
                    <SelectTrigger id="vehicleType">
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input 
                    id="capacity" 
                    placeholder="e.g., 5 MT, 20 passengers" 
                    defaultValue={(product as TransportService)?.capacity || ''}
                  />
                </div>
                <div className="grid gap-3 md:col-span-2">
                  <Label htmlFor="billingMethod">Billing Method</Label>
                  <Select defaultValue={(product as TransportService)?.billingMethod}>
                    <SelectTrigger id="billingMethod">
                      <SelectValue placeholder="Select billing method" />
                    </SelectTrigger>
                    <SelectContent>
                      {billingMethods.map(method => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="grid gap-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="taxable">Taxable</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="taxable" 
                    checked={product?.isTaxable || false} 
                  />
                  <span className="text-sm text-muted-foreground">Default VAT: 11%</span>
                </div>
              </div>
              {product?.isTaxable && (
                <div className="grid gap-3">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input 
                    id="taxRate" 
                    type="number" 
                    defaultValue={product?.taxRate || 11} 
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetails;
