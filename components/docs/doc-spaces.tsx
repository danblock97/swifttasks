"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
    Clock,
    MoreVertical,
    Users,
    FileText,
    Plus,
    Edit,
    Trash2,
    ExternalLink
} from "lucide-react";

interface DocSpace {
    id: string;
    name: string;
    created_at: string;
    owner_id: string;
    team_id: string | null;
}

interface DocSpacesProps {
    spaces: DocSpace[];
    isTeamMember: boolean;
    isTeamOwner: boolean;
    hasReachedSpaceLimit: boolean;
    isTeamSpace: boolean;
}

export function DocSpaces({ spaces, isTeamMember, isTeamOwner, hasReachedSpaceLimit, isTeamSpace }: DocSpacesProps) {
    const [docSpaces, setDocSpaces] = useState<DocSpace[]>(spaces);
    const [selectedSpace, setSelectedSpace] = useState<DocSpace | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const supabase = createClientComponentClient();
    const router = useRouter();
    const { toast } = useToast();

    const handleDeleteSpace = (space: DocSpace) => {
        setSelectedSpace(space);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteSpace = async () => {
        if (!selectedSpace) return;

        if (!isTeamOwner && isTeamMember) {
            toast({
                title: "Permission Denied",
                description: "Only team owners can delete documentation spaces",
                variant: "destructive",
            });
            setIsDeleteDialogOpen(false);
            return;
        }

        // Optimistic update
        setDocSpaces((prevSpaces) =>
            prevSpaces.filter((p) => p.id !== selectedSpace.id)
        );

        // Delete pages associated with the space
        const { error: pagesError } = await supabase
            .from("doc_pages")
            .delete()
            .eq("space_id", selectedSpace.id);

        if (pagesError) {
            console.error("Error deleting pages:", pagesError);
        }

        // Delete the space
        const { error } = await supabase
            .from("doc_spaces")
            .delete()
            .eq("id", selectedSpace.id);

        if (error) {
            toast({
                title: "Error",
                description: "Failed to delete documentation space. Please try again.",
                variant: "destructive",
            });
            // Reload the page to restore state
            router.refresh();
        } else {
            toast({
                title: "Documentation space deleted",
                description: "The documentation space has been deleted successfully."
            });
        }

        setIsDeleteDialogOpen(false);
        setSelectedSpace(null);
    };

    const canManageDocSpace = (space: DocSpace) => {
        if (!isTeamMember) return true; // Single user can manage their spaces
        return isTeamOwner; // Team members can only manage if they're the owner
    };

    return (
        <div className="grid gap-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {docSpaces.map((space) => (
                    <Card key={space.id} className="flex flex-col">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="line-clamp-1 text-base">
                                    {space.name}
                                </CardTitle>
                                {canManageDocSpace(space) && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">Menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/docs/${space.id}`}>
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    View Space
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/docs/${space.id}/edit`}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Space
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDeleteSpace(space)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Space
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                            <CardDescription className="line-clamp-2 min-h-[40px]">
                                Documentation space for organizing and sharing knowledge
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                            <div className="flex items-center space-x-2">
                                <Link
                                    href={`/dashboard/docs/${space.id}`}
                                    className="inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary"
                                >
                                    <FileText className="mr-1 h-3 w-3" />
                                    Documents
                                </Link>

                                {space.team_id && (
                                    <Badge variant="secondary" className="text-xs">
                                        <Users className="mr-1 h-3 w-3" />
                                        Team
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 mt-auto">
                            <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    <span>Created {formatDate(space.created_at)}</span>
                                </div>
                                <Link
                                    href={`/dashboard/docs/${space.id}`}
                                    className="text-xs font-medium text-primary hover:underline"
                                >
                                    View details
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                ))}

                {/* Show "Create a new space" card if user can create more spaces */}
                {!hasReachedSpaceLimit && canManageDocSpace(docSpaces[0] || { id: '', name: '', created_at: '', owner_id: '', team_id: null }) && (
                    <Card className="flex flex-col h-full border-dashed">
                        <CardContent className="flex h-full flex-col items-center justify-center p-6">
                            <div className="mb-4 rounded-full bg-primary/10 p-3">
                                <Plus className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-center font-medium">Create a new space</h3>
                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                Add a new documentation space to organize your knowledge
                            </p>
                            <Link href="/dashboard/docs/create" className="mt-4 w-full">
                                <Button variant="outline" className="w-full">Create Documentation Space</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Show upgrade message for solo users who have reached their limit */}
                {hasReachedSpaceLimit && !isTeamSpace && (
                    <Card className="flex flex-col h-full border-dashed border-blue-200 dark:border-blue-800">
                        <CardContent className="flex h-full flex-col items-center justify-center p-6">
                            <div className="mb-4 rounded-full bg-blue-100 dark:bg-blue-900/40 p-3">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-center font-medium">Upgrade to Team</h3>
                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                Team accounts can create up to 2 documentation spaces
                            </p>
                            <Link href="/dashboard/settings" className="mt-4 w-full">
                                <Button variant="outline" className="w-full text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                    Upgrade Account
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete confirmation dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Documentation Space</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this documentation space? This will delete all pages
                            and associated data. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDeleteSpace}
                        >
                            Delete
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}