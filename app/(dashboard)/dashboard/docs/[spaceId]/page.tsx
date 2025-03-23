import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit, Plus, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DocPages } from "@/components/docs/doc-pages";

interface DocSpacePageProps {
    params: {
        spaceId: string;
    };
}

export default async function DocSpacePage({ params }: DocSpacePageProps) {
    const { spaceId } = params;
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

    // Check if user has access to this doc space
    const isSpaceOwner = docSpace.owner_id === session.user.id;
    const isTeamSpace = docSpace.team_id !== null;
    const isTeamMember = profile?.team_id === docSpace.team_id;

    if (!isSpaceOwner && !(isTeamSpace && isTeamMember)) {
        // User doesn't have access to this doc space
        redirect("/dashboard/docs");
    }

    // Get doc pages for this space
    const { data: docPages } = await supabase
        .from("doc_pages")
        .select("*")
        .eq("space_id", spaceId)
        .order("order", { ascending: true });

    const isTeamOwner = profile?.account_type === "team_member" && profile?.is_team_owner;

    // Split permissions:
    // 1. canEditSpace: only owners can edit space details
    const canEditSpace = isSpaceOwner || isTeamOwner;

    // 2. canManageDocPages: all team members can create/edit pages
    const canManageDocPages = isSpaceOwner || isTeamOwner || (isTeamSpace && isTeamMember);

    // 3. canDeletePages: only owners can delete pages
    const canDeletePages = isSpaceOwner || isTeamOwner;

    // Check if user has reached page limit
    const pageLimit = isTeamSpace ? 10 : 5; // Team = 10 pages, Solo = 5 pages
    const hasReachedPageLimit = (docPages?.length || 0) >= pageLimit;

    return (
        <DashboardShell>
            <div className="flex items-start gap-2">
                <Link href="/dashboard/docs">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Back to documentation</span>
                    </Button>
                </Link>
                <DashboardHeader
                    heading={docSpace.name}
                    description={`Created on ${formatDate(docSpace.created_at)}`}
                >
                    <div className="flex gap-2">
                        {canEditSpace && (
                            <Link href={`/dashboard/docs/${spaceId}/edit`}>
                                <Button variant="outline" size="sm">
                                    <Edit className="mr-1 h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                        )}

                        {canManageDocPages && !hasReachedPageLimit && (
                            <Link href={`/dashboard/docs/${spaceId}/pages/create`}>
                                <Button size="sm">
                                    <Plus className="mr-1 h-4 w-4" />
                                    New Page
                                </Button>
                            </Link>
                        )}
                    </div>
                </DashboardHeader>
            </div>

            <div className="grid gap-4">
                <div className="flex items-center gap-2">
                    {docSpace.team_id && (
                        <Badge variant="outline" className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>Team Documentation</span>
                        </Badge>
                    )}

                    <Badge variant="outline" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{docPages?.length || 0} / {pageLimit} pages</span>
                    </Badge>
                </div>

                <div className="mt-2">
                    <h2 className="text-lg font-medium flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Pages
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Documentation pages for this space
                    </p>

                    <DocPages
                        pages={docPages || []}
                        spaceId={spaceId}
                        canManageDocSpace={canManageDocPages}
                        isTeamSpace={isTeamSpace}
                        canDeletePages={canDeletePages}
                    />
                </div>
            </div>
        </DashboardShell>
    );
}