"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { KanbanItem } from "./kanban-item";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, GripHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BoardItem {
    id: string;
    title: string;
    description: string | null;
    order: number;
    column_id: string;
    created_at: string;
    assigned_to: string | null;
}

interface Column {
    id: string;
    name: string;
    order: number;
    items: BoardItem[];
}

interface KanbanColumnProps {
    column: Column;
    onAddItem: () => void;
    onEditItem: (item: BoardItem) => void;
    onDeleteItem: (itemId: string) => void;
    canManageBoard: boolean;
    isUpdating: boolean;
    dragHandleProps: any;
}

export function KanbanColumn({
                                 column,
                                 onAddItem,
                                 onEditItem,
                                 onDeleteItem,
                                 canManageBoard,
                                 isUpdating,
                                 dragHandleProps
                             }: KanbanColumnProps) {
    const { id, name, items } = column;

    const getColumnColor = (columnName: string) => {
        const lowerName = columnName.toLowerCase();

        if (lowerName.includes("done") || lowerName.includes("complete")) {
            return "bg-green-100 border-green-200 text-green-700";
        }

        if (lowerName.includes("progress") || lowerName.includes("doing")) {
            return "bg-blue-100 border-blue-200 text-blue-700";
        }

        if (lowerName.includes("todo") || lowerName.includes("backlog")) {
            return "bg-gray-100 border-gray-200 text-gray-700";
        }

        if (lowerName.includes("review") || lowerName.includes("testing")) {
            return "bg-purple-100 border-purple-200 text-purple-700";
        }

        if (lowerName.includes("blocked") || lowerName.includes("hold")) {
            return "bg-red-100 border-red-200 text-red-700";
        }

        // Default color
        return "bg-primary/10 border-primary/20 text-primary";
    };

    const columnColor = getColumnColor(name);

    return (
        <div className="flex-shrink-0 w-72 h-min">
            <div className={cn("rounded-t-md border p-2 flex items-center justify-between", columnColor)}>
                <div className="flex items-center gap-2">
                    <div {...dragHandleProps} className="cursor-grab">
                        <GripHorizontal className="h-4 w-4 opacity-50" />
                    </div>
                    <h3 className="font-medium text-sm">
                        {name}
                    </h3>
                    <Badge className={cn("bg-white text-xs", columnColor)}>{items.length}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Column Options</span>
                </Button>
            </div>

            <Droppable droppableId={id} type="task">
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                            "min-h-[200px] max-h-[calc(100vh-220px)] overflow-y-auto rounded-b-md border border-t-0 p-2",
                            snapshot.isDraggingOver ? "bg-primary/5" : "bg-card"
                        )}
                    >
                        {items.map((item, index) => (
                            <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                                isDragDisabled={isUpdating}
                            >
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                            ...provided.draggableProps.style,
                                            opacity: snapshot.isDragging ? "0.8" : "1",
                                        }}
                                        className="mb-2 last:mb-0"
                                    >
                                        <KanbanItem
                                            item={item}
                                            onEdit={() => onEditItem(item)}
                                            onDelete={() => onDeleteItem(item.id)}
                                            canManageBoard={canManageBoard}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}

                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2 text-muted-foreground"
                            onClick={onAddItem}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Task
                        </Button>
                    </div>
                )}
            </Droppable>
        </div>
    );
}