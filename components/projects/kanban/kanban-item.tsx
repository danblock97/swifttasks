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
import { MoreHorizontal, Edit, Trash2, User } from "lucide-react";
import { truncateText } from "@/lib/utils";

interface BoardItem {
    id: string;
    title: string;
    description: string | null;
    order: number;
    column_id: string;
    created_at: string;
    assigned_to: string | null;
}

interface KanbanItemProps {
    item: BoardItem;
    onEdit: () => void;
    onDelete: () => void;
    canManageBoard: boolean;
}

export function KanbanItem({ item, onEdit, onDelete, canManageBoard }: KanbanItemProps) {
    const { title, description, assigned_to } = item;

    return (
        <Card className="border shadow-sm">
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
                        <DropdownMenuContent align="end" className="w-36">
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
                    <p className="text-xs text-muted-foreground mt-1">
                        {truncateText(description, 100)}
                    </p>
                )}
            </CardContent>

            {assigned_to && (
                <CardFooter className="p-3 pt-0 flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                        <User className="mr-1 h-3 w-3" />
                        Assigned
                    </Badge>

                    <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                            {assigned_to.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </CardFooter>
            )}
        </Card>
    );
}