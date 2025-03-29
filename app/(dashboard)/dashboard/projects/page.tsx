// app/(dashboard)/dashboard/projects/page.tsx
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProjectsList } from "@/components/projects/projects-list";
import { getUserProfile, getUserProjects } from "@/lib/user-profile";

export default async function ProjectsPage() {
    // Get user profile using our optimized function
    const profile = await getUserProfile();

    if (!profile) {
        redirect("/login");
    }

    // Get projects with a single optimized query using our helper function
    const projects = await getUserProjects(profile.id, profile.team_id);

    const isTeamOwner = profile.account_type === "team_member" && profile.is_team_owner;
    const isTeamMember = profile.account_type === "team_member";

    // Check if the user can create more projects (based on their limits)
    const projectLimit = isTeamMember ? 2 : 1;
    const hasReachedProjectLimit = projects.length >= projectLimit;

    // Only allow project creation if they have permission AND haven't reached their limit
    const canCreateProject = (!profile.account_type || profile.account_type === "single" || isTeamOwner);

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