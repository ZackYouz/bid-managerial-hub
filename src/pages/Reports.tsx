
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBids, getCosts } from "@/services/dataService";
import { Bid, CostItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/helpers";
import { downloadJsonData, downloadCsv } from "@/utils/helpers";
import { FileDown, BarChart2, PieChart, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPC,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

const Reports = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [timeRange, setTimeRange] = useState<string>("all");
  
  useEffect(() => {
    // Load bids and costs data
    setBids(getBids());
    setCosts(getCosts());
  }, []);
  
  // Filter bids by time range
  const getFilteredBids = () => {
    if (timeRange === "all") return bids;
    
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case "1m":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3m":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6m":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return bids;
    }
    
    return bids.filter(bid => new Date(bid.createdAt) >= startDate);
  };
  
  const filteredBids = getFilteredBids();
  
  // Prepare data for various charts
  
  // Bid status distribution
  const statusData = filteredBids.reduce((acc, bid) => {
    acc[bid.status] = (acc[bid.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const bidStatusChartData = Object.keys(statusData).map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: statusData[status]
  }));
  
  // Bid type distribution
  const typeData = filteredBids.reduce((acc, bid) => {
    acc[bid.bidType] = (acc[bid.bidType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const bidTypeChartData = Object.keys(typeData).map(type => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: typeData[type]
  }));
  
  // Monthly trend data
  const monthlyTrendData = (() => {
    const data: Record<string, { month: string, timestamp: number, total: number, won: number, lost: number }> = {};
    const now = new Date();
    
    // Create entries for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      data[monthKey] = {
        month: monthKey,
        timestamp: month.getTime(),
        total: 0,
        won: 0,
        lost: 0
      };
    }
    
    // Fill in the data
    filteredBids.forEach(bid => {
      const bidDate = new Date(bid.createdAt);
      const monthKey = bidDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (data[monthKey]) {
        data[monthKey].total += 1;
        
        if (bid.status === 'won') {
          data[monthKey].won += 1;
        } else if (bid.status === 'lost') {
          data[monthKey].lost += 1;
        }
      }
    });
    
    return Object.values(data);
  })();
  
  // Win rate data for bidType
  const winRateByType = (() => {
    const typeCounts: Record<string, { total: number, won: number }> = {};
    
    filteredBids.forEach(bid => {
      if (!typeCounts[bid.bidType]) {
        typeCounts[bid.bidType] = { total: 0, won: 0 };
      }
      
      typeCounts[bid.bidType].total += 1;
      
      if (bid.status === 'won') {
        typeCounts[bid.bidType].won += 1;
      }
    });
    
    return Object.keys(typeCounts).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      rate: typeCounts[type].total > 0 
        ? (typeCounts[type].won / typeCounts[type].total) * 100 
        : 0
    }));
  })();
  
  // Cost and profit analysis
  const profitAnalysis = (() => {
    const wonBidIds = filteredBids
      .filter(bid => bid.status === 'won')
      .map(bid => bid.id);
    
    const bidCosts = costs.filter(cost => wonBidIds.includes(cost.bidId));
    
    // Calculate totals
    const totalSupplierCost = bidCosts.reduce((sum, cost) => {
      return sum + (cost.supplierPrice || 0) * cost.quantity;
    }, 0);
    
    const totalInternalCost = bidCosts.reduce((sum, cost) => {
      return sum + (cost.internalCost || 0) * cost.quantity;
    }, 0);
    
    const totalClientRevenue = bidCosts.reduce((sum, cost) => {
      return sum + (cost.clientPrice || 0) * cost.quantity;
    }, 0);
    
    const grossProfit = totalClientRevenue - totalSupplierCost;
    const netProfit = totalClientRevenue - totalInternalCost;
    
    // Prepare chart data
    const chartData = [
      { name: 'Supplier Cost', value: totalSupplierCost },
      { name: 'Internal Cost', value: totalInternalCost },
      { name: 'Revenue', value: totalClientRevenue },
      { name: 'Gross Profit', value: grossProfit },
      { name: 'Net Profit', value: netProfit }
    ];
    
    return {
      totals: {
        supplierCost: totalSupplierCost,
        internalCost: totalInternalCost,
        revenue: totalClientRevenue,
        grossProfit,
        netProfit
      },
      chartData
    };
  })();
  
  // Colors for charts
  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];
  
  const statusColors: Record<string, string> = {
    'Draft': '#6B7280',
    'Pending': '#2563EB',
    'Submitted': '#8B5CF6',
    'Won': '#10B981',
    'Lost': '#EF4444',
    'Expired': '#F59E0B'
  };
  
  // Export functions
  const exportBidData = () => {
    downloadJsonData(filteredBids, `bidflow-bids-${new Date().toISOString().slice(0, 10)}.json`);
  };
  
  const exportBidsCsv = () => {
    downloadCsv(filteredBids, `bidflow-bids-${new Date().toISOString().slice(0, 10)}.csv`);
  };
  
  // Summary statistics
  const summary = {
    totalBids: filteredBids.length,
    wonBids: filteredBids.filter(bid => bid.status === 'won').length,
    lostBids: filteredBids.filter(bid => bid.status === 'lost').length,
    pendingBids: filteredBids.filter(bid => ['draft', 'pending', 'submitted'].includes(bid.status)).length,
    winRate: filteredBids.length > 0 
      ? (filteredBids.filter(bid => bid.status === 'won').length / 
        (filteredBids.filter(bid => ['won', 'lost'].includes(bid.status)).length || 1) * 100)
      : 0
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analyze your bid performance and export data
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportBidsCsv}>
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          
          <Button variant="outline" onClick={exportBidData}>
            <FileDown className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bids
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalBids}</div>
            <p className="text-xs text-muted-foreground">
              {summary.pendingBids} active, {summary.wonBids} won, {summary.lostBids} lost
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {summary.wonBids} won out of {summary.wonBids + summary.lostBids} decided bids
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(profitAnalysis.totals.netProfit)}</div>
            <p className="text-xs text-muted-foreground">
              From {formatCurrency(profitAnalysis.totals.revenue)} in revenue
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Report Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart2 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="bidAnalysis">
            <PieChart className="mr-2 h-4 w-4" />
            Bid Analysis
          </TabsTrigger>
          <TabsTrigger value="financial">
            <TrendingUp className="mr-2 h-4 w-4" />
            Financial
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bid Status Distribution</CardTitle>
                <CardDescription>
                  Overview of all bids by their current status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPC>
                    <Pie
                      data={bidStatusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {bidStatusChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={statusColors[entry.name] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPC>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Bid Type Distribution</CardTitle>
                <CardDescription>
                  Overview of all bids by their type
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bidTypeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366F1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Bid Trends</CardTitle>
              <CardDescription>
                New, won, and lost bids over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#6366F1" name="Total" />
                  <Line type="monotone" dataKey="won" stroke="#10B981" name="Won" />
                  <Line type="monotone" dataKey="lost" stroke="#EF4444" name="Lost" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Bid Analysis Tab */}
        <TabsContent value="bidAnalysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Win Rate by Bid Type</CardTitle>
              <CardDescription>
                Success rate for different types of bids
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={winRateByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, "Win Rate"]} />
                  <Bar dataKey="rate" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Clients</CardTitle>
                <CardDescription>
                  Clients with highest number of won bids
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const clientStats = filteredBids.reduce((acc, bid) => {
                    if (!acc[bid.clientName]) {
                      acc[bid.clientName] = { total: 0, won: 0 };
                    }
                    
                    acc[bid.clientName].total += 1;
                    if (bid.status === 'won') {
                      acc[bid.clientName].won += 1;
                    }
                    
                    return acc;
                  }, {} as Record<string, { total: number, won: number }>);
                  
                  const sortedClients = Object.keys(clientStats)
                    .filter(client => clientStats[client].total > 0)
                    .sort((a, b) => clientStats[b].won - clientStats[a].won)
                    .slice(0, 5);
                  
                  return (
                    <div className="space-y-4">
                      {sortedClients.length > 0 ? (
                        sortedClients.map((client, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{client}</p>
                              <p className="text-xs text-muted-foreground">
                                {clientStats[client].won} won out of {clientStats[client].total} bids
                              </p>
                            </div>
                            <p className="text-sm font-medium">
                              {((clientStats[client].won / clientStats[client].total) * 100).toFixed(1)}%
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No client data available
                        </p>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Bid Value Analysis</CardTitle>
                <CardDescription>
                  Success rate by estimated value
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Group bids by value ranges
                  const valueRanges = [
                    { name: "< $10K", min: 0, max: 10000 },
                    { name: "$10K-$50K", min: 10000, max: 50000 },
                    { name: "$50K-$100K", min: 50000, max: 100000 },
                    { name: "$100K-$500K", min: 100000, max: 500000 },
                    { name: "> $500K", min: 500000, max: Infinity }
                  ];
                  
                  const valueStats = valueRanges.map(range => {
                    const rangeBids = filteredBids.filter(bid => {
                      const value = bid.estimatedValue || 0;
                      return value >= range.min && value < range.max;
                    });
                    
                    const total = rangeBids.length;
                    const won = rangeBids.filter(bid => bid.status === 'won').length;
                    
                    return {
                      name: range.name,
                      total,
                      won,
                      rate: total > 0 ? (won / total) * 100 : 0
                    };
                  });
                  
                  return (
                    <div className="space-y-4">
                      {valueStats.some(s => s.total > 0) ? (
                        valueStats
                          .filter(s => s.total > 0)
                          .map((stat, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{stat.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {stat.won} won out of {stat.total} bids
                                </p>
                              </div>
                              <p className="text-sm font-medium">
                                {stat.rate.toFixed(1)}%
                              </p>
                            </div>
                          ))
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No bid value data available
                        </p>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue and Profit Analysis</CardTitle>
              <CardDescription>
                Overview of financial performance for won bids
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(profitAnalysis.totals.revenue)}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Supplier Cost</p>
                      <p className="font-medium">{formatCurrency(profitAnalysis.totals.supplierCost)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Internal Cost</p>
                      <p className="font-medium">{formatCurrency(profitAnalysis.totals.internalCost)}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Gross Profit (Revenue - Supplier Cost)</p>
                      <p className="font-medium text-green-600">{formatCurrency(profitAnalysis.totals.grossProfit)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Net Profit (Revenue - Internal Cost)</p>
                      <p className="font-medium text-green-600">{formatCurrency(profitAnalysis.totals.netProfit)}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Gross Profit Margin</p>
                      <p className="font-medium">
                        {profitAnalysis.totals.revenue > 0 
                          ? ((profitAnalysis.totals.grossProfit / profitAnalysis.totals.revenue) * 100).toFixed(1) 
                          : 0}%
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Net Profit Margin</p>
                      <p className="font-medium">
                        {profitAnalysis.totals.revenue > 0 
                          ? ((profitAnalysis.totals.netProfit / profitAnalysis.totals.revenue) * 100).toFixed(1) 
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitAnalysis.chartData.filter(item => item.value > 0)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), ""]} />
                      <Bar dataKey="value" fill="#6366F1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Profit by Bid Type</CardTitle>
              <CardDescription>
                Financial performance across different bid types
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {(() => {
                // Get won bids with their associated costs
                const wonBids = filteredBids.filter(bid => bid.status === 'won');
                
                // Group by bid type
                const bidTypeProfit: Record<string, { revenue: number, cost: number }> = {};
                
                // Initialize with all types
                const bidTypes = Array.from(new Set(filteredBids.map(bid => bid.bidType)));
                bidTypes.forEach(type => {
                  bidTypeProfit[type] = { revenue: 0, cost: 0 };
                });
                
                // Calculate profit by type
                wonBids.forEach(bid => {
                  const bidCosts = costs.filter(cost => cost.bidId === bid.id);
                  
                  const revenue = bidCosts.reduce((sum, cost) => {
                    return sum + (cost.clientPrice || 0) * cost.quantity;
                  }, 0);
                  
                  const cost = bidCosts.reduce((sum, cost) => {
                    return sum + (cost.internalCost || 0) * cost.quantity;
                  }, 0);
                  
                  bidTypeProfit[bid.bidType].revenue += revenue;
                  bidTypeProfit[bid.bidType].cost += cost;
                });
                
                // Convert to chart data
                const chartData = Object.keys(bidTypeProfit)
                  .filter(type => bidTypeProfit[type].revenue > 0)
                  .map(type => ({
                    name: type.charAt(0).toUpperCase() + type.slice(1),
                    revenue: bidTypeProfit[type].revenue,
                    profit: bidTypeProfit[type].revenue - bidTypeProfit[type].cost
                  }));
                
                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), ""]} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#6366F1" name="Revenue" />
                      <Bar dataKey="profit" fill="#10B981" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
