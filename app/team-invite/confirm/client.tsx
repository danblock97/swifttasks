'use client';
// Save this as client.tsx in the same directory

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Users, AlertTriangle, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ContentCounts {
    projects: number;
    spaces: number;
    todoLists: number;
}

export default function ConfirmTeamJoinClient() {
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [teamId, setTeamId] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [contentCounts, setContentCounts] = useState<ContentCounts>({ projects: 0, spaces: 0, todoLists: 0 });
    const [hasContent, setHasContent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const supabase = createClientComponentClient();

    useEffect(() => {
        const code = searchParams.get('code');
        if (!code) {
            setError("Missing invitation code");
            setIsLoading(false);
            return;
        }

        const validateAndCheckContent = async () => {
            try {
                // First, validate the invitation
                const { data: inviteData, error: inviteError } = await fetch(
                    `/api/team-invite/validate?code=${code}`
                ).then(res => res.json());

                if (inviteError || !inviteData?.valid) {
                    setError(inviteError || "Invalid invitation");
                    setIsLoading(false);
                    return;
                }

                setTeamName(inviteData.invite.teamName);
                setTeamId(inviteData.invite.teamId);
                setInviteCode(inviteData.invite.inviteCode);

                // Now check user content
                const result = await fetch('/api/team-invite/process-content-migration', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        teamId: inviteData.invite.teamId,
                        inviteCode: inviteData.invite.inviteCode
                    })
                }).then(res => res.json());

                if (result.error) {
                    setError(result.error);
                    setIsLoading(false);
                    return;
                }

                if (result.hasContent) {
                    // User has content that would be migrated
                    setContentCounts(result.contentCounts);
                    setHasContent(true);
                } else if (result.success) {
                    // No content to migrate, user joined successfully
                    setIsSuccess(true);
                }

                setIsLoading(false);
            } catch (error) {
                console.error("Error validating invitation:", error);
                setError("Failed to validate invitation");
                setIsLoading(false);
            }
        };

        validateAndCheckContent();
    }, [searchParams]);

    const handleConfirmJoin = async () => {
        try {
            setIsProcessing(true);

            const response = await fetch('/api/team-invite/process-content-migration', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId,
                    inviteCode,
                    confirmMigration: true
                })
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            setIsSuccess(true);
        } catch (error: any) {
            console.error("Error joining team:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to join team",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <Card className="max-w-md w-full p-8 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <h1 className="text-xl font-semibold mt-4">Validating invitation...</h1>
                    <p className="text-center text-muted-foreground">
                        Please wait while we validate your invitation and check your content.
                    </p>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <Card className="max-w-md w-full p-8 flex flex-col items-center justify-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <h1 className="text-xl font-semibold mt-4">Invitation Error</h1>
                    <p className="text-center text-muted-foreground">
                        {error}
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard">
                            Go to Dashboard
                        </Link>
                    </Button>
                </Card>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <Card className="max-w-md w-full p-8 flex flex-col items-center justify-center space-y-4">
                    <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <h1 className="text-xl font-semibold mt-4">You've Joined {teamName}!</h1>
                    <p className="text-center text-muted-foreground">
                        You have successfully joined {teamName} as a team member.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard/team">
                            Go to Team Dashboard <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <Card className="max-w-md w-full p-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-blue-500" />
                    </div>
                    <h1 className="text-2xl font-bold">Join {teamName}</h1>
                    <p className="text-center text-muted-foreground mt-2">
                        You've been invited to join {teamName} as a team member.
                    </p>
                </div>

                {hasContent && (
                    <div className="mb-6 space-y-4">
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
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                This action cannot be undone. Projects and documentation spaces
                                are team-specific and cannot be transferred between personal
                                and team accounts.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col space-y-3">
                    <Button
                        onClick={handleConfirmJoin}
                        disabled={isProcessing}
                        className="w-full"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                {hasContent ? "Join Team & Migrate Content" : "Join Team"}
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard')}
                        disabled={isProcessing}
                        className="w-full"
                    >
                        Cancel
                    </Button>
                </div>
            </Card>
        </div>
    );
}