import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CreateDocPageForm } from "@/components/docs/create-doc-page-form";

interface CreateDocPageProps {
    params: {
        spaceId: string;
    };
}

export default async function CreateDocPage({ params }: CreateDocPageProps) {
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
    const { count } = await supabase
        .from("doc_pages")
        .select("*", { count: "exact", head: true })
        .eq("space_id", spaceId);

    // Define page limits: Solo = 5 pages, Team = 10 pages
    const pageLimit = isTeamSpace ? 10 : 5;

    // If space has reached page limit, redirect back to space
    if ((count || 0) >= pageLimit) {
        redirect(`/dashboard/docs/${spaceId}`);
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