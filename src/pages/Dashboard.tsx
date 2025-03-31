
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardStats, getUpcomingDeadlines, getBids, getProjects } from "@/services/dataService";
import { DashboardStats, Activity, Bid, Project } from "@/types";
import { formatDate, formatDateTime, getStatusColor } from "@/utils/helpers";
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  Activity as ActivityIcon,
  Layers,
  TrendingUp,
  BarChart2,
  AlertCircle,
  Building,
  Package,
  Truck,
  Users,
  DollarSign,
  PlusCircle,
  Filter
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingBids, setPendingBids] = useState<Bid[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [currentProjects, setCurrentProjects] = useState<Project[]>([]);
  const [bidStatusData, setBidStatusData] = useState<any[]>([]);
  const [bidTypeData, setBidTypeData] = useState<any[]>([]);
  const [bidTrendData, setBidTrendData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("summary");
  const navigate = useNavigate();

  useEffect(() => {
    // Get dashboard statistics
    const dashboardStats = getDashboardStats();
    setStats(dashboardStats);
    setRecentActivity(dashboardStats.recentActivity);

    // Get all bids to filter pending ones
    const allBids = getBids();
    const pending = allBids.filter(bid => bid.status === 'pending');
    setPendingBids(pending);

    // Get current projects
    const projects = getProjects();
    const active = projects.filter(project => project.status === 'active');
    setCurrentProjects(active.slice(0, 5));

    // Prepare bid status data for chart
    const statusCount = allBids.reduce((acc, bid) => {
      acc[bid.status] = (acc[bid.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setBidStatusData(
      Object.keys(statusCount).map(status => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: statusCount[status]
      }))
    );

    // Prepare bid type data for chart
    const typeCount = allBids.reduce((acc, bid) => {
      acc[bid.bidType] = (acc[bid.bidType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setBidTypeData(
      Object.keys(typeCount).map(type => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: typeCount[type]
      }))
    );

    // Prepare bid trend data (last 6 months)
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        timestamp: month.getTime()
      });
    }

    const trendData = months.map(({ month, timestamp }) => {
      const start = new Date(timestamp);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      
      const monthBids = allBids.filter(bid => {
        const bidDate = new Date(bid.createdAt);
        return bidDate >= start && bidDate <= end;
      });
      
      return {
        name: month,
        total: monthBids.length,
        won: monthBids.filter(bid => bid.status === 'won').length,
        lost: monthBids.filter(bid => bid.status === 'lost').length,
      };
    });

    setBidTrendData(trendData);
  }, []);

  // Chart colors
  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];
  
  const statusColors: Record<string, string> = {
    'Draft': '#6B7280',
    'Pending': '#2563EB',
    'Submitted': '#8B5CF6',
    'Won': '#10B981',
    'Lost': '#EF4444',
    'Expired': '#F59E0B',
    'Cancelled': '#9CA3AF'
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tender Management Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your procurement activities
          </p>
        </div>
        
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Quick Actions</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <div className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-indigo-500 to-purple-700 p-6 no-underline outline-none focus:shadow-md"
                        href="/bids/new"
                      >
                        <div className="mt-4 mb-2 text-lg font-medium text-white">
                          New Bid
                        </div>
                        <p className="text-sm leading-tight text-white/90">
                          Create a new bid for your client
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </div>
                  <div className="col-span-1">
                    <NavigationMenuLink asChild>
                      <a
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        href="/projects/new"
                      >
                        <div className="text-sm font-medium leading-none">New Project</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Create a new project from scratch
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </div>
                  <div className="col-span-1">
                    <NavigationMenuLink asChild>
                      <a
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        href="/clients/new"
                      >
                        <div className="text-sm font-medium leading-none">New Client</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Add a new client to your database
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </div>
                  <div className="col-span-1">
                    <NavigationMenuLink asChild>
                      <a
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        href="/suppliers/new"
                      >
                        <div className="text-sm font-medium leading-none">New Supplier</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Add a new supplier to your database
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="md:col-span-5 grid gap-4 md:grid-cols-5">
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center gap-2 h-20" 
            onClick={() => navigate('/bids')}
          >
            <FileText className="h-6 w-6" />
            <span>Bids</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center gap-2 h-20"
            onClick={() => navigate('/projects')}
          >
            <Layers className="h-6 w-6" />
            <span>Projects</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center gap-2 h-20"
            onClick={() => navigate('/clients')}
          >
            <Building className="h-6 w-6" />
            <span>Clients</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center gap-2 h-20"
            onClick={() => navigate('/products')}
          >
            <Package className="h-6 w-6" />
            <span>Products</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center gap-2 h-20"
            onClick={() => navigate('/suppliers')}
          >
            <Truck className="h-6 w-6" />
            <span>Suppliers</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="pending">Pending Bids</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBids}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeBids} active bids
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Won Bids</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.wonBids}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalBids > 0 
                    ? `${((stats.wonBids / stats.totalBids) * 100).toFixed(1)}% success rate`
                    : "No bids yet"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lost Bids</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.lostBids}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalBids > 0 
                    ? `${((stats.lostBids / stats.totalBids) * 100).toFixed(1)}% loss rate`
                    : "No bids yet"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Bids</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingBids}</div>
                <p className="text-xs text-muted-foreground">
                  Need your attention
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  From won bids and direct creation
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Projects</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.currentProjects}</div>
                <p className="text-xs text-muted-foreground">
                  In active status
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully delivered
                </p>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Value</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.profitValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  From completed projects
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Bid Status Distribution</CardTitle>
                <CardDescription>Overview of all bids by their current status</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bidStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {bidStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.name] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Bid Trends</CardTitle>
                <CardDescription>Monthly bid statistics over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bidTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#6366F1" name="Total Bids" />
                    <Line type="monotone" dataKey="won" stroke="#10B981" name="Won" />
                    <Line type="monotone" dataKey="lost" stroke="#EF4444" name="Lost" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Pending Bids</CardTitle>
                <CardDescription>Bids that need your attention</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="default" size="sm" onClick={() => navigate('/bids/new')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Bid
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bid Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Est. Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingBids.length > 0 ? (
                    pendingBids.map((bid) => (
                      <TableRow 
                        key={bid.id}
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => navigate(`/bids/${bid.id}`)}
                      >
                        <TableCell className="font-medium">{bid.bidNumber}</TableCell>
                        <TableCell>{bid.clientName}</TableCell>
                        <TableCell>{bid.bidName}</TableCell>
                        <TableCell>{bid.bidType.charAt(0).toUpperCase() + bid.bidType.slice(1)}</TableCell>
                        <TableCell>{formatDate(bid.deadline)}</TableCell>
                        <TableCell>
                          {bid.estimatedValue 
                            ? `$${bid.estimatedValue.toLocaleString()}`
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(bid.status)}>
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        No pending bids at the moment
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {pendingBids.length > 0 && (
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/bids?status=pending')}
                  >
                    View All Pending Bids
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Current Projects</CardTitle>
                <CardDescription>Active projects requiring management</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="default" size="sm" onClick={() => navigate('/projects/new')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Purchase Value</TableHead>
                    <TableHead>Sales Value</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProjects.length > 0 ? (
                    currentProjects.map((project) => (
                      <TableRow 
                        key={project.id}
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{project.clientName}</TableCell>
                        <TableCell>{project.startDate ? formatDate(project.startDate) : 'N/A'}</TableCell>
                        <TableCell>{project.purchaseValue ? `$${project.purchaseValue.toLocaleString()}` : 'N/A'}</TableCell>
                        <TableCell>{project.salesValue ? `$${project.salesValue.toLocaleString()}` : 'N/A'}</TableCell>
                        <TableCell>
                          {project.profit 
                            ? <span className="text-green-600">${project.profit.toLocaleString()}</span>
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              project.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 
                              project.status === 'on-hold' ? 'bg-amber-500 hover:bg-amber-600' : 
                              project.status === 'completed' ? 'bg-blue-500 hover:bg-blue-600' :
                              'bg-gray-500 hover:bg-gray-600'
                            }
                          >
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        No active projects at the moment
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {currentProjects.length > 0 && (
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/projects?status=active')}
                  >
                    View All Current Projects
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in your account</CardDescription>
          </div>
          <ActivityIcon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 border-b pb-2 last:border-0">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.userName}</span>{' '}
                      {activity.action} {activity.targetType}{' '}
                      <span className="font-medium">{activity.targetName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No recent activity to display
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
