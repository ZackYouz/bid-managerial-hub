
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  getProjectById, 
  updateProject, 
  deleteProject, 
  addFileToProject, 
  removeFileFromProject 
} from "@/services/dataService";
import { FileItem, Project } from "@/types";
import { formatDate, formatFileSize, getFileIconClass } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Save, 
  DownloadCloud,
  File,
  Archive, 
  FolderOpen,
  Upload,
  Plus,
  FilePlus,
  FileMinus,
  AlertCircle,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<Partial<Project>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Reference for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load project data
  useEffect(() => {
    if (!id) return;
    
    const projectData = getProjectById(id);
    if (projectData) {
      setProject(projectData);
      setEditedProject(projectData);
    } else {
      navigate('/projects');
    }
  }, [id, navigate]);
  
  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading project details...</p>
      </div>
    );
  }
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setEditedProject(project);
    }
    setIsEditing(!isEditing);
  };
  
  const handleSave = () => {
    if (!id) return;
    
    const updatedProject = updateProject(id, editedProject);
    if (updatedProject) {
      setProject(updatedProject);
      setIsEditing(false);
      
      toast({
        title: "Project Updated",
        description: "Project details have been saved successfully.",
      });
    }
  };
  
  const handleDelete = () => {
    if (!id) return;
    
    const deleted = deleteProject(id);
    
    if (deleted) {
      toast({
        title: "Project Deleted",
        description: "The project has been deleted successfully.",
      });
      
      navigate('/projects');
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Create a URL for the file
    const fileUrl = URL.createObjectURL(file);
    
    // In a real app, we would upload this file to a server
    // For this demo, we'll simulate it using the object URL
    const fileData: Omit<FileItem, 'id' | 'createdAt' | 'updatedAt'> = {
      name: file.name,
      type: file.type,
      size: file.size,
      url: fileUrl
    };
    
    const addedFile = addFileToProject(id, fileData);
    
    if (addedFile) {
      // Update the project state with the new file
      setProject({
        ...project,
        files: [...project.files, addedFile]
      });
      
      toast({
        title: "File Uploaded",
        description: `${file.name} has been added to the project.`,
      });
      
      setUploadDialogOpen(false);
    }
  };
  
  const handleDeleteFile = (fileId: string) => {
    if (!id) return;
    
    const removed = removeFileFromProject(id, fileId);
    
    if (removed) {
      // Update the project state by removing the file
      setProject({
        ...project,
        files: project.files.filter(file => file.id !== fileId)
      });
      
      toast({
        title: "File Removed",
        description: "The file has been removed from the project.",
      });
    }
  };
  
  // Generate a zip folder (in a real app)
  const handleDownloadFolder = () => {
    toast({
      title: "Download Started",
      description: "All project files would be downloaded as a zip folder in a real application.",
    });
  };
  
  // Function to open file upload input
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button variant="outline" onClick={() => navigate('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={handleEditToggle}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Project</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this project? This will remove all files and cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleEditToggle}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Project Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? (
                <Input
                  value={editedProject.name || ""}
                  onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                  className="text-2xl font-bold h-10 px-1"
                />
              ) : (
                project.name
              )}
            </h1>
            <p className="text-muted-foreground">
              Client: {project.clientName}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge 
              className={
                project.status === 'active' ? 'bg-green-100 text-green-800' :
                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }
            >
              {project.status.replace('-', ' ').replace(
                /\w\S*/g,
                (txt) => txt.charAt(0).toUpperCase() + txt.substr(1)
              )}
            </Badge>
            
            <div className="flex items-center text-sm gap-1">
              <FolderOpen className="h-4 w-4 text-gray-500" />
              <span>Created {formatDate(project.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="details">
        <TabsList className="w-full justify-start border-b mb-4 rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="details" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none bg-transparent px-4 py-2"
          >
            Details
          </TabsTrigger>
          <TabsTrigger 
            value="files" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none bg-transparent px-4 py-2"
          >
            Files
          </TabsTrigger>
        </TabsList>
        
        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                View and edit general project information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Project Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedProject.name || ""}
                        onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm mt-1">{project.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Client Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedProject.clientName || ""}
                        onChange={(e) => setEditedProject({ ...editedProject, clientName: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm mt-1">{project.clientName}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Status</Label>
                    {isEditing ? (
                      <Select
                        value={editedProject.status || "active"}
                        onValueChange={(value: "active" | "completed" | "on-hold" | "cancelled") => 
                          setEditedProject({ ...editedProject, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm mt-1">
                        <Badge 
                          className={
                            project.status === 'active' ? 'bg-green-100 text-green-800' :
                            project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {project.status.replace('-', ' ').replace(
                            /\w\S*/g,
                            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1)
                          )}
                        </Badge>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Start Date</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedProject.startDate ? new Date(editedProject.startDate).toISOString().split('T')[0] : ""}
                        onChange={(e) => setEditedProject({ ...editedProject, startDate: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm mt-1">{formatDate(project.startDate) || "Not set"}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label>End Date</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedProject.endDate ? new Date(editedProject.endDate).toISOString().split('T')[0] : ""}
                        onChange={(e) => setEditedProject({ ...editedProject, endDate: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm mt-1">{formatDate(project.endDate) || "Not set"}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Created Date</Label>
                    <p className="text-sm mt-1">{formatDate(project.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                {isEditing ? (
                  <Textarea
                    value={editedProject.description || ""}
                    onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                    rows={4}
                  />
                ) : (
                  <p className="text-sm mt-1 whitespace-pre-line">
                    {project.description || "No description available."}
                  </p>
                )}
              </div>
              
              {project.bidId && (
                <div>
                  <Label>Associated Bid</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/bids/${project.bidId}`)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Bid
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Project Files</CardTitle>
              <CardDescription>
                {project.files.length > 0
                  ? `${project.files.length} files associated with this project`
                  : "No files associated with this project yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2 mb-4">
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Files
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Files</DialogTitle>
                      <DialogDescription>
                        Select files to upload to this project.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={triggerFileUpload}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-1">Click to upload files</h3>
                        <p className="text-sm text-muted-foreground">
                          or drag and drop your files here
                        </p>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {project.files.length > 0 && (
                  <Button variant="outline" onClick={handleDownloadFolder}>
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Download All
                  </Button>
                )}
              </div>
              
              {project.files.length > 0 ? (
                <div className="grid gap-2">
                  {project.files.slice(0, 3).map((file) => (
                    <div 
                      key={file.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center">
                        <File className={`h-5 w-5 mr-3 ${getFileIconClass(file.name)}`} />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                          <DownloadCloud className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                  
                  {project.files.length > 3 && (
                    <Button variant="link" className="mt-1 text-primary">
                      View all {project.files.length} files →
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No files yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload files to this project to get started
                  </p>
                  <Button onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Files Tab */}
        <TabsContent value="files" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Project Files</h2>
              <p className="text-muted-foreground">
                {project.files.length > 0
                  ? `${project.files.length} files associated with this project`
                  : "No files associated with this project yet"}
              </p>
            </div>
            
            <div className="flex gap-2">
              {project.files.length > 0 && (
                <Button variant="outline" onClick={handleDownloadFolder}>
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              )}
              
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                    <DialogDescription>
                      Select files to upload to this project.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={triggerFileUpload}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-1">Click to upload files</h3>
                      <p className="text-sm text-muted-foreground">
                        or drag and drop your files here
                      </p>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {project.files.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Added Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <File className={`h-5 w-5 mr-2 ${getFileIconClass(file.name)}`} />
                            <span className="font-medium">{file.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{file.type || "Unknown"}</TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell>{formatDate(file.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <Button variant="ghost" size="icon" asChild>
                              <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                                <DownloadCloud className="h-4 w-4 text-gray-500" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteFile(file.id)}
                            >
                              <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <Archive className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Files Yet</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  This project doesn't have any files yet. Upload files to get started with this project.
                </p>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Upload Your First File
                </Button>
              </CardContent>
            </Card>
          )}
          
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-600">About File Storage</AlertTitle>
            <AlertDescription className="text-blue-700">
              In a real application, files would be stored securely in cloud storage. For this demo, 
              files are only stored temporarily in the browser and will be lost when you refresh.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetails;
