"use client";

import { useState } from "react";
import Link from "next/link";
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
import {
    FileText,
    Clock,
    Edit,
    Trash2,
    MoreVertical,
    ExternalLink,
    Plus,
} from "lucide-react";
import { formatDate, truncateText } from "@/lib/utils";

interface DocPage {
    id: string;
    title: string;
    content: string | null;
    created_at: string;
    updated_at: string;
    space_id: string;
    order: number;
}

interface DocPagesProps {
    pages: DocPage[];
    spaceId: string;
    canManageDocSpace: boolean;
}

export function DocPages({ pages, spaceId, canManageDocSpace }: DocPagesProps) {
    const [docPages, setDocPages] = useState<DocPage[]>(pages);
    const [selectedPage, setSelectedPage] = useState<DocPage | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const supabase = createClientComponentClient();
    const router = useRouter();
    const { toast } = useToast();

    const handleDeletePage = (page: DocPage) => {
        setSelectedPage(page);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeletePage = async () => {
        if (!selectedPage) return;

        if (!canManageDocSpace) {
            toast({
                title: "Permission Denied",
                description: "You don't have permission to delete pages",
                variant: "destructive",
            });
            setIsDeleteDialogOpen(false);
            return;
        }

        // Don't allow deletion of the last page
        if (docPages.length <= 1) {
            toast({
                title: "Cannot Delete",
                description: "You cannot delete the last page in a documentation space.",
                variant: "destructive",
            });
            setIsDeleteDialogOpen(false);
            return;
        }

        // Optimistic update
        setDocPages((prevPages) =>
            prevPages.filter((p) => p.id !== selectedPage.id)
        );

        // Delete the page
        const { error } = await supabase
            .from("doc_pages")
            .delete()
            .eq("id", selectedPage.id);

        if (error) {
            toast({
                title: "Error",
                description: "Failed to delete page. Please try again.",
                variant: "destructive",
            });
            // Reload the page to restore state
            router.refresh();
        } else {
            toast({
                title: "Page deleted",
                description: "The page has been deleted successfully."
            });
        }

        setIsDeleteDialogOpen(false);
        setSelectedPage(null);
    };

    const extractSummary = (content: string | null): string => {
        if (!content) return "No content";

        const cleanContent = content
            .replace(/^#+\s+.*$/gm, '') // Remove headings
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Clean links
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .trim();

        return truncateText(cleanContent, 150);
    };

    return (
        <div className="grid gap-6">
            {docPages.length === 0 ? (
                <Card>
                    <CardContent className="flex h-[150px] flex-col items-center justify-center space-y-3 py-8">
                        <h3 className="text-center font-medium">No pages yet</h3>
                        <p className="text-center text-sm text-muted-foreground">
                            Create a page to add documentation
                        </p>
                        <Link href={`/dashboard/docs/${spaceId}/pages/create`}>
                            <Button>Create Page</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {docPages.map((page) => (
                        <Card key={page.id} className="hover:shadow-sm transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <Link href={`/dashboard/docs/${spaceId}/pages/${page.id}`} className="flex-1">
                                        <CardTitle className="line-clamp-1 text-lg hover:text-primary/80 transition-colors">
                                            {page.title}
                                        </CardTitle>
                                    </Link>
                                    {canManageDocSpace && (
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
                                                    <Link href={`/dashboard/docs/${spaceId}/pages/${page.id}`}>
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        View Page
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/docs/${spaceId}/pages/${page.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Page
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDeletePage(page)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Page
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {extractSummary(page.content)}
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="border-t pt-4">
                                <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center">
                                        <FileText className="mr-1 h-3 w-3" />
                                        <span>Created {formatDate(page.created_at)}</span>
                                    </div>
                                    {page.updated_at && page.updated_at !== page.created_at && (
                                        <div className="flex items-center">
                                            <Clock className="mr-1 h-3 w-3" />
                                            <span>Updated {formatDate(page.updated_at)}</span>
                                        </div>
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}

                    {canManageDocSpace && (
                        <Card className="border-dashed hover:shadow-sm transition-shadow">
                            <CardContent className="flex h-24 items-center justify-center">
                                <Link href={`/dashboard/docs/${spaceId}/pages/create`}>
                                    <Button variant="outline" className="border-dashed">
                                        <Plus className="mr-1 h-4 w-4" />
                                        Add New Page
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Delete confirmation dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Page</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this page? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDeletePage}
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