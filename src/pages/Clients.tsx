
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, 
  FileText, 
  Filter, 
  Plus, 
  Search, 
  SortAsc, 
  SortDesc, 
  Users 
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Client, ClientStats, OrganizationType } from '@/types';
import { formatDate, downloadCsv, downloadJsonData } from '@/utils/helpers';
import { getClients, getClientStats } from '@/services/dataService';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats>({
    totalClients: 0,
    activeClients: 0,
    byType: [],
    clientsWithProjects: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Client;
    direction: 'asc' | 'desc';
  }>({
    key: 'name',
    direction: 'asc'
  });
  const [filterType, setFilterType] = useState<OrganizationType | 'all'>('all');

  useEffect(() => {
    // Load clients data
    const loadedClients = getClients();
    setClients(loadedClients);
    setFilteredClients(loadedClients);
    
    // Load client statistics
    const stats = getClientStats();
    setClientStats(stats);
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...clients];
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(client => client.type === filterType);
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        client => 
          client.name.toLowerCase().includes(query) ||
          client.code.toLowerCase().includes(query) ||
          client.emails.some(email => email.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];
      
      if (valueA === undefined || valueB === undefined) return 0;
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortConfig.direction === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
        return sortConfig.direction === 'asc'
          ? Number(valueA) - Number(valueB)
          : Number(valueB) - Number(valueA);
      }
      
      return 0;
    });
    
    setFilteredClients(result);
  }, [clients, searchQuery, sortConfig, filterType]);

  const handleSort = (key: keyof Client) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleDownload = (format: 'csv' | 'json') => {
    const dataToDownload = filteredClients.map(client => ({
      name: client.name,
      code: client.code,
      type: client.type,
      registrationNumber: client.registrationNumber || '',
      address: client.address || '',
      phone: client.phone || '',
      mobile: client.mobile || '',
      primaryEmail: client.emails[0] || '',
      primaryContact: client.contacts[0]?.name || '',
      isActive: client.isActive ? 'Yes' : 'No',
      hasActiveProjects: client.hasActiveProjects ? 'Yes' : 'No'
    }));
    
    if (format === 'csv') {
      downloadCsv(dataToDownload, 'clients.csv');
    } else {
      downloadJsonData(dataToDownload, 'clients.json');
    }
  };
  
  const getTypeLabel = (type: OrganizationType): string => {
    switch (type) {
      case 'ngo': return 'NGO';
      case 'company': return 'Company';
      case 'government': return 'Government';
      case 'individual': return 'Individual';
      case 'other': return 'Other';
      default: return type;
    }
  };

  const getTypeColor = (type: OrganizationType): string => {
    switch (type) {
      case 'ngo': return 'bg-blue-100 text-blue-800';
      case 'company': return 'bg-purple-100 text-purple-800';
      case 'government': return 'bg-amber-100 text-amber-800'; 
      case 'individual': return 'bg-green-100 text-green-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">
            Manage your clients and their information
          </p>
        </div>
        <Button asChild className="ml-auto">
          <Link to="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Link>
        </Button>
      </div>

      {/* Client Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              All registered clients
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.activeClients}</div>
            <p className="text-xs text-muted-foreground">
              Currently active clients
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.clientsWithProjects}</div>
            <p className="text-xs text-muted-foreground">
              Clients with active projects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Types</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientStats.byType.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Different types of clients
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Client List</TabsTrigger>
          <TabsTrigger value="report">Client Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value as OrganizationType | 'all')}
            >
              <SelectTrigger className="w-[180px]">
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDownload('csv')}>
                  Download as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('json')}>
                  Download as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Client Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Client Name
                      {sortConfig.key === 'name' && (
                        sortConfig.direction === 'asc' 
                          ? <SortAsc className="ml-2 h-4 w-4" /> 
                          : <SortDesc className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Primary Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('hasActiveProjects')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortConfig.key === 'hasActiveProjects' && (
                        sortConfig.direction === 'asc' 
                          ? <SortAsc className="ml-2 h-4 w-4" /> 
                          : <SortDesc className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id} className={client.hasActiveProjects ? "bg-green-50/50" : ""}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.code}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(client.type)} variant="outline">
                          {getTypeLabel(client.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {client.contacts[0] ? (
                          <div className="text-sm">
                            <p>{client.contacts[0].name}</p>
                            <p className="text-xs text-muted-foreground">
                              {client.contacts[0].jobTitle || ''}
                            </p>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {client.emails[0] || '-'}
                      </TableCell>
                      <TableCell>
                        {client.phone || client.mobile || '-'}
                      </TableCell>
                      <TableCell>
                        {client.hasActiveProjects ? (
                          <Badge className="bg-green-100 text-green-800">Active Projects</Badge>
                        ) : client.isActive ? (
                          <Badge variant="outline" className="text-blue-800 border-blue-800">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/clients/${client.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No clients found. Adjust filters or create a new client.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Distribution by Type</CardTitle>
              <CardDescription>
                Overview of your client portfolio distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="space-y-4">
                {clientStats.byType.map((typeData) => (
                  <div key={typeData.type} className="flex items-center">
                    <div className="w-1/4 font-medium">{getTypeLabel(typeData.type)}</div>
                    <div className="w-3/4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${(typeData.count / clientStats.totalClients) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground w-12">{typeData.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Active vs. Inactive Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="rounded-full w-16 h-16 border-8 border-primary flex items-center justify-center">
                        <span className="text-lg font-bold">
                          {Math.round((clientStats.activeClients / clientStats.totalClients) * 100)}%
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {clientStats.activeClients} clients are active
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {clientStats.totalClients - clientStats.activeClients} clients are inactive
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Clients with Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="rounded-full w-16 h-16 border-8 border-green-500 flex items-center justify-center">
                        <span className="text-lg font-bold">
                          {Math.round((clientStats.clientsWithProjects / clientStats.totalClients) * 100)}%
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {clientStats.clientsWithProjects} clients have active projects
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {clientStats.totalClients - clientStats.clientsWithProjects} clients without projects
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Clients;
