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
import { DocContent } from "@/components/docs/doc-content";

interface DocPage {
    id: string;
    title: string;
    content: string | null;
    created_at: string;
    updated_at: string;
    space_id: string;
    order: number;
}

interface EditDocPageFormProps {
    spaceId: string;
    page: DocPage;
}

export function EditDocPageForm({ spaceId, page }: EditDocPageFormProps) {
    const [title, setTitle] = useState(page.title);
    const [content, setContent] = useState(page.content || "");
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
            // Update the page
            const { error } = await supabase
                .from("doc_pages")
                .update({
                    title: title.trim(),
                    content: content.trim(),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", page.id);

            if (error) throw error;

            toast({
                title: "Page updated",
                description: "Your documentation page has been updated successfully.",
            });

            // Navigate back to the page view
            router.push(`/dashboard/docs/${spaceId}/pages/${page.id}`);
            router.refresh();
        } catch (error: any) {
            console.error("Error updating documentation page:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update page. Please try again.",
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
                    <CardTitle>Edit Documentation Page</CardTitle>
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
                        onClick={() => router.push(`/dashboard/docs/${spaceId}/pages/${page.id}`)}
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
            </Card>
        </form>
    );
}