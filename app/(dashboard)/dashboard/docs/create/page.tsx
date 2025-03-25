import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CreateDocSpaceForm } from "@/components/docs/create-doc-space-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Users, AlertCircle } from "lucide-react";

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
        return (
            <DashboardShell>
                <DashboardHeader
                    heading="Permission Denied"
                    description="You don't have permission to create documentation spaces"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Team Member Permissions</CardTitle>
                        <CardDescription>
                            Only team owners can create documentation spaces
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2 text-amber-600">
                            <AlertCircle className="h-5 w-5" />
                            <p>As a team member, you don't have permission to create new documentation spaces.</p>
                        </div>
                        <Link href="/dashboard/docs">
                            <Button variant="outline" className="mt-2">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back to Documentation
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </DashboardShell>
        );
    }

    // Check if user has reached their documentation space limit
    try {
        let query = supabase
            .from("doc_spaces")
            .select("*", { count: "exact" });

        // Personal spaces
        if (!isTeamMember) {
            query = query.eq("owner_id", session.user.id);
        } else if (profile?.team_id) {
            // Team spaces
            query = query.eq("team_id", profile.team_id);
        }

        const { count, error } = await query;

        if (error) throw error;

        // Team = 2 spaces, Solo = 1 space
        const spaceLimit = isTeamMember ? 2 : 1;

        // If user has reached their space limit, show limit reached page
        if ((count || 0) >= spaceLimit) {
            return (
                <DashboardShell>
                    <DashboardHeader
                        heading="Space Limit Reached"
                        description={isTeamMember
                            ? "Your team has reached the maximum number of documentation spaces"
                            : "You have reached the maximum number of documentation spaces"}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle>Documentation Space Limit</CardTitle>
                            <CardDescription>
                                {isTeamMember
                                    ? "Team accounts can create up to 2 documentation spaces"
                                    : "Personal accounts can create 1 documentation space"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isTeamMember && (
                                <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800/50">
                                    <div className="flex items-center">
                                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Upgrade to Team</h3>
                                    </div>
                                    <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                                        Upgrade to a team account to create more documentation spaces and collaborate with others.
                                    </p>
                                    <div className="mt-3">
                                        <Link href="/dashboard/settings">
                                            <Button size="sm" variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                                Upgrade Account
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            <Link href="/dashboard/docs">
                                <Button variant="outline" className="mt-2">
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back to Documentation
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </DashboardShell>
            );
        }
    } catch (error) {
        console.error("Error checking space limits:", error);
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