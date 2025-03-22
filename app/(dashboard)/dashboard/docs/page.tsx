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

    // Get documentation spaces (either personal or team)
    const { data: docSpaces } = await supabase
        .from("doc_spaces")
        .select("*")
        .or(`owner_id.eq.${session.user.id},team_id.eq.${profile?.team_id || 'null'}`)
        .order("created_at", { ascending: false });

    const isTeamOwner = profile?.account_type === "team_member" && profile?.is_team_owner;
    const canCreateDocSpace = !profile?.account_type || profile?.account_type === "single" || isTeamOwner;

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Documentation"
                description="Create, manage, and share documentation for your projects."
            >
                {canCreateDocSpace && (
                    <Link href="/dashboard/docs/create">
                        <Button size="sm" className="ml-auto">
                            <Plus className="mr-1 h-4 w-4" />
                            New Documentation Space
                        </Button>
                    </Link>
                )}
            </DashboardHeader>

            {docSpaces && docSpaces.length > 0 ? (
                <DocSpaces
                    spaces={docSpaces}
                    isTeamMember={profile?.account_type === "team_member"}
                    isTeamOwner={isTeamOwner}
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