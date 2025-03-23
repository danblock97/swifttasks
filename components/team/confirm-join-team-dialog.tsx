// components/team/confirm-join-team-dialog.tsx
"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, X } from "lucide-react";

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
    const hasContent = contentCounts.projects > 0 || contentCounts.spaces > 0;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {hasContent && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                        Join {teamName}
                    </DialogTitle>
                    <DialogDescription>
                        {hasContent
                            ? "Before joining this team, please review what will happen to your existing content."
                            : `You're about to join ${teamName} as a team member.`}
                    </DialogDescription>
                </DialogHeader>

                {hasContent && (
                    <div className="space-y-4 py-2">
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-900/20">
                            <div className="flex items-start">
                                <AlertTriangle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                        Content Migration Warning
                                    </h3>
                                    <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                                        <p className="mb-2">
                                            When joining a team, the following will happen:
                                        </p>
                                        <ul className="list-inside list-disc space-y-1">
                                            {contentCounts.projects > 0 && (
                                                <li>
                                                    <strong>{contentCounts.projects}</strong> personal {contentCounts.projects === 1 ? "project" : "projects"} will be deleted
                                                </li>
                                            )}
                                            {contentCounts.spaces > 0 && (
                                                <li>
                                                    <strong>{contentCounts.spaces}</strong> documentation {contentCounts.spaces === 1 ? "space" : "spaces"} will be deleted
                                                </li>
                                            )}
                                            {contentCounts.todoLists > 0 && (
                                                <li>
                                                    <strong>{contentCounts.todoLists}</strong> todo {contentCounts.todoLists === 1 ? "list" : "lists"} will be preserved
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/40 dark:bg-blue-900/20">
                            <div className="flex items-start">
                                <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-400">
                                        This action cannot be undone. Projects and documentation spaces
                                        are team-specific and cannot be transferred between personal
                                        and team accounts.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <svg
                                    className="mr-2 h-4 w-4 animate-spin"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Processing...
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                {hasContent ? "Join Team & Migrate Content" : "Join Team"}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}