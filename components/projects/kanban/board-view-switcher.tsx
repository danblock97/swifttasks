"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/projects/kanban/kanban-board";
import { BoardListView } from "@/components/projects/kanban/board-list-view";
import { List, Kanban, ArrowDownUp, Edit, Plus } from "lucide-react";
import { useUserPreferences } from "@/hooks/use-preferences";
import { sortBoardItems } from "@/lib/task-sorting-utils";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface BoardViewSwitcherProps {
    columns: Column[];
    boardId: string;
    canManageBoard: boolean;
    teamMembers?: any[];
    currentUserId: string;
    projectId: string;
}

export function BoardViewSwitcher({
                                      columns: initialColumns,
                                      boardId,
                                      canManageBoard,
                                      teamMembers = [],
                                      currentUserId,
                                      projectId,
                                  }: BoardViewSwitcherProps) {
    const { preferences, updatePreference } = useUserPreferences();
    const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
    const [sortOrder, setSortOrder] = useState<'priority' | 'due_date' | 'created_at'>('created_at');

    // Apply sorting to column items
    const columns = initialColumns.map(column => ({
        ...column,
        items: sortBoardItems(column.items, sortOrder)
    }));

    useEffect(() => {
        // Set initial view mode based on user preference
        if (preferences && preferences.defaultView) {
            if (preferences.defaultView === "list" || preferences.defaultView === "kanban") {
                setViewMode(preferences.defaultView);
            }
        }

        // Set initial sort order from user preferences
        if (preferences && preferences.tasksSortOrder) {
            setSortOrder(preferences.tasksSortOrder);
        }
    }, [preferences]);

    // Function to toggle view mode
    const toggleViewMode = () => {
        const newViewMode = viewMode === "kanban" ? "list" : "kanban";
        setViewMode(newViewMode);
    };

    // Function to change sort order
    const changeSortOrder = (newSortOrder: 'priority' | 'due_date' | 'created_at') => {
        setSortOrder(newSortOrder);
        updatePreference('tasksSortOrder', newSortOrder);
    };

    // Get display name for sort order
    const getSortOrderName = (sortOrder: string) => {
        switch(sortOrder) {
            case 'priority': return 'Priority';
            case 'due_date': return 'Due Date';
            case 'created_at': return 'Created Date';
            default: return 'Default';
        }
    };

    return (
        <div className="space-y-4 w-full">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <ArrowDownUp className="mr-1 h-4 w-4" />
                                Sort: {getSortOrderName(sortOrder)}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                onClick={() => changeSortOrder('priority')}
                                className={sortOrder === 'priority' ? 'font-medium' : ''}
                            >
                                By Priority
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => changeSortOrder('due_date')}
                                className={sortOrder === 'due_date' ? 'font-medium' : ''}
                            >
                                By Due Date
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => changeSortOrder('created_at')}
                                className={sortOrder === 'created_at' ? 'font-medium' : ''}
                            >
                                By Created Date
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {viewMode === "list" && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Plus className="mr-1 h-4 w-4" />
                                    Add Task
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {initialColumns.map(column => (
                                    <DropdownMenuItem
                                        key={column.id}
                                        onClick={() => {
                                            // Handle adding task to this column
                                            // For now this is just a placeholder
                                            // since this functionality is in the list view itself
                                        }}
                                    >
                                        Add to {column.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {canManageBoard && (
                        <Link href={`/dashboard/projects/${projectId}/boards/${boardId}/edit`}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-1 h-4 w-4" />
                                Edit Board
                            </Button>
                        </Link>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleViewMode}
                    >
                        {viewMode === "kanban" ? (
                            <>
                                <List className="mr-1 h-4 w-4" />
                                List View
                            </>
                        ) : (
                            <>
                                <Kanban className="mr-1 h-4 w-4" />
                                Kanban View
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="w-full overflow-hidden">
                {viewMode === "kanban" ? (
                    <KanbanBoard
                        columns={columns}
                        boardId={boardId}
                        canManageBoard={canManageBoard}
                        teamMembers={teamMembers}
                        currentUserId={currentUserId}
                    />
                ) : (
                    <BoardListView
                        columns={columns}
                        boardId={boardId}
                        canManageBoard={canManageBoard}
                        teamMembers={teamMembers}
                        currentUserId={currentUserId}
                    />
                )}
            </div>
        </div>
    );
}