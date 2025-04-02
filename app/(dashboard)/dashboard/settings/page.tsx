// File: app/(dashboard)/settings/page.tsx (or wherever SettingsPage is located)
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUserPreferences } from "@/hooks/use-preferences"; // Using your hook
import { removeCookie, COOKIE_KEYS } from "@/lib/cookies";
import { useTheme } from "@/components/theme/theme-provider";
// Removed SwitchPrimitives import as toggle is removed
import { AccountTypeSwitcher } from "@/components/dashboard/account-type-switcher";
// Import updated types
import {
	CalendarReminderPreferences,
	DbUser,
	Database,
} from "@/lib/supabase/database.types";

// Updated reminder frequency options to include 'none'
const reminderFrequencyOptions: {
	value: CalendarReminderPreferences["frequency"] | "none";
	label: string;
}[] = [
	{ value: "none", label: "Never" }, // Added "Never" option
	{ value: "on_day", label: "On day of event" },
	{ value: "1_day_before", label: "1 day before event" },
];

type UserProfile = DbUser & { teams: any | null }; // Consider a more specific type for teams if possible

export default function SettingsPage() {
	const { toast } = useToast();
	const { theme, setTheme } = useTheme();
	const { preferences, updatePreference, resetPreferences, isLoaded } =
		useUserPreferences();
	const [cookiesCleared, setCookiesCleared] = useState(false);
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [isLoadingProfile, setIsLoadingProfile] = useState(true);

	const supabase = createClientComponentClient<Database>();

	// State for browser notification permission (still needed for browser notifications)
	const [notificationPermission, setNotificationPermission] =
		useState<string>("default");

	// Fetch user profile
	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				setIsLoadingProfile(true);
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) {
					setIsLoadingProfile(false);
					return;
				}
				// Fetch user profile with team data
				const { data: profile, error } = await supabase
					.from("users")
					.select("*, teams(*)") // Fetch related team data
					.eq("id", user.id)
					.single();

				if (error) {
					console.error("Error fetching user profile:", error);
				} else {
					setUserProfile(profile as UserProfile); // Cast to specific type
				}
			} catch (error) {
				console.error("Error in fetchUserProfile:", error);
			} finally {
				setIsLoadingProfile(false);
			}
		};
		fetchUserProfile();
	}, [supabase]); // Add supabase as dependency

	// Check notification permission on load
	useEffect(() => {
		if (typeof window !== "undefined" && "Notification" in window) {
			setNotificationPermission(Notification.permission);
		}
	}, []);

	// Request notification permission function
	const requestNotificationPermission = async (): Promise<boolean> => {
		if (typeof window !== "undefined" && "Notification" in window) {
			if (Notification.permission === "granted") {
				setNotificationPermission("granted"); // Already granted
				return true;
			}
			if (Notification.permission === "denied") {
				toast({
					title: "Notification Permission Denied",
					description:
						"Please enable notifications for this site in your browser settings.",
					variant: "destructive",
				});
				return false; // Already denied
			}
			// If permission is 'default', request it
			try {
				const permission = await Notification.requestPermission();
				setNotificationPermission(permission); // Update state with user's choice
				if (permission !== "granted") {
					toast({
						title: "Notification Permission Required",
						description: "Browser notification permission was not granted.",
						variant: "destructive",
					});
					return false;
				}
				return true; // Permission granted
			} catch (error) {
				console.error("Error requesting notification permission:", error);
				toast({
					title: "Notification Error",
					description: "Could not request notification permission.",
					variant: "destructive",
				});
				return false;
			}
		} else {
			toast({
				title: "Notifications Not Supported",
				description: "Your browser does not support notifications.",
				variant: "destructive",
			});
			return false; // Browser doesn't support notifications
		}
	};

	// --- Calendar Preference Handler ---
	// Handles changes to the frequency dropdown
	const handleCalendarFrequencyChange = async (
		value: CalendarReminderPreferences["frequency"] | "none"
	) => {
		let permissionGranted = notificationPermission === "granted";
		let finalFrequency = value;

		// If selecting a reminder option (not 'none') and permission isn't granted/denied, request it
		if (value !== "none" && notificationPermission === "default") {
			permissionGranted = await requestNotificationPermission();
			// If permission denied after request, force frequency back to 'none'
			if (!permissionGranted) {
				finalFrequency = "none";
				// Toast is shown by requestNotificationPermission in case of failure/denial
			}
		}

		// If permission is denied, force frequency to 'none' regardless of selection
		if (notificationPermission === "denied") {
			finalFrequency = "none";
			// Optionally notify user again if they try to select something other than 'none'
			if (value !== "none") {
				toast({
					title: "Permission Denied",
					description:
						"Browser notifications are blocked. Cannot enable reminders.",
					variant: "destructive",
				});
			}
		}

		// Update the preference object in the database via the hook
		// We only store the frequency now. 'none' means disabled.
		updatePreference("calendar_reminders", {
			frequency: finalFrequency,
		});

		// Provide feedback to the user
		toast({
			title: "Reminder preference saved.",
			description:
				finalFrequency === "none"
					? "Event reminders disabled."
					: `Event reminders set to: ${
							reminderFrequencyOptions.find(
								(opt) => opt.value === finalFrequency
							)?.label
					  }.`,
		});
	};
	// --- End Calendar Preference Handler ---

	// Loading state check
	if (!isLoaded || isLoadingProfile) {
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

	// clearAllCookies function
	const clearAllCookies = () => {
		Object.values(COOKIE_KEYS).forEach((key) => removeCookie(key));
		removeCookie("cookie_consent");
		removeCookie("remembered_email");
		setCookiesCleared(true);
		toast({
			title: "Cookies cleared",
			description: "All non-essential cookies have been cleared.",
		});
	};

	// Show a test browser notification
	const showTestNotification = () => {
		if (Notification.permission === "granted") {
			const notification = new Notification("SwiftTasks Event Reminder", {
				body: "This is a test browser notification.",
				icon: "/favicon.ico", // Ensure this path is correct
			});
			notification.onclick = () => {
				window.focus();
				notification.close();
			};
		} else if (Notification.permission === "denied") {
			toast({
				title: "Notification Permission Denied",
				description:
					"Please enable notifications for this site in your browser settings.",
				variant: "destructive",
			});
		} else {
			// Request permission if default
			requestNotificationPermission().then((granted) => {
				if (granted) {
					// Try showing again if permission was just granted
					showTestNotification();
				}
			});
		}
	};

	// Get current frequency preference, default to 'none'
	// Ensure backward compatibility if 'enabled' field still exists from previous structure
	const currentFrequency = preferences.calendar_reminders?.frequency ?? "none";
	const legacyEnabled = (preferences.calendar_reminders as any)?.enabled; // Check for old field
	// If legacy 'enabled' exists and is false, treat as 'none', otherwise use current frequency or default to 'none'
	const calendarReminderFrequency =
		legacyEnabled === false ? "none" : currentFrequency;

	return (
		<DashboardShell>
			<DashboardHeader
				heading="Settings"
				description="Manage your account settings and preferences."
			/>
			<div className="grid gap-6">
				{/* Appearance Card */}
				<Card>
					<CardHeader>
						{" "}
						<CardTitle>Appearance</CardTitle>{" "}
						<CardDescription>
							{" "}
							Customize the appearance of the application.{" "}
						</CardDescription>{" "}
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="theme">Theme</Label>
							<Select
								value={theme}
								onValueChange={(value) => setTheme(value as any)}
							>
								<SelectTrigger id="theme" className="w-full bg-background">
									{" "}
									<SelectValue placeholder="Select a theme" />{" "}
								</SelectTrigger>
								<SelectContent className="bg-background border shadow-md">
									{" "}
									<SelectItem value="light">Light</SelectItem>{" "}
									<SelectItem value="dark">Dark</SelectItem>{" "}
									<SelectItem value="system">System</SelectItem>{" "}
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Preferences Card */}
				<Card>
					<CardHeader>
						{" "}
						<CardTitle>Preferences</CardTitle>{" "}
						<CardDescription>
							{" "}
							Customize your workspace preferences.{" "}
						</CardDescription>{" "}
					</CardHeader>
					<CardContent className="space-y-6">
						{/* --- Calendar Notifications Section --- */}
						<div className="space-y-4 p-4 border rounded-lg">
							<h3 className="text-base font-medium mb-3">
								Event Reminders (Browser Notifications)
							</h3>
							{/* Removed Enable Toggle */}

							{/* Updated Select for Frequency */}
							<div className="space-y-2">
								<Label htmlFor="calendar-frequency">Reminder Time</Label>
								<Select
									value={calendarReminderFrequency} // Use state derived from preferences
									// Use updated handler
									onValueChange={(
										value: CalendarReminderPreferences["frequency"] | "none"
									) => handleCalendarFrequencyChange(value)}
									// Disabled only if browser permission is permanently denied
									disabled={notificationPermission === "denied"}
								>
									<SelectTrigger
										id="calendar-frequency"
										className="w-full bg-background"
									>
										<SelectValue placeholder="Select reminder time" />
									</SelectTrigger>
									<SelectContent className="bg-background border shadow-md">
										{/* Updated Options */}
										{reminderFrequencyOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-xs text-muted-foreground mt-1">
									Select when you want to receive browser notifications for
									events. Select 'Never' to disable.
								</p>
								{/* Show permission status */}
								{notificationPermission === "denied" && (
									<p className="text-xs text-destructive mt-1">
										{" "}
										Browser notification permission is denied. Reminders are
										disabled.{" "}
									</p>
								)}
								{/* Prompt to allow if default and a reminder option is selected */}
								{notificationPermission === "default" &&
									calendarReminderFrequency !== "none" && (
										<p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
											{" "}
											Browser notification permission needed to receive
											reminders.{" "}
										</p>
									)}
							</div>

							{/* Test Notification Button */}
							{notificationPermission !== "denied" && ( // Show if permission not denied
								<Button
									variant="outline"
									size="sm"
									onClick={showTestNotification}
									className="mt-2"
								>
									Send Test Notification
								</Button>
							)}
						</div>
						{/* --- End Calendar Notifications Section --- */}

						{/* Default View Preference */}
						<div className="space-y-2">
							<Label htmlFor="default-view">Default Project View</Label>{" "}
							<Select
								value={preferences.defaultView}
								onValueChange={(value: any) =>
									updatePreference("defaultView", value)
								}
							>
								{" "}
								<SelectTrigger
									id="default-view"
									className="w-full bg-background"
								>
									{" "}
									<SelectValue placeholder="Select a default view" />{" "}
								</SelectTrigger>{" "}
								<SelectContent className="bg-background border shadow-md">
									{" "}
									<SelectItem value="list">List</SelectItem>{" "}
									<SelectItem value="kanban">Kanban</SelectItem>{" "}
									<SelectItem value="calendar">Calendar</SelectItem>{" "}
								</SelectContent>{" "}
							</Select>{" "}
							<p className="text-xs text-muted-foreground mt-1">
								{" "}
								Choose the view type that appears first when opening projects.{" "}
							</p>
						</div>

						{/* Tasks Sort Order Preference */}
						<div className="space-y-2">
							<Label htmlFor="sort-order">Default Tasks Sort Order</Label>{" "}
							<Select
								value={preferences.tasksSortOrder}
								onValueChange={(value: any) =>
									updatePreference("tasksSortOrder", value)
								}
							>
								{" "}
								<SelectTrigger id="sort-order" className="w-full bg-background">
									{" "}
									<SelectValue placeholder="Select a sort order" />{" "}
								</SelectTrigger>{" "}
								<SelectContent className="bg-background border shadow-md">
									{" "}
									<SelectItem value="due_date">Due Date</SelectItem>{" "}
									<SelectItem value="priority">Priority</SelectItem>{" "}
									<SelectItem value="created_at">Creation Date</SelectItem>{" "}
								</SelectContent>{" "}
							</Select>{" "}
							<p className="text-xs text-muted-foreground mt-1">
								{" "}
								Choose how tasks are sorted by default.{" "}
							</p>
						</div>
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button variant="outline" onClick={resetPreferences}>
							{" "}
							Reset Preferences{" "}
						</Button>
					</CardFooter>
				</Card>

				{/* Account Type Switcher */}
				{userProfile && <AccountTypeSwitcher user={userProfile} />}

				{/* Privacy Card */}
				<Card>
					<CardHeader>
						{" "}
						<CardTitle>Privacy</CardTitle>{" "}
						<CardDescription> Manage your privacy settings. </CardDescription>{" "}
					</CardHeader>{" "}
					<CardContent className="space-y-4">
						{" "}
						<div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-800/50">
							{" "}
							<div className="flex">
								{" "}
								<div className="flex-shrink-0">
									{" "}
									<svg
										className="h-5 w-5 text-amber-400 dark:text-amber-300"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										{" "}
										<path
											fillRule="evenodd"
											d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>{" "}
									</svg>{" "}
								</div>{" "}
								<div className="ml-3">
									{" "}
									<h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
										Cookie Information
									</h3>{" "}
									<div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
										{" "}
										<p>
											This application uses cookies to enhance your experience.
											You can clear all non-essential cookies below.
										</p>{" "}
									</div>{" "}
								</div>{" "}
							</div>{" "}
						</div>{" "}
						<Button
							variant="outline"
							onClick={clearAllCookies}
							disabled={cookiesCleared}
						>
							{" "}
							Clear Non-Essential Cookies{" "}
						</Button>{" "}
					</CardContent>
				</Card>
			</div>
		</DashboardShell>
	);
}
