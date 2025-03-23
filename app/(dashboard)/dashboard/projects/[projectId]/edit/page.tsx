import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EditProjectForm } from "@/components/projects/edit-project-form";

interface EditProjectPageProps {
    params: Promise<{
        projectId: string;
    }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
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

    // Check if user has access to manage this project
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
        // User doesn't have permission to edit
        redirect(`/dashboard/projects/${projectId}`);
    }

    return (
        <DashboardShell>
            <DashboardHeader
                heading={`Edit: ${project.name}`}
                description="Update your project details"
            />

            <EditProjectForm
                project={project}
            />
        </DashboardShell>
    );
}