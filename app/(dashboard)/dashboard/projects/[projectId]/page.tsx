import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProjectKanbanBoards } from "@/components/projects/project-kanban-boards";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit, Kanban, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProjectDetailPageProps {
    params: Promise<{
        projectId: string;
    }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
    // Resolve the promise to get the actual parameters
    const resolvedParams = await params;
    const { projectId } = resolvedParams;

    const supabase = createServerComponentClient({ cookies });

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect("/login");
    }

    // Get user profile
    const { data: profile } = await supabase
        .from("users")
        .select("*, teams(*)")
        .eq("id", session.user.id)
        .single();

    // Get project details
    const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

    // If project doesn't exist or user doesn't have access
    if (!project) {
        notFound();
    }

    // Check if user has access to this project
    const isProjectOwner = project.owner_id === session.user.id;
    const isTeamProject = project.team_id !== null;
    const isTeamMember = profile?.team_id === project.team_id;

    if (!isProjectOwner && !(isTeamProject && isTeamMember)) {
        // User doesn't have access to this project
        redirect("/dashboard/projects");
    }

    // Get kanban boards for this project
    const { data: boards } = await supabase
        .from("boards")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

    const isTeamOwner = profile?.account_type === "team_member" && profile?.is_team_owner;
    const canManageProject = isProjectOwner || isTeamOwner;

    return (
        <DashboardShell>
            <div className="flex items-start gap-2">
                <Link href="/dashboard/projects">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Back to projects</span>
                    </Button>
                </Link>
                <div className="flex flex-1 justify-between items-start">
                    <DashboardHeader
                        heading={project.name}
                        description={
                            project.description ||
                            `Created on ${formatDate(project.created_at)}`
                        }
                    />
                    {canManageProject && (
                        <div className="flex gap-2 ml-auto">
                            <Link href={`/dashboard/projects/${projectId}/edit`}>
                                <Button variant="outline" size="sm">
                                    <Edit className="mr-1 h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>

                            {boards && boards.length < 2 && (
                                <Link href={`/dashboard/projects/${projectId}/boards/create`}>
                                    <Button size="sm">
                                        <Plus className="mr-1 h-4 w-4" />
                                        New Board
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-4">
                <div className="flex items-center gap-2">
                    {project.team_id && (
                        <Badge variant="outline" className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>Team Project</span>
                        </Badge>
                    )}
                </div>

                <div className="mt-2">
                    <h2 className="text-lg font-medium flex items-center gap-2">
                        <Kanban className="h-5 w-5" />
                        Kanban Boards
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Manage tasks with visual kanban boards
                    </p>

                    <ProjectKanbanBoards
                        boards={boards || []}
                        projectId={projectId}
                        canManageProject={canManageProject}
                        isTeamProject={isTeamProject}
                    />
                </div>
            </div>
        </DashboardShell>
    );
}