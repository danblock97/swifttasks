"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import {
    Clock,
    MoreVertical,
    Kanban,
    Plus,
    Edit,
    Trash2,
    ExternalLink,
    Layout
} from "lucide-react";

interface Board {
    id: string;
    name: string;
    created_at: string;
    project_id: string;
}

interface ProjectKanbanBoardsProps {
    boards: Board[];
    projectId: string;
    canManageProject: boolean;
}

export function ProjectKanbanBoards({
                                        boards,
                                        projectId,
                                        canManageProject
                                    }: ProjectKanbanBoardsProps) {
    const [boardsList, setBoardsList] = useState<Board[]>(boards);
    const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const supabase = createClientComponentClient();
    const router = useRouter();
    const { toast } = useToast();

    const handleDeleteBoard = (board: Board) => {
        if (!canManageProject) {
            toast({
                title: "Permission Denied",
                description: "You don't have permission to delete boards",
                variant: "destructive",
            });
            return;
        }

        setSelectedBoard(board);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteBoard = async () => {
        if (!selectedBoard) return;

        // Optimistic update
        setBoardsList((prevBoards) =>
            prevBoards.filter((b) => b.id !== selectedBoard.id)
        );

        // Delete board columns and items
        const { error: columnsError } = await supabase
            .from("board_columns")
            .delete()
            .eq("board_id", selectedBoard.id);

        if (columnsError) {
            console.error("Error deleting columns:", columnsError);
        }

        // Delete the board
        const { error } = await supabase
            .from("boards")
            .delete()
            .eq("id", selectedBoard.id);

        if (error) {
            toast({
                title: "Error",
                description: "Failed to delete board. Please try again.",
                variant: "destructive",
            });
            // Reload the page to restore state
            router.refresh();
        } else {
            toast({
                title: "Board deleted",
                description: "The board has been deleted successfully."
            });
        }

        setIsDeleteDialogOpen(false);
        setSelectedBoard(null);
    };

    return (
        <div className="grid gap-6">
            {boardsList.length === 0 ? (
                <Card>
                    <CardContent className="flex h-[200px] flex-col items-center justify-center space-y-4 py-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Kanban className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-center font-medium">No boards yet</h3>
                        <p className="text-center text-sm text-muted-foreground">
                            Create a kanban board to start organizing tasks
                        </p>
                        {canManageProject && (
                            <Link href={`/dashboard/projects/${projectId}/boards/create`}>
                                <Button size="sm">
                                    <Plus className="mr-1 h-4 w-4" />
                                    Create Board
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {boardsList.map((board) => (
                        <Card key={board.id} className="flex flex-col">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        {board.name}
                                    </CardTitle>
                                    {canManageProject && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <MoreVertical className="h-4 w-4" />
                                                    <span className="sr-only">Menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/projects/${projectId}/boards/${board.id}`}>
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        View Board
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/projects/${projectId}/boards/${board.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Board
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDeleteBoard(board)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Board
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="py-2">
                                <div className="flex h-24 items-center justify-center rounded-md border-2 border-dashed border-primary/20">
                                    <Layout className="h-8 w-8 text-primary/40" />
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 mt-auto">
                                <Link
                                    href={`/dashboard/projects/${projectId}/boards/${board.id}`}
                                    className="w-full"
                                >
                                    <Button variant="outline" className="w-full">
                                        <Kanban className="mr-2 h-4 w-4" />
                                        Open Board
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}

                    {canManageProject && boardsList.length < 2 && (
                        <Card className="flex flex-col border-dashed">
                            <CardContent className="flex h-full flex-col items-center justify-center p-6">
                                <div className="mb-4 rounded-full bg-primary/10 p-3">
                                    <Plus className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-center font-medium">Create a new board</h3>
                                <p className="mt-2 text-center text-sm text-muted-foreground">
                                    Add another kanban board to organize different aspects of your project
                                </p>
                                <Link href={`/dashboard/projects/${projectId}/boards/create`} className="mt-4 w-full">
                                    <Button variant="outline" className="w-full">Create Board</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Delete confirmation dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Board</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this board? This will delete all columns,
                            tasks, and associated data. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDeleteBoard}
                        >
                            Delete
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}