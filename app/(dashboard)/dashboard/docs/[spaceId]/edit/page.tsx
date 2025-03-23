import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EditDocSpaceForm } from "@/components/docs/edit-doc-space-form";

interface EditDocSpacePageProps {
    params: Promise<{
        spaceId: string;
    }>;
}

export default async function EditDocSpacePage({ params }: EditDocSpacePageProps) {
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

    // Only space owners and team owners can edit space details
    const canManageDocSpace = isSpaceOwner || isTeamOwner;

    if (!isSpaceOwner && !(isTeamSpace && isTeamMember)) {
        // User doesn't have access to this doc space
        redirect("/dashboard/docs");
    }

    if (!canManageDocSpace) {
        // User doesn't have permission to edit
        redirect(`/dashboard/docs/${spaceId}`);
    }

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Edit Documentation Space"
                description="Update the details of your documentation space"
            />

            <EditDocSpaceForm
                space={docSpace}
            />
        </DashboardShell>
    );
}