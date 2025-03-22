"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Check, X, Bell, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/utils";

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

interface NotificationsTableProps {
    notifications: Notification[];
}

export function NotificationsTable({ notifications }: NotificationsTableProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [currentNotifications, setCurrentNotifications] = useState<Notification[]>(notifications);
    const router = useRouter();
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    // Mark notification as read
    const markAsRead = async (id: string) => {
        try {
            setIsLoading(true);
            const { error } = await supabase
                .from("user_notifications")
                .update({ is_read: true })
                .eq("id", id);

            if (error) throw error;

            // Update local state
            setCurrentNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );

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
            const { error } = await supabase
                .from("user_notifications")
                .delete()
                .eq("id", id);

            if (error) throw error;

            // Update local state
            setCurrentNotifications(prev =>
                prev.filter(n => n.id !== id)
            );

            toast({
                title: "Success",
                description: "Notification deleted",
            });
        } catch (error: any) {
            console.error("Error deleting notification:", error);
            toast({
                title: "Error",
                description: "Failed to delete notification",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle team invitation acceptance
    const handleTeamInvitation = async (notification: Notification, accept: boolean) => {
        try {
            setIsLoading(true);
            if (!notification.data?.team_id || !notification.data?.invite_code) {
                throw new Error("Invalid invitation data");
            }

            if (accept) {
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

                // Delete the invitation record
                const { error: inviteDeleteError } = await supabase
                    .from("team_invites")
                    .delete()
                    .eq("invite_code", notification.data.invite_code);

                if (inviteDeleteError) {
                    console.warn("Error deleting invitation:", inviteDeleteError);
                }

                toast({
                    title: "Invitation Accepted",
                    description: `You have joined ${notification.data.team_name}`,
                });

                // Delete the notification
                await deleteNotification(notification.id);

                // Redirect to team dashboard
                router.push("/dashboard/team?joined=true");
                router.refresh();
            } else {
                // Decline invitation - just delete the notification
                await deleteNotification(notification.id);

                toast({
                    title: "Invitation Declined",
                    description: "You have declined the team invitation",
                });
            }
        } catch (error: any) {
            console.error("Error handling invitation:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to process invitation",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            setIsLoading(true);
            const { error } = await supabase
                .from("user_notifications")
                .update({ is_read: true })
                .eq("is_read", false);

            if (error) throw error;

            // Update local state
            setCurrentNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true }))
            );

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
    );
}