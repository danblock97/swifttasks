import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TeamMembersList } from "@/components/team/team-members-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, UserPlus, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function TeamDashboardPage() {
    const supabase = createServerComponentClient({ cookies });

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect("/login");
    }

    // Get user profile with team info
    const { data: profile } = await supabase
        .from("users")
        .select("*, teams(*)")
        .eq("id", session.user.id)
        .single();

    // Check if user is in a team
    const isTeamMember = profile?.account_type === "team_member";
    const isTeamOwner = isTeamMember && profile?.is_team_owner;

    if (!isTeamMember) {
        // If not a team member, offer to upgrade account
        return (
            <DashboardShell>
                <DashboardHeader
                    heading="Team Dashboard"
                    description="Manage your team members and settings"
                />

                <Card>
                    <CardContent className="flex h-[300px] flex-col items-center justify-center space-y-4 py-8">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-center text-xl font-medium">You don't have a team yet</h3>
                        <p className="text-center text-muted-foreground">
                            Upgrade to a team account to invite team members and collaborate together
                        </p>
                        <Link href="/dashboard/settings" className="mt-2">
                            <Button>
                                <UserPlus className="mr-1 h-4 w-4" />
                                Upgrade to Team Account
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </DashboardShell>
        );
    }

    // Get team information
    const teamId = profile.team_id;
    const teamName = profile.teams?.name || "Your Team";

    // Get all team members
    const { data: teamMembers } = await supabase
        .from("users")
        .select("id, email, display_name, created_at, is_team_owner")
        .eq("team_id", teamId)
        .order("is_team_owner", { ascending: false })
        .order("created_at", { ascending: true });

    // Get pending invitations
    const { data: pendingInvites } = await supabase
        .from("team_invites")
        .select("*")
        .eq("team_id", teamId)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

    return (
        <DashboardShell>
            <DashboardHeader
                heading={teamName}
                description="Manage your team members and collaboration settings"
            >
                {isTeamOwner && (
                    <Link href="/dashboard/team/invite">
                        <Button size="sm">
                            <UserPlus className="mr-1 h-4 w-4" />
                            Invite Member
                        </Button>
                    </Link>
                )}
            </DashboardHeader>

            <div className="grid gap-6">
                {/* Team Information */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xl">Team Information</CardTitle>
                        <CardDescription>
                            Your team details and basic information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Team Name</p>
                                    <p className="text-base">{teamName}</p>
                                </div>
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{teamMembers?.length || 0} Members</span>
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Created</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(profile.teams?.created_at || new Date())}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Your Role</p>
                                <div className="flex items-center gap-2">
                                    {isTeamOwner ? (
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Team Owner</Badge>
                                    ) : (
                                        <Badge variant="outline">Team Member</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Team Members List */}
                <TeamMembersList
                    members={teamMembers || []}
                    pendingInvites={pendingInvites || []}
                    isTeamOwner={isTeamOwner}
                    currentUserId={session.user.id}
                />

                {/* Team Features */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xl">Team Features</CardTitle>
                        <CardDescription>
                            Benefits and features available to your team
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg border p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Kanban className="h-4 w-4 text-primary" />
                                    </div>
                                    <h3 className="font-medium">Multiple Kanban Boards</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Create up to 2 Kanban boards per project for better task organization
                                </p>
                            </div>
                            <div className="rounded-lg border p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FileText className="h-4 w-4 text-primary" />
                                    </div>
                                    <h3 className="font-medium">Enhanced Documentation</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Up to 2 documentation spaces with 10 pages each for comprehensive guides
                                </p>
                            </div>
                            <div className="rounded-lg border p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Users className="h-4 w-4 text-primary" />
                                    </div>
                                    <h3 className="font-medium">Collaboration Tools</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Assign tasks to team members and track progress together
                                </p>
                            </div>
                            <div className="rounded-lg border p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Shield className="h-4 w-4 text-primary" />
                                    </div>
                                    <h3 className="font-medium">Role-Based Permissions</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Control who can edit, view, or manage different aspects of your projects
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardShell>
    );
}

// Import missing components
import { Kanban, FileText, Shield } from "lucide-react";