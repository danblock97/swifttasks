// app/(dashboard)/dashboard/page.tsx
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RecentTasks } from "@/components/dashboard/recent-tasks";
import { ProjectsOverview } from "@/components/dashboard/projects-overview";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { getUserProfile, getUserProjects } from "@/lib/user-profile";
import { cache } from "react";
import { fetchServerSession } from "@/lib/supabase/utils";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Create a cached function for tasks that shares the auth session
const getRecentTasks = cache(async (userId: string) => {
    // Get the cached session rather than creating a new auth check
    const sessionData = await fetchServerSession();
    if (!sessionData.data.session) return [];

    const supabase = createServerComponentClient({ cookies });

    const { data: tasks } = await supabase
        .from("todo_items")
        .select("*, todo_lists(*)")
        .eq("todo_lists.owner_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

    return tasks || [];
});

export default async function DashboardPage() {
    // Get user profile using our enhanced cached function
    const profile = await getUserProfile();

    if (!profile) {
        redirect("/login");
    }

    // Get recent tasks (with enhanced caching)
    const recentTasks = await getRecentTasks(profile.id);

    // Get projects with our optimized query
    const projects = await getUserProjects(profile.id, profile.team_id);

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