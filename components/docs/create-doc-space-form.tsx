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
import { FileText } from "lucide-react";

interface CreateDocSpaceFormProps {
    userId: string;
    isTeamMember: boolean;
    teamId: string | null;
}

export function CreateDocSpaceForm({ userId, isTeamMember, teamId }: CreateDocSpaceFormProps) {
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
                description: "Space name is required",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Generate IDs
            const spaceId = generateUUID();
            const firstPageId = generateUUID();

            // Create the doc space
            const { error: spaceError } = await supabase
                .from("doc_spaces")
                .insert({
                    id: spaceId,
                    name: name.trim(),
                    owner_id: userId,
                    team_id: isTeamMember ? teamId : null,
                });

            if (spaceError) throw spaceError;

            // Create a welcome/first page
            const { error: pageError } = await supabase
                .from("doc_pages")
                .insert({
                    id: firstPageId,
                    title: "Welcome",
                    content: `# Welcome to ${name}\n\nThis is your first documentation page. You can edit this page to add your content or create new pages.`,
                    space_id: spaceId,
                    order: 0,
                });

            if (pageError) throw pageError;

            toast({
                title: "Documentation space created",
                description: "Your documentation space has been created successfully.",
            });

            // Navigate to the new doc space
            router.push(`/dashboard/docs/${spaceId}`);
        } catch (error: any) {
            console.error("Error creating documentation space:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create documentation space. Please try again.",
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
                    <CardTitle>Space Details</CardTitle>
                    <CardDescription>
                        Fill in the details to create a new documentation space
                    </CardDescription>
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

                    <div className="rounded-md bg-primary/10 p-4">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="rounded-full bg-primary/20 p-1">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                A default welcome page will be created with your documentation space
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard/docs")}
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
                        Create Documentation Space
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}