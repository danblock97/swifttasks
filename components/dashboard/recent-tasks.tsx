"use client";

import { cn, formatDate } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface Task {
    id: string;
    content: string;
    is_completed: boolean;
    created_at: string;
    list_id: string;
    due_date: string | null;
    priority: "low" | "medium" | "high" | null;
    todo_lists: {
        title: string;
    };
}

interface RecentTasksProps extends React.HTMLAttributes<HTMLDivElement> {
    tasks: Task[];
}

export function RecentTasks({ tasks, className, ...props }: RecentTasksProps) {
    const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(
        Object.fromEntries(tasks.map((task) => [task.id, task.is_completed]))
    );
    const supabase = createClientComponentClient();
    const router = useRouter();

    const handleToggleComplete = async (taskId: string) => {
        const newState = !completedTasks[taskId];

        // Optimistic update
        setCompletedTasks((prev) => ({
            ...prev,
            [taskId]: newState,
        }));

        // Update in database
        await supabase
            .from("todo_items")
            .update({ is_completed: newState })
            .eq("id", taskId);

        router.refresh();
    };

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
        <Card className={cn("", className)} {...props}>
            <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>
                    Your most recent tasks and their status.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {tasks.length === 0 ? (
                    <div className="flex h-[150px] items-center justify-center rounded-md border border-dashed">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                You don&apos;t have any tasks yet.
                            </p>
                            <Link
                                href="/dashboard/todo"
                                className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                            >
                                Create your first task
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tasks.map((task) => {
                            const priorityDetails = getPriorityDetails(task.priority);

                            return (
                                <div
                                    key={task.id}
                                    className="flex items-start justify-between space-x-4 rounded-md border p-4"
                                >
                                    <div className="flex items-start space-x-4">
                                        <Checkbox
                                            id={`task-${task.id}`}
                                            checked={completedTasks[task.id]}
                                            onCheckedChange={() => handleToggleComplete(task.id)}
                                        />
                                        <div>
                                            <label
                                                htmlFor={`task-${task.id}`}
                                                className={cn(
                                                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                                    completedTasks[task.id] && "line-through text-muted-foreground"
                                                )}
                                            >
                                                {task.content}
                                            </label>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                From <span className="font-medium">{task.todo_lists.title}</span>
                                                {task.due_date && (
                                                    <> · Due {formatDate(task.due_date)}</>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    {task.priority && (
                                        <Badge variant="outline" className={cn("flex items-center gap-1", priorityDetails.color)}>
                                            {priorityDetails.icon}
                                            <span>{priorityDetails.label}</span>
                                        </Badge>
                                    )}
                                </div>
                            );
                        })}
                        <div className="text-center">
                            <Link
                                href="/dashboard/todo"
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                View all tasks
                            </Link>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}