import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { User } from "../types";
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search, 
  Users,
  Package,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { initializeSampleData, getUpcomingDeadlines } from "@/services/dataService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

const Layout = ({ user, onLogout }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<number>(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    initializeSampleData();
    
    setUpcomingDeadlines(getUpcomingDeadlines(7).length);
    
    const interval = setInterval(() => {
      setUpcomingDeadlines(getUpcomingDeadlines(7).length);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const mainLinks = [
    { 
      to: '/', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      to: '/bids', 
      label: 'Bids', 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      to: '/projects', 
      label: 'Projects', 
      icon: <FolderOpen className="h-5 w-5" /> 
    },
    {
      to: '/clients',
      label: 'Clients',
      icon: <Users className="h-5 w-5" />
    },
    {
      to: '/suppliers',
      label: 'Suppliers',
      icon: <Truck className="h-5 w-5" />
    },
    {
      to: '/products',
      label: 'Products',
      icon: <Package className="h-5 w-5" />
    },
    { 
      to: '/reports', 
      label: 'Reports', 
      icon: <BarChart3 className="h-5 w-5" /> 
    }
  ];
  
  const secondaryLinks = [
    { 
      to: '/settings', 
      label: 'Settings', 
      icon: <Settings className="h-5 w-5" /> 
    }
  ];
  
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-full bg-white shadow-md"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      <aside 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 bg-white border-r border-gray-200 flex flex-col`}
      >
        <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-200">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-2 rounded-lg">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">BidFlow Pro</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          <div className="space-y-1">
            {mainLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {link.icon}
                <span>{link.label}</span>
                {link.label === 'Bids' && upcomingDeadlines > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-auto bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                  >
                    {upcomingDeadlines}
                  </Badge>
                )}
              </NavLink>
            ))}
          </div>
          
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Settings
            </p>
            {secondaryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
            
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-md transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
        
        <div className="flex items-center gap-3 p-4 border-t border-gray-200">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.role}</p>
          </div>
        </div>
      </aside>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4 w-full max-w-md">
            <Search className="h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Search..." 
              className="border-none shadow-none focus-visible:ring-0 placeholder:text-gray-400"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {upcomingDeadlines > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {upcomingDeadlines}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {upcomingDeadlines > 0 ? (
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium">Upcoming Deadlines</p>
                      <p className="text-sm text-gray-500">
                        You have {upcomingDeadlines} bid{upcomingDeadlines > 1 ? 's' : ''} with upcoming deadlines.
                      </p>
                    </div>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem>
                    <p className="text-gray-500">No new notifications</p>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 hover:bg-gray-100"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium hidden md:inline-block">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs font-normal text-gray-500">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-500 focus:text-red-500" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
