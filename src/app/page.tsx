"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Video, Plus, RefreshCw, Download, Trash2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  createdAt: string;
}

interface ProjectStatus {
  project: {
    id: string;
    name: string;
    status: string;
  };
  stats: {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    processingJobs: number;
    pendingJobs: number;
    overallProgress: number;
  };
  jobs: Array<{
    id: string;
    status: string;
    progress: number;
    error?: string;
    outputUrl?: string;
  }>;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      const interval = setInterval(() => {
        fetchProjectStatus(selectedProject);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const fetchProjectStatus = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/status`);
      const data = await response.json();
      setProjectStatus(data);
    } catch (error) {
      console.error("Failed to fetch project status:", error);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription,
        }),
      });

      const data = await response.json();
      const projectId = data.project.id;

      // Process CSV if uploaded
      if (csvFile) {
        await processCSV(projectId, csvFile);
      }

      setShowNewProject(false);
      setNewProjectName("");
      setNewProjectDescription("");
      setCsvFile(null);
      fetchProjects();
      setSelectedProject(projectId);
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setLoading(false);
    }
  };

  const processCSV = async (projectId: string, file: File) => {
    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((h) => h.trim());

    const jobs = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const data: Record<string, any> = {};
      headers.forEach((header, index) => {
        data[header] = values[index];
      });
      return { data };
    });

    await fetch(`/api/projects/${projectId}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobs }),
    });
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      fetchProjects();
      if (selectedProject === projectId) {
        setSelectedProject(null);
        setProjectStatus(null);
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDING: "secondary",
      PROCESSING: "warning",
      COMPLETED: "success",
      FAILED: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Video className="h-10 w-10 text-primary" />
              AI Video SaaS
            </h1>
            <p className="text-muted-foreground mt-2">
              Mass video production at scale
            </p>
          </div>
          <Button onClick={() => setShowNewProject(!showNewProject)}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>

        {showNewProject && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>
                Upload a CSV file with video data to generate videos in bulk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Video Campaign"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Promotional videos for Q1 campaign"
                />
              </div>
              <div>
                <Label htmlFor="csv">CSV File (Optional)</Label>
                <Input
                  id="csv"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  CSV should have headers: text, backgroundColor, etc.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={createProject} disabled={loading}>
                  {loading ? "Creating..." : "Create Project"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewProject(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Projects</h2>
          <div className="space-y-3">
            {projects.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No projects yet. Create your first project to get started.
                </CardContent>
              </Card>
            ) : (
              projects.map((project) => (
                <Card
                  key={project.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedProject === project.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => {
                    setSelectedProject(project.id);
                    fetchProjectStatus(project.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        {project.description && (
                          <p className="text-sm text-muted-foreground">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(project.status)}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Total: {project.totalJobs}</span>
                      <span className="text-green-600">
                        Completed: {project.completedJobs}
                      </span>
                      {project.failedJobs > 0 && (
                        <span className="text-red-600">
                          Failed: {project.failedJobs}
                        </span>
                      )}
                    </div>
                    {project.totalJobs > 0 && (
                      <Progress
                        value={(project.completedJobs / project.totalJobs) * 100}
                        className="mt-3"
                      />
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div>
          {projectStatus ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">
                  {projectStatus.project.name}
                </h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fetchProjectStatus(selectedProject!)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={projectStatus.stats.overallProgress} />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Jobs</p>
                        <p className="text-2xl font-bold">
                          {projectStatus.stats.totalJobs}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold text-green-600">
                          {projectStatus.stats.completedJobs}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Processing</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {projectStatus.stats.processingJobs}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Failed</p>
                        <p className="text-2xl font-bold text-red-600">
                          {projectStatus.stats.failedJobs}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jobs ({projectStatus.jobs.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {projectStatus.jobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-3 border rounded-lg flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-mono text-muted-foreground">
                              {job.id.slice(0, 8)}
                            </span>
                            {getStatusBadge(job.status)}
                          </div>
                          {job.status === "PROCESSING" && (
                            <Progress value={job.progress} className="h-2" />
                          )}
                          {job.error && (
                            <p className="text-xs text-red-600 mt-1">{job.error}</p>
                          )}
                        </div>
                        {job.status === "COMPLETED" && job.outputUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(job.outputUrl, "_blank")}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                Select a project to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
