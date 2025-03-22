"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
    Clock,
    MoreVertical,
    Users,
    Kanban,
    Plus,
    Edit,
    Trash2,
    ExternalLink
} from "lucide-react";

interface Project {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    owner_id: string;
    team_id: string | null;
}

interface ProjectsListProps {
    projects: Project[];
    isTeamMember: boolean;
    isTeamOwner: boolean;
}

export function ProjectsList({ projects, isTeamMember, isTeamOwner }: ProjectsListProps) {
    const [projectsList, setProjectsList] = useState<Project[]>(projects);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const supabase = createClientComponentClient();
    const router = useRouter();
    const { toast } = useToast();

    const handleDeleteProject = (project: Project) => {
        setSelectedProject(project);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteProject = async () => {
        if (!selectedProject) return;

        if (!isTeamOwner && isTeamMember) {
            toast({
                title: "Permission Denied",
                description: "Only team owners can delete projects",
                variant: "destructive",
            });
            setIsDeleteDialogOpen(false);
            return;
        }

        // Optimistic update
        setProjectsList((prevProjects) =>
            prevProjects.filter((p) => p.id !== selectedProject.id)
        );

        // Delete boards associated with the project
        const { error: boardsError } = await supabase
            .from("boards")
            .delete()
            .eq("project_id", selectedProject.id);

        if (boardsError) {
            console.error("Error deleting boards:", boardsError);
        }

        // Delete the project
        const { error } = await supabase
            .from("projects")
            .delete()
            .eq("id", selectedProject.id);

        if (error) {
            toast({
                title: "Error",
                description: "Failed to delete project. Please try again.",
                variant: "destructive",
            });
            // Reload the page to restore state
            router.refresh();
        } else {
            toast({
                title: "Project deleted",
                description: "The project has been deleted successfully."
            });
        }

        setIsDeleteDialogOpen(false);
        setSelectedProject(null);
    };

    const canManageProject = (project: Project) => {
        if (!isTeamMember) return true; // Single user can manage their projects
        return isTeamOwner; // Team members can only manage if they're the owner
    };

    return (
        <div className="grid gap-6">
            {projectsList.length === 0 ? (
                <Card>
                    <CardContent className="flex h-[300px] flex-col items-center justify-center space-y-4 py-8">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            <Kanban className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-center text-xl font-medium">No projects yet</h3>
                        <p className="text-center text-muted-foreground">
                            {isTeamOwner
                                ? "Create a project to manage tasks and collaborate with your team"
                                : isTeamMember
                                    ? "Your team owner hasn't created any projects yet"
                                    : "Create a project to organize your tasks efficiently"}
                        </p>
                        {(!isTeamMember || isTeamOwner) && (
                            <Link href="/dashboard/projects/create">
                                <Button className="mt-2">
                                    <Plus className="mr-1 h-4 w-4" />
                                    Create Project
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {projectsList.map((project) => (
                        <Card key={project.id} className="flex flex-col">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="line-clamp-1 text-base">
                                        {project.name}
                                    </CardTitle>
                                    {canManageProject(project) && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <MoreVertical className="h-4 w-4" />
                                                    <span className="sr-only">Menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/projects/${project.id}`}>
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        View Project
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/projects/${project.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Project
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDeleteProject(project)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Project
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                    {project.description || "No description provided"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="flex items-center space-x-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link
                                                    href={`/dashboard/projects/${project.id}`}
                                                    className="inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary"
                                                >
                                                    <Kanban className="mr-1 h-3 w-3" />
                                                    Kanban
                                                </Link>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>View Kanban Boards</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {project.team_id && (
                                        <Badge variant="secondary" className="text-xs">
                                            <Users className="mr-1 h-3 w-3" />
                                            Team
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 mt-auto">
                                <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center">
                                        <Clock className="mr-1 h-3 w-3" />
                                        <span>Created {formatDate(project.created_at)}</span>
                                    </div>
                                    <Link
                                        href={`/dashboard/projects/${project.id}`}
                                        className="text-xs font-medium text-primary hover:underline"
                                    >
                                        View details
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete confirmation dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this project? This will delete all boards,
                            tasks, and associated data. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDeleteProject}
                        >
                            Delete
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}