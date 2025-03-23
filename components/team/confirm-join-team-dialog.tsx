"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface ContentCounts {
    projects: number;
    spaces: number;
    todoLists: number;
}

interface ConfirmJoinTeamDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    teamName: string;
    contentCounts: ContentCounts;
    isLoading: boolean;
}

export function ConfirmJoinTeamDialog({
                                          open,
                                          onClose,
                                          onConfirm,
                                          teamName,
                                          contentCounts,
                                          isLoading
                                      }: ConfirmJoinTeamDialogProps) {
    const [understood, setUnderstood] = useState(false);

    // Reset the checkbox when dialog opens
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setUnderstood(false);
            onClose();
        }
    };

    const hasContent = contentCounts.projects > 0 || contentCounts.spaces > 0;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Join Team: {teamName}</DialogTitle>
                    <DialogDescription>
                        You're about to join a team. Please review the effects on your content.
                    </DialogDescription>
                </DialogHeader>

                {hasContent && (
                    <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-800/50 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Content Migration Warning</h3>
                                <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                                    <p>You have existing content that will be affected when joining this team:</p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        {contentCounts.projects > 0 && (
                                            <li>{contentCounts.projects} personal project(s) will be removed</li>
                                        )}
                                        {contentCounts.spaces > 0 && (
                                            <li>{contentCounts.spaces} documentation space(s) will be removed</li>
                                        )}
                                        {contentCounts.todoLists > 0 && (
                                            <li>Your todo list will be migrated to the team</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4 py-2">
                    <h3 className="text-sm font-medium">By joining {teamName}:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>You'll become a team member with access to team projects and documentation</li>
                        <li>Your account type will change from Solo to Team Member</li>
                        <li>You'll be able to collaborate with other team members</li>
                    </ul>

                    {hasContent && (
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="understand-content-loss"
                                checked={understood}
                                onCheckedChange={(checked) => setUnderstood(checked as boolean)}
                            />
                            <label
                                htmlFor="understand-content-loss"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I understand that my personal projects and documentation spaces will be removed
                            </label>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isLoading}>Cancel</Button>
                    </DialogClose>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading || (hasContent && !understood)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? "Processing..." : "Join Team"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}