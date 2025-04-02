// File: app/(dashboard)/dashboard/projects/page.tsx
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProjectsList } from "@/components/projects/projects-list"; // Assuming this component exists
import { getUserProfile, getUserProjects } from "@/lib/user-profile";
import { DbUser } from "@/lib/supabase/database.types"; // Import DbUser type

export default async function ProjectsPage() {
	// Get user profile using our optimized function
	// Add type assertion for clarity, assuming getUserProfile returns DbUser | null
	const profile: DbUser | null = await getUserProfile();

	if (!profile) {
		redirect("/login");
	}

	// Get projects with a single optimized query using our helper function
	const projects = await getUserProjects(profile.id, profile.team_id);

	// Corrected: Ensure isTeamOwner is always boolean by treating null as false
	const isTeamOwner =
		profile.account_type === "team_member" && (profile.is_team_owner ?? false);
	const isTeamMember = profile.account_type === "team_member";

	// Check if the user can create more projects (based on their limits)
	// const projectLimit = isTeamMember ? 2 : 1; // Example limit logic
	// const hasReachedProjectLimit = projects.length >= projectLimit;

	// Only allow project creation if they have permission AND haven't reached their limit
	// const canCreateProject = (!profile.account_type || profile.account_type === "single" || isTeamOwner) && !hasReachedProjectLimit; // Example combining checks

	return (
		<DashboardShell>
			<DashboardHeader
				heading="Projects"
				description="Manage your projects and kanban boards."
				// Example: Conditionally show Create button based on logic above
				// actions={canCreateProject ? <CreateProjectButton /> : undefined}
			/>

			<ProjectsList
				projects={projects || []}
				isTeamMember={isTeamMember}
				isTeamOwner={isTeamOwner} // Now guaranteed to be boolean
			/>
		</DashboardShell>
	);
}
