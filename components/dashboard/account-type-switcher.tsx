"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Users } from "lucide-react";
import { generateUUID } from "@/lib/utils";

interface AccountTypeSwitcherProps {
    user: any;
}

export function AccountTypeSwitcher({ user }: AccountTypeSwitcherProps) {
    const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
    const [isDowngradeDialogOpen, setIsDowngradeDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [teamName, setTeamName] = useState("");

    const router = useRouter();
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    const isTeamMember = user?.account_type === "team_member";
    const isTeamOwner = isTeamMember && user?.is_team_owner;

    const handleUpgradeToTeam = async () => {
        if (!teamName.trim()) {
            toast({
                title: "Team name required",
                description: "Please enter a name for your team.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Create a new team
            const teamId = generateUUID();

            // Create the team
            const { error: teamError } = await supabase
                .from("teams")
                .insert({
                    id: teamId,
                    name: teamName.trim(),
                    owner_id: user.id,
                });

            if (teamError) throw teamError;

            // Update user to team owner
            const { error: userError } = await supabase
                .from("users")
                .update({
                    account_type: "team_member",
                    team_id: teamId,
                    is_team_owner: true,
                })
                .eq("id", user.id);

            if (userError) throw userError;

            toast({
                title: "Account upgraded",
                description: "Your account has been upgraded to a team account.",
            });

            setIsUpgradeDialogOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error("Error upgrading account:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to upgrade account. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDowngradeToSolo = async () => {
        setIsLoading(true);

        try {
            if (isTeamOwner) {
                toast({
                    title: "Cannot downgrade",
                    description: "Team owners must transfer ownership or delete the team before downgrading.",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            // Update user to single account
            const { error: userError } = await supabase
                .from("users")
                .update({
                    account_type: "single",
                    team_id: null,
                    is_team_owner: false,
                })
                .eq("id", user.id);

            if (userError) throw userError;

            toast({
                title: "Account downgraded",
                description: "Your account has been downgraded to a solo account.",
            });

            setIsDowngradeDialogOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error("Error downgrading account:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to downgrade account. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Type</CardTitle>
                <CardDescription>
                    Manage your account type
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isTeamMember ? (
                                <Users className="h-5 w-5 text-blue-500" />
                            ) : (
                                <User className="h-5 w-5 text-indigo-500" />
                            )}
                            <div>
                                <p className="font-medium">
                                    {isTeamMember
                                        ? isTeamOwner
                                            ? "Team Owner"
                                            : "Team Member"
                                        : "Solo User"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {isTeamMember
                                        ? `You're part of ${user?.teams?.name || "a team"}`
                                        : "You're using a personal account"}
                                </p>
                            </div>
                        </div>

                        {!isTeamMember && (
                            <Button
                                onClick={() => setIsUpgradeDialogOpen(true)}
                                variant="outline"
                                className="text-blue-600 dark:text-blue-400"
                            >
                                <Users className="mr-1 h-4 w-4" />
                                Upgrade to Team
                            </Button>
                        )}

                        {isTeamMember && !isTeamOwner && (
                            <Button
                                onClick={() => setIsDowngradeDialogOpen(true)}
                                variant="outline"
                                className="text-indigo-600 dark:text-indigo-400"
                            >
                                <User className="mr-1 h-4 w-4" />
                                Switch to Solo
                            </Button>
                        )}
                    </div>

                    {isTeamMember && isTeamOwner && (
                        <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-800/50">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-amber-400 dark:text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Team Owner Notice</h3>
                                    <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                                        <p>As a team owner, you must transfer ownership or delete the team before switching to a solo account.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Upgrade Dialog */}
            <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upgrade to Team Account</DialogTitle>
                        <DialogDescription>
                            Create a team to collaborate with others. You'll be the team owner.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="team-name">Team Name</Label>
                            <Input
                                id="team-name"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="Enter team name"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isLoading}>Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleUpgradeToTeam}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading ? "Upgrading..." : "Upgrade Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Downgrade Dialog */}
            <Dialog open={isDowngradeDialogOpen} onOpenChange={setIsDowngradeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Switch to Solo Account</DialogTitle>
                        <DialogDescription>
                            You'll leave your current team and convert to a solo account.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-800/50 mb-4">
                        <p className="text-amber-800 dark:text-amber-300 text-sm">
                            This action will remove you from your current team. You'll lose access to team projects, boards, and documentation.
                        </p>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isLoading}>Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleDowngradeToSolo}
                            disabled={isLoading}
                            variant="destructive"
                        >
                            {isLoading ? "Switching..." : "Switch Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}