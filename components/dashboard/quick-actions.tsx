"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CheckSquare,
    Plus,
    Kanban,
    FileText,
    UserPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
    profile: any;
}

export function QuickActions({ profile }: QuickActionsProps) {
    const router = useRouter();
    const { toast } = useToast();

    const isTeam = profile?.account_type === "team_member";
    const isTeamOwner = isTeam && profile?.is_team_owner;

    const handleNewProject = () => {
        if (isTeamOwner || !isTeam) {
            router.push("/dashboard/projects/create");
        } else {
            toast({
                title: "Permission Denied",
                description: "Only team owners can create new projects",
                variant: "destructive",
            });
        }
    };

    const handleNewDoc = () => {
        if (isTeamOwner || !isTeam) {
            router.push("/dashboard/docs/create");
        } else {
            toast({
                title: "Permission Denied",
                description: "Only team owners can create new documentation spaces",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                    Common tasks and actions to get started
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Link href="/dashboard/todo">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 text-left"
                        size="sm"
                    >
                        <CheckSquare className="h-4 w-4" />
                        <div className="flex flex-col items-start">
                            <span>Add New Task</span>
                            <span className="text-xs font-normal text-muted-foreground">
                Create a task in your todo list
              </span>
                        </div>
                    </Button>
                </Link>

                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-left"
                    size="sm"
                    onClick={handleNewProject}
                >
                    <Kanban className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                        <span>New Project</span>
                        <span className="text-xs font-normal text-muted-foreground">
              Create a project with kanban boards
            </span>
                    </div>
                </Button>

                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-left"
                    size="sm"
                    onClick={handleNewDoc}
                >
                    <FileText className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                        <span>New Documentation</span>
                        <span className="text-xs font-normal text-muted-foreground">
              Create a documentation space
            </span>
                    </div>
                </Button>

                {isTeamOwner && (
                    <Link href="/dashboard/team/invite">
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2 text-left"
                            size="sm"
                        >
                            <UserPlus className="h-4 w-4" />
                            <div className="flex flex-col items-start">
                                <span>Invite Team Member</span>
                                <span className="text-xs font-normal text-muted-foreground">
                  Add people to your team
                </span>
                            </div>
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}