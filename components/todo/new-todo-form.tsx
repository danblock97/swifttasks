"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Plus } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface NewTodoFormProps {
    todoListId: string;
}

export function NewTodoForm({ todoListId }: NewTodoFormProps) {
    const [content, setContent] = useState("");
    const [priority, setPriority] = useState<string>("");
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const router = useRouter();
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

        setIsSubmitting(true);

        // Prepare due date if set
        const formattedDueDate = dueDate ? dueDate.toISOString() : null;

        // Insert new task
        const { error } = await supabase
            .from("todo_items")
            .insert({
                content: content.trim(),
                is_completed: false,
                list_id: todoListId,
                priority: priority === "none" ? null : priority || null,
                due_date: formattedDueDate,
            });

        setIsSubmitting(false);

        if (error) {
            toast({
                title: "Error",
                description: "Failed to create task. Please try again.",
                variant: "destructive",
            });
        } else {
            // Reset form
            setContent("");
            setPriority("");
            setDueDate(undefined);
            setShowDetails(false);

            toast({
                title: "Task created",
                description: "Your task has been added to the list.",
            });

            // Refresh page to show new task
            router.refresh();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Task</CardTitle>
                <CardDescription>
                    Create a new task for your todo list
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-start gap-2">
                        <Input
                            placeholder="Enter your task..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={isSubmitting}
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setShowDetails(!showDetails)}
                            disabled={isSubmitting}
                        >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Add details</span>
                        </Button>
                    </div>

                    {showDetails && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Select
                                    value={priority}
                                    onValueChange={setPriority}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger>
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

                            <div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !dueDate && "text-muted-foreground"
                                            )}
                                            disabled={isSubmitting}
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
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && (
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
                            Add Task
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}