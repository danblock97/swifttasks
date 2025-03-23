"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Bell, Check, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { ConfirmJoinTeamDialog } from "@/components/team/confirm-join-team-dialog";

interface Notification {
    id: string;
    type: string;
    title: string;
    content: string | null;
    data: any;
    is_read: boolean;
    created_at: string;
}

interface ContentCounts {
    projects: number;
    spaces: number;
    todoLists: number;
}

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isJoinTeamDialogOpen, setIsJoinTeamDialogOpen] = useState(false);
    const [pendingTeamInvitation, setPendingTeamInvitation] = useState<Notification | null>(null);
    const [contentCounts, setContentCounts] = useState<ContentCounts>({ projects: 0, spaces: 0, todoLists: 0 });

    const router = useRouter();
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("user_notifications")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(10);

            if (error) throw error;

            setNotifications(data || []);
            setUnreadCount((data || []).filter(n => !n.is_read).length);
        } catch (error: any) {
            console.error("Error fetching notifications:", error);
            toast({
                title: "Error",
                description: "Failed to load notifications",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Load notifications on component mount
    useEffect(() => {
        fetchNotifications();

        // Set up real-time subscription for new notifications
        const subscription = supabase
            .channel('user_notifications_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'user_notifications',
            }, (payload) => {
                fetchNotifications();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    // Mark notification as read
    const markAsRead = async (id: string) => {
        try {
            // Update local state immediately
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));

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
        } catch (error) {
            console.error("Error marking notification as read:", error);
            // Don't revert the UI state, but you could show a toast notification
        }
    };

    // Delete notification
    const deleteNotification = async (id: string) => {
        try {
            // Update local state immediately for better UX
            setNotifications(prev => prev.filter(n => n.id !== id));

            // Calculate new unread count
            const removedNotification = notifications.find(n => n.id === id);
            if (removedNotification && !removedNotification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

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
                throw new Error(errorData.error || 'Failed to delete notification');
            }
        } catch (error) {
            console.error("Error deleting notification:", error);
            // Don't revert the UI state to avoid confusion, but show an error toast
            toast({
                title: "Error",
                description: "There was an issue deleting the notification. Please refresh the page.",
                variant: "destructive",
            });
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            // Update local state immediately
            const unreadNotifications = notifications.filter(n => !n.is_read);
            if (unreadNotifications.length === 0) return;

            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true }))
            );
            setUnreadCount(0);

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
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            // Don't revert the UI state, but you could show a toast notification
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

    // Handle team invitation
    const handleTeamInvitation = async (notification: Notification, accept: boolean) => {
        if (!accept) {
            // Decline invitation - delete the notification
            try {
                await deleteNotification(notification.id);

                toast({
                    title: "Invitation Declined",
                    description: "You have declined the team invitation",
                });
            } catch (error) {
                console.error("Error declining invitation:", error);
                toast({
                    title: "Error",
                    description: "Failed to decline the invitation. Please try again.",
                    variant: "destructive",
                });
            }
            return;
        }

        // If accepting, check user content and show confirmation dialog
        try {
            setIsOpen(false); // Close dropdown
            setPendingTeamInvitation(notification);

            // Check user content
            const counts = await checkUserContent();
            setContentCounts(counts);

            // Show the confirmation dialog
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

            // Delete the notification using our reliable method
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

            // Redirect to team dashboard with complete page refresh to ensure state is updated
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

    // Render notification based on type
    const renderNotification = (notification: Notification) => {
        switch (notification.type) {
            case "team_invitation":
                return (
                    <div className="p-3 bg-card border rounded-md mb-2 relative">
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm leading-tight">{notification.title}</p>
                                <p className="text-muted-foreground text-xs mt-1">{notification.content}</p>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {formatRelativeTime(notification.created_at)}
                                </div>

                                {!notification.is_read && (
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleTeamInvitation(notification, true)}
                                        >
                                            <Check className="h-3 w-3 mr-1" />
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => handleTeamInvitation(notification, false)}
                                        >
                                            <X className="h-3 w-3 mr-1" />
                                            Decline
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {!notification.is_read && (
                                <div className="absolute top-2 right-2">
                                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="p-3 bg-card border rounded-md mb-2 relative">
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                                <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm leading-tight">{notification.title}</p>
                                <p className="text-muted-foreground text-xs mt-1">{notification.content}</p>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {formatRelativeTime(notification.created_at)}
                                </div>
                            </div>

                            {!notification.is_read && (
                                <div className="absolute top-2 right-2">
                                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                </div>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px]">
                                {unreadCount}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex justify-between items-center">
                        <span>Notifications</span>
                        {notifications.length > 0 && (
                            <Link href="/dashboard/notifications" className="text-xs text-muted-foreground hover:underline">
                                View All
                            </Link>
                        )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <div className="max-h-[calc(80vh-100px)] overflow-y-auto py-1">
                        {isLoading ? (
                            <div className="p-4 text-center text-muted-foreground">
                                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2"></div>
                                <p className="text-sm">Loading notifications...</p>
                            </div>
                        ) : notifications.length > 0 ? (
                            <DropdownMenuGroup className="px-2 py-1">
                                {notifications.map((notification) => (
                                    <DropdownMenuItem key={notification.id} className="p-0 focus:bg-transparent">
                                        {renderNotification(notification)}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        ) : (
                            <div className="p-4 text-center text-muted-foreground">
                                <p className="text-sm">No notifications</p>
                            </div>
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

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