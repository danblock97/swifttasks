"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { generateUUID } from "@/lib/utils";

interface Column {
    id: string;
    name: string;
    order: number;
    board_id: string;
}

interface CreateColumnDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    boardId: string;
    onColumnCreated: (column: Column) => void;
    currentColumnsCount: number;
}

export function CreateColumnDialog({
                                       open,
                                       onOpenChange,
                                       boardId,
                                       onColumnCreated,
                                       currentColumnsCount,
                                   }: CreateColumnDialogProps) {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const supabase = createClientComponentClient();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Column name is required",
                variant: "destructive",
            });
            return;
        }

        if (currentColumnsCount >= 7) {
            toast({
                title: "Error",
                description: "Maximum of 7 columns allowed per board",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Generate column ID
            const columnId = generateUUID();

            // Create new column
            const { error } = await supabase
                .from("board_columns")
                .insert({
                    id: columnId,
                    name: name.trim(),
                    order: currentColumnsCount,
                    board_id: boardId,
                });

            if (error) throw error;

            // Get the created column
            const { data: createdColumn, error: fetchError } = await supabase
                .from("board_columns")
                .select("*")
                .eq("id", columnId)
                .single();

            if (fetchError) throw fetchError;

            toast({
                title: "Column created",
                description: "Your new column has been added to the board.",
            });

            onColumnCreated(createdColumn);

            // Reset form
            setName("");
        } catch (error: any) {
            console.error("Error creating column:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create column. Please try again.",
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
                        <DialogTitle>Add New Column</DialogTitle>
                        <DialogDescription>
                            Create a new column for your Kanban board.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="column-name">Column Name</Label>
                            <Input
                                id="column-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter column name (e.g., To Do, In Progress)"
                                disabled={isLoading}
                                autoFocus
                            />
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
                            Create Column
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}