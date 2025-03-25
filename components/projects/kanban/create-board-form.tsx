"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateUUID } from "@/lib/utils";

interface CreateBoardFormProps {
    projectId: string;
    projectName: string;
}

export function CreateBoardForm({ projectId, projectName }: CreateBoardFormProps) {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Board name is required",
                variant: "destructive",
            });
            return;
        }

        // Check board limits
        try {
            // First check if this is a team project
            const { data: project, error: projectError } = await supabase
                .from("projects")
                .select("team_id")
                .eq("id", projectId)
                .single();

            if (projectError) throw projectError;

            const isTeamProject = !!project.team_id;

            // Then check board count
            const { count, error } = await supabase
                .from("boards")
                .select("*", { count: "exact", head: true })
                .eq("project_id", projectId);

            if (error) throw error;

            const boardLimit = isTeamProject ? 2 : 1;
            if (count && count >= boardLimit) {
                toast({
                    title: "Board limit reached",
                    description: isTeamProject
                        ? "Team projects can have up to 2 boards"
                        : "Single user projects can have 1 board. Upgrade to a team account for more boards.",
                    variant: "destructive",
                });
                return;
            }
        } catch (error: any) {
            console.error("Error checking board limits:", error);
        }

        setIsLoading(true);

        try {
            // Generate IDs
            const boardId = generateUUID();

            // Create the board
            const { error: boardError } = await supabase
                .from("boards")
                .insert({
                    id: boardId,
                    name: name.trim(),
                    project_id: projectId,
                });

            if (boardError) throw boardError;

            // Create default columns
            const columns = [
                { id: generateUUID(), name: "To Do", order: 0, board_id: boardId },
                { id: generateUUID(), name: "In Progress", order: 1, board_id: boardId },
                { id: generateUUID(), name: "Done", order: 2, board_id: boardId },
            ];

            const { error: columnsError } = await supabase
                .from("board_columns")
                .insert(columns);

            if (columnsError) throw columnsError;

            toast({
                title: "Board created",
                description: "Your board has been created successfully.",
            });

            // Navigate to the new board
            router.push(`/dashboard/projects/${projectId}/boards/${boardId}`);
        } catch (error: any) {
            console.error("Error creating board:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create board. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Board Details</CardTitle>
                    <CardDescription>
                        Create a new kanban board for {projectName}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Board Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter board name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="rounded-md bg-primary/10 p-4">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="rounded-full bg-primary/20 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                                </svg>
                            </div>
                            <div>
                                Default columns (To Do, In Progress, Done) will be created automatically
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/projects/${projectId}`)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && (
                            <svg
                                className="mr-2 h-4 w-4 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                        )}
                        Create Board
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}