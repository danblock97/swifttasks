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
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface DocSpace {
    id: string;
    name: string;
    created_at: string;
    owner_id: string;
    team_id: string | null;
}

interface EditDocSpaceFormProps {
    space: DocSpace;
}

export function EditDocSpaceForm({ space }: EditDocSpaceFormProps) {
    const [name, setName] = useState(space.name);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Space name is required",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Update the space
            const { error } = await supabase
                .from("doc_spaces")
                .update({
                    name: name.trim(),
                })
                .eq("id", space.id);

            if (error) throw error;

            toast({
                title: "Documentation space updated",
                description: "The documentation space has been updated successfully.",
            });

            // Navigate back to the space view
            router.push(`/dashboard/docs/${space.id}`);
            router.refresh();
        } catch (error: any) {
            console.error("Error updating documentation space:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update documentation space. Please try again.",
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
                    <CardTitle>Edit Documentation Space</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Space Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter documentation space name"
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
                        onClick={() => router.push(`/dashboard/docs/${space.id}`)}
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