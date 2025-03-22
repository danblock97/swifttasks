"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "./kanban-column";
import { KanbanItem } from "./kanban-item";
import { CreateItemDialog } from "./create-item-dialog";
import { EditItemDialog } from "./edit-item-dialog";
import { CreateColumnDialog } from "./create-column-dialog";
import { Plus } from "lucide-react";

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

interface KanbanBoardProps {
    columns: Column[];
    boardId: string;
    canManageBoard: boolean;
    teamMembers?: any[];
    currentUserId: string;
}

export function KanbanBoard({
                                columns: initialColumns,
                                boardId,
                                canManageBoard,
                                teamMembers = [],
                                currentUserId
                            }: KanbanBoardProps) {
    const [columns, setColumns] = useState<Column[]>(initialColumns);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createColumnDialogOpen, setCreateColumnDialogOpen] = useState(false);
    const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<BoardItem | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const supabase = createClientComponentClient();
    const router = useRouter();
    const { toast } = useToast();

    // This is a simplified version of the drag and drop functionality
    // In a real app, you would want to optimize this further
    const onDragEnd = async (result: any) => {
        const { destination, source, draggableId, type } = result;

        // If dropped outside of any droppable area
        if (!destination) return;

        // If dropped in the same position
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Handle column reordering
        if (type === "column") {
            const newColumns = [...columns];
            const movedColumn = newColumns.find(col => col.id === draggableId);

            if (!movedColumn) return;

            // Remove from old position and insert at new position
            newColumns.splice(newColumns.indexOf(movedColumn), 1);
            newColumns.splice(destination.index, 0, movedColumn);

            // Update order of all columns
            const updatedColumns = newColumns.map((col, index) => ({
                ...col,
                order: index
            }));

            setColumns(updatedColumns);

            // Update in database
            setIsUpdating(true);

            try {
                // Create batch updates
                const updates = updatedColumns.map(col => ({
                    id: col.id,
                    order: col.order
                }));

                await Promise.all(
                    updates.map(update =>
                        supabase
                            .from("board_columns")
                            .update({ order: update.order })
                            .eq("id", update.id)
                    )
                );
            } catch (error) {
                console.error("Error updating column orders:", error);
                toast({
                    title: "Error",
                    description: "Failed to save column order. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsUpdating(false);
            }

            return;
        }

        // Handle item reordering
        const sourceColumn = columns.find(col => col.id === source.droppableId);
        const destColumn = columns.find(col => col.id === destination.droppableId);

        if (!sourceColumn || !destColumn) return;

        // Create new arrays to avoid mutating state directly
        const newColumns = [...columns];

        // If moving within the same column
        if (sourceColumn.id === destColumn.id) {
            const column = newColumns.find(col => col.id === sourceColumn.id);
            if (!column) return;

            const newItems = [...column.items];
            const [movedItem] = newItems.splice(source.index, 1);
            newItems.splice(destination.index, 0, movedItem);

            // Update orders
            const updatedItems = newItems.map((item, index) => ({
                ...item,
                order: index
            }));

            column.items = updatedItems;

            setColumns(newColumns);

            // Update in database
            setIsUpdating(true);

            try {
                // Create batch updates
                const updates = updatedItems.map(item => ({
                    id: item.id,
                    order: item.order
                }));

                await Promise.all(
                    updates.map(update =>
                        supabase
                            .from("board_items")
                            .update({ order: update.order })
                            .eq("id", update.id)
                    )
                );
            } catch (error) {
                console.error("Error updating item orders:", error);
                toast({
                    title: "Error",
                    description: "Failed to save item order. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsUpdating(false);
            }
        } else {
            // Moving between columns
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];

            const [movedItem] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, {
                ...movedItem,
                column_id: destColumn.id
            });

            // Update orders
            const updatedSourceItems = sourceItems.map((item, index) => ({
                ...item,
                order: index
            }));

            const updatedDestItems = destItems.map((item, index) => ({
                ...item,
                order: index
            }));

            // Update column items
            const newSourceColumn = newColumns.find(col => col.id === sourceColumn.id);
            const newDestColumn = newColumns.find(col => col.id === destColumn.id);

            if (newSourceColumn) newSourceColumn.items = updatedSourceItems;
            if (newDestColumn) newDestColumn.items = updatedDestItems;

            setColumns(newColumns);

            // Update in database
            setIsUpdating(true);

            try {
                // Update moved item's column and order
                await supabase
                    .from("board_items")
                    .update({
                        column_id: destColumn.id,
                        order: destination.index
                    })
                    .eq("id", movedItem.id);

                // Update other items' orders in both columns
                const updates = [
                    ...updatedSourceItems.map(item => ({
                        id: item.id,
                        order: item.order
                    })),
                    ...updatedDestItems
                        .filter(item => item.id !== movedItem.id) // Avoid updating the moved item twice
                        .map(item => ({
                            id: item.id,
                            order: item.order
                        }))
                ];

                await Promise.all(
                    updates.map(update =>
                        supabase
                            .from("board_items")
                            .update({ order: update.order })
                            .eq("id", update.id)
                    )
                );
            } catch (error) {
                console.error("Error moving item between columns:", error);
                toast({
                    title: "Error",
                    description: "Failed to move item. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsUpdating(false);
            }
        }
    };

    const handleAddItem = (columnId: string) => {
        setSelectedColumnId(columnId);
        setCreateDialogOpen(true);
    };

    const handleEditItem = (item: BoardItem) => {
        setSelectedItem(item);
        setEditDialogOpen(true);
    };

    const handleDeleteItem = async (itemId: string) => {
        // Optimistic update
        const newColumns = columns.map(column => ({
            ...column,
            items: column.items.filter(item => item.id !== itemId)
        }));

        setColumns(newColumns);

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
            router.refresh();
        } else {
            toast({
                title: "Item deleted",
                description: "The item has been deleted successfully."
            });
        }
    };

    const handleItemCreated = (newItem: BoardItem) => {
        setColumns(columns.map(column => {
            if (column.id === newItem.column_id) {
                return {
                    ...column,
                    items: [...column.items, newItem]
                };
            }
            return column;
        }));

        setCreateDialogOpen(false);
        setSelectedColumnId(null);
    };

    const handleItemUpdated = (updatedItem: BoardItem) => {
        setColumns(columns.map(column => {
            // If the item was moved to a different column
            if (selectedItem && selectedItem.column_id !== updatedItem.column_id) {
                if (column.id === selectedItem.column_id) {
                    // Remove from old column
                    return {
                        ...column,
                        items: column.items.filter(item => item.id !== updatedItem.id)
                    };
                }
                if (column.id === updatedItem.column_id) {
                    // Add to new column
                    return {
                        ...column,
                        items: [...column.items, updatedItem]
                    };
                }
            } else if (column.id === updatedItem.column_id) {
                // Update in the same column
                return {
                    ...column,
                    items: column.items.map(item =>
                        item.id === updatedItem.id ? updatedItem : item
                    )
                };
            }
            return column;
        }));

        setEditDialogOpen(false);
        setSelectedItem(null);
    };

    const handleColumnCreated = (newColumn: any) => {
        // Add the new column with an empty items array
        setColumns([...columns, {
            ...newColumn,
            items: []
        }]);

        setCreateColumnDialogOpen(false);
    };

    return (
        <div className="h-full">
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="board" type="column" direction="horizontal">
                    {(provided) => (
                        <div
                            className="flex gap-4 overflow-x-auto pb-4"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {columns.map((column, index) => (
                                <Draggable
                                    key={column.id}
                                    draggableId={column.id}
                                    index={index}
                                    isDragDisabled={!canManageBoard || isUpdating}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                        >
                                            <KanbanColumn
                                                column={column}
                                                onAddItem={() => handleAddItem(column.id)}
                                                onEditItem={handleEditItem}
                                                onDeleteItem={handleDeleteItem}
                                                canManageBoard={canManageBoard}
                                                isUpdating={isUpdating}
                                                dragHandleProps={provided.dragHandleProps}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}

                            {canManageBoard && columns.length < 7 && (
                                <div className="flex-shrink-0 w-72 h-min">
                                    <Button
                                        variant="outline"
                                        className="border-dashed w-full h-12 flex gap-1"
                                        onClick={() => setCreateColumnDialogOpen(true)}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Column
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Create Item Dialog */}
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

            {/* Edit Item Dialog */}
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

            {/* Create Column Dialog */}
            <CreateColumnDialog
                open={createColumnDialogOpen}
                onOpenChange={setCreateColumnDialogOpen}
                boardId={boardId}
                onColumnCreated={handleColumnCreated}
                currentColumnsCount={columns.length}
            />
        </div>
    );
}