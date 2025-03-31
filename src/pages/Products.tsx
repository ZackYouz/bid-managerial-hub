
import { useState } from "react";
import {
  Package,
  Plus,
  Filter,
  Search,
  Tag,
  Utensils,
  Truck,
  Syringe,
  CircleCheck,
  CircleX
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BaseProduct, SupplyProduct, TransportService, ProductCategory } from "@/types";

// Mock data for products
const mockProducts: (SupplyProduct | TransportService)[] = [
  {
    id: "prod-001",
    name: "Rice (25kg bag)",
    code: "FOOD-001",
    category: "food",
    unit: "bag",
    isTaxable: true,
    taxRate: 11
  },
  {
    id: "prod-002",
    name: "Cooking Oil (5L)",
    code: "FOOD-002",
    category: "food",
    unit: "bottle",
    isTaxable: true,
    taxRate: 11
  },
  {
    id: "prod-003",
    name: "Sanitizer (1L)",
    code: "HYG-001",
    category: "hygiene",
    unit: "bottle",
    isTaxable: false
  },
  {
    id: "prod-004",
    name: "Face Masks (Box of 50)",
    code: "HYG-002",
    category: "hygiene",
    unit: "box",
    isTaxable: false
  },
  {
    id: "prod-005",
    name: "10 MT Truck Transport",
    code: "TRANS-001",
    category: "transportation",
    vehicleType: "truck",
    capacity: "10MT",
    billingMethod: "per_trip",
    isTaxable: true,
    taxRate: 11
  },
  {
    id: "prod-006",
    name: "20-Seater Bus",
    code: "TRANS-002",
    category: "transportation",
    vehicleType: "bus",
    capacity: "20 passengers",
    billingMethod: "per_day",
    isTaxable: true,
    taxRate: 11
  },
  {
    id: "prod-007",
    name: "Container Shipping (20ft)",
    code: "TRANS-003",
    category: "transportation",
    vehicleType: "container",
    capacity: "20ft",
    billingMethod: "per_km",
    isTaxable: true,
    taxRate: 11
  }
];

// Mock product categories
const productCategories: ProductCategory[] = ["food", "hygiene", "services", "transportation"];

// Vehicle types for transportation services
const vehicleTypes = [
  { value: "bus", label: "Bus" },
  { value: "truck", label: "Truck", capacities: ["1 MT", "3 MT", "5 MT", "7 MT", "9 MT", "10 MT"] },
  { value: "container", label: "Container", capacities: ["10 ft", "20 ft", "30 ft", "50 ft"] },
  { value: "van", label: "Van" },
  { value: "car", label: "Car" }
];

// Billing methods
const billingMethods = [
  { value: "per_trip", label: "Per Trip" },
  { value: "per_km", label: "Per KM" },
  { value: "per_day", label: "Per Day" }
];

const Products = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newProductType, setNewProductType] = useState<"supply" | "transport">("supply");

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "food":
        return <Utensils className="h-5 w-5" />;
      case "hygiene":
        return <Syringe className="h-5 w-5" />;
      case "transportation":
        return <Truck className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  // Filter products based on search and category
  const filteredProducts = mockProducts.filter(product => {
    if (
      filterCategory !== "all" && 
      product.category !== filterCategory
    ) {
      return false;
    }
    if (
      searchTerm &&
      !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !product.code.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    if (activeTab !== "all" && product.category !== activeTab) {
      return false;
    }
    return true;
  });

  // Handle adding a new product
  const handleAddProduct = () => {
    // In a real app, this would save the product
    setShowAddDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Enter the details for the new product. Press save when you're done.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Tabs defaultValue="supply" className="w-full mb-6" onValueChange={(value) => setNewProductType(value as "supply" | "transport")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="supply">Supply Product</TabsTrigger>
                  <TabsTrigger value="transport">Transportation Service</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    Code
                  </Label>
                  <Input id="code" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select>
                    <SelectTrigger id="category" className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {newProductType === "supply" ? (
                        <>
                          <SelectItem value="food">Food Supply</SelectItem>
                          <SelectItem value="hygiene">Hygiene Supply</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </>
                      ) : (
                        <SelectItem value="transportation">Transportation</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {newProductType === "supply" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">
                      Unit
                    </Label>
                    <Input id="unit" className="col-span-3" placeholder="e.g., kg, box, piece" />
                  </div>
                )}

                {newProductType === "transport" && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="vehicleType" className="text-right">
                        Vehicle Type
                      </Label>
                      <Select>
                        <SelectTrigger id="vehicleType" className="col-span-3">
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="capacity" className="text-right">
                        Capacity
                      </Label>
                      <Input id="capacity" className="col-span-3" placeholder="e.g., 5 MT, 20 passengers" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="billingMethod" className="text-right">
                        Billing Method
                      </Label>
                      <Select>
                        <SelectTrigger id="billingMethod" className="col-span-3">
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

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="taxable" className="text-right">
                    Taxable
                  </Label>
                  <div className="flex items-center gap-2 col-span-3">
                    <Switch id="taxable" />
                    <span className="text-sm text-gray-500">Default VAT: 11%</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleAddProduct}>Save Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Product Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {productCategories.map((category) => (
              <div key={category} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  <span className="capitalize">{category}</span>
                </div>
                <Badge variant="outline">
                  {mockProducts.filter(p => p.category === category).length}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Product Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 text-center">
              <p className="text-muted-foreground">
                Product distribution chart will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="food">Food Supply</TabsTrigger>
          <TabsTrigger value="hygiene">Hygiene Supply</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="transportation">Transportation</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>
                  {activeTab === "all" ? "All Products" : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Products`}
                </CardTitle>
              </div>
              <CardDescription>
                Manage your {activeTab === "all" ? "products" : activeTab} inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {productCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-base font-medium">No products found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map(product => {
                    // Determine if it's a transportation service
                    const isTransport = 'vehicleType' in product;
                    
                    return (
                      <Card key={product.id} className="overflow-hidden">
                        <div className={`w-full h-2 ${product.category === 'food' ? 'bg-green-500' : 
                          product.category === 'hygiene' ? 'bg-blue-500' :
                          product.category === 'transportation' ? 'bg-orange-500' : 'bg-purple-500'}`} />
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(product.category)}
                              <CardTitle>{product.name}</CardTitle>
                            </div>
                          </div>
                          <CardDescription>{product.code}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <Badge variant="outline" className="capitalize">
                              {product.category}
                            </Badge>
                          </div>
                          {!isTransport ? (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Unit:</span>
                              <span>{(product as SupplyProduct).unit}</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Vehicle Type:</span>
                                <span className="capitalize">{(product as TransportService).vehicleType}</span>
                              </div>
                              {(product as TransportService).capacity && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Capacity:</span>
                                  <span>{(product as TransportService).capacity}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Billing:</span>
                                <span>
                                  {(product as TransportService).billingMethod === 'per_trip' ? 'Per Trip' :
                                   (product as TransportService).billingMethod === 'per_km' ? 'Per KM' : 'Per Day'}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Taxable:</span>
                            <div className="flex items-center gap-1">
                              {product.isTaxable ? (
                                <>
                                  <CircleCheck className="h-4 w-4 text-green-600" />
                                  <span className="text-xs text-muted-foreground">
                                    {product.taxRate}%
                                  </span>
                                </>
                              ) : (
                                <CircleX className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                          <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {mockProducts.length} products
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Products;
