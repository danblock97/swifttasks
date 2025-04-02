// File: components/dashboard/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
	LayoutDashboard,
	CheckSquare,
	Kanban, // Icon for Projects
	CalendarDays, // <-- New icon for Calendar
	FileText,
	Users,
	Settings,
	PlusSquare,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { setSidebarCollapsed, getSidebarCollapsed } from "@/lib/cookies";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
	user?: any; // Consider defining a more specific user type if possible
}

export function Sidebar({ className, user, ...props }: SidebarProps) {
	const pathname = usePathname();
	const { toast } = useToast();
	const router = useRouter();
	const [collapsed, setCollapsed] = useState(false);

	const isTeam = user?.account_type === "team_member";
	const isTeamOwner = isTeam && user?.is_team_owner;

	// Load collapsed state from cookie
	useEffect(() => {
		const savedCollapsed = getSidebarCollapsed();
		setCollapsed(savedCollapsed);
	}, []);

	// Save collapsed state to cookie when it changes
	useEffect(() => {
		setSidebarCollapsed(collapsed);
	}, [collapsed]);

	const toggleSidebar = () => {
		setCollapsed(!collapsed);
	};

	// Define the sidebar items array
	const sidebarItems = [
		{
			title: "Dashboard",
			href: "/dashboard",
			icon: LayoutDashboard,
			active: pathname === "/dashboard",
		},
		{
			title: "My Todo List",
			href: "/dashboard/todo",
			icon: CheckSquare,
			active: pathname === "/dashboard/todo",
		},
		{
			title: "Projects",
			href: "/dashboard/projects",
			icon: Kanban, // Using Kanban icon for Projects
			active: pathname.startsWith("/dashboard/projects"),
		},
		// --- Add Calendar Link Here ---
		{
			title: "Calendar",
			href: "/dashboard/calendar", // Link to the new calendar page
			icon: CalendarDays, // Use the CalendarDays icon
			active: pathname.startsWith("/dashboard/calendar"), // Active state check
		},
		// --- End Calendar Link ---
		{
			title: "Documentation",
			href: "/dashboard/docs",
			icon: FileText,
			active: pathname.startsWith("/dashboard/docs"),
		},
	];

	// Conditionally add the "Team" item if the user is part of a team
	if (isTeam) {
		// Insert Team item after Documentation (or adjust index as needed)
		sidebarItems.splice(5, 0, {
			// Adjust index if needed (currently after Docs)
			title: "Team",
			href: "/dashboard/team",
			icon: Users,
			active: pathname.startsWith("/dashboard/team"),
		});
	}

	const createNewProject = () => {
		if (isTeamOwner || !isTeam) {
			router.push("/dashboard/projects/create");
		} else {
			toast({
				title: "Permission Denied",
				description: "Only team owners can create new projects.",
				variant: "destructive",
			});
		}
	};

	return (
		<div
			className={cn(
				"relative pb-12 transition-width duration-300 ease-in-out",
				collapsed ? "w-16" : "w-[240px]",
				className
			)}
			{...props}
		>
			{/* Toggle Button */}
			<Button
				variant="ghost"
				size="icon"
				className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border shadow-md bg-background hover:bg-accent"
				onClick={toggleSidebar}
			>
				{collapsed ? (
					<ChevronRight className="h-3 w-3" />
				) : (
					<ChevronLeft className="h-3 w-3" />
				)}
			</Button>

			<div className="space-y-4 py-4">
				{/* New Project Button */}
				<div className="px-3 py-2">
					{!collapsed && (
						<Button
							variant="outline"
							className="w-full justify-start gap-2"
							onClick={createNewProject}
						>
							<PlusSquare className="h-4 w-4" />
							<span>New Project</span>
						</Button>
					)}
					{collapsed && (
						<Button
							variant="outline"
							size="icon"
							className="w-10 h-10 mx-auto flex items-center justify-center" // Ensure icon is centered
							onClick={createNewProject}
							aria-label="New Project" // Add accessibility label
						>
							<PlusSquare className="h-4 w-4" />
						</Button>
					)}

					{/* Team Workspace Name (if applicable) */}
					<div className="mt-3">
						{isTeam && !collapsed && (
							<div className="mb-2">
								<div className="px-4 py-1.5 text-xs font-semibold truncate text-muted-foreground">
									{user?.teams?.name || "Team Workspace"}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Main Navigation Links */}
				<div className="px-3 py-2">
					{!collapsed && (
						<h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
							Main
						</h2>
					)}
					<div className="space-y-1">
						{sidebarItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								title={collapsed ? item.title : undefined} // Show title on hover when collapsed
							>
								<Button
									variant={item.active ? "secondary" : "ghost"}
									className={cn(
										"w-full justify-start",
										collapsed
											? "h-10 w-10 p-0 flex items-center justify-center"
											: "gap-2" // Center icon when collapsed
									)}
								>
									<item.icon
										className={cn("h-4 w-4", collapsed ? "mx-auto" : "")}
									/>{" "}
									{/* Center icon */}
									{!collapsed && <span>{item.title}</span>}
								</Button>
							</Link>
						))}
					</div>
				</div>

				{/* Settings Link */}
				<div className="px-3 py-2 absolute bottom-4 left-0 right-0">
					{" "}
					{/* Position settings at bottom */}
					{!collapsed && (
						<h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
							Settings
						</h2>
					)}
					<div className="space-y-1">
						<Link
							href="/dashboard/settings"
							title={collapsed ? "Settings" : undefined}
						>
							<Button
								variant={
									pathname.startsWith("/dashboard/settings")
										? "secondary"
										: "ghost" // Use startsWith for settings subpages
								}
								className={cn(
									"w-full justify-start",
									collapsed
										? "h-10 w-10 p-0 flex items-center justify-center"
										: "gap-2" // Center icon when collapsed
								)}
							>
								<Settings
									className={cn("h-4 w-4", collapsed ? "mx-auto" : "")}
								/>{" "}
								{/* Center icon */}
								{!collapsed && <span>Settings</span>}
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
