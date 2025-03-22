"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TodoItem {
    id: string;
    content: string;
    is_completed: boolean;
    created_at: string;
    list_id: string;
    due_date: string | null;
    priority: "low" | "medium" | "high" | null;
}

interface EditTodoDialogProps {
    task: TodoItem;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (updatedTask: TodoItem) => void;
}

export function EditTodoDialog({
                                   task,
                                   open,
                                   onOpenChange,
                                   onUpdate
                               }: EditTodoDialogProps) {
    const [content, setContent] = useState(task.content);
    const [priority, setPriority] = useState<string>(task.priority || "");
    const [dueDate, setDueDate] = useState<Date | undefined>(
        task.due_date ? new Date(task.due_date) : undefined
    );
    const [isLoading, setIsLoading] = useState(false);

    const supabase = createClientComponentClient();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            toast({
                title: "Error",
                description: "Task content cannot be empty",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        const formattedDueDate = dueDate ? dueDate.toISOString() : null;

        // Create updated task object
        const updatedTask = {
            ...task,
            content: content.trim(),
            priority: priority === "none" ? null : priority as "low" | "medium" | "high" | null,
            due_date: formattedDueDate,
        };

        // Update task in database
        const { error } = await supabase
            .from("todo_items")
            .update({
                content: updatedTask.content,
                priority: updatedTask.priority,
                due_date: updatedTask.due_date,
            })
            .eq("id", task.id);

        setIsLoading(false);

        if (error) {
            toast({
                title: "Error",
                description: "Failed to update task. Please try again.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Task updated",
                description: "Your task has been updated successfully.",
            });

            // Notify parent component
            onUpdate(updatedTask);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                        <DialogDescription>
                            Make changes to your task here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="task-content">Task</Label>
                            <Input
                                id="task-content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={priority}
                                onValueChange={setPriority}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="priority">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="due-date">Due Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="due-date"
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !dueDate && "text-muted-foreground"
                                        )}
                                        disabled={isLoading}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dueDate ? format(dueDate, "PPP") : "No due date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={setDueDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {dueDate && (
                                <Button
                                    type="button"
                                    variant="link"
                                    className="px-0 text-xs"
                                    onClick={() => setDueDate(undefined)}
                                    disabled={isLoading}
                                >
                                    Clear due date
                                </Button>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
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