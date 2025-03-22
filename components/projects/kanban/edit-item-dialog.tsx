"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

interface EditItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: BoardItem;
    columns: Column[];
    onItemUpdated: (item: BoardItem) => void;
    teamMembers?: any[];
    currentUserId: string;
}

export function EditItemDialog({
                                   open,
                                   onOpenChange,
                                   item,
                                   columns,
                                   onItemUpdated,
                                   teamMembers = [],
                                   currentUserId,
                               }: EditItemDialogProps) {
    const [title, setTitle] = useState(item.title);
    const [description, setDescription] = useState(item.description || "");
    const [columnId, setColumnId] = useState(item.column_id);
    const [assignedTo, setAssignedTo] = useState<string | undefined>(
        item.assigned_to || "unassigned"
    );
    const [isLoading, setIsLoading] = useState(false);

    const supabase = createClientComponentClient();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast({
                title: "Error",
                description: "Task title is required",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const updatedData: Partial<BoardItem> = {
                title: title.trim(),
                description: description.trim() || null,
                assigned_to: assignedTo === "unassigned" ? null : assignedTo || null,
            };

            // If column changed, update column_id and recalculate order
            if (columnId !== item.column_id) {
                updatedData.column_id = columnId;

                // Get count of items in the new column for order
                const { count } = await supabase
                    .from("board_items")
                    .select("*", { count: "exact", head: true })
                    .eq("column_id", columnId);

                updatedData.order = count || 0;
            }

            // Update item in database
            const { error } = await supabase
                .from("board_items")
                .update(updatedData)
                .eq("id", item.id);

            if (error) throw error;

            // Get the updated item
            const { data: updatedItem, error: fetchError } = await supabase
                .from("board_items")
                .select("*")
                .eq("id", item.id)
                .single();

            if (fetchError) throw fetchError;

            toast({
                title: "Task updated",
                description: "Your task has been updated successfully.",
            });

            onItemUpdated(updatedItem);
        } catch (error: any) {
            console.error("Error updating item:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update task. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-background border shadow-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                        <DialogDescription>
                            Make changes to your task here.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                                rows={3}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-column">Status</Label>
                            <Select
                                value={columnId}
                                onValueChange={setColumnId}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="edit-column">
                                    <SelectValue placeholder="Select column" />
                                </SelectTrigger>
                                <SelectContent>
                                    {columns.map((column) => (
                                        <SelectItem key={column.id} value={column.id}>
                                            {column.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-assigned-to">Assign To</Label>
                            <Select
                                value={assignedTo}
                                onValueChange={setAssignedTo}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="edit-assigned-to">
                                    <SelectValue placeholder="Select a person" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    <SelectItem value={currentUserId}>Me</SelectItem>
                                    {teamMembers.map((member: any) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.display_name || member.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && (
                                <svg
                                    className="mr-2 h-4 w-4 animate-spin"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                            )}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}