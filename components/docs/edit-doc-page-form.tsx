"use client";

import { useState, useRef } from "react";
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
import { ImageIcon } from "lucide-react";

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
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    const handleImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            // Get bucket name from environment variable or use default
            const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "doc-images";

            console.log(`Attempting to upload to bucket: "${bucketName}"`);

            // Create a unique file path that we'll keep track of
            const fileExt = file.name.split('.').pop();
            const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `${spaceId}/${uniqueFilename}`;

            console.log(`Upload path: ${filePath}`);

            // Try direct upload
            const { data, error } = await supabase
                .storage
                .from(bucketName)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                throw error;
            }

            console.log('Upload response:', data);

            // Get public URL using the path we KNOW we uploaded to
            // This is more reliable than depending on the response format
            const { data: urlData } = supabase
                .storage
                .from(bucketName)
                .getPublicUrl(filePath);

            console.log('URL data:', urlData);

            if (!urlData?.publicUrl) {
                throw new Error("Could not generate public URL for uploaded image");
            }

            // Insert image markdown at cursor position
            const imageMarkdown = `\n![${file.name}](${urlData.publicUrl})\n`;

            // Insert at cursor position
            const textarea = document.getElementById('content') as HTMLTextAreaElement;
            const cursorPos = textarea.selectionStart;
            const textBefore = content.substring(0, cursorPos);
            const textAfter = content.substring(cursorPos);

            setContent(textBefore + imageMarkdown + textAfter);

            toast({
                title: "Image uploaded",
                description: "Image was successfully added to your document.",
            });
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast({
                title: "Error uploading image",
                description: error.message || "Failed to upload image. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);

            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

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
                        <div className="flex justify-between items-center mb-2">
                            <Label htmlFor="content">Content</Label>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleImageUpload}
                                    disabled={isLoading || isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="mr-1 h-4 w-4" /> Add Image
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

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

                                    <div className="text-xs text-muted-foreground mt-2 p-2 border-t">
                                        <details>
                                            <summary className="cursor-pointer font-medium">Formatting & Features Guide</summary>
                                            <div className="mt-2 space-y-2">
                                                <div>
                                                    <strong className="block">Basic Markdown:</strong>
                                                    <ul className="list-disc ml-4 space-y-1">
                                                        <li># Heading 1, ## Heading 2, ### Heading 3</li>
                                                        <li>**Bold text**, *Italic text*</li>
                                                        <li>- Bullet list item, 1. Numbered list item</li>
                                                        <li>[Link text](https://example.com)</li>
                                                    </ul>
                                                </div>

                                                <div>
                                                    <strong className="block">Images:</strong>
                                                    <ul className="list-disc ml-4 space-y-1">
                                                        <li>Use the "Add Image" button to upload and insert images</li>
                                                        <li>Or manually: ![Image description](image-url.jpg)</li>
                                                    </ul>
                                                </div>

                                                <div>
                                                    <strong className="block">Embed Kanban Board:</strong>
                                                    <ul className="list-disc ml-4 space-y-1">
                                                        <li>Add this syntax anywhere in your content: <code>[kanban:boardId]</code></li>
                                                        <li>Replace "boardId" with the actual ID of your kanban board</li>
                                                        <li>You can find the board ID in the URL when viewing a board</li>
                                                        <li>Example: <code>[kanban:abc123]</code></li>
                                                    </ul>
                                                </div>

                                                <div>
                                                    <a
                                                        href="https://www.markdownguide.org/basic-syntax/"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline inline-block mt-1"
                                                    >
                                                        Learn more about Markdown
                                                    </a>
                                                </div>
                                            </div>
                                        </details>
                                    </div>
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