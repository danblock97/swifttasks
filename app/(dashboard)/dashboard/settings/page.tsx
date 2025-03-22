"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUserPreferences } from "@/hooks/use-preferences";
import { removeCookie, COOKIE_KEYS } from "@/lib/cookies";
import { useTheme } from "@/components/theme/theme-provider";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { AccountTypeSwitcher } from "@/components/dashboard/account-type-switcher";

export default function SettingsPage() {
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const { preferences, updatePreference, resetPreferences, isLoaded } = useUserPreferences();
    const [cookiesCleared, setCookiesCleared] = useState(false);

    // Notifications permission state
    const [notificationPermission, setNotificationPermission] = useState<string>("default");

    // Check notification permission on load
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    // Request notification permission when enabled
    useEffect(() => {
        if (isLoaded && preferences.notificationsEnabled && notificationPermission === "default") {
            requestNotificationPermission();
        }
    }, [isLoaded, preferences.notificationsEnabled, notificationPermission]);

    const requestNotificationPermission = async () => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            try {
                const permission = await Notification.requestPermission();
                setNotificationPermission(permission);

                if (permission !== "granted") {
                    // If permission denied, disable the preference
                    updatePreference('notificationsEnabled', false);
                    toast({
                        title: "Notification permission denied",
                        description: "Please enable notifications in your browser settings to use this feature.",
                    });
                }
            } catch (error) {
                console.error("Error requesting notification permission:", error);
            }
        }
    };

    const handleNotificationsToggle = (checked: boolean) => {
        if (checked && notificationPermission !== "granted") {
            requestNotificationPermission();
        }
        updatePreference('notificationsEnabled', checked);
    };

    if (!isLoaded) {
        return (
            <DashboardShell>
                <DashboardHeader
                    heading="Settings"
                    description="Manage your account settings and preferences."
                />
                <div className="grid gap-6">
                    <div className="flex items-center justify-center p-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                </div>
            </DashboardShell>
        );
    }

    const clearAllCookies = () => {
        // Clear all cookies except auth cookies
        Object.values(COOKIE_KEYS).forEach(key => {
            removeCookie(key);
        });
        removeCookie("cookie_consent");
        removeCookie("remembered_email");
        setCookiesCleared(true);
        toast({
            title: "Cookies cleared",
            description: "All cookies have been cleared successfully.",
        });
    };

    // Show a test notification
    const showTestNotification = () => {
        if (Notification.permission === "granted") {
            const notification = new Notification("SwiftTasks Notification", {
                body: "This is a test notification from SwiftTasks.",
                icon: "/favicon.ico"
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        } else {
            toast({
                title: "Notification permission required",
                description: "Please enable notifications in your browser settings.",
            });
        }
    };

    // Custom styled switch component
    const CustomSwitch = ({ checked, onCheckedChange, id }: { checked: boolean, onCheckedChange: (checked: boolean) => void, id: string }) => (
        <SwitchPrimitives.Root
            checked={checked}
            onCheckedChange={onCheckedChange}
            id={id}
            className="switch-base"
        >
            <SwitchPrimitives.Thumb className="switch-thumb" />
        </SwitchPrimitives.Root>
    );

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Settings"
                description="Manage your account settings and preferences."
            />
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>
                            Customize the appearance of the application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="theme">Theme</Label>
                            <Select value={theme} onValueChange={(value) => setTheme(value as any)}>
                                <SelectTrigger id="theme" className="w-full relative z-10 bg-background">
                                    <SelectValue placeholder="Select a theme" />
                                </SelectTrigger>
                                <SelectContent className="absolute z-50 bg-background border shadow-md">
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Preferences</CardTitle>
                        <CardDescription>
                            Customize your workspace preferences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="notifications" className="block mb-1">Enable Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive notifications for important updates
                                </p>
                            </div>
                            <CustomSwitch
                                id="notifications"
                                checked={preferences.notificationsEnabled}
                                onCheckedChange={handleNotificationsToggle}
                            />
                        </div>

                        {preferences.notificationsEnabled && notificationPermission === "granted" && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={showTestNotification}
                                className="mt-1"
                            >
                                Send Test Notification
                            </Button>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="default-view">Default View</Label>
                            <Select
                                value={preferences.defaultView}
                                onValueChange={(value: any) => updatePreference('defaultView', value)}
                            >
                                <SelectTrigger id="default-view" className="w-full relative z-10 bg-background">
                                    <SelectValue placeholder="Select a default view" />
                                </SelectTrigger>
                                <SelectContent className="absolute z-50 bg-background border shadow-md">
                                    <SelectItem value="list">List</SelectItem>
                                    <SelectItem value="kanban">Kanban</SelectItem>
                                    <SelectItem value="calendar">Calendar</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                                Choose the view type that appears first when opening projects
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sort-order">Tasks Sort Order</Label>
                            <Select
                                value={preferences.tasksSortOrder}
                                onValueChange={(value: any) => updatePreference('tasksSortOrder', value)}
                            >
                                <SelectTrigger id="sort-order" className="w-full relative z-10 bg-background">
                                    <SelectValue placeholder="Select a sort order" />
                                </SelectTrigger>
                                <SelectContent className="absolute z-50 bg-background border shadow-md">
                                    <SelectItem value="due_date">Due Date</SelectItem>
                                    <SelectItem value="priority">Priority</SelectItem>
                                    <SelectItem value="created_at">Creation Date</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                                Choose how tasks are sorted by default in your lists
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={resetPreferences}
                        >
                            Reset Preferences
                        </Button>
                        <Button onClick={() => {
                            toast({
                                title: "Preferences saved",
                                description: "Your preferences have been saved successfully.",
                            });
                        }}>
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>

                {/* Account Type Switcher */}
                <AccountTypeSwitcher user={preferences} />

                <Card>
                    <CardHeader>
                        <CardTitle>Privacy</CardTitle>
                        <CardDescription>
                            Manage your privacy settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-800/50">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-amber-400 dark:text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Cookie Information</h3>
                                    <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                                        <p>This application uses cookies to enhance your experience. You can clear all non-essential cookies below.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={clearAllCookies}
                            disabled={cookiesCleared}
                        >
                            Clear All Cookies
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardShell>
    );
}