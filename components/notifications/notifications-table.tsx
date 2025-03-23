"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Check, X, Bell, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/utils";
import { ConfirmJoinTeamDialog } from "@/components/team/confirm-join-team-dialog";

interface Notification {
    id: string;
    type: string;
    title: string;
    content: string | null;
    data: any;
    is_read: boolean;
    created_at: string;
    user_id: string;
}

interface ContentCounts {
    projects: number;
    spaces: number;
    todoLists: number;
}

interface NotificationsTableProps {
    notifications: Notification[];
}

export function NotificationsTable({ notifications }: NotificationsTableProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [currentNotifications, setCurrentNotifications] = useState<Notification[]>(notifications);
    const [isJoinTeamDialogOpen, setIsJoinTeamDialogOpen] = useState(false);
    const [pendingTeamInvitation, setPendingTeamInvitation] = useState<Notification | null>(null);
    const [contentCounts, setContentCounts] = useState<ContentCounts>({ projects: 0, spaces: 0, todoLists: 0 });

    const router = useRouter();
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    // Mark notification as read
    const markAsRead = async (id: string) => {
        try {
            setIsLoading(true);

            // Update local state immediately
            setCurrentNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );

            // Call the API to update the database
            const response = await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    notificationId: id,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }

            toast({
                title: "Success",
                description: "Notification marked as read",
            });
        } catch (error: any) {
            console.error("Error marking notification as read:", error);
            toast({
                title: "Error",
                description: "Failed to update notification",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Delete notification
    const deleteNotification = async (id: string) => {
        try {
            setIsLoading(true);

            // Update local state immediately for better UX
            setCurrentNotifications(prev => prev.filter(n => n.id !== id));

            // Call server-side API to delete the notification
            const response = await fetch('/api/notifications/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    notificationId: id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Server error deleting notification:", errorData);
                throw new Error(errorData.error || 'Failed to delete notification');
            }

            toast({
                title: "Success",
                description: "Notification deleted",
            });
        } catch (error: any) {
            console.error("Error deleting notification:", error);
            toast({
                title: "Note",
                description: "The notification has been removed from your view, but there might be a sync issue. Please refresh if needed.",
                variant: "default",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Check user's content before joining team
    const checkUserContent = async (): Promise<ContentCounts> => {
        try {
            // Get user ID
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) throw new Error("User not authenticated");

            // Count projects
            const { count: projectsCount, error: projectsError } = await supabase
                .from("projects")
                .select("*", { count: "exact", head: true })
                .eq("owner_id", userId)
                .is("team_id", null);

            if (projectsError) throw projectsError;

            // Count doc spaces
            const { count: spacesCount, error: spacesError } = await supabase
                .from("doc_spaces")
                .select("*", { count: "exact", head: true })
                .eq("owner_id", userId)
                .is("team_id", null);

            if (spacesError) throw spacesError;

            // Count todo lists
            const { count: todoListsCount, error: todoListsError } = await supabase
                .from("todo_lists")
                .select("*", { count: "exact", head: true })
                .eq("owner_id", userId);

            if (todoListsError) throw todoListsError;

            return {
                projects: projectsCount || 0,
                spaces: spacesCount || 0,
                todoLists: todoListsCount || 0
            };
        } catch (error) {
            console.error("Error checking user content:", error);
            return { projects: 0, spaces: 0, todoLists: 0 };
        }
    };

    // Delete user's personal projects and spaces
    const deleteUserContent = async () => {
        try {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) throw new Error("User not authenticated");

            // First, we need to manually delete boards and their dependencies
            // Get all project IDs for the user's personal projects
            const { data: projectsData } = await supabase
                .from("projects")
                .select("id")
                .eq("owner_id", userId)
                .is("team_id", null);

            if (projectsData && projectsData.length > 0) {
                const projectIds = projectsData.map(p => p.id);

                // Get all board IDs for these projects
                const { data: boardsData } = await supabase
                    .from("boards")
                    .select("id")
                    .in("project_id", projectIds);

                if (boardsData && boardsData.length > 0) {
                    const boardIds = boardsData.map(b => b.id);

                    // Delete board items first
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

                    // Delete board columns
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

                // Now delete the projects
                await supabase
                    .from("projects")
                    .delete()
                    .in("id", projectIds);
            }

            // Delete doc spaces and their pages
            const { data: spacesData } = await supabase
                .from("doc_spaces")
                .select("id")
                .eq("owner_id", userId)
                .is("team_id", null);

            if (spacesData && spacesData.length > 0) {
                const spaceIds = spacesData.map(s => s.id);

                // Delete doc pages first
                await supabase
                    .from("doc_pages")
                    .delete()
                    .in("space_id", spaceIds);

                // Delete doc spaces
                await supabase
                    .from("doc_spaces")
                    .delete()
                    .in("id", spaceIds);
            }

            console.log("Successfully deleted personal projects and spaces");
        } catch (error) {
            console.error("Error deleting user content:", error);
            // We'll continue with team acceptance even if deletion fails
            // but log the error and raise a toast to indicate partial success
            toast({
                title: "Partial Migration",
                description: "Joined team successfully, but there was an issue migrating some content.",
                variant: "destructive",
            });
        }
    };

    // Handle team invitation (initial function)
    const handleTeamInvitation = async (notification: Notification, accept: boolean) => {
        if (!accept) {
            // Decline invitation - just delete the notification
            await deleteNotification(notification.id);
            toast({
                title: "Invitation Declined",
                description: "You have declined the team invitation",
            });
            return;
        }

        // For accept, check user content first
        try {
            setPendingTeamInvitation(notification);

            // Check user content
            const counts = await checkUserContent();
            setContentCounts(counts);

            // Show confirmation dialog
            setIsJoinTeamDialogOpen(true);
        } catch (error) {
            console.error("Error preparing team join:", error);
            toast({
                title: "Error",
                description: "Failed to prepare team join process. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Process team invitation after confirmation
    const processTeamInvitation = async () => {
        if (!pendingTeamInvitation) return;

        try {
            setIsLoading(true);

            // First, delete the user's personal projects and spaces
            await deleteUserContent();

            // Now accept the team invitation by updating user record
            const { error: userUpdateError } = await supabase
                .from("users")
                .update({
                    account_type: "team_member",
                    team_id: pendingTeamInvitation.data.team_id,
                    is_team_owner: false,
                })
                .eq("id", (await supabase.auth.getUser()).data.user?.id || "");

            if (userUpdateError) {
                throw userUpdateError;
            }

            // Wait for the update to complete
            await new Promise(resolve => setTimeout(resolve, 500));

            try {
                // Use a server-side API route to ensure proper deletion of related records
                const response = await fetch('/api/team/delete-invite', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inviteCode: pendingTeamInvitation.data.invite_code,
                    }),
                });

                if (!response.ok) {
                    console.warn("Server-side invite deletion returned error:", await response.text());
                }
            } catch (deleteError) {
                console.warn("Error using server API to delete invitation:", deleteError);
            }

            // Delete notification from both UI and database
            try {
                await deleteNotification(pendingTeamInvitation.id);
            } catch (notifError) {
                console.warn("Error deleting notification:", notifError);
                // Continue with team join even if notification deletion fails
            }

            toast({
                title: "Team Joined Successfully",
                description: `You have joined ${pendingTeamInvitation.data.team_name}`,
            });

            // Redirect to team dashboard with a full page reload to ensure freshness
            window.location.href = "/dashboard/team?joined=true";
        } catch (error: any) {
            console.error("Error processing team invitation:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to join team. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setIsJoinTeamDialogOpen(false);
            setPendingTeamInvitation(null);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            setIsLoading(true);

            // Update local state immediately
            setCurrentNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true }))
            );

            // Call the API to update the database
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to mark all notifications as read');
            }

            toast({
                title: "Success",
                description: "All notifications marked as read",
            });
        } catch (error: any) {
            console.error("Error marking all notifications as read:", error);
            toast({
                title: "Error",
                description: "Failed to update notifications",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Get notification icon based on type
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "team_invitation":
                return <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
            default:
                return <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
        }
    };

    if (currentNotifications.length === 0) {
        return (
            <Card className="p-8 text-center">
                <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bell className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                    You don't have any notifications at the moment.
                </p>
            </Card>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{currentNotifications.length} notifications</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                        disabled={isLoading || !currentNotifications.some(n => !n.is_read)}
                    >
                        <Check className="h-4 w-4 mr-2" />
                        Mark all as read
                    </Button>
                </div>

                <div className="grid gap-4">
                    {currentNotifications.map((notification) => (
                        <Card key={notification.id} className={`p-4 border-l-4 ${notification.is_read ? "border-l-gray-200 dark:border-l-gray-700" : "border-l-blue-500"}`}>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    {getNotificationIcon(notification.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium text-base">{notification.title}</h4>
                                            <p className="text-muted-foreground mt-1">{notification.content}</p>
                                            <div className="text-xs text-muted-foreground mt-2">
                                                {formatRelativeTime(notification.created_at)}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {!notification.is_read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => markAsRead(notification.id)}
                                                    disabled={isLoading}
                                                >
                                                    <Check className="h-4 w-4" />
                                                    <span className="sr-only">Mark as read</span>
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteNotification(notification.id)}
                                                disabled={isLoading}
                                            >
                                                <X className="h-4 w-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {notification.type === "team_invitation" && !notification.is_read && (
                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                size="sm"
                                                onClick={() => handleTeamInvitation(notification, true)}
                                                disabled={isLoading}
                                            >
                                                <Check className="h-4 w-4 mr-2" />
                                                Accept Invitation
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleTeamInvitation(notification, false)}
                                                disabled={isLoading}
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Decline
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Team Join Confirmation Dialog */}
            {pendingTeamInvitation && (
                <ConfirmJoinTeamDialog
                    open={isJoinTeamDialogOpen}
                    onClose={() => {
                        setIsJoinTeamDialogOpen(false);
                        setPendingTeamInvitation(null);
                    }}
                    onConfirm={processTeamInvitation}
                    teamName={pendingTeamInvitation.data.team_name || "Team"}
                    contentCounts={contentCounts}
                    isLoading={isLoading}
                />
            )}
        </>
    );
}