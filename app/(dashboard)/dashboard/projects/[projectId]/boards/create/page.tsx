import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CreateBoardForm } from "@/components/projects/kanban/create-board-form";

interface CreateBoardPageProps {
    params: {
        projectId: string;
    };
}

export default async function CreateBoardPage({ params }: CreateBoardPageProps) {
    const { projectId } = params;
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
    const isTeamOwner = profile?.account_type === "team_member" && profile?.is_team_owner;
    const canManageProject = isProjectOwner || isTeamOwner;

    if (!isProjectOwner && !(isTeamProject && isTeamMember)) {
        // User doesn't have access to this project
        redirect("/dashboard/projects");
    }

    if (!canManageProject) {
        // User doesn't have permission to create boards
        redirect(`/dashboard/projects/${projectId}`);
    }

    // Count existing boards to check if user can create more
    const { count } = await supabase
        .from("boards")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

    // Check board limit (team projects can have 2 boards, solo users 1)
    const isAtBoardLimit = (isTeamProject && (count || 0) >= 2) || (!isTeamProject && (count || 0) >= 1);

    if (isAtBoardLimit) {
        redirect(`/dashboard/projects/${projectId}`);
    }

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Create New Board"
                description={`Add a new board to ${project.name}`}
            />

            <CreateBoardForm
                projectId={projectId}
                projectName={project.name}
            />
        </DashboardShell>
    );
}