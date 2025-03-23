import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, FolderPlus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DocSpaces } from "@/components/docs/doc-spaces";

export default async function DocsPage() {
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

    // Using a more explicit query structure to ensure we get all spaces
    // First get the user's personal spaces
    const { data: personalSpaces, error: personalError } = await supabase
        .from("doc_spaces")
        .select("*")
        .eq("owner_id", session.user.id);

    // Then get team spaces if the user is part of a team
    let teamSpaces = [];
    if (profile?.team_id) {
        const { data: teamDocSpaces, error: teamError } = await supabase
            .from("doc_spaces")
            .select("*")
            .eq("team_id", profile.team_id);

        if (!teamError && teamDocSpaces) {
            teamSpaces = teamDocSpaces;
        }
    }

    // Combine and deduplicate spaces (in case any appear in both queries)
    const allSpaces = [...(personalSpaces || [])];
    teamSpaces.forEach(teamSpace => {
        if (!allSpaces.some(space => space.id === teamSpace.id)) {
            allSpaces.push(teamSpace);
        }
    });

    // Sort by creation date
    const docSpaces = allSpaces.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const isTeamOwner = profile?.account_type === "team_member" && profile?.is_team_owner;
    const isTeamMember = profile?.account_type === "team_member";
    const canCreateDocSpace = !profile?.account_type || profile?.account_type === "single" || isTeamOwner;

    // Check if user has reached their documentation space limit
    const isTeamSpace = isTeamMember;
    const spaceLimit = isTeamSpace ? 2 : 1; // Team = 2 spaces, Solo = 1 space
    const hasReachedSpaceLimit = (docSpaces?.length || 0) >= spaceLimit;

    // User can create a space if they haven't reached their limit and have permission
    const canCreateMoreSpaces = canCreateDocSpace && !hasReachedSpaceLimit;

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Documentation"
                description="Create, manage, and share documentation for your projects."
            >
                {canCreateMoreSpaces && (
                    <Link href="/dashboard/docs/create">
                        <Button size="sm" className="ml-auto">
                            <Plus className="mr-1 h-4 w-4" />
                            New Documentation Space
                        </Button>
                    </Link>
                )}
            </DashboardHeader>

            {Array.isArray(docSpaces) && docSpaces.length > 0 ? (
                <DocSpaces
                    spaces={docSpaces}
                    isTeamMember={isTeamMember}
                    isTeamOwner={isTeamOwner}
                    hasReachedSpaceLimit={hasReachedSpaceLimit}
                    isTeamSpace={isTeamSpace}
                />
            ) : (
                <Card>
                    <CardContent className="flex h-[300px] flex-col items-center justify-center space-y-4 py-8">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            <FileText className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-center text-xl font-medium">No documentation yet</h3>
                        <p className="text-center text-muted-foreground">
                            {isTeamOwner
                                ? "Create a documentation space to organize and share knowledge with your team"
                                : profile?.account_type === "team_member"
                                    ? "Your team owner hasn't created any documentation spaces yet"
                                    : "Create a documentation space to organize your knowledge efficiently"}
                        </p>
                        {canCreateDocSpace && (
                            <Link href="/dashboard/docs/create">
                                <Button className="mt-2">
                                    <FolderPlus className="mr-1 h-4 w-4" />
                                    Create Documentation Space
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}
        </DashboardShell>
    );
}