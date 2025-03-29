"use client";

// Define the BoardItem interface so it can be used in the sorting functions
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

// Priority mapping for sorting (high → medium → low → null)
const priorityValues = {
    high: 1,
    medium: 2,
    low: 3,
    null: 4, // Null priorities come last
};

/**
 * Sort board items based on specified sort order
 */
export const sortBoardItems = (
    items: BoardItem[],
    sortOrder: 'priority' | 'due_date' | 'created_at' = 'created_at'
): BoardItem[] => {
    // Create a copy to avoid mutating the original
    const sortedItems = [...items];

    switch (sortOrder) {
        case 'priority':
            return sortedItems.sort((a, b) => {
                // Sort by priority first
                const aPriority = a.priority ? priorityValues[a.priority] : priorityValues.null;
                const bPriority = b.priority ? priorityValues[b.priority] : priorityValues.null;

                if (aPriority !== bPriority) {
                    return aPriority - bPriority;
                }

                // If same priority, sort by order (kanban position)
                return a.order - b.order;
            });

        case 'due_date':
            return sortedItems.sort((a, b) => {
                // Items with no due date come last
                if (!a.due_date && !b.due_date) return a.order - b.order;
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;

                // Sort by due date (earlier dates first)
                const aDate = new Date(a.due_date).getTime();
                const bDate = new Date(b.due_date).getTime();

                if (aDate !== bDate) {
                    return aDate - bDate;
                }

                // If same due date, sort by order
                return a.order - b.order;
            });

        case 'created_at':
        default:
            // Default to sorting by creation date (newest first)
            return sortedItems.sort((a, b) => {
                const aDate = new Date(a.created_at).getTime();
                const bDate = new Date(b.created_at).getTime();

                // Newest first
                if (aDate !== bDate) {
                    return bDate - aDate;
                }

                // If same creation date, sort by order
                return a.order - b.order;
            });
    }
};