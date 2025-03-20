import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CreateProjectForm } from "@/components/projects/create-project-form";

export default async function CreateProjectPage() {
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

    const isTeamMember = profile?.account_type === "team_member";
    const isTeamOwner = isTeamMember && profile?.is_team_owner;

    // If user is team member but not team owner, they can't create projects
    if (isTeamMember && !isTeamOwner) {
        redirect("/dashboard/projects");
    }

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Create Project"
                description="Create a new project to organize tasks and collaborate with your team."
            />

            <div className="grid gap-6">
                <CreateProjectForm
                    userId={session.user.id}
                    isTeamMember={isTeamMember}
                    teamId={profile?.team_id || null}
                />
            </div>
        </DashboardShell>
    );
}