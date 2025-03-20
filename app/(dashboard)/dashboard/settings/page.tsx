"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUserPreferences } from "@/hooks/use-preferences";
import { removeCookie, COOKIE_KEYS } from "@/lib/cookies";
import { useTheme } from "@/components/theme/theme-provider";

export default function SettingsPage() {
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const { preferences, updatePreference, resetPreferences, isLoaded } = useUserPreferences();
    const [cookiesCleared, setCookiesCleared] = useState(false);

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
                                <SelectTrigger id="theme">
                                    <SelectValue placeholder="Select a theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="color-scheme">Color Scheme</Label>
                            <Select
                                value={preferences.colorScheme}
                                onValueChange={(value) => updatePreference('colorScheme', value)}
                            >
                                <SelectTrigger id="color-scheme">
                                    <SelectValue placeholder="Select a color scheme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="blue">Blue</SelectItem>
                                    <SelectItem value="green">Green</SelectItem>
                                    <SelectItem value="purple">Purple</SelectItem>
                                    <SelectItem value="orange">Orange</SelectItem>
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
                            <Label htmlFor="sidebar-collapsed">Collapsed Sidebar</Label>
                            <Switch
                                id="sidebar-collapsed"
                                checked={preferences.sidebarCollapsed}
                                onCheckedChange={(checked) => updatePreference('sidebarCollapsed', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="notifications">Enable Notifications</Label>
                            <Switch
                                id="notifications"
                                checked={preferences.notificationsEnabled}
                                onCheckedChange={(checked) => updatePreference('notificationsEnabled', checked)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="default-view">Default View</Label>
                            <Select
                                value={preferences.defaultView}
                                onValueChange={(value: any) => updatePreference('defaultView', value)}
                            >
                                <SelectTrigger id="default-view">
                                    <SelectValue placeholder="Select a default view" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="list">List</SelectItem>
                                    <SelectItem value="kanban">Kanban</SelectItem>
                                    <SelectItem value="calendar">Calendar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sort-order">Tasks Sort Order</Label>
                            <Select
                                value={preferences.tasksSortOrder}
                                onValueChange={(value: any) => updatePreference('tasksSortOrder', value)}
                            >
                                <SelectTrigger id="sort-order">
                                    <SelectValue placeholder="Select a sort order" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="due_date">Due Date</SelectItem>
                                    <SelectItem value="priority">Priority</SelectItem>
                                    <SelectItem value="created_at">Creation Date</SelectItem>
                                </SelectContent>
                            </Select>
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

                <Card>
                    <CardHeader>
                        <CardTitle>Privacy</CardTitle>
                        <CardDescription>
                            Manage your privacy settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-amber-800">Cookie Information</h3>
                                    <div className="mt-2 text-sm text-amber-700">
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