"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";
import { useUserPreferences } from "@/hooks/use-preferences";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Edit,
    MoreHorizontal,
    Plus,
    Tag,
    Trash2,
    AlertCircle,
    Clock,
    CheckCircle2,
    User,
    Calendar,
    ArrowDownUp
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { CreateItemDialog } from "./create-item-dialog";
import { EditItemDialog } from "./edit-item-dialog";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { sortBoardItems } from "@/lib/task-sorting-utils";

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

interface Column {
    id: string;
    name: string;
    order: number;
    items: BoardItem[];
}

interface BoardListViewProps {
    columns: Column[];
    boardId: string;
    canManageBoard: boolean;
    teamMembers?: any[];
    currentUserId: string;
}

export function BoardListView({
                                  columns,
                                  boardId,
                                  canManageBoard,
                                  teamMembers = [],
                                  currentUserId,
                              }: BoardListViewProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<BoardItem | null>(null);
    const [assigneeDetails, setAssigneeDetails] = useState<Record<string, { name: string, initials: string }>>({});
    const [activeSortOrder, setActiveSortOrder] = useState<'priority' | 'due_date' | 'created_at'>('created_at');

    const supabase = createClientComponentClient();
    const { toast } = useToast();
    const { preferences } = useUserPreferences();

    // Set the initial sort order from user preferences
    useEffect(() => {
        if (preferences && preferences.tasksSortOrder) {
            setActiveSortOrder(preferences.tasksSortOrder);
        }
    }, [preferences]);

    // Flatten all items from all columns and apply sorting
    const allItems = columns.flatMap(column =>
        column.items.map(item => ({
            ...item,
            columnName: column.name,
        }))
    );

    // Apply sorting based on active sort order
    const sortedItems = sortBoardItems(allItems, activeSortOrder);

    const handleAddItem = (columnId: string) => {
        setSelectedColumnId(columnId);
        setCreateDialogOpen(true);
    };

    const handleEditItem = (item: BoardItem) => {
        // Ensure the item has all required BoardItem properties
        const completeItem: BoardItem = {
            ...item,
            priority: item.priority || null,
            due_date: item.due_date || null,
            estimated_hours: item.estimated_hours || null,
            labels: item.labels || []
        };
        setSelectedItem(completeItem);
        setEditDialogOpen(true);
    };

    const handleDeleteItem = async (itemId: string) => {
        // Delete from database
        const { error } = await supabase
            .from("board_items")
            .delete()
            .eq("id", itemId);

        if (error) {
            toast({
                title: "Error",
                description: "Failed to delete item. Please try again.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Item deleted",
                description: "The item has been deleted successfully."
            });

            // Refresh the page to show updated data
            window.location.reload();
        }
    };

    const handleItemCreated = (newItem: BoardItem) => {
        setCreateDialogOpen(false);
        setSelectedColumnId(null);

        // Refresh the page to show the new item
        window.location.reload();
    };

    const handleItemUpdated = (updatedItem: BoardItem) => {
        setEditDialogOpen(false);
        setSelectedItem(null);

        // Refresh the page to show the updated item
        window.location.reload();
    };

    // Get status badge color based on column name
    const getStatusColor = (columnName: string) => {
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

    // Get priority badge details
    const getPriorityDetails = (priority: string | null) => {
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

    // Find assigned user's name
    const getAssigneeName = (userId: string | null) => {
        if (!userId) return "Unassigned";
        if (userId === currentUserId) return "Me";

        const teamMember = teamMembers.find((member: any) => member.id === userId);
        return teamMember ? (teamMember.display_name || teamMember.email) : "Unknown";
    };

    // Get assignee initials
    const getAssigneeInitials = (userId: string | null) => {
        if (!userId) return "";
        if (userId === currentUserId) return "ME";

        const teamMember = teamMembers.find((member: any) => member.id === userId);
        if (!teamMember) return "??";

        const name = teamMember.display_name || teamMember.email;
        if (teamMember.display_name) {
            return teamMember.display_name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2);
        } else {
            return teamMember.email.substring(0, 2).toUpperCase();
        }
    };

    // Function to toggle/change sort order
    const changeSortOrder = (sortOrder: 'priority' | 'due_date' | 'created_at') => {
        setActiveSortOrder(sortOrder);
    };

    // Get display name for sort order
    const getSortOrderName = (sortOrder: string) => {
        switch(sortOrder) {
            case 'priority': return 'Priority';
            case 'due_date': return 'Due Date';
            case 'created_at': return 'Created Date';
            default: return 'Sort Order';
        }
    };

    return (
        <div className="board-list-view w-full space-y-4">
            <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="w-full table-fixed min-w-[800px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[25%]">Title</TableHead>
                                <TableHead className="w-[15%]">Status</TableHead>
                                <TableHead className="w-[15%]">Priority</TableHead>
                                <TableHead className="w-[12%]">Due Date</TableHead>
                                <TableHead className="w-[10%]">Assignee</TableHead>
                                <TableHead className="w-[15%]">Labels</TableHead>
                                <TableHead className="w-[8%] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                        No tasks found. Create your first task using the "Add Task" button.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedItems.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="max-w-[25%]">
                                            <div className="font-medium line-clamp-1">{item.title}</div>
                                            {item.description && (
                                                <div className="text-xs text-muted-foreground line-clamp-1">
                                                    {item.description}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn("text-xs whitespace-nowrap", getStatusColor(item.columnName))}>
                                                {item.columnName}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {item.priority ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge variant="outline" className={cn("text-xs", getPriorityDetails(item.priority)?.color)}>
                                                                {getPriorityDetails(item.priority)?.icon}
                                                                <span className="ml-1">{getPriorityDetails(item.priority)?.label}</span>
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Priority: {getPriorityDetails(item.priority)?.label}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {item.due_date ? (
                                                <div className="flex items-center gap-1 text-xs">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDate(item.due_date)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {item.assigned_to ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs">{getAssigneeName(item.assigned_to)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Unassigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {item.labels && item.labels.length > 0 ? (
                                                    item.labels.slice(0, 2).map((label: string, index: number) => (
                                                        <Badge key={index} variant="secondary" className="text-xs py-0 px-1.5 bg-primary/10 text-primary">
                                                            <Tag className="h-2.5 w-2.5 mr-1" />
                                                            {label}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                                {item.labels && item.labels.length > 2 && (
                                                    <Badge variant="secondary" className="text-xs py-0 px-1.5 bg-primary/10 text-primary">
                                                        +{item.labels.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    {canManageBoard && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteItem(item.id)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {selectedColumnId && (
                <CreateItemDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    columnId={selectedColumnId}
                    boardId={boardId}
                    onItemCreated={handleItemCreated}
                    teamMembers={teamMembers}
                    currentUserId={currentUserId}
                />
            )}

            {selectedItem && (
                <EditItemDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    item={selectedItem}
                    columns={columns}
                    onItemUpdated={handleItemUpdated}
                    teamMembers={teamMembers}
                    currentUserId={currentUserId}
                />
            )}
        </div>
    );
}