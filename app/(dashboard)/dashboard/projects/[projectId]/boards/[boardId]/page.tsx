import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { KanbanBoard } from "@/components/projects/kanban/kanban-board";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit } from "lucide-react";

interface BoardDetailPageProps {
    params: {
        projectId: string;
        boardId: string;
    };
}

export default async function BoardDetailPage({ params }: BoardDetailPageProps) {
    const { projectId, boardId } = params;
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

    // Get project details
    const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

    // If project doesn't exist or user doesn't have access
    if (!project) {
        notFound();
    }

    // Check if user has access to this project
    const isProjectOwner = project.owner_id === session.user.id;
    const isTeamProject = project.team_id !== null;
    const isTeamMember = profile?.team_id === project.team_id;

    if (!isProjectOwner && !(isTeamProject && isTeamMember)) {
        // User doesn't have access to this project
        redirect("/dashboard/projects");
    }

    // Get board details
    const { data: board } = await supabase
        .from("boards")
        .select("*")
        .eq("id", boardId)
        .eq("project_id", projectId)
        .single();

    if (!board) {
        notFound();
    }

    // Get board columns with tasks
    const { data: columns } = await supabase
        .from("board_columns")
        .select(`
      *,
      board_items(*)
    `)
        .eq("board_id", boardId)
        .order("order", { ascending: true });

    // Format columns and items for the kanban board
    const formattedColumns = columns?.map((column) => ({
        id: column.id,
        name: column.name,
        order: column.order,
        items: column.board_items.sort((a: { order: number }, b: { order: number }) => a.order - b.order)
    })) || [];

    // Check if user can manage the board
    const isTeamOwner = profile?.account_type === "team_member" && profile?.is_team_owner;
    const canManageBoard = isProjectOwner || isTeamOwner;

    return (
        <DashboardShell>
            <div className="flex items-start gap-2">
                <Link href={`/dashboard/projects/${projectId}`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Back to project</span>
                    </Button>
                </Link>
                <DashboardHeader
                    heading={board.name}
                    description={`${project.name} › Board`}
                />
            </div>

            {canManageBoard && (
                <div className="flex justify-end mb-4">
                    <Link href={`/dashboard/projects/${projectId}/boards/${boardId}/edit`}>
                        <Button variant="outline" size="sm">
                            <Edit className="mr-1 h-4 w-4" />
                            Edit Board
                        </Button>
                    </Link>
                </div>
            )}

            <div className="w-full overflow-hidden">
                <KanbanBoard
                    columns={formattedColumns}
                    boardId={boardId}
                    canManageBoard={canManageBoard}
                    teamMembers={isTeamProject ? profile?.teams?.members : []}
                    currentUserId={session.user.id}
                />
            </div>
        </DashboardShell>
    );
}