import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, Edit } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DocContent } from "@/components/docs/doc-content";

interface DocPageViewProps {
    params: {
        spaceId: string;
        pageId: string;
    };
}

export default async function DocPageView({ params }: DocPageViewProps) {
    const { spaceId, pageId } = params;
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

    // Get the specific page
    const { data: page } = await supabase
        .from("doc_pages")
        .select("*")
        .eq("id", pageId)
        .eq("space_id", spaceId)
        .single();

    if (!page) {
        notFound();
    }

    const isTeamOwner = profile?.account_type === "team_member" && profile?.is_team_owner;
    const canManageDocSpace = isSpaceOwner || isTeamOwner;

    return (
        <DashboardShell>
            <div className="flex items-center justify-between">
                <div className="flex items-start gap-2">
                    <Link href={`/dashboard/docs/${spaceId}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Back to space</span>
                        </Button>
                    </Link>
                    <DashboardHeader
                        heading={page.title}
                        description={`${docSpace.name} › Documentation`}
                    />
                </div>

                {canManageDocSpace && (
                    <Link href={`/dashboard/docs/${spaceId}/pages/${pageId}/edit`}>
                        <Button variant="outline" size="sm">
                            <Edit className="mr-1 h-4 w-4" />
                            Edit Page
                        </Button>
                    </Link>
                )}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{page.title}</CardTitle>
                        <div className="text-xs text-muted-foreground">
                            {page.updated_at && page.updated_at !== page.created_at
                                ? `Updated ${formatDate(page.updated_at)}`
                                : `Created ${formatDate(page.created_at)}`}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DocContent content={page.content || ''} />
                </CardContent>
            </Card>
        </DashboardShell>
    );
}