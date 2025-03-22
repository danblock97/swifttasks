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

interface Project {
    id: string;
    name: string;
    description: string | null;
    owner_id: string;
    team_id: string | null;
}

interface EditProjectFormProps {
    project: Project;
}

export function EditProjectForm({ project }: EditProjectFormProps) {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || "");
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

        setIsLoading(true);

        try {
            const { error } = await supabase
                .from("projects")
                .update({
                    name: name.trim(),
                    description: description.trim() || null,
                })
                .eq("id", project.id);

            if (error) throw error;

            toast({
                title: "Project updated",
                description: "Your project has been updated successfully.",
            });

            // Navigate back to the project page
            router.push(`/dashboard/projects/${project.id}`);
            router.refresh();
        } catch (error: any) {
            console.error("Error updating project:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update project. Please try again.",
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
                        Update your project information
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
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
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
                        Save Changes
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}