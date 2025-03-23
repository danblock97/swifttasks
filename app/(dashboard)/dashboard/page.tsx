import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RecentTasks } from "@/components/dashboard/recent-tasks";
import { ProjectsOverview } from "@/components/dashboard/projects-overview";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
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

    // Get recent tasks
    const { data: recentTasks } = await supabase
        .from("todo_items")
        .select("*, todo_lists(*)")
        .eq("todo_lists.owner_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

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

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Dashboard"
                description={`Welcome back, ${profile?.display_name || "there"}!`}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <RecentTasks className="col-span-2" tasks={recentTasks || []} />
                <QuickActions profile={profile} />
            </div>
            <div className="mt-6">
                <ProjectsOverview projects={projects || []} />
            </div>
        </DashboardShell>
    );
}