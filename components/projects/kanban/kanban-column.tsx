"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { KanbanItem } from "./kanban-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MoreHorizontal, GripHorizontal, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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

interface BoardItem {
    id: string;
    title: string;
    description: string | null;
    order: number;
    column_id: string;
    created_at: string;
    assigned_to: string | null;
}

interface Column {
    id: string;
    name: string;
    order: number;
    items: BoardItem[];
}

interface KanbanColumnProps {
    column: Column;
    onAddItem: () => void;
    onEditItem: (item: BoardItem) => void;
    onDeleteItem: (itemId: string) => void;
    canManageBoard: boolean;
    isUpdating: boolean;
    dragHandleProps: any;
    boardId: string;
    onColumnUpdated: () => void;
}

export function KanbanColumn({
                                 column,
                                 onAddItem,
                                 onEditItem,
                                 onDeleteItem,
                                 canManageBoard,
                                 isUpdating,
                                 dragHandleProps,
                                 boardId,
                                 onColumnUpdated
                             }: KanbanColumnProps) {
    const { id, name, items } = column;
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [newColumnName, setNewColumnName] = useState(name);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    const getColumnColor = (columnName: string) => {
        const lowerName = columnName.toLowerCase();

        if (lowerName.includes("done") || lowerName.includes("complete")) {
            return "bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400";
        }

        if (lowerName.includes("progress") || lowerName.includes("doing")) {
            return "bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400";
        }

        if (lowerName.includes("todo") || lowerName.includes("backlog")) {
            return "bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800/40 dark:border-gray-700 dark:text-gray-300";
        }

        if (lowerName.includes("review") || lowerName.includes("testing")) {
            return "bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400";
        }

        if (lowerName.includes("blocked") || lowerName.includes("hold")) {
            return "bg-red-100 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400";
        }

        // Default color
        return "bg-primary/10 border-primary/20 text-primary";
    };

    const columnColor = getColumnColor(name);

    const handleEditColumn = async () => {
        if (!newColumnName.trim()) {
            toast({
                title: "Error",
                description: "Column name cannot be empty",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase
                .from("board_columns")
                .update({ name: newColumnName.trim() })
                .eq("id", id);

            if (error) throw error;

            toast({
                title: "Column updated",
                description: "Column name has been updated successfully",
            });

            setIsEditDialogOpen(false);
            onColumnUpdated();
        } catch (error: any) {
            console.error("Error updating column:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update column. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteColumn = async () => {
        // Prevent deletion if column has items
        if (items.length > 0) {
            toast({
                title: "Cannot delete column",
                description: "This column contains tasks. Please move or delete them first.",
                variant: "destructive",
            });
            setIsDeleteDialogOpen(false);
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase
                .from("board_columns")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast({
                title: "Column deleted",
                description: "Column has been deleted successfully",
            });

            setIsDeleteDialogOpen(false);
            onColumnUpdated();
        } catch (error: any) {
            console.error("Error deleting column:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to delete column. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="kanban-column flex flex-col h-full w-full">
            <div className={cn("rounded-t-md border p-2 flex items-center justify-between", columnColor)}>
                <div className="flex items-center gap-2">
                    <div {...dragHandleProps} className="cursor-grab">
                        <GripHorizontal className="h-4 w-4 opacity-50" />
                    </div>
                    <h3 className="font-medium text-sm">
                        {name}
                    </h3>
                    <Badge className={cn("bg-white text-xs", columnColor)}>{items.length}</Badge>
                </div>
                {canManageBoard && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Column Options</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border shadow-md">
                            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Column
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Column
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <Droppable droppableId={id} type="task">
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                            "flex-1 min-h-[300px] max-h-[calc(100vh-250px)] overflow-y-auto rounded-b-md border border-t-0 p-2",
                            snapshot.isDraggingOver ? "bg-primary/5" : "bg-card"
                        )}
                    >
                        {items.map((item, index) => (
                            <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                                isDragDisabled={isUpdating}
                            >
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                            ...provided.draggableProps.style,
                                            opacity: snapshot.isDragging ? "0.8" : "1",
                                        }}
                                        className="mb-2 last:mb-0"
                                    >
                                        <KanbanItem
                                            item={item}
                                            onEdit={() => onEditItem(item)}
                                            onDelete={() => onDeleteItem(item.id)}
                                            canManageBoard={canManageBoard}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}

                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2 text-muted-foreground"
                            onClick={onAddItem}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Task
                        </Button>
                    </div>
                )}
            </Droppable>

            {/* Edit Column Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-background border shadow-md">
                    <DialogHeader>
                        <DialogTitle>Edit Column</DialogTitle>
                        <DialogDescription>
                            Change the name of this column.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Input
                                id="column-name"
                                value={newColumnName}
                                onChange={(e) => setNewColumnName(e.target.value)}
                                placeholder="Enter column name"
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleEditColumn}
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Column Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-background border shadow-md">
                    <DialogHeader>
                        <DialogTitle>Delete Column</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this column?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {items.length > 0 && (
                            <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-800/50 mb-4">
                                <p className="text-amber-800 dark:text-amber-300 text-sm">
                                    This column contains {items.length} task(s).
                                    Please move or delete them before deleting the column.
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteColumn}
                            disabled={isLoading || items.length > 0}
                        >
                            {isLoading ? "Deleting..." : "Delete Column"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}