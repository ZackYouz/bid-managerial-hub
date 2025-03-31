
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Download,
  Filter,
  SortAsc,
  SortDesc,
  Search,
  Building,
  CheckCircle2
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
import { Supplier, SupplierStats, OrganizationType } from "@/types";
import { Badge } from "@/components/ui/badge";

// Placeholder data for demonstration
const mockSuppliers: Supplier[] = [
  {
    id: "sup-001",
    name: "Quality Building Materials",
    code: "QBM-2023",
    registrationNumber: "SUP1234567",
    type: "company",
    address: "123 Construction Rd, New York, NY",
    emails: ["info@qbm.com"],
    contacts: [
      { id: "contact-001", name: "James Wilson", jobTitle: "Sales Manager", email: "james@qbm.com", phone: "+1 234 567 8901" }
    ],
    isActive: true,
    hasActiveProjects: true
  },
  {
    id: "sup-002",
    name: "Medical Supplies Inc",
    code: "MSI-2023",
    registrationNumber: "SUP7654321",
    type: "company",
    address: "456 Health Ave, Chicago, IL",
    emails: ["sales@medsupplies.com", "info@medsupplies.com"],
    contacts: [
      { id: "contact-002", name: "Emily Brown", jobTitle: "Account Manager", email: "emily@medsupplies.com", phone: "+1 345 678 9012" }
    ],
    isActive: true,
    hasActiveProjects: false
  },
  {
    id: "sup-003",
    name: "Green Earth NGO Supplies",
    code: "GES-2023",
    type: "ngo",
    address: "789 Eco St, Portland, OR",
    emails: ["contact@greenearthsupplies.org"],
    contacts: [
      { id: "contact-003", name: "Michael Green", jobTitle: "Director", email: "michael@greenearthsupplies.org", phone: "+1 456 789 0123" }
    ],
    isActive: false,
    hasActiveProjects: false
  },
  {
    id: "sup-004",
    name: "Government Office Supplies",
    code: "GOS-2023",
    registrationNumber: "GOV9876543",
    type: "government",
    address: "101 Federal Plaza, Washington, DC",
    emails: ["procurement@govsupplies.gov"],
    contacts: [
      { id: "contact-004", name: "Sarah Johnson", jobTitle: "Procurement Officer", email: "sarah@govsupplies.gov", phone: "+1 567 890 1234" }
    ],
    isActive: true,
    hasActiveProjects: true
  },
  {
    id: "sup-005",
    name: "Tech Solutions Providers",
    code: "TSP-2023",
    registrationNumber: "CORP5678901",
    type: "company",
    address: "202 Innovation Way, San Francisco, CA",
    emails: ["sales@techsolutions.com", "support@techsolutions.com"],
    contacts: [
      { id: "contact-005", name: "David Lee", jobTitle: "Sales Director", email: "david@techsolutions.com", phone: "+1 678 901 2345" },
      { id: "contact-006", name: "Lisa Chen", jobTitle: "Account Executive", email: "lisa@techsolutions.com", phone: "+1 789 012 3456" }
    ],
    isActive: true,
    hasActiveProjects: true,
    productCategories: ["IT Equipment", "Software", "Services"]
  }
];

// Mock stats for demonstration
const mockSupplierStats: SupplierStats = {
  totalSuppliers: mockSuppliers.length,
  activeSuppliers: mockSuppliers.filter(supplier => supplier.isActive).length,
  byType: [
    { type: "company", count: 3 },
    { type: "ngo", count: 1 },
    { type: "government", count: 1 },
    { type: "individual", count: 0 },
    { type: "other", count: 0 }
  ],
  suppliersWithProjects: mockSuppliers.filter(supplier => supplier.hasActiveProjects).length
};

const Suppliers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredSuppliers = mockSuppliers
    .filter(supplier => {
      if (filterType !== "all" && supplier.type !== filterType) {
        return false;
      }
      if (searchTerm && !supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortDirection === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  const handleAddSupplier = () => {
    navigate("/suppliers/new");
  };

  const handleSupplierClick = (id: string) => {
    navigate(`/suppliers/${id}`);
  };

  const handleExport = (format: "pdf" | "csv") => {
    // Placeholder for export functionality
    console.log(`Exporting suppliers as ${format}`);
  };

  const handleToggleSort = () => {
    setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
  };

  const getTypeColorClass = (type: OrganizationType): string => {
    switch (type) {
      case "company":
        return "bg-blue-100 text-blue-800";
      case "ngo":
        return "bg-green-100 text-green-800";
      case "government":
        return "bg-purple-100 text-purple-800";
      case "individual":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
        <Button onClick={handleAddSupplier}>
          <Plus className="mr-2 h-4 w-4" />
          New Supplier
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockSupplierStats.totalSuppliers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {mockSupplierStats.byType.filter(t => t.count > 0).length} categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Active Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockSupplierStats.activeSuppliers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((mockSupplierStats.activeSuppliers / mockSupplierStats.totalSuppliers) * 100)}% of total suppliers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">With Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockSupplierStats.suppliersWithProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently fulfilling orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">By Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockSupplierStats.byType
              .filter(type => type.count > 0)
              .map(type => (
                <div key={type.type} className="flex justify-between items-center">
                  <span className="capitalize">{type.type}</span>
                  <Badge variant="outline">{type.count}</Badge>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Supplier List</TabsTrigger>
          <TabsTrigger value="report">Supplier Report</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>All Suppliers</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
              <CardDescription>Manage and view all your suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search suppliers..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="ngo">NGO</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleToggleSort}>
                  {sortDirection === "asc" ? (
                    <SortAsc className="h-4 w-4 mr-2" />
                  ) : (
                    <SortDesc className="h-4 w-4 mr-2" />
                  )}
                  {sortDirection === "asc" ? "A-Z" : "Z-A"}
                </Button>
              </div>

              <div className="grid gap-4">
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map(supplier => (
                    <div
                      key={supplier.id}
                      onClick={() => handleSupplierClick(supplier.id)}
                      className={`p-4 rounded-lg border transition-colors hover:bg-gray-50 cursor-pointer ${
                        supplier.hasActiveProjects ? "border-green-200 border-l-4" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 rounded-full p-2">
                            <Building className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{supplier.name}</h3>
                            <div className="text-sm text-muted-foreground">
                              {supplier.code}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColorClass(supplier.type)}>
                            {supplier.type}
                          </Badge>
                          {supplier.isActive && (
                            <Badge variant="outline" className="flex items-center gap-1 text-green-600 bg-green-50">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm">
                        <div className="flex items-start gap-8">
                          <div className="w-32 text-muted-foreground">Primary Contact:</div>
                          <div>{supplier.contacts[0]?.name || "N/A"}</div>
                        </div>
                        <div className="flex items-start gap-8">
                          <div className="w-32 text-muted-foreground">Email:</div>
                          <div>{supplier.emails[0] || "N/A"}</div>
                        </div>
                        {supplier.productCategories && supplier.productCategories.length > 0 && (
                          <div className="flex items-start gap-8">
                            <div className="w-32 text-muted-foreground">Categories:</div>
                            <div className="flex gap-1 flex-wrap">
                              {supplier.productCategories.map(category => (
                                <Badge key={category} variant="secondary" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No suppliers found matching your criteria
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredSuppliers.length} of {mockSuppliers.length} suppliers
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="report" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Report</CardTitle>
              <CardDescription>Detailed statistics about your suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">Supplier Reports</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Detailed supplier reports will be displayed here with charts and analytics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Suppliers;
