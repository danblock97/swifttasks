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

    // Get projects
    const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .or(`owner_id.eq.${session.user.id},team_id.eq.${profile?.team_id || 'null'}`)
        .order("created_at", { ascending: false })
        .limit(4);

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