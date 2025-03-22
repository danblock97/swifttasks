"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { AlertCircle, Clock, CheckCircle2, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EditTodoDialog } from "@/components/todo/edit-todo-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface TodoItem {
    id: string;
    content: string;
    is_completed: boolean;
    created_at: string;
    list_id: string;
    due_date: string | null;
    priority: "low" | "medium" | "high" | null;
}

interface TodoListProps {
    todoItems: TodoItem[];
}

export function TodoList({ todoItems }: TodoListProps) {
    const [tasks, setTasks] = useState<TodoItem[]>(todoItems);
    const [filter, setFilter] = useState<string>("all");
    const [selectedTask, setSelectedTask] = useState<TodoItem | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const supabase = createClientComponentClient();
    const router = useRouter();
    const { toast } = useToast();

    const handleToggleComplete = async (taskId: string) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        const newState = !task.is_completed;

        // Optimistic update
        setTasks((prevTasks) =>
            prevTasks.map((t) =>
                t.id === taskId ? { ...t, is_completed: newState } : t
            )
        );

        // Update in database
        const { error } = await supabase
            .from("todo_items")
            .update({ is_completed: newState })
            .eq("id", taskId);

        if (error) {
            toast({
                title: "Error",
                description: "Failed to update task. Please try again.",
                variant: "destructive",
            });
            // Revert optimistic update
            setTasks((prevTasks) =>
                prevTasks.map((t) =>
                    t.id === taskId ? { ...t, is_completed: !newState } : t
                )
            );
        } else {
            router.refresh();
        }
    };

    useEffect(() => {
        // Update the tasks state when the todoItems prop changes
        setTasks(todoItems);
    }, [todoItems]);

    const handleEditTask = (task: TodoItem) => {
        setSelectedTask(task);
        setIsEditDialogOpen(true);
    };

    const handleDeleteTask = (task: TodoItem) => {
        setSelectedTask(task);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteTask = async () => {
        if (!selectedTask) return;

        // Optimistic update
        setTasks((prevTasks) => prevTasks.filter((t) => t.id !== selectedTask.id));

        // Delete from database
        const { error } = await supabase
            .from("todo_items")
            .delete()
            .eq("id", selectedTask.id);

        if (error) {
            toast({
                title: "Error",
                description: "Failed to delete task. Please try again.",
                variant: "destructive",
            });
            // Reload the page to restore state
            router.refresh();
        } else {
            toast({
                title: "Task deleted",
                description: "The task has been deleted successfully."
            });
        }

        setIsDeleteDialogOpen(false);
        setSelectedTask(null);
    };

    const handleUpdateTask = (updatedTask: TodoItem) => {
        setTasks((prevTasks) =>
            prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        );
        setIsEditDialogOpen(false);
        setSelectedTask(null);
    };

    // Filter tasks based on selection
    const filteredTasks = tasks.filter((task) => {
        switch (filter) {
            case "completed":
                return task.is_completed;
            case "active":
                return !task.is_completed;
            case "high":
                return task.priority === "high";
            case "medium":
                return task.priority === "medium";
            case "low":
                return task.priority === "low";
            default:
                return true;
        }
    });

    // Get priority icon and color
    const getPriorityDetails = (priority: string | null) => {
        switch(priority) {
            case 'high':
                return {
                    icon: <AlertCircle className="h-4 w-4" />,
                    color: 'text-red-500',
                    label: 'High'
                };
            case 'medium':
                return {
                    icon: <Clock className="h-4 w-4" />,
                    color: 'text-yellow-500',
                    label: 'Medium'
                };
            case 'low':
                return {
                    icon: <CheckCircle2 className="h-4 w-4" />,
                    color: 'text-green-500',
                    label: 'Low'
                };
            default:
                return {
                    icon: null,
                    color: '',
                    label: 'None'
                };
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>My Tasks</CardTitle>
                    <CardDescription>Manage and track your tasks</CardDescription>
                </div>
                <div className="w-32">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {filteredTasks.length === 0 ? (
                    <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
                        <p className="text-sm text-muted-foreground">
                            {tasks.length === 0
                                ? "You don't have any tasks yet."
                                : "No tasks match the current filter."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTasks.map((task) => {
                            const priorityDetails = getPriorityDetails(task.priority);

                            return (
                                <div
                                    key={task.id}
                                    className="flex items-start justify-between rounded-md border p-4"
                                >
                                    <div className="flex flex-1 items-start space-x-4">
                                        <Checkbox
                                            id={`todo-item-${task.id}`}
                                            checked={task.is_completed}
                                            onCheckedChange={() => handleToggleComplete(task.id)}
                                        />
                                        <div className="flex-1">
                                            <label
                                                htmlFor={`todo-item-${task.id}`}
                                                className={cn(
                                                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                                    task.is_completed && "line-through text-muted-foreground"
                                                )}
                                            >
                                                {task.content}
                                            </label>
                                            {(task.due_date || task.priority) && (
                                                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                                    {task.due_date && (
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{formatDate(task.due_date)}</span>
                                                        </div>
                                                    )}
                                                    {task.priority && (
                                                        <Badge variant="outline" className={cn("flex items-center gap-1", priorityDetails.color)}>
                                                            {priorityDetails.icon}
                                                            <span>{priorityDetails.label}</span>
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEditTask(task)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Edit Task</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteTask(task)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Delete Task</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>

            {/* Edit task dialog */}
            {selectedTask && (
                <EditTodoDialog
                    task={selectedTask}
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    onUpdate={handleUpdateTask}
                />
            )}

            {/* Delete confirmation dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this task? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDeleteTask}
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
        </Card>
    );
}