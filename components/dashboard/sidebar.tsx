"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CheckSquare,
    Kanban,
    FileText,
    Users,
    Settings,
    PlusSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    user?: any;
}

export function Sidebar({ className, user, ...props }: SidebarProps) {
    const pathname = usePathname();
    const { toast } = useToast();
    const router = useRouter();

    const isTeam = user?.account_type === "team_member";
    const isTeamOwner = isTeam && user?.is_team_owner;

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
            icon: Kanban,
            active: pathname.startsWith("/dashboard/projects"),
        },
        {
            title: "Documentation",
            href: "/dashboard/docs",
            icon: FileText,
            active: pathname.startsWith("/dashboard/docs"),
        },
    ];

    if (isTeam) {
        sidebarItems.splice(3, 0, {
            title: "Team",
            href: "/dashboard/team",
            icon: Users,
            active: pathname.startsWith("/dashboard/team"),
        });
    }

    const createNewProject = () => {
        if (isTeamOwner || !isTeam) {
            // Navigate to create project page
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
        <div className={cn("pb-12", className)} {...props}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={createNewProject}
                    >
                        <PlusSquare className="h-4 w-4" />
                        <span>New Project</span>
                    </Button>
                    <div className="mt-3">
                        {isTeam && (
                            <div className="mb-2">
                                <div className="px-4 py-1.5 text-xs font-semibold">
                                    {user?.teams?.name || "Team Workspace"}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight">
                        Main
                    </h2>
                    <div className="space-y-1">
                        {sidebarItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                            >
                                <Button
                                    variant={item.active ? "secondary" : "ghost"}
                                    className="w-full justify-start gap-2"
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight">
                        Settings
                    </h2>
                    <div className="space-y-1">
                        <Link href="/dashboard/settings">
                            <Button
                                variant={
                                    pathname === "/dashboard/settings" ? "secondary" : "ghost"
                                }
                                className="w-full justify-start gap-2"
                            >
                                <Settings className="h-4 w-4" />
                                <span>Settings</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}