import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle, ChevronLeft } from "lucide-react";

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
        // Instead of redirect, we'll render a message
        return (
            <DashboardShell>
                <DashboardHeader
                    heading="Permission Denied"
                    description="You don't have permission to create projects"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Team Member Permissions</CardTitle>
                        <CardDescription>
                            Only team owners can create projects
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2 text-amber-600">
                            <AlertCircle className="h-5 w-5" />
                            <p>As a team member, you don't have permission to create new projects.</p>
                        </div>
                        <Link href="/dashboard/projects">
                            <Button variant="outline" className="mt-2">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back to Projects
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </DashboardShell>
        );
    }

    // Check project limits
    try {
        // Count existing projects based on account type
        const { count, error } = await supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq(isTeamMember ? "team_id" : "owner_id", isTeamMember ? profile.team_id : session.user.id);

        if (error) throw error;

        // Define project limits: Team = 2 projects, Solo = 1 project
        const projectLimit = isTeamMember ? 2 : 1;

        // If user has reached their project limit, show limit reached message
        if ((count || 0) >= projectLimit) {
            return (
                <DashboardShell>
                    <DashboardHeader
                        heading="Project Limit Reached"
                        description={isTeamMember
                            ? "Your team has reached the maximum number of projects"
                            : "You have reached the maximum number of projects"}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle>Project Limit</CardTitle>
                            <CardDescription>
                                {isTeamMember
                                    ? "Team accounts can create up to 2 projects"
                                    : "Personal accounts can create 1 project"}
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
                                        Upgrade to a team account to create more projects and collaborate with others.
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

                            <Link href="/dashboard/projects">
                                <Button variant="outline" className="mt-2">
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back to Projects
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </DashboardShell>
            );
        }
    } catch (error) {
        console.error("Error checking project limits:", error);
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