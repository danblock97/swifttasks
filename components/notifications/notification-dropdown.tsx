// FILE: components/notifications/notification-dropdown.tsx

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

interface Notification {
    id: string;
    type: string;
    title: string;
    content: string | null;
    data: any;
    is_read: boolean;
    created_at: string;
}

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
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
            const { error } = await supabase
                .from("user_notifications")
                .update({ is_read: true })
                .eq("id", id);

            if (error) throw error;

            // Update local state
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error: any) {
            console.error("Error marking notification as read:", error);
            toast({
                title: "Error",
                description: "Failed to update notification",
                variant: "destructive",
            });
        }
    };

    // Handle team invitation acceptance
    const handleTeamInvitation = async (notification: Notification, accept: boolean) => {
        try {
            if (!notification.data?.team_id || !notification.data?.invite_code) {
                throw new Error("Invalid invitation data");
            }

            if (accept) {
                // Log the invitation data for debugging
                console.log("Processing invitation with data:", notification.data);

                // Accept invitation
                const { error: userUpdateError } = await supabase
                    .from("users")
                    .update({
                        account_type: "team_member",
                        team_id: notification.data.team_id,
                        is_team_owner: false,
                    })
                    .eq("id", (await supabase.auth.getUser()).data.user?.id || "");

                if (userUpdateError) throw userUpdateError;

                console.log("User updated successfully to team member");

                // Try to find the invitation using the code to get its ID
                const { data: inviteData, error: findInviteError } = await supabase
                    .from("team_invites")
                    .select("id")
                    .eq("invite_code", notification.data.invite_code)
                    .maybeSingle();

                if (findInviteError) {
                    console.warn("Error finding invitation:", findInviteError);
                    // This is not fatal, we'll continue without deleting
                }

                // Only try to delete if we found an invitation
                if (inviteData?.id) {
                    // Delete the invitation record by ID instead of code
                    const { error: inviteDeleteError } = await supabase
                        .from("team_invites")
                        .delete()
                        .eq("id", inviteData.id);

                    if (inviteDeleteError) {
                        console.warn("Error deleting invitation by ID:", inviteDeleteError);
                        // Not a fatal error, user is still added to the team
                    } else {
                        console.log("Invitation deleted successfully");
                    }
                } else {
                    console.warn("Couldn't find invitation with code:", notification.data.invite_code);
                    // This is not a fatal error, user is still added to the team
                }

                toast({
                    title: "Invitation Accepted",
                    description: `You have joined ${notification.data.team_name}`,
                });

                // Mark notification as read
                await markAsRead(notification.id);

                // Refresh the page to update UI
                router.refresh();

                // Redirect to team dashboard
                router.push("/dashboard/team?joined=true");
            } else {
                // Decline invitation - just mark as read
                await markAsRead(notification.id);

                toast({
                    title: "Invitation Declined",
                    description: "You have declined the team invitation",
                });
            }

            setIsOpen(false); // Close dropdown after action
        } catch (error: any) {
            console.error("Error handling invitation:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to process invitation",
                variant: "destructive",
            });
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
    );
}