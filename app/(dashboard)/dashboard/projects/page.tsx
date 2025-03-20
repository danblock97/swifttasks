import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProjectsList } from "@/components/projects/projects-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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

    // Get projects (either personal or team projects)
    const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .or(`owner_id.eq.${session.user.id},team_id.eq.${profile?.team_id || 'null'}`)
        .order("created_at", { ascending: false });

    const isTeamOwner = profile?.account_type === "team_member" && profile?.is_team_owner;
    const canCreateProject = !profile?.account_type || profile?.account_type === "single" || isTeamOwner;

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Projects"
                description="Manage your projects and kanban boards."
            >
                {canCreateProject && (
                    <Link href="/dashboard/projects/create">
                        <Button size="sm" className="ml-auto">
                            <Plus className="mr-1 h-4 w-4" />
                            New Project
                        </Button>
                    </Link>
                )}
            </DashboardHeader>

            <ProjectsList
                projects={projects || []}
                isTeamMember={profile?.account_type === "team_member"}
                isTeamOwner={isTeamOwner}
            />
        </DashboardShell>
    );
}