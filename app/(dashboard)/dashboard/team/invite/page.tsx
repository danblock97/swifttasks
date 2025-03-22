import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { InviteTeamMemberForm } from "@/components/team/invite-team-member-form";

export default async function TeamInvitePage() {
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

    // Check if user is a team owner
    const isTeamMember = profile?.account_type === "team_member";
    const isTeamOwner = isTeamMember && profile?.is_team_owner;

    if (!isTeamMember) {
        // If not a team member, redirect to team dashboard
        redirect("/dashboard/team");
    }

    if (!isTeamOwner) {
        // If not a team owner, redirect to team dashboard with a message
        // In a real app, you might want to set a message in a cookie or URL param
        redirect("/dashboard/team");
    }

    // If we reach here, the user is a team owner
    const teamId = profile.team_id;
    const teamName = profile.teams?.name || "Your Team";

    // Get current team members to avoid duplicate invitations
    const { data: teamMembers } = await supabase
        .from("users")
        .select("email")
        .eq("team_id", teamId);

    const existingEmails = teamMembers?.map(member => member.email.toLowerCase()) || [];

    // Get existing invites to avoid duplicates
    const { data: existingInvites } = await supabase
        .from("team_invites")
        .select("email")
        .eq("team_id", teamId)
        .gte("expires_at", new Date().toISOString());

    const invitedEmails = existingInvites?.map(invite => invite.email.toLowerCase()) || [];

    // Combine both arrays to get all emails that shouldn't be invited
    const unavailableEmails = [...existingEmails, ...invitedEmails];

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Invite Team Member"
                description={`Invite someone to join ${teamName}`}
            />

            <InviteTeamMemberForm
                teamId={teamId}
                teamName={teamName}
                unavailableEmails={unavailableEmails}
            />
        </DashboardShell>
    );
}