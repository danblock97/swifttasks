import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CreateDocPageForm } from "@/components/docs/create-doc-page-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Users } from "lucide-react";

interface CreateDocPageProps {
    params: Promise<{
        spaceId: string;
    }>;
}

export default async function CreateDocPage({ params }: CreateDocPageProps) {
    // Resolve the promise to get the actual parameters
    const resolvedParams = await params;
    const { spaceId } = resolvedParams;

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

    // Get doc space details
    const { data: docSpace } = await supabase
        .from("doc_spaces")
        .select("*")
        .eq("id", spaceId)
        .single();

    // If doc space doesn't exist or user doesn't have access
    if (!docSpace) {
        notFound();
    }

    // Check if user has access to manage this doc space
    const isSpaceOwner = docSpace.owner_id === session.user.id;
    const isTeamSpace = docSpace.team_id !== null;
    const isTeamMember = profile?.team_id === docSpace.team_id;
    const isTeamOwner = profile?.account_type === "team_member" && profile?.is_team_owner;
    const canManageDocSpace = isSpaceOwner || isTeamOwner || (isTeamSpace && isTeamMember);

    if (!isSpaceOwner && !(isTeamSpace && isTeamMember)) {
        // User doesn't have access to this doc space
        redirect("/dashboard/docs");
    }

    if (!canManageDocSpace) {
        // User doesn't have permission to create new pages
        redirect(`/dashboard/docs/${spaceId}`);
    }

    // Get count of existing pages to determine order and check limits
    const { count, error } = await supabase
        .from("doc_pages")
        .select("*", { count: "exact", head: true })
        .eq("space_id", spaceId);

    // Define page limits: Solo = 5 pages, Team = 10 pages
    const pageLimit = isTeamSpace ? 10 : 5;

    // If space has reached page limit, show limit reached page
    if ((count || 0) >= pageLimit) {
        return (
            <DashboardShell>
                <DashboardHeader
                    heading="Page Limit Reached"
                    description={`This documentation space has reached the maximum number of pages (${pageLimit})`}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Page Limit</CardTitle>
                        <CardDescription>
                            {isTeamSpace
                                ? "Team documentation spaces can have up to 10 pages"
                                : "Personal documentation spaces can have up to 5 pages"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!isTeamSpace && (
                            <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800/50">
                                <div className="flex items-center">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Upgrade to Team</h3>
                                </div>
                                <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                                    Upgrade to a team account to create up to 10 pages per documentation space.
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

                        <Link href={`/dashboard/docs/${spaceId}`}>
                            <Button variant="outline" className="mt-2">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back to Documentation Space
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Create New Page"
                description={`Add a new page to ${docSpace.name}`}
            />

            <CreateDocPageForm
                spaceId={spaceId}
                spaceName={docSpace.name}
                pageOrder={count || 0}
                pageLimit={pageLimit}
                currentPages={count || 0}
            />
        </DashboardShell>
    );
}