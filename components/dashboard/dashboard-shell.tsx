import { cn } from "@/lib/utils";

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({
                                   children,
                                   className,
                                   ...props
                               }: DashboardShellProps) {
    return (
        <div className={cn("flex min-h-screen flex-col space-y-6", className)} {...props}>
            <div className="flex-1 space-y-4 pt-2">{children}</div>
        </div>
    );
}