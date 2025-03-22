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

interface Board {
    id: string;
    name: string;
    project_id: string;
    created_at: string;
}

interface EditBoardFormProps {
    board: Board;
    projectId: string;
    boardId: string;
}

export function EditBoardForm({ board, projectId, boardId }: EditBoardFormProps) {
    const [name, setName] = useState(board.name);
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

        setIsLoading(true);

        try {
            const { error } = await supabase
                .from("boards")
                .update({
                    name: name.trim(),
                })
                .eq("id", boardId);

            if (error) throw error;

            toast({
                title: "Board updated",
                description: "Your board has been updated successfully.",
            });

            // Navigate back to the board page
            router.push(`/dashboard/projects/${projectId}/boards/${boardId}`);
            router.refresh();
        } catch (error: any) {
            console.error("Error updating board:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update board. Please try again.",
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
                        Update your board information
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
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/projects/${projectId}/boards/${boardId}`)}
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