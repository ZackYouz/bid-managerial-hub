
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "@/services/dataService";
import { Project } from "@/types";
import { formatDate } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  FolderPlus, 
  FileText, 
  Archive, 
  Folders, 
  Clock,
  FolderArchive,
  Check,
  Pause,
  X
} from "lucide-react";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    // Load projects from storage
    const loadedProjects = getProjects();
    setProjects(loadedProjects);
    setFilteredProjects(loadedProjects);
  }, []);

  // Filter projects when search or status filter changes
  useEffect(() => {
    let result = [...projects];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        project =>
          project.name.toLowerCase().includes(query) ||
          project.clientName.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(project => project.status === statusFilter);
    }
    
    setFilteredProjects(result);
  }, [projects, searchQuery, statusFilter]);

  // Get counts for each status
  const statusCounts = projects.reduce(
    (acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Check className="h-4 w-4" />;
      case "completed":
        return <FolderArchive className="h-4 w-4" />;
      case "on-hold":
        return <Pause className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage all your projects and files
          </p>
        </div>
        
        <Button onClick={() => navigate('/bids')}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </div>
      
      {/* Search and filters */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search projects..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Project status tabs */}
      <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="w-full justify-start border-b space-x-4 rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none bg-transparent py-2"
          >
            All Projects
            <Badge variant="secondary" className="ml-2">
              {projects.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="active" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none bg-transparent py-2"
          >
            Active
            <Badge variant="secondary" className="ml-2">
              {statusCounts["active"] || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none bg-transparent py-2"
          >
            Completed
            <Badge variant="secondary" className="ml-2">
              {statusCounts["completed"] || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="on-hold" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none bg-transparent py-2"
          >
            On Hold
            <Badge variant="secondary" className="ml-2">
              {statusCounts["on-hold"] || 0}
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <ProjectGrid projects={filteredProjects} navigate={navigate} />
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <ProjectGrid projects={filteredProjects} navigate={navigate} />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <ProjectGrid projects={filteredProjects} navigate={navigate} />
        </TabsContent>
        
        <TabsContent value="on-hold" className="mt-6">
          <ProjectGrid projects={filteredProjects} navigate={navigate} />
        </TabsContent>
        
        <TabsContent value="cancelled" className="mt-6">
          <ProjectGrid projects={filteredProjects} navigate={navigate} />
        </TabsContent>
      </Tabs>
      
      {/* Empty state */}
      {filteredProjects.length === 0 && (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Folders className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium">No Projects Found</h3>
            <p className="text-muted-foreground text-center mt-2 mb-4">
              {projects.length === 0
                ? "Create your first project to organize files and track progress."
                : "No projects match your current filters."}
            </p>
            {projects.length === 0 ? (
              <Button onClick={() => navigate('/bids')}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Create First Project
              </Button>
            ) : (
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ProjectGrid component for displaying projects in a grid layout
interface ProjectGridProps {
  projects: Project[];
  navigate: (path: string) => void;
}

const ProjectGrid = ({ projects, navigate }: ProjectGridProps) => {
  // Status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Card 
          key={project.id} 
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/projects/${project.id}`)}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{project.name}</h3>
                <p className="text-sm text-muted-foreground">{project.clientName}</p>
              </div>
              <Badge className={getStatusBadgeStyle(project.status)}>
                {project.status.replace('-', ' ').replace(
                  /\w\S*/g,
                  (txt) => txt.charAt(0).toUpperCase() + txt.substr(1)
                )}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 pt-2">
            <p className="text-sm my-2 text-gray-600 line-clamp-2">
              {project.description || "No description available"}
            </p>
          </CardContent>
          
          <CardFooter className="p-4 border-t flex justify-between items-center text-sm">
            <div className="flex items-center">
              <Archive className="h-4 w-4 mr-1 text-gray-500" />
              <span>{project.files.length} files</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              <span>Created {formatDate(project.createdAt)}</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Projects;
