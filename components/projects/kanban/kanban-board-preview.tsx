"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Layout } from "lucide-react";

interface Column {
    id: string;
    name: string;
    order: number;
    board_items: any[];
}

interface KanbanBoardPreviewProps {
    boardId: string;
}

export function KanbanBoardPreview({ boardId }: KanbanBoardPreviewProps) {
    const [columns, setColumns] = useState<Column[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchBoardColumns = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from("board_columns")
                    .select(`
                        id,
                        name,
                        order,
                        board_items(id)
                    `)
                    .eq("board_id", boardId)
                    .order("order", { ascending: true });

                if (error) throw error;
                setColumns(data);
            } catch (err) {
                console.error("Error fetching board columns:", err);
                setColumns(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBoardColumns();
    }, [boardId, supabase]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex h-24 items-center justify-center rounded-md border-2 border-dashed border-primary/20">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
        );
    }

    // Show fallback state if no columns or error
    if (!columns || columns.length === 0) {
        return (
            <div className="flex h-24 items-center justify-center rounded-md border-2 border-dashed border-primary/20">
                <Layout className="h-8 w-8 text-primary/40" />
            </div>
        );
    }

    // Show preview of board columns
    return (
        <div className="flex h-24 items-center justify-center rounded-md border-2 border-dashed border-primary/20 p-2">
            <div className="flex w-full h-full gap-1 overflow-hidden">
                {columns.map((column) => (
                    <div
                        key={column.id}
                        className="flex-1 min-w-0 rounded border border-muted p-1 bg-background/80"
                    >
                        <div className="text-[9px] font-medium truncate text-center pb-1 border-b border-dashed border-muted-foreground/30">
                            {column.name}
                        </div>
                        <div className="flex items-center justify-center pt-1">
                            <div className="text-[10px] text-muted-foreground">
                                {column.board_items?.length || 0} tasks
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}