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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateUUID } from "@/lib/utils";
import { DocContent } from "@/components/docs/doc-content";

interface CreateDocPageFormProps {
    spaceId: string;
    spaceName: string;
    pageOrder: number;
}

export function CreateDocPageForm({ spaceId, spaceName, pageOrder }: CreateDocPageFormProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [activeTab, setActiveTab] = useState("edit");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast({
                title: "Error",
                description: "Page title is required",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Generate a new ID
            const pageId = generateUUID();
            const now = new Date().toISOString();

            // Create the new page
            const { error } = await supabase
                .from("doc_pages")
                .insert({
                    id: pageId,
                    title: title.trim(),
                    content: content.trim() || null,
                    space_id: spaceId,
                    order: pageOrder,
                    created_at: now,
                    updated_at: now,
                });

            if (error) throw error;

            toast({
                title: "Page created",
                description: "Your documentation page has been created successfully.",
            });

            // Navigate to the new page
            router.push(`/dashboard/docs/${spaceId}/pages/${pageId}`);
        } catch (error: any) {
            console.error("Error creating documentation page:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create page. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>New Documentation Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Page Title</Label>
                        <Input
                            id="title"
                            placeholder="Enter page title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <div className="border rounded-md">
                            <Tabs
                                defaultValue="edit"
                                value={activeTab}
                                onValueChange={setActiveTab}
                                className="w-full"
                            >
                                <TabsList className="w-full border-b rounded-t-md rounded-b-none grid grid-cols-2">
                                    <TabsTrigger value="edit">Edit</TabsTrigger>
                                    <TabsTrigger value="preview">Preview</TabsTrigger>
                                </TabsList>
                                <TabsContent value="edit" className="p-0">
                                    <Textarea
                                        id="content"
                                        placeholder="Write your documentation here using Markdown..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        disabled={isLoading}
                                        className="min-h-[400px] border-0 rounded-none rounded-b-md focus-visible:ring-0 resize-y"
                                    />
                                </TabsContent>
                                <TabsContent value="preview" className="p-4 min-h-[400px] rounded-b-md border-t">
                                    {content ? (
                                        <DocContent content={content} />
                                    ) : (
                                        <div className="text-muted-foreground text-center p-4">
                                            Nothing to preview yet. Start writing some Markdown content to see a preview.
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            You can use Markdown to format your content. Support for headings, lists, links, code blocks, and more.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/docs/${spaceId}`)}
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
                        Create Page
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}