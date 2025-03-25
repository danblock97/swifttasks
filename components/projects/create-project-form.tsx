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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateUUID } from "@/lib/utils";

interface CreateProjectFormProps {
    userId: string;
    isTeamMember: boolean;
    teamId: string | null;
}

export function CreateProjectForm({ userId, isTeamMember, teamId }: CreateProjectFormProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Project name is required",
                variant: "destructive",
            });
            return;
        }

        // Check project limits
        try {
            const { count, error } = await supabase
                .from("projects")
                .select("*", { count: "exact", head: true })
                .eq(isTeamMember ? "team_id" : "owner_id", isTeamMember ? teamId : userId);

            if (error) throw error;

            const projectLimit = isTeamMember ? 2 : 1;
            if (count && count >= projectLimit) {
                toast({
                    title: "Project limit reached",
                    description: isTeamMember
                        ? "Team accounts can create up to 2 projects"
                        : "You can create up to 1 project. Upgrade to a team account for more projects.",
                    variant: "destructive",
                });
                return;
            }
        } catch (error: any) {
            console.error("Error checking project limits:", error);
        }

        setIsLoading(true);

        try {
            // Generate IDs
            const projectId = generateUUID();
            const boardId = generateUUID();

            // Create the project
            const { error: projectError } = await supabase
                .from("projects")
                .insert({
                    id: projectId,
                    name: name.trim(),
                    description: description.trim() || null,
                    owner_id: userId,
                    team_id: isTeamMember ? teamId : null,
                });

            if (projectError) throw projectError;

            // Create default kanban board
            const { error: boardError } = await supabase
                .from("boards")
                .insert({
                    id: boardId,
                    name: "Main Board",
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
                title: "Project created",
                description: "Your project has been created successfully.",
            });

            // Navigate to the new project
            router.push(`/dashboard/projects/${projectId}`);
        } catch (error: any) {
            console.error("Error creating project:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create project. Please try again.",
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
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>
                        Fill in the details to create a new project
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter project name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe what this project is about"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground">
                            A brief description of your project and its goals
                        </p>
                    </div>

                    <div className="rounded-md bg-primary/10 p-4">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="rounded-full bg-primary/20 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                                </svg>
                            </div>
                            <div>
                                A default Kanban board will be created with your project
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard/projects")}
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
                        Create Project
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}