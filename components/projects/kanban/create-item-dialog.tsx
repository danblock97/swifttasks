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
import { generateUUID } from "@/lib/utils";

interface BoardItem {
    id: string;
    title: string;
    description: string | null;
    order: number;
    column_id: string;
    created_at: string;
    assigned_to: string | null;
}

interface CreateItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    columnId: string;
    boardId: string;
    onItemCreated: (item: BoardItem) => void;
    teamMembers?: any[];
    currentUserId: string;
}

export function CreateItemDialog({
                                     open,
                                     onOpenChange,
                                     columnId,
                                     boardId,
                                     onItemCreated,
                                     teamMembers = [],
                                     currentUserId,
                                 }: CreateItemDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);
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
            // Count existing items to determine order
            const { count } = await supabase
                .from("board_items")
                .select("*", { count: "exact", head: true })
                .eq("column_id", columnId);

            const newItemOrder = count || 0;

            // Generate item ID
            const itemId = generateUUID();

            // Create new item
            const { error } = await supabase
                .from("board_items")
                .insert({
                    id: itemId,
                    title: title.trim(),
                    description: description.trim() || null,
                    order: newItemOrder,
                    column_id: columnId,
                    assigned_to: assignedTo || null,
                });

            if (error) throw error;

            // Get the created item
            const { data: createdItem, error: fetchError } = await supabase
                .from("board_items")
                .select("*")
                .eq("id", itemId)
                .single();

            if (fetchError) throw fetchError;

            toast({
                title: "Task created",
                description: "Your task has been added to the board.",
            });

            onItemCreated(createdItem);

            // Reset form
            setTitle("");
            setDescription("");
            setAssignedTo(undefined);
        } catch (error: any) {
            console.error("Error creating item:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create task. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                            Add a new task to your kanban board.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter task title"
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the task (optional)"
                                disabled={isLoading}
                                rows={3}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="assigned-to">Assign To</Label>
                            <Select
                                value={assignedTo}
                                onValueChange={setAssignedTo}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="assigned-to">
                                    <SelectValue placeholder="Select a person" />
                                </SelectTrigger>
                                <SelectContent>
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
                            Create Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}