import React from "react";

interface DashboardShellProps {
    children: React.ReactNode;
    className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
    return (
        <div className={`grid items-start gap-4 pb-20 md:pb-0 ${className}`}>
            {children}
        </div>
    );
}