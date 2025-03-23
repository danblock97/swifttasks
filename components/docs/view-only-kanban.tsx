// Update components/docs/view-only-kanban.tsx

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface BoardItem {
    id: string;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high' | null;
}

interface Column {
    id: string;
    name: string;
    items: BoardItem[];
}

// Update props to accept boardPath
export function ViewOnlyKanban({ boardPath }: { boardPath: string }) {
    const [columns, setColumns] = useState<Column[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [boardName, setBoardName] = useState<string>("");

    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchBoard = async () => {
            try {
                // Extract the board ID from the path
                let boardId: string;

                // Check if this is a full path (projectId/boards/boardId) or just a boardId
                if (boardPath.includes('/boards/')) {
                    // It's a full path, extract just the board ID
                    const pathParts = boardPath.split('/boards/');
                    if (pathParts.length < 2) {
                        throw new Error('Invalid board path format');
                    }
                    boardId = pathParts[1];
                } else {
                    boardId = boardPath;
                }

                // Get the board name first
                const { data: boardData, error: boardError } = await supabase
                    .from('boards')
                    .select('name, project_id')
                    .eq('id', boardId)
                    .single();

                if (boardError) {
                    console.error('Error fetching board:', boardError);
                    throw new Error(`Board not found: ${boardError.message}`);
                }

                if (boardData) {
                    setBoardName(boardData.name);
                } else {
                    console.error('No board data returned');
                    throw new Error('Board not found');
                }

                // Get board columns with items
                const { data, error } = await supabase
                    .from('board_columns')
                    .select(`
            id, 
            name, 
            order,
            board_items (
              id, 
              title,
              description,
              priority,
              order
            )
          `)
                    .eq('board_id', boardId)
                    .order('order', { ascending: true });

                if (error) {
                    console.error('Error fetching columns:', error);
                    throw error;
                }

                if (!data || data.length === 0) {
                    setColumns([]);
                    setIsLoading(false);
                    return;
                }

                // Format columns and sort items
                const formattedColumns = data.map(column => ({
                    id: column.id,
                    name: column.name,
                    items: (column.board_items || [])
                        .sort((a, b) => a.order - b.order)
                }));

                setColumns(formattedColumns);
            } catch (err: any) {
                console.error('Error in ViewOnlyKanban:', err);
                setError(err.message || 'Failed to load kanban board');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBoard();
    }, [boardPath, supabase]);

    // Get priority details
    const getPriorityDetails = (priority: string | null) => {
        switch(priority) {
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

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-24 border rounded-md">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-4 text-center text-red-500 border rounded-md">
                <p>{error}</p>
                <p className="text-xs mt-1">Board path: {boardPath}</p>
            </div>
        );
    }

    // Empty state
    if (columns.length === 0) {
        return (
            <div className="p-4 text-center border rounded-md">
                <p>No columns found for this board.</p>
                <p className="text-xs mt-1">Board path: {boardPath}</p>
            </div>
        );
    }

    // Board view
    return (
        <div className="kanban-columns-container border rounded-md overflow-hidden">
            <div className="bg-muted p-2 border-b flex items-center justify-between">
                <h3 className="font-medium text-sm">{boardName || "Kanban Board"}</h3>
                <span className="text-xs text-muted-foreground">View Only</span>
            </div>
            <div className="p-2 overflow-x-auto">
                <div className="inline-flex gap-4 min-w-full pb-2">
                    {columns.map(column => (
                        <div key={column.id} className="w-64 flex-shrink-0 border rounded-md bg-muted/30">
                            <div className="p-2 border-b font-medium text-sm bg-muted/50 rounded-t-md">
                                {column.name} <span className="text-xs text-muted-foreground">({column.items.length})</span>
                            </div>
                            <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
                                {column.items.length === 0 ? (
                                    <div className="text-center text-xs text-muted-foreground p-2">No items</div>
                                ) : (
                                    column.items.map(item => (
                                        <Card key={item.id} className="shadow-sm">
                                            <CardContent className="p-3">
                                                <div className="text-sm font-medium">{item.title}</div>
                                                {item.description && (
                                                    <div className="text-xs mt-1 text-muted-foreground line-clamp-2">
                                                        {item.description}
                                                    </div>
                                                )}
                                                {item.priority && (
                                                    <div className="mt-2">
                                                        {(() => {
                                                            const priorityDetails = getPriorityDetails(item.priority);
                                                            if (!priorityDetails) return null;

                                                            return (
                                                                <Badge variant="outline" className={`text-xs flex items-center gap-1 py-0 px-1.5 ${priorityDetails.color}`}>
                                                                    {priorityDetails.icon}
                                                                    <span>{priorityDetails.label}</span>
                                                                </Badge>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}