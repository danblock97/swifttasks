"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { ViewOnlyKanban } from "./view-only-kanban";

interface DocContentProps {
    content: string;
    className?: string;
}

export function DocContent({ content, className }: DocContentProps) {
    // Function to render content with kanban boards
    const renderContent = () => {
        if (!content) return null;

        // Replace kanban board references with placeholders
        const KANBAN_PLACEHOLDER = "___KANBAN_BOARD_PLACEHOLDER___";
        const kanbanRegex = /\[kanban:([a-zA-Z0-9-/]+)\]/g;

        // Extract board paths
        const boardPaths: string[] = [];
        let match;
        while ((match = kanbanRegex.exec(content)) !== null) {
            boardPaths.push(match[1]);
        }

        // Replace kanban references with placeholders
        const textParts = content.replace(kanbanRegex, KANBAN_PLACEHOLDER).split(KANBAN_PLACEHOLDER);

        // Combine text and kanban boards
        const result: React.ReactNode[] = [];

        textParts.forEach((text, index) => {
            // Add text part
            if (text) {
                result.push(
                    <ReactMarkdown key={`text-${index}`}>
                        {text}
                    </ReactMarkdown>
                );
            }

            // Add kanban board if exists
            if (index < boardPaths.length) {
                result.push(
                    <div key={`kanban-${index}`} className="my-6">
                        <ViewOnlyKanban boardPath={boardPaths[index]} />
                    </div>
                );
            }
        });

        return result;
    };

    return (
        <div className={cn("prose prose-slate dark:prose-invert max-w-none", className)}>
            {renderContent()}
        </div>
    );
}