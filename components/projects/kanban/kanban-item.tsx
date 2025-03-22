"use client";

import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Edit,
    Trash2,
    User,
    Clock,
    Calendar,
    Tag,
    AlertCircle,
    CheckCircle2,
    CircleDashed
} from "lucide-react";
import { truncateText, formatDate } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BoardItem {
    id: string;
    title: string;
    description: string | null;
    order: number;
    column_id: string;
    created_at: string;
    assigned_to: string | null;
    priority: "low" | "medium" | "high" | null;
    due_date: string | null;
    estimated_hours: number | null;
    labels: string[] | null;
}

interface KanbanItemProps {
    item: BoardItem;
    onEdit: () => void;
    onDelete: () => void;
    canManageBoard: boolean;
}

export function KanbanItem({ item, onEdit, onDelete, canManageBoard }: KanbanItemProps) {
    const {
        title,
        description,
        assigned_to,
        priority,
        due_date,
        estimated_hours,
        labels
    } = item;

    const [assigneeInitials, setAssigneeInitials] = useState("");
    const [assigneeName, setAssigneeName] = useState("");
    const supabase = createClientComponentClient();

    useEffect(() => {
        const getAssigneeDetails = async () => {
            if (!assigned_to) return;

            const { data: user } = await supabase
                .from('users')
                .select('display_name, email')
                .eq('id', assigned_to)
                .single();

            if (user) {
                setAssigneeName(user.display_name || user.email);

                // Get initials from display_name or email
                if (user.display_name) {
                    const initials = user.display_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2);
                    setAssigneeInitials(initials);
                } else if (user.email) {
                    setAssigneeInitials(user.email.substring(0, 2).toUpperCase());
                }
            }
        };

        getAssigneeDetails();
    }, [assigned_to, supabase]);

    // Get priority details
    const getPriorityDetails = () => {
        switch (priority) {
            case 'high':
                return {
                    icon: <AlertCircle className="h-3 w-3" />,
                    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
                    label: 'High'
                };
            case 'medium':
                return {
                    icon: <Clock className="h-3 w-3" />,
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
                    label: 'Medium'
                };
            case 'low':
                return {
                    icon: <CheckCircle2 className="h-3 w-3" />,
                    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
                    label: 'Low'
                };
            default:
                return null;
        }
    };



    const priorityDetails = getPriorityDetails();

    return (
        <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-3">
                <div className="flex justify-between items-start gap-2">
                    <h4 className="font-medium text-sm">{title}</h4>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                                <MoreHorizontal className="h-3 w-3" />
                                <span className="sr-only">Actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 bg-background border shadow-md">
                            <DropdownMenuItem onClick={onEdit}>
                                <Edit className="mr-2 h-3.5 w-3.5" />
                                Edit
                            </DropdownMenuItem>
                            {canManageBoard && (
                                <DropdownMenuItem
                                    onClick={onDelete}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {description && (
                    <p className="text-xs text-muted-foreground mt-1 mb-2">
                        {truncateText(description, 100)}
                    </p>
                )}

                {/* Priority badge */}
                {priorityDetails && (
                    <div className="flex flex-wrap gap-1 mt-2 mb-1">
                        <Badge variant="outline" className={cn("text-xs flex items-center gap-1 py-0 px-1.5", priorityDetails.color)}>
                            {priorityDetails.icon}
                            <span>{priorityDetails.label}</span>
                        </Badge>
                    </div>
                )}

                {/* Due date and estimated time */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 mb-1 text-xs text-muted-foreground">
                    {due_date && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(due_date)}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Due Date</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {estimated_hours !== null && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{estimated_hours} {estimated_hours === 1 ? 'hour' : 'hours'}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Estimated Time</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                {/* Labels */}
                {labels && labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {labels.slice(0, 3).map((label, index) => (
                            <Badge key={index} variant="secondary" className="text-xs py-0 px-1.5 bg-primary/10 text-primary">
                                <Tag className="h-2.5 w-2.5 mr-1" />
                                {label}
                            </Badge>
                        ))}
                        {labels.length > 3 && (
                            <Badge variant="secondary" className="text-xs py-0 px-1.5 bg-primary/10 text-primary">
                                +{labels.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>

            {assigned_to && (
                <CardFooter className="p-3 pt-0 flex justify-between items-center">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs flex items-center gap-1 py-0.5">
                                    <User className="h-3 w-3" />
                                    <span>Assigned</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Assigned to {assigneeName}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {assigneeInitials || "?"}
                        </AvatarFallback>
                    </Avatar>
                </CardFooter>
            )}
        </Card>
    );
}