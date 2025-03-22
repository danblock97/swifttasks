import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CreateDocSpaceForm } from "@/components/docs/create-doc-space-form";

export default async function CreateDocSpacePage() {
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

    // If user is team member but not team owner, they can't create doc spaces
    if (isTeamMember && !isTeamOwner) {
        redirect("/dashboard/docs");
    }

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Create Documentation Space"
                description="Create a new space to organize and share documentation."
            />

            <div className="grid gap-6">
                <CreateDocSpaceForm
                    userId={session.user.id}
                    isTeamMember={isTeamMember}
                    teamId={profile?.team_id || null}
                />
            </div>
        </DashboardShell>
    );
}