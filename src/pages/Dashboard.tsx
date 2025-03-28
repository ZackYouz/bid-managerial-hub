
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, getUpcomingDeadlines, getBids } from "@/services/dataService";
import { DashboardStats, Activity, Bid } from "@/types";
import { formatDate, formatDateTime, getStatusColor } from "@/utils/helpers";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  Activity as ActivityIcon,
  Layers,
  TrendingUp,
  BarChart2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [upcomingBids, setUpcomingBids] = useState<Bid[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [bidStatusData, setBidStatusData] = useState<any[]>([]);
  const [bidTypeData, setBidTypeData] = useState<any[]>([]);
  const [bidTrendData, setBidTrendData] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get dashboard statistics
    const dashboardStats = getDashboardStats();
    setStats(dashboardStats);
    setRecentActivity(dashboardStats.recentActivity);

    // Get upcoming deadlines
    const deadlines = getUpcomingDeadlines(7);
    setUpcomingBids(deadlines);

    // Get all bids for charts
    const allBids = getBids();

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
    'Expired': '#F59E0B'
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
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your bid management activity
          </p>
        </div>
        <Button onClick={() => navigate('/bids')}>
          <FileText className="mr-2 h-4 w-4" />
          View All Bids
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground">
              In the next 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
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
            <CardTitle>Bid Type Distribution</CardTitle>
            <CardDescription>Overview of all bids by their type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bidTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
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

      {/* Upcoming Deadlines and Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Bids due in the next 7 days</CardDescription>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBids.length > 0 ? (
                upcomingBids.slice(0, 5).map((bid) => (
                  <div 
                    key={bid.id} 
                    className="flex items-center border-b pb-2 last:border-0 cursor-pointer hover:bg-gray-50 p-2 rounded-md"
                    onClick={() => navigate(`/bids/${bid.id}`)}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{bid.bidName}</p>
                        <Badge className={getStatusColor(bid.status)}>
                          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="mr-2">Client: {bid.clientName}</span>
                        <span>Due: {formatDate(bid.deadline)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No upcoming deadlines in the next 7 days
                </p>
              )}
              
              {upcomingBids.length > 5 && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/bids')}
                >
                  View All Deadlines
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

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
    </div>
  );
};

export default Dashboard;
