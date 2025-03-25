import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProjectsList } from "@/components/projects/projects-list";

export default async function ProjectsPage() {
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

    // Using the separate queries approach that worked for documentation spaces

    // First get the user's personal projects
    const { data: personalProjects, error: personalError } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", session.user.id);

    if (personalError) {
        console.error("Error fetching personal projects:", personalError);
    }

    // Then get team projects if the user is part of a team
    let teamProjects = [];
    if (profile?.team_id) {
        const { data: teamProjectsData, error: teamError } = await supabase
            .from("projects")
            .select("*")
            .eq("team_id", profile.team_id);

        if (teamError) {
            console.error("Error fetching team projects:", teamError);
        } else if (teamProjectsData) {
            teamProjects = teamProjectsData;
        }
    }

    // Combine and deduplicate projects
    const allProjects = [...(personalProjects || [])];
    teamProjects.forEach(teamProject => {
        if (!allProjects.some(project => project.id === teamProject.id)) {
            allProjects.push(teamProject);
        }
    });

    // Sort by creation date
    const projects = allProjects.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const isTeamOwner = profile?.account_type === "team_member" && profile?.is_team_owner;
    const isTeamMember = profile?.account_type === "team_member";

    // Check if the user can create more projects (based on their limits)
    const projectLimit = isTeamMember ? 2 : 1;
    const hasReachedProjectLimit = projects.length >= projectLimit;

    // Only allow project creation if they have permission AND haven't reached their limit
    const canCreateProject = (!profile?.account_type || profile?.account_type === "single" || isTeamOwner);

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Projects"
                description="Manage your projects and kanban boards."
            />

            <ProjectsList
                projects={projects || []}
                isTeamMember={isTeamMember}
                isTeamOwner={isTeamOwner}
            />
        </DashboardShell>
    );
}