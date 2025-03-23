"use client";

import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Users, AlertTriangle, Trash2, UserPlus, LogOut } from "lucide-react";
import { generateUUID, formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

interface AccountTypeSwitcherProps {
    user: any;
}

interface TeamMember {
    id: string;
    email: string;
    display_name: string;
    is_team_owner: boolean;
}

interface TeamData {
    id: string;
    name: string;
    members: TeamMember[];
    created_at: string;
}

export function AccountTypeSwitcher({ user }: AccountTypeSwitcherProps) {
    // Dialogs state
    const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
    const [isDowngradeDialogOpen, setIsDowngradeDialogOpen] = useState(false);
    const [isDeleteTeamDialogOpen, setIsDeleteTeamDialogOpen] = useState(false);
    const [isTransferOwnershipDialogOpen, setIsTransferOwnershipDialogOpen] = useState(false);

    // Form state
    const [isLoading, setIsLoading] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [newOwnerUserId, setNewOwnerUserId] = useState("");
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [teamData, setTeamData] = useState<TeamData | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    // Content migration checkboxes
    const [migrateTodoLists, setMigrateTodoLists] = useState(true);
    const [migratePersonalProjects, setMigratePersonalProjects] = useState(true);
    const [migratePersonalSpaces, setMigratePersonalSpaces] = useState(true);

    // Counts for current content
    const [contentCounts, setContentCounts] = useState({
        todoLists: 0,
        personalProjects: 0,
        personalSpaces: 0,
        teamProjects: 0,
        teamSpaces: 0
    });

    const router = useRouter();
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    const isTeamMember = user?.account_type === "team_member";
    const isTeamOwner = isTeamMember && user?.is_team_owner;

    // Fetch team data for team members
    useEffect(() => {
        const fetchTeamData = async () => {
            if (isTeamMember && user?.team_id) {
                setIsLoading(true);
                try {
                    // Get team data
                    const { data: team, error: teamError } = await supabase
                        .from("teams")
                        .select("*")
                        .eq("id", user.team_id)
                        .single();

                    if (teamError) throw teamError;

                    // Get team members
                    const { data: members, error: membersError } = await supabase
                        .from("users")
                        .select("id, email, display_name, is_team_owner")
                        .eq("team_id", user.team_id);

                    if (membersError) throw membersError;

                    // For team owners, we need to see other potential owners for transfer
                    if (isTeamOwner && members) {
                        setTeamMembers(members.filter(m => !m.is_team_owner));
                    }

                    if (team && members) {
                        setTeamData({
                            ...team,
                            members
                        });
                    }

                    // Get content counts
                    await fetchContentCounts();
                } catch (error) {
                    console.error("Error fetching team data:", error);
                } finally {
                    setIsLoading(false);
                }
            } else if (!isTeamMember) {
                // For solo users, just get content counts
                fetchContentCounts();
            }
        };

        fetchTeamData();
    }, [isTeamMember, isTeamOwner, user?.team_id]);

    // Fetch counts of user's content
    const fetchContentCounts = async () => {
        try {
            if (!user?.id) return;

            // Get todo lists count
            const { count: todoListsCount } = await supabase
                .from("todo_lists")
                .select("*", { count: "exact", head: true })
                .eq("owner_id", user.id);

            // For team members
            if (isTeamMember && user?.team_id) {
                // Get personal projects (those owned by user but not associated with the team)
                const { count: personalProjectsCount } = await supabase
                    .from("projects")
                    .select("*", { count: "exact", head: true })
                    .eq("owner_id", user.id)
                    .is("team_id", null);

                // Get personal spaces
                const { count: personalSpacesCount } = await supabase
                    .from("doc_spaces")
                    .select("*", { count: "exact", head: true })
                    .eq("owner_id", user.id)
                    .is("team_id", null);

                // Get team projects
                const { count: teamProjectsCount } = await supabase
                    .from("projects")
                    .select("*", { count: "exact", head: true })
                    .eq("team_id", user.team_id);

                // Get team spaces
                const { count: teamSpacesCount } = await supabase
                    .from("doc_spaces")
                    .select("*", { count: "exact", head: true })
                    .eq("team_id", user.team_id);

                setContentCounts({
                    todoLists: todoListsCount || 0,
                    personalProjects: personalProjectsCount || 0,
                    personalSpaces: personalSpacesCount || 0,
                    teamProjects: teamProjectsCount || 0,
                    teamSpaces: teamSpacesCount || 0
                });
            } else {
                // For solo users
                // Get personal projects
                const { count: projectsCount } = await supabase
                    .from("projects")
                    .select("*", { count: "exact", head: true })
                    .eq("owner_id", user.id);

                // Get personal spaces
                const { count: spacesCount } = await supabase
                    .from("doc_spaces")
                    .select("*", { count: "exact", head: true })
                    .eq("owner_id", user.id);

                setContentCounts({
                    todoLists: todoListsCount || 0,
                    personalProjects: projectsCount || 0,
                    personalSpaces: spacesCount || 0,
                    teamProjects: 0,
                    teamSpaces: 0
                });
            }
        } catch (error) {
            console.error("Error fetching content counts:", error);
        }
    };

    // Upgrade to team account
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

            // Migrate content if needed
            // Note: For upgrading to a team, we typically don't need to migrate as the user
            // will automatically have access to their existing personal content in the team context

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

    // Team member leaving a team
    const handleDowngradeToSolo = async () => {
        if (isTeamOwner) {
            // Team owners will be handled by different flows (transfer or delete)
            return;
        }

        setIsLoading(true);

        try {
            // First we need to take care of content migration
            if (migrateTodoLists) {
                // Todo lists are already associated with the user, just need to remove team_id
                const { error: todoListError } = await supabase
                    .from("todo_lists")
                    .update({ team_id: null })
                    .eq("owner_id", user.id);

                if (todoListError) throw todoListError;
            } else {
                // If not migrating, we might want to delete them or handle differently
                // For now, we'll keep them with the user but this can be customized
            }

            // Handle personal projects
            if (!migratePersonalProjects && contentCounts.personalProjects > 0) {
                await deletePersonalProjects();
            }

            // Handle personal doc spaces
            if (!migratePersonalSpaces && contentCounts.personalSpaces > 0) {
                await deletePersonalSpaces();
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

    // Delete personal projects
    const deletePersonalProjects = async () => {
        try {
            // Get personal project IDs
            const { data: projectsData } = await supabase
                .from("projects")
                .select("id")
                .eq("owner_id", user.id)
                .is("team_id", null);

            if (projectsData && projectsData.length > 0) {
                const projectIds = projectsData.map(p => p.id);

                // Get board IDs
                const { data: boardsData } = await supabase
                    .from("boards")
                    .select("id")
                    .in("project_id", projectIds);

                if (boardsData && boardsData.length > 0) {
                    const boardIds = boardsData.map(b => b.id);

                    // Get column IDs
                    const { data: columnsData } = await supabase
                        .from("board_columns")
                        .select("id")
                        .in("board_id", boardIds);

                    if (columnsData && columnsData.length > 0) {
                        const columnIds = columnsData.map(c => c.id);

                        // Delete board items
                        await supabase
                            .from("board_items")
                            .delete()
                            .in("column_id", columnIds);
                    }

                    // Delete columns
                    await supabase
                        .from("board_columns")
                        .delete()
                        .in("board_id", boardIds);

                    // Delete boards
                    await supabase
                        .from("boards")
                        .delete()
                        .in("id", boardIds);
                }

                // Delete projects
                await supabase
                    .from("projects")
                    .delete()
                    .in("id", projectIds);
            }
        } catch (error) {
            console.error("Error deleting personal projects:", error);
            throw error;
        }
    };

    // Delete personal doc spaces
    const deletePersonalSpaces = async () => {
        try {
            // Get personal space IDs
            const { data: spacesData } = await supabase
                .from("doc_spaces")
                .select("id")
                .eq("owner_id", user.id)
                .is("team_id", null);

            if (spacesData && spacesData.length > 0) {
                const spaceIds = spacesData.map(s => s.id);

                // Delete doc pages first
                await supabase
                    .from("doc_pages")
                    .delete()
                    .in("space_id", spaceIds);

                // Delete spaces
                await supabase
                    .from("doc_spaces")
                    .delete()
                    .in("id", spaceIds);
            }
        } catch (error) {
            console.error("Error deleting personal spaces:", error);
            throw error;
        }
    };

    // Transfer team ownership
    const handleTransferOwnership = async () => {
        if (!newOwnerUserId) {
            toast({
                title: "No user selected",
                description: "Please select a team member to transfer ownership to.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // First, make the selected user a team owner
            const { error: newOwnerError } = await supabase
                .from("users")
                .update({ is_team_owner: true })
                .eq("id", newOwnerUserId);

            if (newOwnerError) throw newOwnerError;

            // Update team record with new owner
            const { error: teamError } = await supabase
                .from("teams")
                .update({ owner_id: newOwnerUserId })
                .eq("id", user.team_id);

            if (teamError) throw teamError;

            // Now we can downgrade current user to regular team member or solo account
            if (migratePersonalProjects && migratePersonalSpaces) {
                // Stay as team member but not owner
                const { error: userError } = await supabase
                    .from("users")
                    .update({ is_team_owner: false })
                    .eq("id", user.id);

                if (userError) throw userError;

                toast({
                    title: "Ownership transferred",
                    description: "You are now a regular team member.",
                });
            } else {
                // Convert to solo account
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
                    description: "Ownership transferred and your account converted to solo.",
                });
            }

            setIsTransferOwnershipDialogOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error("Error transferring ownership:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to transfer ownership. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Delete team
    const handleDeleteTeam = async () => {
        if (deleteConfirmText !== teamData?.name) {
            toast({
                title: "Confirmation required",
                description: "Please type the team name to confirm deletion.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // This is a complex operation that requires deleting multiple resources
            const teamId = user.team_id;

            // 1. Get all team members
            const { data: teamMembers } = await supabase
                .from("users")
                .select("id")
                .eq("team_id", teamId);

            // 2. Delete team projects and their dependencies
            // 2.1 Get team project IDs
            const { data: projectsData } = await supabase
                .from("projects")
                .select("id")
                .eq("team_id", teamId);

            if (projectsData && projectsData.length > 0) {
                const projectIds = projectsData.map(p => p.id);

                // 2.2 Get board IDs
                const { data: boardsData } = await supabase
                    .from("boards")
                    .select("id")
                    .in("project_id", projectIds);

                if (boardsData && boardsData.length > 0) {
                    const boardIds = boardsData.map(b => b.id);

                    // 2.3 Get column IDs
                    const { data: columnsData } = await supabase
                        .from("board_columns")
                        .select("id")
                        .in("board_id", boardIds);

                    if (columnsData && columnsData.length > 0) {
                        const columnIds = columnsData.map(c => c.id);

                        // 2.4 Delete board items
                        await supabase
                            .from("board_items")
                            .delete()
                            .in("column_id", columnIds);
                    }

                    // 2.5 Delete columns
                    await supabase
                        .from("board_columns")
                        .delete()
                        .in("board_id", boardIds);

                    // 2.6 Delete boards
                    await supabase
                        .from("boards")
                        .delete()
                        .in("id", boardIds);
                }

                // 2.7 Delete projects
                await supabase
                    .from("projects")
                    .delete()
                    .in("id", projectIds);
            }

            // 3. Delete team doc spaces and pages
            // 3.1 Get team space IDs
            const { data: spacesData } = await supabase
                .from("doc_spaces")
                .select("id")
                .eq("team_id", teamId);

            if (spacesData && spacesData.length > 0) {
                const spaceIds = spacesData.map(s => s.id);

                // 3.2 Delete doc pages
                await supabase
                    .from("doc_pages")
                    .delete()
                    .in("space_id", spaceIds);

                // 3.3 Delete spaces
                await supabase
                    .from("doc_spaces")
                    .delete()
                    .in("id", spaceIds);
            }

            // 4. Delete team todo lists
            await supabase
                .from("todo_lists")
                .delete()
                .eq("team_id", teamId);

            // 5. Update all team members to solo accounts
            if (teamMembers && teamMembers.length > 0) {
                const memberIds = teamMembers.map(m => m.id);

                await supabase
                    .from("users")
                    .update({
                        account_type: "single",
                        team_id: null,
                        is_team_owner: false
                    })
                    .in("id", memberIds);
            }

            // 6. Delete team invites
            await supabase
                .from("team_invites")
                .delete()
                .eq("team_id", teamId);

            // 7. Finally, delete the team itself
            await supabase
                .from("teams")
                .delete()
                .eq("id", teamId);

            toast({
                title: "Team deleted",
                description: "Your team has been deleted and your account converted to solo.",
            });

            setIsDeleteTeamDialogOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error("Error deleting team:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to delete team. Please try again.",
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
                                        ? `You're part of ${teamData?.name || user?.teams?.name || "a team"}`
                                        : "You're using a personal account"}
                                </p>
                                {isTeamMember && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Team created {teamData ? formatDate(teamData.created_at) : ""}
                                    </p>
                                )}
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

                        {isTeamMember && isTeamOwner && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setIsTransferOwnershipDialogOpen(true)}
                                    variant="outline"
                                    className="text-amber-600 dark:text-amber-400"
                                >
                                    <UserPlus className="mr-1 h-4 w-4" />
                                    Transfer Ownership
                                </Button>
                                <Button
                                    onClick={() => setIsDeleteTeamDialogOpen(true)}
                                    variant="outline"
                                    className="text-red-600 dark:text-red-400"
                                >
                                    <Trash2 className="mr-1 h-4 w-4" />
                                    Delete Team
                                </Button>
                            </div>
                        )}
                    </div>

                    {isTeamMember && (
                        <div className="grid gap-4 mt-2">
                            <div className="rounded-md bg-muted p-4">
                                <h3 className="text-sm font-medium mb-2">Your Content Summary</h3>
                                <div className="grid gap-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Todo Lists:</span>
                                        <span>{contentCounts.todoLists}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Personal Projects:</span>
                                        <span>{contentCounts.personalProjects}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Personal Doc Spaces:</span>
                                        <span>{contentCounts.personalSpaces}</span>
                                    </div>
                                    {isTeamOwner && (
                                        <>
                                            <div className="flex justify-between text-sm font-medium pt-2">
                                                <span>Team Content:</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Team Projects:</span>
                                                <span>{contentCounts.teamProjects}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Team Doc Spaces:</span>
                                                <span>{contentCounts.teamSpaces}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {isTeamOwner && (
                                <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-800/50">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertTriangle className="h-5 w-5 text-amber-500" />
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
                    )}
                </div>
            </CardContent>

            {/* Upgrade Dialog - Solo to Team */}
            <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
                <DialogContent className="sm:max-w-md">
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

                        <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 p-4 border border-blue-200 dark:border-blue-800/50">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Users className="h-5 w-5 text-blue-500" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Team Features</h3>
                                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Invite team members to collaborate</li>
                                            <li>Create team projects with multiple boards</li>
                                            <li>Share documentation with your team</li>
                                            <li>Assign tasks to team members</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-md bg-muted p-4">
                            <p className="text-sm font-medium">Your content will be carried over:</p>
                            <ul className="mt-2 text-sm list-inside list-disc space-y-1">
                                <li>Todo lists ({contentCounts.todoLists})</li>
                                <li>Projects ({contentCounts.personalProjects})</li>
                                <li>Doc spaces ({contentCounts.personalSpaces})</li>
                            </ul>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isLoading}>Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleUpgradeToTeam}
                            disabled={isLoading || !teamName.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading ? "Upgrading..." : "Upgrade Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Downgrade Dialog - Team Member to Solo */}
            <Dialog open={isDowngradeDialogOpen} onOpenChange={setIsDowngradeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Switch to Solo Account</DialogTitle>
                        <DialogDescription>
                            You'll leave your current team and convert to a solo account.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-800/50 mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Warning</h3>
                                    <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                                        <p>This action will remove you from your current team. You'll lose access to team projects, boards, and documentation.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-medium">Content Migration Options</h4>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="migrate-todo-lists"
                                    checked={migrateTodoLists}
                                    onCheckedChange={(checked) => setMigrateTodoLists(checked as boolean)}
                                />
                                <label
                                    htmlFor="migrate-todo-lists"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Migrate my todo lists ({contentCounts.todoLists})
                                </label>
                            </div>

                            {contentCounts.personalProjects > 0 && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="migrate-personal-projects"
                                        checked={migratePersonalProjects}
                                        onCheckedChange={(checked) => setMigratePersonalProjects(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="migrate-personal-projects"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Keep my personal projects ({contentCounts.personalProjects})
                                    </label>
                                </div>
                            )}

                            {contentCounts.personalSpaces > 0 && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="migrate-personal-spaces"
                                        checked={migratePersonalSpaces}
                                        onCheckedChange={(checked) => setMigratePersonalSpaces(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="migrate-personal-spaces"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Keep my personal doc spaces ({contentCounts.personalSpaces})
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="rounded-md bg-muted p-4 mt-4 text-sm">
                            <p className="font-medium">Note:</p>
                            <p className="mt-1">You will lose access to all team content and cannot rejoin without a new invitation.</p>
                        </div>
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
                            {isLoading ? "Processing..." : "Leave Team & Convert to Solo"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Transfer Ownership Dialog - Team Owner */}
            <Dialog open={isTransferOwnershipDialogOpen} onOpenChange={setIsTransferOwnershipDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transfer Team Ownership</DialogTitle>
                        <DialogDescription>
                            Transfer ownership of {teamData?.name} to another team member.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {teamMembers.length === 0 ? (
                            <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-800/50">
                                <p className="text-amber-800 dark:text-amber-300 text-sm">
                                    There are no other team members to transfer ownership to. You need to invite members first or delete the team.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-owner">Select New Owner</Label>
                                    <Select
                                        value={newOwnerUserId}
                                        onValueChange={setNewOwnerUserId}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger id="new-owner">
                                            <SelectValue placeholder="Select a team member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teamMembers.map((member) => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    {member.display_name || member.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4 mt-2">
                                    <h4 className="text-sm font-medium">After Transfer</h4>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="stay-team-member"
                                            checked={migratePersonalProjects && migratePersonalSpaces}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setMigratePersonalProjects(true);
                                                    setMigratePersonalSpaces(true);
                                                } else {
                                                    setMigratePersonalProjects(false);
                                                    setMigratePersonalSpaces(false);
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="stay-team-member"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Stay as a team member
                                        </label>
                                    </div>

                                    {(!migratePersonalProjects || !migratePersonalSpaces) && (
                                        <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-800/50">
                                            <p className="text-amber-800 dark:text-amber-300 text-sm">
                                                You will be converted to a solo account after transferring ownership.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isLoading}>Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleTransferOwnership}
                            disabled={isLoading || !newOwnerUserId || teamMembers.length === 0}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            {isLoading ? "Transferring..." : "Transfer Ownership"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Team Dialog - Team Owner */}
            <Dialog open={isDeleteTeamDialogOpen} onOpenChange={setIsDeleteTeamDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Team</DialogTitle>
                        <DialogDescription>
                            This action is permanent and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-4 border border-red-200 dark:border-red-800/50">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Warning</h3>
                                    <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                                        <p>Deleting your team will:</p>
                                        <ul className="list-disc list-inside mt-1">
                                            <li>Remove all team members from the team</li>
                                            <li>Delete all team projects, boards, and tasks</li>
                                            <li>Delete all team documentation spaces and pages</li>
                                            <li>Convert all members to solo accounts</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2 mt-2">
                            <Label htmlFor="confirm-delete" className="text-red-600">
                                Type <span className="font-bold">{teamData?.name}</span> to confirm
                            </Label>
                            <Input
                                id="confirm-delete"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder={`Type "${teamData?.name}" to confirm`}
                                disabled={isLoading}
                                className="border-red-200 focus-visible:ring-red-500"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isLoading}>Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleDeleteTeam}
                            disabled={isLoading || deleteConfirmText !== teamData?.name}
                            variant="destructive"
                        >
                            {isLoading ? "Deleting..." : "Delete Team Forever"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}