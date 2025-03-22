"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface DocContentProps {
    content: string;
    className?: string;
}

export function DocContent({ content, className }: DocContentProps) {
    return (
        <div className={cn("prose prose-slate dark:prose-invert max-w-none", className)}>
            <ReactMarkdown
                components={{
                    h1: ({ className, ...props }) => (
                        <h1 className={cn("text-2xl font-bold tracking-tight mt-6 mb-4", className)} {...props} />
                    ),
                    h2: ({ className, ...props }) => (
                        <h2 className={cn("text-xl font-semibold tracking-tight mt-6 mb-3", className)} {...props} />
                    ),
                    h3: ({ className, ...props }) => (
                        <h3 className={cn("text-lg font-semibold tracking-tight mt-5 mb-2", className)} {...props} />
                    ),
                    h4: ({ className, ...props }) => (
                        <h4 className={cn("text-base font-semibold tracking-tight mt-4 mb-2", className)} {...props} />
                    ),
                    p: ({ className, ...props }) => (
                        <p className={cn("mb-4 leading-7", className)} {...props} />
                    ),
                    ul: ({ className, ...props }) => (
                        <ul className={cn("my-4 ml-6 list-disc", className)} {...props} />
                    ),
                    ol: ({ className, ...props }) => (
                        <ol className={cn("my-4 ml-6 list-decimal", className)} {...props} />
                    ),
                    li: ({ className, ...props }) => (
                        <li className={cn("mt-1", className)} {...props} />
                    ),
                    blockquote: ({ className, ...props }) => (
                        <blockquote
                            className={cn(
                                "mt-4 mb-4 border-l-4 border-slate-300 dark:border-slate-600 pl-4 text-slate-600 dark:text-slate-400",
                                className
                            )}
                            {...props}
                        />
                    ),
                    code: ({ className, ...props }) => (
                        <code
                            className={cn(
                                "rounded-md bg-slate-100 dark:bg-slate-800 px-1 py-0.5 text-sm font-mono",
                                className
                            )}
                            {...props}
                        />
                    ),
                    pre: ({ className, ...props }) => (
                        <pre
                            className={cn(
                                "mt-4 mb-4 overflow-x-auto rounded-lg bg-slate-100 dark:bg-slate-800 p-4",
                                className
                            )}
                            {...props}
                        />
                    ),
                    a: ({ className, ...props }) => (
                        <a
                            className={cn("text-blue-600 dark:text-blue-400 hover:underline", className)}
                            {...props}
                        />
                    ),
                    img: ({ className, ...props }) => (
                        <img
                            className={cn("my-4 rounded-md border border-slate-200 dark:border-slate-700", className)}
                            {...props}
                        />
                    ),
                    hr: ({ className, ...props }) => (
                        <hr
                            className={cn("my-6 border-slate-200 dark:border-slate-700", className)}
                            {...props}
                        />
                    ),
                    table: ({ className, ...props }) => (
                        <div className="my-4 w-full overflow-y-auto">
                            <table
                                className={cn("w-full text-sm border-collapse", className)}
                                {...props}
                            />
                        </div>
                    ),
                    th: ({ className, ...props }) => (
                        <th
                            className={cn(
                                "border border-slate-200 dark:border-slate-700 px-4 py-2 text-left font-semibold",
                                className
                            )}
                            {...props}
                        />
                    ),
                    td: ({ className, ...props }) => (
                        <td
                            className={cn(
                                "border border-slate-200 dark:border-slate-700 px-4 py-2 text-left",
                                className
                            )}
                            {...props}
                        />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}